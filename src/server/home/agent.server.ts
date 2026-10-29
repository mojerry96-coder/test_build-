// Fitila on Home: understand -> decide -> act -> reply. The word list sorts first and the AI only when
import { withContinue } from "@/shared/continue-link";
import { resetAt } from "@/server/lesson/shown-skills.server";
import { afterRestart } from "@/shared/restart-cutoff";
// unsure; the engine (this file + decide.ts) picks every action from her data and the content. All lines
// come from approved fallback lines; all marking goes through the maths engine.
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { HOME_INTENTS, extractDetails, pickHomeIntentSure, type HomeIntent, type HomeMode } from "@/shared/home-intents";
import { typedOptionNumber, typedOptionTitle, matchPendingReply } from "@/shared/home-intents";
import { planRank, avoidRepeat, clarify, planView, decideAction, findOffered, lagosDay, learnedDays, pickOption, planDateFrom, reviewDue, streakDays, weekRow, type Action, type EvidenceRow } from "./decide";
import { questRows } from "@/shared/quests-display";
import { gradientSteps, checkStep } from "./homework";
import { subjectKeyFor } from "@/shared/routes";
import type { HomeCard, HomeData, HomePlanItem, HomeReply, HomeChatMsg, HomeOption } from "@/shared/contracts/home";

type Db = SupabaseClient<Database>;
type Any = any; // eslint-disable-line @typescript-eslint/no-explicit-any

async function rule(admin: Db, key: string, topicId?: string): Promise<Any> {
  const q = admin.from("rules").select("value, topic_id").eq("key", key);
  const { data } = await q;
  const rows = data ?? [];
  return (rows.find((r) => topicId && r.topic_id === topicId) ?? rows.find((r) => r.topic_id == null) ?? rows[0])?.value ?? null;
}

async function tutorName(admin: Db) { const v = await rule(admin, "tutor_display_name"); return typeof v === "string" && v.trim() ? v.trim() : "your tutor"; }

/** Approved line(s) for a decision key with {placeholders} filled from engine values. */
export async function homeLine(admin: Db, key: string, vars: Record<string, string | number> = {}): Promise<string[]> {
  const { data } = await admin.from("fallback_lines").select("script, topic_id").eq("decision_key", key);
  const row = (data ?? []).find((r) => r.topic_id == null) ?? data?.[0];
  const name = await tutorName(admin);
  const all: Record<string, string> = { tutor_name: name, ...Object.fromEntries(Object.entries(vars).map(([k, v]) => [k, String(v)])) };
  return ((row?.script ?? []) as { text?: string }[])
    .map((s) => (s.text ?? "").replace(/\{(\w+)\}/g, (m, k) => all[k] ?? m))
    .filter((t) => t && !/\{\w+\}/.test(t));
}

