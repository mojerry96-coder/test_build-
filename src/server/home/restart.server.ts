// "Start again" for any signed-in student: ends only her own open lessons (kept as history), starts a clean
// Ask Fiti chat, resets the first-time talk, and writes the restart_journey audit row the progress cutoff reads.
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

type Db = SupabaseClient<Database>;
export const RESTART_COOLDOWN_MS = 60_000;

/** Pure: a restart is allowed when the last one was over a minute ago. */
export function canRestart(lastAt: string | null, now: Date): boolean {
  return !lastAt || now.getTime() - new Date(lastAt).getTime() >= RESTART_COOLDOWN_MS;
}

/** Pure: whole seconds left before another restart is allowed (0 = allowed). */
export function cooldownSecondsLeft(lastAt: string | null, now: Date): number {
  if (!lastAt) return 0;
  const left = RESTART_COOLDOWN_MS - (now.getTime() - new Date(lastAt).getTime());
  return left > 0 ? Math.ceil(left / 1000) : 0;
}

export const COOLDOWN_PREFIX = "RESTART_COOLDOWN:";

export async function restartMyJourney(admin: Db, userId: string): Promise<{ ok: true; ended: number; repeat?: true }> {
  const { data: last } = await admin.from("admin_audit").select("created_at").eq("actor_id", userId)
    .contains("details", { section: "restart_journey" }).order("created_at", { ascending: false }).limit(1).maybeSingle();
  const left = cooldownSecondsLeft(last?.created_at ?? null, new Date());
  if (left > 0 && last) {
    // Nothing done since the last restart → she is already on a clean slate.
    const [s, m] = await Promise.all([
      admin.from("sessions").select("id", { count: "exact", head: true }).eq("student_id", userId).gt("started_at", last.created_at),
      admin.from("home_messages").select("id", { count: "exact", head: true }).eq("student_id", userId).gt("created_at", last.created_at),
    ]);
    if (!s.error && !m.error && !s.count && !m.count) return { ok: true, ended: 0, repeat: true };
    throw new Error(COOLDOWN_PREFIX + left);
  }
  const t0 = Date.now();
  const { data: rows } = await admin.from("sessions").select("id").eq("student_id", userId).in("status", ["active", "paused"]);
  const mine = (rows ?? []).map((r) => r.id);
  const { resetIntro } = await import("@/server/home/opening.server");
  // Independent resets run together; the audit row (the progress cutoff) is written last.
  const [u] = await Promise.all([
    mine.length ? admin.from("sessions").update({ status: "abandoned", completed_at: new Date().toISOString() }).in("id", mine).eq("student_id", userId) : Promise.resolve({ error: null }),
    admin.from("home_conversations").insert({ student_id: userId, title: null }),
    resetIntro(admin, userId),
  ]);
  if (u.error) throw new Error("Could not start again.");
  const a = await admin.from("admin_audit").insert({ action: "dev_tool_used", actor_id: userId, details: { section: "restart_journey", what: "student start again", ms: Date.now() - t0 } });
  if (a.error) throw new Error("Could not start again.");
  return { ok: true, ended: mine.length };
}
