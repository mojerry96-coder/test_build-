import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
export const testDataSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("options") }),
  z.object({ action: z.literal("restart"), studentId: z.string().uuid(), topicId: z.string().min(1).max(100) }),
  z.object({ action: z.literal("reset"), confirmation: z.literal("RESET") }),
]);
export async function testData(user: SupabaseClient<Database>, actorId: string, input: unknown) {
  const data = testDataSchema.parse(input);
  const { data: allowed, error } = await user.rpc("has_role", { _user_id: actorId, _role: "admin" });
  if (error || !allowed) throw new Error("Admin access required.");
  const { supabaseAdmin: admin } = await import("@/integrations/supabase/client.server");
  if (data.action === "options") {
    const students = await admin.from("user_roles").select("user_id").eq("role", "student");
    if (students.error) throw students.error;
    const ids = (students.data ?? []).map(s => s.user_id);
    const profiles = ids.length ? await admin.from("profiles").select("id, display_name").in("id", ids) : { data: [], error: null };
    const topics = await admin.from("topics").select("id, display_name");
    if (profiles.error || topics.error) throw new Error("Could not load test data choices.");
    return { students: profiles.data ?? [], topics: topics.data ?? [] };
  }
  // Write the audit record before mutation: an audit failure must prevent any deletion.
  const audit = await admin.from("admin_audit").insert({ actor_id: actorId, action: `test_data_${data.action}`, details: data });
  if (audit.error) throw audit.error;
  let count = 0;
  if (data.action === "restart") {
    const r = await admin.from("sessions").update({ status: "abandoned", completed_at: new Date().toISOString() }).eq("student_id", data.studentId).eq("topic_id", data.topicId).in("status", ["active", "paused"]).select("id");
    if (r.error) throw r.error;
    count = r.data?.length ?? 0;
  } else {
    // All runtime session data, including events, evidence, summaries, turns and flags,
    // has ON DELETE CASCADE. No content, identity or role table is mutated.
    const r = await admin.from("sessions").delete().not("id", "is", null).select("id");
    if (r.error) throw r.error;
    count = r.data?.length ?? 0;
  }
  const done = await admin.from("admin_audit").insert({ actor_id: actorId, action: `test_data_${data.action}_success`, details: data });
  if (done.error) throw done.error;
  return { students: [], topics: [], count };
}