/** Everything Home needs: plan, three cards, streak. Built from her real data. */
export async function loadHome(admin: Db, userId: string, isAdmin: boolean): Promise<HomeData> {
  const [{ data: profile }, { data: topics }, { data: sessions }, { data: ev }, { data: plan }, { data: skills }, { data: tSkills }] = await Promise.all([
    admin.from("profiles").select("display_name").eq("id", userId).maybeSingle(),
    admin.from("topics").select("id, display_name, subject, chapter_slug, quest_slug, topic_slug").eq("is_active", true).order("id"),
    admin.from("sessions").select("id, topic_id, step, status, state, started_at, updated_at").eq("student_id", userId).order("started_at", { ascending: false }),
    admin.from("evidence").select("skill_id, correct, confidence, strength, misconception_id, created_at, session_id, item_id").eq("student_id", userId),
    admin.from("plan_items").select("*").eq("student_id", userId).order("planned_for", { ascending: true }),
    admin.from("skills").select("id, name"),
    admin.from("topic_skills").select("topic_id, skill_id"),
  ]);
  const cutoff = await resetAt(admin, userId).catch(() => null);
  const real = afterRestart(sessions ?? [], cutoff).filter((s) => (s.state as Any)?.consent_basis !== "admin_preview" || isAdmin);
  const lessons = real.filter((s) => (s.state as Any)?.kind !== "quiz");
  const path = (t: Any) => ({ subject: subjectKeyFor(t.subject), chapter: t.chapter_slug ?? "general", quest: t.quest_slug ?? "general", topic: t.topic_slug ?? "general" });
  const topicById = new Map((topics ?? []).map((t) => [t.id, t]));
  const skillName = new Map((skills ?? []).map((s) => [s.id, s.name]));
  const now = new Date();
  const interval = Number(await rule(admin, "review_interval_days")) || 3;
  const studyHour = Number(await rule(admin, "default_study_hour")) || 19;

  const items: HomePlanItem[] = [];
  const active = lessons.find((s) => s.status === "active" || s.status === "paused");
  if (active && topicById.get(active.topic_id)) {
    const t = topicById.get(active.topic_id)!;
    items.push({ id: `lesson:${active.id}`, kind: "continue", label: t.display_name, topicId: t.id, source: "own", path: path(t), done: false, locked: false, planned_for: null, due_at: null });
  }
  const due = reviewDue((ev ?? []) as EvidenceRow[], now, interval);
  if (due.length) {
    const sk = due[0]!;
    const topicId = (tSkills ?? []).find((x) => x.skill_id === sk)?.topic_id ?? (topics ?? [])[0]?.id;
    const t = topicId ? topicById.get(topicId) : undefined;
    if (t) items.push({ id: `review:${sk}`, kind: "review", label: skillName.get(sk) ?? sk, topicId: t.id, skillId: sk, source: "own", path: path(t), done: false, locked: false, planned_for: null, due_at: null });
  }
  for (const p of (plan ?? []).filter((p) => !p.done && (!p.sample || isAdmin))) {
    const t = topicById.get(p.topic_id); if (!t) continue;
    items.push({ id: p.id, kind: p.source === "teacher" ? "teacher" : "plan", label: p.label ?? t.display_name, topicId: t.id, source: p.source as Any, path: path(t), done: p.done, locked: p.source !== "own", planned_for: p.planned_for, due_at: p.due_at });
  }
  const completed = new Set(lessons.filter((s) => s.status === "completed").map((s) => s.topic_id));
  const next = (topics ?? []).find((t) => !completed.has(t.id) && !items.some((i) => i.topicId === t.id && i.kind !== "review"));
  if (next) items.push({ id: `next:${next.id}`, kind: "next", label: next.display_name, topicId: next.id, source: "own", path: path(next), done: false, locked: false, planned_for: null, due_at: null });

  // Lesson first: Start (plan[0]) always follows the lesson flow; a due review is a separate choice, never Start.
  items.sort((x, y) => planRank(x.kind) - planRank(y.kind));
  const first = (profile?.display_name ?? "").split(" ")[0] || null;
  const tonight = items.slice(0, 3);
  // Cards: Continue, Review due, From your teacher; filled with Explore Mathematics.
  const cards: HomeCard[] = [];
  const c = items.find((i) => i.kind === "continue"); if (c) cards.push({ kind: "continue", title: "Continue", line: c.label, item: c });
  const r = items.find((i) => i.kind === "review"); if (r) cards.push({ kind: "review", title: "Review due", line: r.label, item: r });
  const tc = items.find((i) => i.kind === "teacher"); if (tc) cards.push({ kind: "teacher", title: "From your teacher", line: `${tc.label}${tc.due_at ? ` · due ${new Date(tc.due_at).toLocaleDateString("en-GB", { weekday: "short", timeZone: "Africa/Lagos" })}` : ""}`, item: tc });
  while (cards.length < 3) cards.push({ kind: "explore", title: "Explore Mathematics", line: "Discover something new", item: null });

  const evAt = (ev ?? []).map((e) => e.created_at as string);
  const spans = lessons.map((s) => ({ start: s.started_at as string, end: s.updated_at as string }));
  const streak = streakDays(evAt, spans, now);
  const week = weekRow(learnedDays(evAt, spans), now);
  const lines = await homeLine(admin, tonight.length ? "home_plan_greeting" : "home_plan_empty", { part: partOfDay(now) });
  void studyHour;
  return { firstName: first, initials: initials(profile?.display_name ?? ""), className: "SS3", streak, planGreeting: lines.join(" "), plan: tonight, allPlan: items, cards, week };
}

const partOfDay = (d: Date) => { const h = Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hourCycle: "h23", timeZone: "Africa/Lagos" }).format(d)); return h < 12 ? "morning" : h < 17 ? "afternoon" : "evening"; };
const initials = (n: string) => n.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join("") || "ME";

async function log(admin: Db, userId: string, convId: string, role: "student" | "tutor", text: string, meta: Record<string, unknown>) {
  const { error } = await admin.from("home_messages").insert({ student_id: userId, conversation_id: convId, role, text, meta: meta as Any });
  if (error) console.error("home log failed", error.message);
}

/** Her latest conversation (or none yet) and its messages. */
export async function homeHistory(admin: Db, userId: string, pick?: string | null): Promise<{ conversationId: string | null; msgs: HomeChatMsg[] }> {
  const mine = pick ? (await admin.from("home_conversations").select("id").eq("id", pick).eq("student_id", userId).maybeSingle()).data : null;
  const { data: conv } = mine ? { data: mine } : await admin.from("home_conversations").select("id").eq("student_id", userId).order("updated_at", { ascending: false }).limit(1).maybeSingle();
  if (!conv) return { conversationId: null, msgs: [] };
  const { data } = await admin.from("home_messages").select("id, role, text, meta, created_at").eq("student_id", userId).eq("conversation_id", conv.id).order("created_at", { ascending: true }).limit(200);
  return { conversationId: conv.id, msgs: (data ?? []).map((m) => ({ id: m.id, role: m.role as Any, text: m.text, buttons: ((m.meta as Any)?.buttons ?? []), options: (m.meta as Any)?.options ?? undefined, planView: (m.meta as Any)?.planView ?? undefined })) };
}

