// Super Admin panel actions. Every call re-checks: admin role, rule dev_tools_enabled, not the live build.
// Lesson changes only ever touch the caller's own admin preview sessions.
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/integrations/supabase/types";
import { devToolsAllowed, DEV_SECTIONS } from "@/shared/dev-tools";
import { LESSON_STEPS } from "@/shared/contracts/enums";

type Db = SupabaseClient<Database>;
/* eslint-disable @typescript-eslint/no-explicit-any */

export async function devAccess(user: Db, admin: Db, userId: string, host: string | null) {
  const { data: isAdmin } = await user.rpc("has_role", { _user_id: userId, _role: "admin" });
  if (!isAdmin) return false;
  const { data } = await admin.from("rules").select("value").eq("key", "dev_tools_enabled").is("topic_id", null).maybeSingle();
  return devToolsAllowed({ isAdmin: !!isAdmin, settingOn: data?.value === true, host });
}

export const devActionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("info"), sessionId: z.string().uuid().optional() }),
  z.object({ action: z.literal("topics") }),
  z.object({ action: z.literal("items"), sessionId: z.string().uuid() }),
  z.object({ action: z.literal("jump"), sessionId: z.string().uuid(), step: z.enum(LESSON_STEPS), index: z.number().int().min(0).max(50).default(0) }),
  z.object({ action: z.literal("restart"), sessionId: z.string().uuid() }),
  z.object({ action: z.literal("restart_journey") }),
  z.object({ action: z.literal("open_step"), step: z.enum(LESSON_STEPS), band: z.enum(["rebuild", "bridge", "stretch"]).optional() }),
  z.object({ action: z.literal("debug") }),
  z.object({ action: z.literal("log"), section: z.enum(DEV_SECTIONS), what: z.string().max(60) }),
]);
export type DevActionInput = z.input<typeof devActionSchema>;

async function audit(admin: Db, userId: string, details: Record<string, unknown>) {
  const r = await admin.from("admin_audit").insert({ action: "dev_tool_used", actor_id: userId, details: details as Json });
  if (r.error) throw new Error("Could not record the action.");
}

/** Reuses (or creates) one admin preview session per topic for this admin. */
export async function startPreview(admin: Db, userId: string, topicId: string): Promise<string> {
  const { data: rows } = await admin.from("sessions").select("id, state, attempt").eq("student_id", userId).eq("topic_id", topicId).in("status", ["active", "paused"]);
  const mine = (rows ?? []).find((r) => (r.state as any)?.consent_basis === "admin_preview");
  if (mine) return mine.id;
  // Previews open beside her real lesson; the real lesson is never closed.
  const { data: last } = await admin.from("sessions").select("attempt").eq("student_id", userId).eq("topic_id", topicId).order("attempt", { ascending: false }).limit(1).maybeSingle();
  const { data: pack } = await admin.from("content_imports").select("pack_version").eq("topic_id", topicId).eq("status", "success").eq("dry_run", false).order("created_at", { ascending: false }).limit(1).maybeSingle();
  const { data: s, error } = await admin.from("sessions").insert({
    student_id: userId, topic_id: topicId, attempt: (last?.attempt ?? 0) + 1, pack_version: pack?.pack_version ?? null,
    state: { consent_basis: "admin_preview" },
  }).select("id").single();
  if (error || !s) throw new Error("Could not start a preview lesson.");
  return s.id;
}

async function previewSession(admin: Db, userId: string, sessionId: string) {
  const { data: s } = await admin.from("sessions").select("*").eq("id", sessionId).eq("student_id", userId).maybeSingle();
  if (!s || (s.state as any)?.consent_basis !== "admin_preview") throw new Error("Only your own preview lessons can be changed.");
  return s;
}

/** The demo topic: the first open topic. */
async function demoTopic(admin: Db): Promise<string> {
  const { data } = await admin.from("topics").select("id").eq("is_active", true).order("id").limit(1).maybeSingle();
  if (!data) throw new Error("No open topic.");
  return data.id;
}

