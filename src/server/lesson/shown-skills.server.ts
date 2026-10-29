// The one rule for "she has already shown this skill", used by the topic intro and the warm-up.
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { countsAsShown, type EvidenceRow } from "./warmup";

type Db = SupabaseClient<Database>;
export type ShownSkill = { evidenceId: string; sessionId: string; at: string; strength: string | null; status: string | null; correct: boolean | null };

/** Admin Restart (dev tool "restart_journey") makes the admin count as a new student: earlier evidence is ignored. */
export async function resetAt(admin: Db, userId: string): Promise<string | null> {
  const { data } = await admin.from("admin_audit").select("created_at").eq("actor_id", userId).eq("action", "dev_tool_used")
    .contains("details", { section: "restart_journey" }).order("created_at", { ascending: false }).limit(1).maybeSingle();
  return data?.created_at ?? null;
}

export async function shownSkills(admin: Db, userId: string): Promise<Map<string, ShownSkill>> {
  const [{ data }, reset] = await Promise.all([
    admin.from("evidence").select("id, session_id, skill_id, correct, strength, status, created_at, sessions(status, state)").eq("student_id", userId)
      .or("status.eq.shown,correct.eq.true").order("created_at"),
    resetAt(admin, userId),
  ]);
  const out = new Map<string, ShownSkill>();
  for (const r of data ?? []) {
    const s = r.sessions as { status?: string; state?: { consent_basis?: string } } | null;
    const row: EvidenceRow = { id: r.id, skill_id: r.skill_id, correct: r.correct, strength: r.strength, status: r.status, created_at: r.created_at,
      session_status: s?.status ?? null, consent_basis: s?.state?.consent_basis ?? null };
    if (countsAsShown(row, reset) && !out.has(r.skill_id!))
      out.set(r.skill_id!, { evidenceId: r.id, sessionId: r.session_id, at: r.created_at, strength: r.strength, status: r.status, correct: r.correct });
  }
  return out;
}