/** The conversation to write to: hers if the id is hers, else a new one. */
export async function ensureConversation(admin: Db, userId: string, convId: string | null | undefined, title?: string): Promise<string> {
  if (convId) {
    const { data } = await admin.from("home_conversations").select("id").eq("id", convId).eq("student_id", userId).maybeSingle();
    if (data) { await admin.from("home_conversations").update({ updated_at: new Date().toISOString() }).eq("id", data.id); return data.id; }
  }
  const { data, error } = await admin.from("home_conversations").insert({ student_id: userId, title: title?.slice(0, 80) ?? null }).select("id").single();
  if (error) throw new Error(error.message);
  return data.id;
}

/** Sorts the message: word list first; AI only when unsure (3 s), then the word list again. */
export type SortCtx = { lastTutorLine: string | null; buttons: string[]; recent: string[] };
export async function sortHome(admin: Db, text: string, mode: HomeMode, ctx?: SortCtx): Promise<{ intent: HomeIntent; source: "words" | "ai" | "words_fallback"; ms?: number; ai?: Any }> {
  const w = pickHomeIntentSure(text, mode);
  if (w.sure) return { intent: w.intent, source: "words" };
  const prov = await rule(admin, "ai_provider");
  if (prov !== "lovable_ai") return { intent: w.intent, source: "words" };
  const { classifyHomeMessage } = await import("@/server/providers/ai.server");
  const { redactForAi } = await import("@/shared/intro-moves");
  const ms = Number(await rule(admin, "ai_classify_timeout_ms")) || 3000;
  const t0 = Date.now();
  const c = ctx ? { lastTutorLine: ctx.lastTutorLine, buttons: ctx.buttons, recent: ctx.recent.map((m) => redactForAi(m)) } : undefined;
  const r = await classifyHomeMessage(redactForAi(text), mode, HOME_INTENTS, Math.min(ms, 3000), c);
  const took = Date.now() - t0;
  return r ? { intent: r.intent as HomeIntent, source: "ai", ms: took, ai: r } : { intent: w.intent, source: "words_fallback", ms: took };
}

export type HomeInput =
  | { kind: "text"; text: string; mode: HomeMode }
  | { kind: "card"; itemId: string | null; cardKind: string }
  | { kind: "start_plan" }
  | { kind: "plan_yes"; proposal: Any }
  | { kind: "hw_answer"; answer: string }
  | { kind: "option"; num: number; typed?: string };

export async function lastTutorMeta(admin: Db, userId: string, convId: string): Promise<Any> {
  const { data } = await admin.from("home_messages").select("meta, text").eq("student_id", userId).eq("conversation_id", convId).eq("role", "tutor").order("created_at", { ascending: false }).limit(1).maybeSingle();
  return data ? { ...((data.meta as Any) ?? {}), __text: data.text } : null;
}

/** What "yes" would do after the tutor's last question. Valid until the next question or 10 minutes. */
type Pending = { kind: "item"; itemId: string } | { kind: "plan" } | { kind: "proposal"; proposal: Any } | { kind: "send"; text: string } | { kind: "onboard"; step: Any } | { kind: "return" };
const PENDING_MS = 10 * 60e3;

function pendingFor(action: Action, reply: { lines: string[]; buttons: Any[]; proposal?: Any; options?: Any }, home: HomeData): Pending | null {
  if (reply.options?.length) return null;
  if (action.type === "propose_change" && reply.proposal) return { kind: "proposal", proposal: reply.proposal };
  const asks = /\?\s*$/.test(reply.lines[reply.lines.length - 1] ?? "");
  if (!asks) return null;
  if ((action.type === "greeting" || action.type === "view_plan") && home.plan[0]) return { kind: "item", itemId: home.plan[0].id };
  const b = reply.buttons[0];
  if (b?.action === "start_plan") return { kind: "plan" };
  if (b?.send) return { kind: "send", text: b.send };
  return null;
}