async function stepItemIds(admin: Db, topicId: string, step: string) {
  const { data } = await admin.from("items").select("id, sequence").eq("topic_id", topicId).eq("step", step as any).order("sequence");
  return (data ?? []).map((r) => r.id);
}

export async function devAction(user: Db, admin: Db, userId: string, host: string | null, input: unknown) {
  const d = devActionSchema.parse(input);
  // Demo: admins may Restart from the profile menu on the live app too; every other tool keeps the full check.
  if (d.action === "restart_journey") {
    const { data: isAdmin } = await user.rpc("has_role", { _user_id: userId, _role: "admin" });
    if (!isAdmin) throw new Error("Admin tools are off.");
  } else if (!(await devAccess(user, admin, userId, host))) throw new Error("Admin tools are off.");
  await audit(admin, userId, { section: d.action === "log" ? d.section : d.action, ...(d.action === "log" ? { what: d.what } : {}),
    ...("sessionId" in d && d.sessionId ? { session_id: d.sessionId } : {}), ...(d.action === "jump" ? { step: d.step, index: d.index } : {}),
    ...(d.action === "open_step" ? { step: d.step } : {}), ...(d.action === "restart_journey" ? { what: "restart journey" } : {}) });

  switch (d.action) {
    case "log": return { ok: true as const };
    case "info": {
      const [{ data: roles }, { data: rules }] = await Promise.all([
        admin.from("user_roles").select("role").eq("user_id", userId),
        admin.from("rules").select("key, value").in("key", ["dev_open_access", "dev_tools_enabled"]).is("topic_id", null),
      ]);
      let session: null | { id: string; step: string; attempt: number; packVersion: string | null; preview: boolean } = null;
      if (d.sessionId) {
        const { data: s } = await admin.from("sessions").select("id, step, attempt, pack_version, state").eq("id", d.sessionId).eq("student_id", userId).maybeSingle();
        if (s) session = { id: s.id, step: s.step, attempt: s.attempt, packVersion: s.pack_version, preview: (s.state as any)?.consent_basis === "admin_preview" };
      }
      return { ok: true as const, roles: (roles ?? []).map((r) => r.role), settings: Object.fromEntries((rules ?? []).map((r) => [r.key, r.value])), session };
    }
    case "topics": {
      const { data } = await admin.from("topics").select("id, display_name, subject, chapter_slug, quest_slug, topic_slug, is_active").order("id");
      return { ok: true as const, topics: data ?? [] };
    }
    case "items": {
      const s = await previewSession(admin, userId, d.sessionId);
      const { data } = await admin.from("items").select("id, step, sequence").eq("topic_id", s.topic_id).order("step").order("sequence");
      return { ok: true as const, items: (data ?? []).map((r) => ({ id: r.id, step: r.step, sequence: r.sequence })) };
    }
    case "jump": {
      const s = await previewSession(admin, userId, d.sessionId);
      const raw = (s.state as any) ?? {};
      const demo = { ...(raw.demo ?? {}), pos: { step: d.step, index: d.index }, pendingRepair: null, closed: false };
      if (d.step === "simulation" && !demo.band) demo.band = "bridge";
      await admin.from("sessions").update({ state: { ...raw, demo }, step: d.step, status: "active", completed_at: null, ...(demo.band ? { band: demo.band } : {}) }).eq("id", s.id);
      return { ok: true as const };
    }
    case "restart": {
      const s = await previewSession(admin, userId, d.sessionId);
      await admin.from("sessions").update({ status: "abandoned", completed_at: new Date().toISOString() }).eq("id", s.id);
      return { ok: true as const, sessionId: await startPreview(admin, userId, s.topic_id) };
    }
    case "restart_journey": {
      const topicId = await demoTopic(admin);
      const { data: rows } = await admin.from("sessions").select("id, state").eq("student_id", userId).eq("topic_id", topicId).in("status", ["active", "paused"]);
      // A true fresh start for this admin: preview lessons AND their own real lesson end (only their own rows, never students').
      const mine = (rows ?? []).map((r) => r.id);
      // Run the resets together; no preview lesson is built here (it's made when a lesson is opened).
      const { resetIntro } = await import("@/server/home/opening.server");
      await Promise.all([
        mine.length ? admin.from("sessions").update({ status: "abandoned", completed_at: new Date().toISOString() }).in("id", mine) : null,
        admin.from("home_conversations").insert({ student_id: userId, title: null }),
        resetIntro(admin, userId),
      ]);
      return { ok: true as const, ended: mine.length };
    }
    case "open_step": {
      const topicId = await demoTopic(admin);
      const id = await startPreview(admin, userId, topicId);
      const s = await previewSession(admin, userId, id);
      const raw = (s.state as any) ?? {};
      const demo = { ...(raw.demo ?? {}), pos: { step: d.step, index: 0 }, pendingRepair: null, popup: null, fix: null, closed: false };
      if (d.step === "video") {
        const { data: vids } = await admin.from("items").select("id").eq("topic_id", topicId).eq("step", "video");
        for (const { id: vid } of vids ?? []) { delete demo.results?.[vid]; delete demo.attempts?.[vid]; delete demo.tried?.[vid]; }
        demo.videoPos = 0;
      }
      if (d.step === "simulation") {
        // Each simulation opens fresh: no finished tasks, saved points or counts from an earlier run.
        demo.band = d.band ?? demo.band ?? "bridge";
        demo.simDone = []; demo.simSaved = {}; demo.simMis = {}; demo.simWrong = {};
        for (const k of Object.keys(demo.attempts ?? {})) if (k.startsWith("SIM_")) delete demo.attempts[k];
        for (const k of Object.keys(demo.hints ?? {})) if (k.startsWith("SIM_")) delete demo.hints[k];
        for (const k of Object.keys(demo.lines ?? {})) if (k.startsWith("sim_start:")) delete demo.lines[k];
      }
      await admin.from("sessions").update({ state: { ...raw, demo }, step: d.step, status: "active", completed_at: null, ...(demo.band ? { band: demo.band } : {}) }).eq("id", s.id);
      return { ok: true as const, sessionId: id };
    }
    case "debug": {
      const topicId = await demoTopic(admin);
      const { data: rows } = await admin.from("sessions").select("id, step, attempt, status, state, updated_at").eq("student_id", userId).eq("topic_id", topicId).in("status", ["active", "paused"]);
      // Your own real lesson first (that's where warm-up skips happen), else your preview lesson.
      const s = (rows ?? []).find((r) => (r.state as any)?.consent_basis !== "admin_preview") ?? (rows ?? []).find((r) => (r.state as any)?.consent_basis === "admin_preview");
      if (!s) return { ok: true as const, session: null, events: [] };
      const st = (s.state as any) ?? {};
      const { data: ev } = await admin.from("events").select("seq, type, step, created_at, payload").eq("session_id", s.id).order("seq", { ascending: false }).limit(20);
      return { ok: true as const, session: { id: s.id, step: s.step, attempt: s.attempt, status: s.status, updatedAt: s.updated_at,
        prediction: st.prediction ?? null, readiness: st.demo?.readiness ?? null, position: st.demo?.pos ?? null, preview: st.consent_basis === "admin_preview", skipReasons: st.demo?.skipReasons ?? [], luckyGuesses: st.demo?.luckyGuesses ?? 0, firm: (st.demo?.firm ?? []).map((f: unknown) => typeof f === "string" ? { misconception_id: f } : f), warmupIds: st.demo?.warmupIds ?? null }, events: (ev ?? []).map(({ payload, ...e }) => ({ ...e, note: e.type === "sim_v2_marked" ? `lab: ${(payload as Record<string, unknown>)?.["lab"]} · ours: ${(payload as Record<string, unknown>)?.["ours"]}` : null })) };
    }
  }
}
