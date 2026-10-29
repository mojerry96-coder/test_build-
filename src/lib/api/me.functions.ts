import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { LessonStep } from "@/shared/contracts/enums";
import { subjectKeyFor } from "@/shared/routes";
import { afterRestart } from "@/shared/restart-cutoff";

export type MeTopic = {
  id: string; displayName: string; subject: string | null; chapter: string | null; quest: string | null;
  activeStep: LessonStep | null; activeSessionId: string | null; secure: boolean; completed: boolean;
  /** Start time of her most recent session on this topic, if any. */
  lastWorkedAt: string | null;
  /** True once she has answered something in her open lesson; until then Enter Quest shows the intro again. */
  resumeLesson: boolean;
  /** Readable address segments for this topic. */
  path: { subject: string; chapter: string; quest: string; topic: string };
};
export type Me = { firstName: string | null; roles: string[]; isAdmin: boolean; isStudent: boolean; topics: MeTopic[] };

export const getMeFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<Me> => {
    const { supabase, userId } = context;
    const [{ data: profile }, { data: roles }] = await Promise.all([
      supabase.from("profiles").select("display_name").eq("id", userId).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", userId),
    ]);
    const roleList = (roles ?? []).map((r) => r.role as string);
    const isStudent = roleList.includes("student");
    let topics: MeTopic[] = [];
    if (isStudent || roleList.includes("admin")) {
      const [{ data: t }, { data: s }] = await Promise.all([
        supabase.from("topics").select("id, display_name, subject, chapter, quest, chapter_slug, quest_slug, topic_slug").eq("is_active", true).order("id"),
        supabase.from("sessions").select("id, topic_id, step, status, state, started_at").eq("student_id", userId).order("started_at", { ascending: false }),
      ]);
      // After an admin Restart, nothing from before it counts (clean map, no "done" cards).
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { resetAt } = await import("@/server/lesson/shown-skills.server");
      const cutoff = await resetAt(supabaseAdmin, userId).catch(() => null);
      topics = (t ?? []).map((row) => {
        // Admin preview lessons never count towards progress.
        const mine = afterRestart(s ?? [], cutoff).filter((x) => x.topic_id === row.id && (x.state as { consent_basis?: string } | null)?.consent_basis !== "admin_preview" && (x.state as { kind?: string } | null)?.kind !== "quiz");
        const sess = mine.find((x) => x.status === "active" || x.status === "paused");
        const done = mine.filter((x) => x.status === "completed");
        const secure = done.some((x) => (x.state as { secure?: boolean } | null)?.secure === true);
        return {
          id: row.id, displayName: row.display_name, subject: row.subject, chapter: row.chapter, quest: row.quest,
          activeStep: (sess?.step as LessonStep) ?? null, activeSessionId: sess?.id ?? null, secure, completed: done.length > 0,
          resumeLesson: !!sess && !(sess.step === "readiness" && !Object.keys(((sess.state as { demo?: { results?: object; attempts?: object } } | null)?.demo?.attempts) ?? {}).length),
          lastWorkedAt: (mine[0]?.started_at as string | undefined) ?? null,
          path: { subject: subjectKeyFor(row.subject), chapter: row.chapter_slug ?? "general", quest: row.quest_slug ?? "general", topic: row.topic_slug ?? "general" },
        };
      });
    }
    // Voice: the helper bubble's lines (Home tips, each chapter's "next adventure") are built in the browser; note them so they may be spoken.
    const { noteShown } = await import("@/server/providers/voice-ledger.server");
    const { homeTips, nextAdventure } = await import("@/shared/home-tips");
    const { questRows } = await import("@/shared/quests-display");
    const adventures = [...new Set(topics.map((t) => t.chapter))].flatMap((c) => {
      const q = c ? questRows(c, topics.filter((t) => t.chapter === c)).find((r) => r.open)?.name : null;
      return q ? [nextAdventure(q)] : [];
    });
    await noteShown(userId, [...homeTips(true), ...adventures, `Hello, ${profile?.display_name ?? "there"}! What shall we learn today?`]);
    return { firstName: profile?.display_name ?? null, roles: roleList, isAdmin: roleList.includes("admin"), isStudent, topics };
  });

export const checkAdminFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    return { isAdmin: !!data };
  });