export async function handleHome(admin: Db, userId: string, isAdmin: boolean, input: HomeInput, convId: string): Promise<HomeReply> {
  const home = await loadHome(admin, userId, isAdmin);
  const lastMeta = await lastTutorMeta(admin, userId, convId);
  const prevText: string | null = lastMeta?.__text ?? null;
  const hwState = lastMeta?.hw ?? null;
  const p = lastMeta?.pending as (Pending & { expiresAt: string }) | undefined;
  const pending: Pending | null = p && Date.parse(p.expiresAt) > Date.now() ? p : null;
  const offeredList = (lastMeta?.options ?? []) as HomeOption[];
  const { data: topics } = await admin.from("topics").select("id, display_name, subject, chapter_slug, quest_slug, topic_slug").eq("is_active", true).order("id");

  /** Run an action, swap a repeated line for "pick one", remember any question, log, reply. */
  let resume: Pending | null = null;
  const finish = async (action: Action, intent: string, source: string, carry: Pending | null, extra: Record<string, unknown> = {}): Promise<HomeReply> => {
    // Two unclear messages in a row: offer the three likely actions instead of asking again.
    if (action.type === "rule_line" && action.key === "home_unclear" && lastMeta?.outcome === "home_unclear") action = { type: "rule_line", key: "home_pick_one", buttons: clarify() };
    let reply = await act(admin, userId, home, action);
    if (resume) reply = { ...reply, lines: [...reply.lines, ...await homeLine(admin, "home_onb_resume")], buttons: [...(reply.buttons ?? []), { label: "Sure!", send: "sure" }, { label: "Just start", send: "just start" }] };
    const rep = avoidRepeat(prevText, reply.lines.join(" "));
    if (rep.repeat) reply = { lines: await homeLine(admin, "home_pick_one"), buttons: rep.buttons, outcome: "pick_one" };
    if (reply.navigate && (reply.navigate.to === "lesson" || reply.navigate.to === "intro")) reply = { ...reply, buttons: withContinue(reply.buttons ?? [], reply.navigate.path) as Any };
    const own = rep.repeat ? null : pendingFor(action, reply, home);
    const keep = resume ?? own ?? (reply.options?.length ? null : carry);
    const pend = keep ? { ...keep, expiresAt: own ? new Date(Date.now() + PENDING_MS).toISOString() : (p?.expiresAt ?? new Date(Date.now() + PENDING_MS).toISOString()) } : null;
    await log(admin, userId, convId, "tutor", reply.lines.join(" "), { intent, action: action.type, outcome: reply.outcome, buttons: reply.buttons, hw: reply.hw ?? null, proposal: reply.proposal ?? null, options: reply.options ?? null, planView: reply.planView ?? null, pending: pend, source, topicTitle: reply.topicTitle ?? null, ...extra });
    await refreshTitle(admin, convId);
    return { ...reply, intent, actionType: action.type, source, conversationId: convId };
  };

  // First conversation / "how have you been": her answer to Fiti's own question comes first.
  if (input.kind === "text" && pending && (pending.kind === "onboard" || pending.kind === "return")) {
    const { onboardReply, endIntro } = await import("./opening.server");
    const r = await onboardReply(admin, userId, home, pending, input.text);
    if (r) {
      await log(admin, userId, convId, "student", input.text, { intent: `onboard_${pending.kind === "onboard" ? pending.step : "return"}`, source: "pending", pending });
      const pend = r.pending ? { ...r.pending, expiresAt: new Date(Date.now() + PENDING_MS).toISOString() } : null;
      await log(admin, userId, convId, "tutor", r.lines.join(" "), { intent: "onboard", action: r.step, outcome: r.outcome, buttons: r.buttons, pending: pend, source: "onboard" });
      await refreshTitle(admin, convId);
      return { lines: r.lines, buttons: r.buttons, outcome: r.outcome, intent: "onboard", actionType: r.step, source: "onboard", conversationId: convId };
    }
    // Not an answer: answer what she asked, then ask once to carry on; a second miss ends the setup.
    if (pending.kind === "onboard") { if ((pending as Any).missed) await endIntro(admin, userId); else resume = { ...pending, missed: true } as Any; }
  }
  if (input.kind === "text" && offeredList.length) {
    const n = typedOptionNumber(input.text) ?? typedOptionTitle(input.text, offeredList);
    if (n != null && findOffered<HomeOption>(offeredList, n)) input = { kind: "option", num: n, typed: input.text };
  }
  if (input.kind === "option") {
    const offered = findOffered<HomeOption>(offeredList, input.num);
    if (!offered) {
      // A choice from an older message: never run it; offer what she can do now.
      await log(admin, userId, convId, "student", input.typed ?? `Option ${input.num}`, { intent: "stale_option", source: "option" });
      return finish({ type: "rule_line", key: "home_choice_passed", buttons: clarify() }, "stale_option", "option", null);
    }
    const o = pickOption<HomeOption>(offeredList, input.num);
    if (!o || !o.path) {
      const open = offeredList.find((x) => x.available && x.path);
      await log(admin, userId, convId, "student", input.typed ?? offered.title, { intent: "learn_topic", source: input.typed ? "typed_option" : "option", option: offered.num, pending_match: "pending_option" });
      const lines = await homeLine(admin, "home_quest_soon", { quest: offered.title, option: open?.title ?? "" });
      const buttons = open ? [{ label: `Start ${open.title}`, send: `${open.num}` }] : [];
      await log(admin, userId, convId, "tutor", lines.join(" "), { intent: "learn_topic", action: "quest_unavailable", outcome: "offered", buttons, options: offeredList });
      return { lines, buttons, outcome: "offered", intent: "learn_topic", actionType: "quest_unavailable", source: "option", conversationId: convId };
    }
    await log(admin, userId, convId, "student", input.typed ?? o.title, { intent: "learn_topic", source: input.typed ? "typed_option" : "option", option: o.num, pending_match: "pending_option" });
    const lines = await homeLine(admin, "home_learn_topic", { topic: o.title });
    await log(admin, userId, convId, "tutor", lines.join(" "), { intent: "learn_topic", action: "open_option", outcome: "opened", buttons: withContinue([], o.path), topicTitle: o.title });
    await refreshTitle(admin, convId);
    return { lines, buttons: withContinue([], o.path) as Any, outcome: "opened", intent: "learn_topic", actionType: "open_option", source: "option", navigate: { to: "intro", path: o.path }, conversationId: convId };
  }

  // Her reply to the question just asked is checked before any sorting.
  if (input.kind === "text" && (pending || offeredList.length)) {
    const r = matchPendingReply(input.text);
    if (r) {
      await log(admin, userId, convId, "student", input.text, { intent: `pending_${r}`, source: "pending", pending });
      if (r === "no") return finish({ type: "rule_line", key: "home_pending_no", buttons: [{ label: "See my plan", send: "show me my plan" }, { label: "Quiz me", send: "quiz me" }] }, "pending_no", "pending", null);
      const empty: Action = { type: "rule_line", key: "home_pending_empty", buttons: [{ label: "Quiz me", send: "quiz me" }, { label: "See subjects", send: "teach me maths" }] };
      if (!pending) {
        const open = offeredList.filter((x) => x.available && x.path);
        if (open.length === 1) return handleHome(admin, userId, isAdmin, { kind: "option", num: open[0]!.num, typed: input.text }, convId);
        return finish({ type: "rule_line", key: "home_pick_one", buttons: clarify() }, "pending_yes", "pending", null);
      }
      let action: Action;
      if (pending.kind === "proposal") action = { type: "apply_change", proposal: pending.proposal };
      else if (pending.kind === "item") { const it = home.allPlan.find((i) => i.id === pending.itemId) ?? home.plan[0]; action = it ? { type: "open_item", item: it, first: it.id === home.plan[0]?.id } : empty; }
      else if (pending.kind === "plan") action = home.plan[0] ? { type: "open_item", item: home.plan[0], first: true } : empty;
      else if (pending.kind === "send") {
        const d = extractDetails(pending.text);
        action = decideAction(pickHomeIntentSure(pending.text).intent, { home, details: d, topics: topics ?? [], input: { kind: "text", text: pending.text }, hwState: null });
      } else action = home.plan[0] ? { type: "open_item", item: home.plan[0], first: true } : empty;
      return finish(action, "pending_yes", "pending", null);
    }
  }

  let intent: HomeIntent; let source = "button"; let ms: number | undefined; let studentText: string | null = null;
  const details = input.kind === "text" ? extractDetails(input.text) : { topicWords: null, day: null, time: null, points: [] as [number, number][] };
  if (input.kind === "text") {
    studentText = input.text;
    const { data: rec } = await admin.from("home_messages").select("text").eq("student_id", userId).eq("conversation_id", convId).eq("role", "student").order("created_at", { ascending: false }).limit(4);
    const s = await sortHome(admin, input.text, input.mode, { lastTutorLine: prevText, buttons: ((lastMeta?.buttons ?? []) as Any[]).map((b) => String(b?.label ?? "")).filter(Boolean), recent: (rec ?? []).map((r) => r.text as string).reverse() });
    intent = s.intent; source = s.source; ms = s.ms;
    if (s.ai) { details.topicWords ??= s.ai.topic; details.day ??= s.ai.day; details.time ??= s.ai.time; }
  } else if (input.kind === "start_plan") intent = "start_plan";
  else if (input.kind === "card") intent = input.cardKind === "review" ? "quiz" : input.cardKind === "explore" ? "learn_topic" : "start_plan";
  else if (input.kind === "plan_yes") intent = "change_plan";
  else intent = "homework_help";

  if (intent === "greeting") {
    const { opening } = await import("./opening.server");
    const o = await opening(admin, userId, home);
    if (o) {
      if (studentText != null) await log(admin, userId, convId, "student", studentText, { intent, source, ms });
      return sayOpening(admin, userId, convId, o);
    }
  }
  const action: Action = decideAction(intent, { home, details, topics: topics ?? [], input: input as Any, hwState });
  if (studentText != null) await log(admin, userId, convId, "student", studentText, { intent, source, ms, details });
  // A different request keeps the earlier question open for her next "yes" (e.g. "show me the plan first").
  return finish(action, intent, source, input.kind === "text" ? pending : null);
}

