import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

type Db = SupabaseClient<Database>;

export type SessionStartResult = { ok: true; sessionId: string } | { ok: false; message: string };

/**
 * session-start: user = RLS-scoped client for the caller; admin = service client
 * (runtime tables are written only from the server).
 */
export async function sessionStart(user: Db, admin: Db, userId: string, topicId: string): Promise<SessionStartResult> {
  const { data: isStudent } = await user.rpc("has_role", { _user_id: userId, _role: "student" });
  if (!isStudent) return { ok: false, message: "Your account is waiting for access." };

  const { data: topic } = await user.from("topics").select("id, is_active").eq("id", topicId).maybeSingle();
  if (!topic || !topic.is_active) return { ok: false, message: "This lesson isn't available right now." };

  const { data: consent } = await user.rpc("has_learning_consent", { _student_id: userId });
  if (!consent) return { ok: false, message: "A parent or guardian needs to give permission before you can start." };

  const { data: openRule } = await admin.from("rules").select("value").eq("key", "dev_open_access").or(`topic_id.eq.${topicId},topic_id.is.null`).order("topic_id", { ascending: true, nullsFirst: false }).limit(1).maybeSingle();
  const consentBasis = openRule?.value === true ? "dev_open_access" : "guardian";

  // A preview lesson can be open beside her real one; only the real one is ever resumed here.
  const { data: open } = await admin
    .from("sessions").select("id, state")
    .eq("student_id", userId).eq("topic_id", topicId).in("status", ["active", "paused"]);
  const active = (open ?? []).find((r) => (r.state as { consent_basis?: string } | null)?.consent_basis !== "admin_preview");

  if (active) {
    await logEvent(admin, active.id, "session_resumed");
    return { ok: true, sessionId: active.id };
  }

  const { data: last } = await admin
    .from("sessions").select("attempt").eq("student_id", userId).eq("topic_id", topicId)
    .order("attempt", { ascending: false }).limit(1).maybeSingle();

  const { data: pack } = await admin
    .from("content_imports").select("pack_version")
    .eq("topic_id", topicId).eq("status", "success").eq("dry_run", false)
    .order("created_at", { ascending: false }).limit(1).maybeSingle();

  const { data: created, error } = await admin
    .from("sessions")
    .insert({
      student_id: userId,
      topic_id: topicId,
      attempt: (last?.attempt ?? 0) + 1,
      pack_version: pack?.pack_version ?? null,
      state: { consent_basis: consentBasis },
    })
    .select("id").single();
  if (error || !created) {
    console.error("session-start insert failed", error);
    return { ok: false, message: "We couldn't start the lesson. Please try again." };
  }
  await logEvent(admin, created.id, "session_started");
  return { ok: true, sessionId: created.id };
}

async function logEvent(admin: Db, sessionId: string, type: string) {
  const { data: lastEvt } = await admin.from("events").select("seq").eq("session_id", sessionId)
    .order("seq", { ascending: false }).limit(1).maybeSingle();
  await admin.from("events").insert({
    session_id: sessionId, seq: (lastEvt?.seq ?? 0) + 1, actor: "system", type, payload: {},
  });
}
