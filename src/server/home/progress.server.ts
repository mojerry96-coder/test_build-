// Her own progress (admin client, called only after auth with her own user id).
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import type { ProgressData } from "@/shared/contracts/progress";
import { countProgress } from "./progress";
import { homeLine } from "./agent.server";

type Db = SupabaseClient<Database>;

export async function loadProgress(admin: Db, userId: string, sessionId: string, done: number): Promise<ProgressData> {
  const [{ data: ev }, { data: audits }, { data: s }] = await Promise.all([
    admin.from("evidence").select("created_at, correct, is_first_try, status, session_id").eq("student_id", userId),
    admin.from("admin_audit").select("created_at").eq("action", "dev_tool_used").contains("details", { section: "restart_journey" }).eq("actor_id", userId),
    admin.from("sessions").select("topic_id").eq("id", sessionId).eq("student_id", userId).maybeSingle(),
  ]);
  const cutoff = (audits ?? []).map((a) => a.created_at).sort().pop() ?? null;
  const { data: topicSessions } = s?.topic_id
    ? await admin.from("sessions").select("id").eq("student_id", userId).eq("topic_id", s.topic_id)
    : { data: [] as { id: string }[] };
  const c = countProgress((ev ?? []).map((e) => ({ ...e, quiz: e.status === "quiz" })), cutoff, (topicSessions ?? []).map((t) => t.id));
  const fitiLine = (await homeLine(admin, done > 0 ? "progress_going" : "progress_start", { done })).join(" ");
  return { stepsDone: done, ...c, fitiLine };
}