async function sayOpening(admin: Db, userId: string, convId: string, o: Any): Promise<HomeReply> {
  const pend = o.pending ? { ...o.pending, expiresAt: new Date(Date.now() + PENDING_MS).toISOString() } : null;
  await log(admin, userId, convId, "tutor", o.lines.join(" "), { intent: "opening", action: `opening_${o.kind}`, outcome: o.outcome, buttons: o.buttons, pending: pend, source: "opening" });
  return { lines: o.lines, buttons: o.buttons, outcome: o.outcome, intent: "opening", actionType: `opening_${o.kind}`, source: "opening", conversationId: convId };
}

/** Opening a fresh Ask Fiti conversation: the first-time talk, or a situation-aware hello once per day. */
export async function homeOpening(admin: Db, userId: string, isAdmin: boolean, convId: string | null): Promise<HomeReply | null> {
  if (convId) {
    const { count } = await admin.from("home_messages").select("id", { count: "exact", head: true }).eq("conversation_id", convId);
    if (count) return null;
  }
  const home = await loadHome(admin, userId, isAdmin);
  const { opening } = await import("./opening.server");
  const o = await opening(admin, userId, home);
  if (!o || o.kind === "normal") return null;
  const id = await ensureConversation(admin, userId, convId, "Hello");
  return sayOpening(admin, userId, id, o);
}

async function act(admin: Db, userId: string, home: HomeData, a: Action): Promise<Omit<HomeReply, "intent" | "actionType" | "source">> {
  const L = (k: string, v: Record<string, string | number> = {}) => homeLine(admin, k, v);
  switch (a.type) {
    case "open_item": {
      const it = a.item;
      if (it.kind === "review" && it.skillId) return act(admin, userId, home, { type: "quiz", topicId: it.topicId, label: it.label, skillId: it.skillId });
      return { lines: await L(a.first ? "home_start_plan" : "home_learn_topic", { item: it.label, topic: it.label }), navigate: { to: it.kind === "continue" ? "lesson" : "intro", path: it.path }, buttons: [], outcome: "opened", topicTitle: it.label };
    }
    case "quiz": {
      const q = await buildQuiz(admin, userId, a.topicId, a.skillId);
      if (!q) return { lines: await L("home_quiz_none"), buttons: [], outcome: "no_items" };
      return { lines: await L("home_quiz", { n: q.n, topic: a.label }), navigate: { to: "quiz", sessionId: q.sessionId }, buttons: [], outcome: "quiz_built", topicTitle: a.label };
    }
    case "homework_start": {
      const steps = gradientSteps(a.points);
      if (!steps) return { lines: [...await L("home_hw_cannot"), ...await L("home_offer_lesson")], buttons: [{ label: "Start the lesson", send: "teach me gradient" }], outcome: "cannot_step" };
      return { lines: await L("home_hw_start", { step_question: steps[0]!.question }), buttons: [], outcome: "hw_started", hw: { points: a.points, step: 0 } };
    }
    case "homework_answer": {
      const steps = gradientSteps(a.state.points)!;
      const st = steps[a.state.step]!;
      const ok = checkStep(st, a.answer);
      if (ok === null) return { lines: await L("home_hw_unreadable"), buttons: [], outcome: "unreadable", hw: a.state };
      if (!ok) return { lines: await L("home_hw_not_quite", { hint: st.hint }), buttons: [], outcome: "step_wrong", hw: a.state };
      const nextStep = steps[a.state.step + 1];
      if (!nextStep) return { lines: await L("home_hw_done"), buttons: [{ label: "Start the lesson", send: "teach me gradient" }], outcome: "hw_done" };
      return { lines: await L("home_hw_next", { step_question: nextStep.question }), buttons: [], outcome: "step_right", hw: { ...a.state, step: a.state.step + 1 } };
    }
    case "propose_change": {
      return { lines: await L("home_plan_propose", { item: a.item.label, when: a.whenLabel }), buttons: [], outcome: "proposed", proposal: { itemId: a.item.id, topicId: a.item.topicId, label: a.item.label, to: a.to, whenLabel: a.whenLabel, add: a.add ?? false } };
    }
    case "apply_change": {
      const p = a.proposal;
      if (p.add) {
        const { data, error } = await admin.from("plan_items").insert({ student_id: userId, topic_id: p.topicId, source: "own", planned_for: p.to, created_by: userId }).select("id").single();
        if (error) { console.error(error.message); return { lines: await L("home_plan_failed"), buttons: [], outcome: "save_failed" }; }
        await admin.from("plan_changes").insert({ student_id: userId, plan_item_id: data.id, action: "add", new_value: p });
      } else if (/^[0-9a-f-]{36}$/.test(p.itemId)) {
        const { data: old } = await admin.from("plan_items").select("planned_for, source").eq("id", p.itemId).eq("student_id", userId).maybeSingle();
        if (!old) return { lines: await L("home_plan_failed"), buttons: [], outcome: "not_found" };
        await admin.from("plan_items").update({ planned_for: p.to }).eq("id", p.itemId);
        await admin.from("plan_changes").insert({ student_id: userId, plan_item_id: p.itemId, action: "move", old_value: old, new_value: p });
      } else {
        // Engine-built items (lesson in progress, review, next topic) become her own planned item.
        const { data, error } = await admin.from("plan_items").insert({ student_id: userId, topic_id: p.topicId, source: "own", label: p.label, planned_for: p.to, created_by: userId }).select("id").single();
        if (error) { console.error(error.message); return { lines: await L("home_plan_failed"), buttons: [], outcome: "save_failed" }; }
        await admin.from("plan_changes").insert({ student_id: userId, plan_item_id: data.id, action: "move", new_value: p });
      }
      return { lines: await L("home_plan_saved", { item: p.label, when: p.whenLabel }), buttons: [], outcome: "saved" };
    }
    case "locked_item": return { lines: await L("home_plan_locked", { item: a.item.label }), buttons: [], outcome: "locked" };
    case "ask_when": return { lines: await L("home_plan_ask_when", { item: a.item.label }), buttons: [{ label: "Tomorrow 7 pm", send: "move it to tomorrow 7pm" }, { label: "Saturday 10 am", send: "move it to saturday 10am" }], outcome: "asked_when" };
    case "progress": {
      const { data: ev } = await admin.from("evidence").select("correct").eq("student_id", userId);
      const right = (ev ?? []).filter((e) => e.correct).length;
      const due = home.allPlan.filter((i) => i.kind === "review").length;
      return { lines: await L(due ? "home_progress_review" : "home_progress", { right, total: (ev ?? []).length, item: home.allPlan.find((i) => i.kind === "review")?.label ?? "" }), buttons: [{ label: "See Progress", link: "/progress" }], outcome: "summary" };
    }
    case "topic_answer": {
      const { groundedAnswer } = await import("@/server/lesson/tutor-chat.server");
      const g = await groundedAnswer(admin, a.topicId, a.text, ["intro"], { visible: [], hiddenItemIds: [] });
      const lines = g.text ? [g.text] : await L("home_topic_question");
      return { lines: [...lines, ...await L("home_want_lesson")], buttons: [{ label: "Start the lesson", send: "teach me gradient" }], outcome: g.text ? "ai_answer" : "approved_line" };
    }
    case "unavailable": return { lines: await L("home_unavailable", { subject: a.subject, option: a.option }), buttons: [{ label: `Yes, ${a.option}`, send: `teach me ${a.option.toLowerCase()}` }], outcome: "offered" };
    case "greeting": return { lines: await L(home.plan.length ? "home_greeting" : "home_greeting_empty", { first_name: home.firstName ?? "there", item: home.plan[0]?.label ?? "" }), buttons: home.plan.length ? [{ label: "Start tonight's plan", action: "start_plan" }] : [], outcome: "greeted" };
    case "rule_line": return { lines: await L(a.key), buttons: a.buttons ?? [], outcome: a.key };
    case "list_quests": {
      const { data: ts } = await admin.from("topics").select("id, display_name, subject, chapter, quest, chapter_slug, quest_slug, topic_slug").eq("is_active", true).order("id");
      const maths = (ts ?? []).filter((t) => /math/i.test(t.subject ?? ""));
      const chapter = maths[0]?.chapter ?? "Coordinate Geometry";
      const rows = questRows(chapter, maths.map((t) => ({ chapter: t.chapter, quest: t.quest, displayName: t.display_name })));
      const options: HomeOption[] = rows.slice(0, 3).map((q) => {
        const t = maths.find((x) => x.quest === q.dbName);
        return { num: q.num, title: q.name, line: q.description, available: q.open && !!t, path: t ? { subject: subjectKeyFor(t.subject), chapter: t.chapter_slug ?? "general", quest: t.quest_slug ?? "general", topic: t.topic_slug ?? "general" } : null };
      });
      return { lines: await L("home_list_quests", { n: options.length }), buttons: [], outcome: "listed", options };
    }
    case "view_plan": {
      if (!home.allPlan.length) return { lines: await L("home_plan_empty_reply"), buttons: [{ label: "Quiz me", send: "quiz me" }], outcome: "plan_empty" };
      const first = home.plan[0];
      return { lines: await L(a.made ? "home_plan_made" : "home_plan_view", { first_name: home.firstName ?? "there" }), planView: planView(home), outcome: "plan_shown",
        buttons: [...(first ? [{ label: `Start ${first.label}`, action: "start_plan" as const }] : []), { label: "Open My plan", link: "/my-plan" }] };
    }
    case "explore": return { lines: await L("home_explore"), navigate: { to: "subject" }, buttons: [], outcome: "opened" };
  }
}

/** 5 items (fewer if not enough) from video checks, worksheet and repair practice, never exit ticket or guided;
 *  weak and due skills first; skips items she saw in the last 24 hours. */
async function buildQuiz(admin: Db, userId: string, topicId: string, skillId?: string): Promise<{ sessionId: string; n: number } | null> {
  const [{ data: items }, { data: reps }, { data: ev }] = await Promise.all([
    admin.from("items").select("id, step, kind, skill_ids").eq("topic_id", topicId),
    admin.from("repairs").select("practice_item_id").eq("topic_id", topicId),
    admin.from("evidence").select("item_id, skill_id, correct, confidence, strength, misconception_id, created_at, session_id").eq("student_id", userId),
  ]);
  const practice = new Set((reps ?? []).map((r) => r.practice_item_id).filter(Boolean) as string[]);
  const since = Date.now() - 24 * 3600e3;
  const seen = new Set((ev ?? []).filter((e) => new Date(e.created_at as string).getTime() > since).map((e) => e.item_id));
  const pool = (items ?? []).filter((i) => (i.step === "video" || i.step === "worksheet" || practice.has(i.id)) && !seen.has(i.id) && (i.kind === "mcq" || i.kind === "line_work" || i.kind === "numeric"));
  const weak = new Set(reviewDue((ev ?? []) as EvidenceRow[], new Date(), 0));
  const score = (i: Any) => (skillId && i.skill_ids.includes(skillId) ? 0 : i.skill_ids.some((s: string) => weak.has(s)) ? 1 : 2);
  const pick = pool.sort((a, b) => score(a) - score(b) || a.id.localeCompare(b.id)).slice(0, 5);
  if (!pick.length) return null;
  const { data: lastAttempt } = await admin.from("sessions").select("attempt").eq("student_id", userId).eq("topic_id", topicId).order("attempt", { ascending: false }).limit(1).maybeSingle();
  const { data, error } = await admin.from("sessions").insert({ student_id: userId, topic_id: topicId, attempt: (lastAttempt?.attempt ?? 0) + 1, status: "completed", completed_at: new Date().toISOString(), state: { kind: "quiz", items: pick.map((i) => i.id), answers: {} } as Any }).select("id").single();
  if (error) { console.error("quiz create failed", error.message); return null; }
  return { sessionId: data.id, n: pick.length };
}

export { lagosDay, planDateFrom };

/** Her past chats for Chat history: only her own, after her latest Start again, with at least one message from her. */
/** Rename the chat after what happened in it (event titles only; no AI here so replies stay fast). */
async function refreshTitle(admin: Db, convId: string) {
  try {
    const { chatTitle } = await import("./conversations");
    const [{ data: conv }, { data: msgs }] = await Promise.all([
      admin.from("home_conversations").select("title, title_source").eq("id", convId).maybeSingle(),
      admin.from("home_messages").select("role, text, meta, created_at").eq("conversation_id", convId).order("created_at", { ascending: true }).limit(200),
    ]);
    const t = chatTitle((msgs ?? []) as Any);
    if (t && t !== conv?.title) await admin.from("home_conversations").update({ title: t, title_source: "event" }).eq("id", convId);
  } catch (e) { console.error("chat title failed", e); }
}

/** Fill in titles for older chats: event rules first, then an AI title (checked) for the newest few, else her first real message. */
async function backfillTitles(admin: Db, convs: { id: string; title: string | null; title_source?: string | null }[]) {
  const { chatTitle, firstMessageTitle, checkChatTitle } = await import("./conversations");
  const todo = convs.filter((c) => c.title_source !== "event" && c.title_source !== "ai");
  if (!todo.length) return;
  const { data: msgs } = await admin.from("home_messages").select("conversation_id, role, text, meta, created_at").in("conversation_id", todo.map((c) => c.id)).order("created_at", { ascending: true }).limit(3000);
  const { titleChat } = await import("@/server/providers/ai.server");
  const { data: bw } = await admin.from("rules").select("value").eq("key", "banned_words").is("topic_id", null).limit(1);
  const banned = Array.isArray(bw?.[0]?.value) ? (bw![0]!.value as string[]) : undefined;
  const { data: prov } = await admin.from("rules").select("value").eq("key", "ai_provider").is("topic_id", null).limit(1);
  let aiLeft = prov?.[0]?.value === "lovable_ai" ? 10 : 0;
  await Promise.all(todo.map(async (c) => {
    const mine = (msgs ?? []).filter((m) => m.conversation_id === c.id) as Any[];
    const ev = chatTitle(mine);
    let title = ev, source = "event";
    if (!title) {
      const studentText = mine.filter((m) => m.role === "student").map((m) => m.text).join(" \n ");
      const ai = studentText && aiLeft-- > 0 ? await titleChat(studentText.slice(0, 1200), 3000).catch(() => null) : null;
      if (ai && checkChatTitle(ai, studentText, banned)) { title = ai; source = "ai"; }
      else if (c.title_source === "first") return;
      else { title = firstMessageTitle(mine); source = "first"; }
    }
    if (!title) return;
    c.title = title; c.title_source = source;
    await admin.from("home_conversations").update({ title, title_source: source }).eq("id", c.id);
  }));
}

export async function listConversations(admin: Db, userId: string) {
  const { summarize } = await import("./conversations");
  const { data: convs } = await admin.from("home_conversations").select("id, title, title_source, updated_at, created_at").eq("student_id", userId).order("updated_at", { ascending: false }).limit(100);
  const ids = (convs ?? []).map((c) => c.id);
  const { data: msgs } = ids.length
    ? await admin.from("home_messages").select("conversation_id, role, text, created_at").eq("student_id", userId).eq("role", "student").in("conversation_id", ids).order("created_at", { ascending: true }).limit(2000)
    : { data: [] };
  const has = new Set((msgs ?? []).map((m) => m.conversation_id));
  await backfillTitles(admin, (convs ?? []).filter((c) => has.has(c.id)).slice(0, 50)).catch((e) => console.error("title backfill failed", e));
  return summarize(convs ?? [], msgs ?? []);
}
