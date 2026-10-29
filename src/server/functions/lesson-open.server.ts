// Opens a lesson from its readable address. Ownership checks stay in session-start / demo path.
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { SUBJECT_MATCH, subjectKeyFor, type TopicPath } from "@/shared/routes";
import { sessionStart } from "./session-start.server";

type Db = SupabaseClient<Database>;
type TopicRow = { id: string; subject: string | null; chapter_slug: string | null; quest_slug: string | null; topic_slug: string | null; is_active: boolean };

export type OpenLessonResult =
  | { kind: "session"; sessionId: string; topicId: string }
  | { kind: "redirect"; to: TopicPath; search: { attempt?: number; preview?: 1 } }
  | { kind: "locked"; subject: string }
  | { kind: "notfound" }
  | { kind: "error"; message: string };

export const pathOf = (t: TopicRow): TopicPath => ({
  subject: subjectKeyFor(t.subject), chapter: t.chapter_slug ?? "general", quest: t.quest_slug ?? "general", topic: t.topic_slug ?? "general",
});

/** Finds the topic for an address, following renamed slugs. `renamed` = an old slug was used. */
export async function findTopic(admin: Db, p: TopicPath): Promise<{ topic: TopicRow; renamed: boolean } | null> {
  const re = SUBJECT_MATCH[p.subject];
  if (!re) return null;
  const { data } = await admin.from("topics").select("id, subject, chapter_slug, quest_slug, topic_slug, is_active");
  const rows = ((data ?? []) as TopicRow[]).filter((t) => re.test(t.subject ?? ""));
  const exact = rows.find((t) => t.chapter_slug === p.chapter && t.quest_slug === p.quest && t.topic_slug === p.topic);
  if (exact) return { topic: exact, renamed: false };
  const { data: hist } = await admin.from("slug_history").select("kind, old_slug, topic_id").in("topic_id", rows.map((r) => r.id));
  const old = (id: string, kind: string, slug: string) => (hist ?? []).some((h) => h.topic_id === id && h.kind === kind && h.old_slug === slug);
  const match = rows.find((t) =>
    (t.chapter_slug === p.chapter || old(t.id, "chapter", p.chapter)) &&
    (t.quest_slug === p.quest || old(t.id, "quest", p.quest)) &&
    (t.topic_slug === p.topic || old(t.id, "topic", p.topic)));
  return match ? { topic: match, renamed: true } : null;
}

export async function openLesson(
  user: Db, admin: Db, userId: string,
  input: TopicPath & { attempt?: number | undefined; preview?: boolean | undefined },
  previewStart: (topicId: string) => Promise<string>,
): Promise<OpenLessonResult> {
  const found = await findTopic(admin, input);
  if (!found) return { kind: "notfound" };
  const { topic, renamed } = found;
  if (renamed) {
    return { kind: "redirect", to: pathOf(topic), search: { ...(input.attempt ? { attempt: input.attempt } : {}), ...(input.preview ? { preview: 1 as const } : {}) } };
  }
  if (input.preview) {
    try { return { kind: "session", sessionId: await previewStart(topic.id), topicId: topic.id }; }
    catch (e) { return { kind: "error", message: e instanceof Error ? e.message : "Preview is not available." }; }
  }
  if (!topic.is_active) return { kind: "locked", subject: input.subject };
  if (input.attempt) {
    const { data: s } = await admin.from("sessions").select("id, state").eq("student_id", userId).eq("topic_id", topic.id).eq("attempt", input.attempt).maybeSingle();
    if (!s || (s.state as { consent_basis?: string } | null)?.consent_basis === "admin_preview") return { kind: "notfound" };
    return { kind: "session", sessionId: s.id, topicId: topic.id };
  }
  const res = await sessionStart(user, admin, userId, topic.id);
  return res.ok ? { kind: "session", sessionId: res.sessionId, topicId: topic.id } : { kind: "error", message: res.message };
}

/** Old /lesson/[id] address: the owner's readable lesson address, or null (go Home). */
export async function lessonPathForSession(admin: Db, userId: string, sessionId: string): Promise<{ to: TopicPath; search: { attempt?: number; preview?: 1 } } | null> {
  const { data: s } = await admin.from("sessions").select("topic_id, attempt, status, state").eq("id", sessionId).eq("student_id", userId).maybeSingle();
  if (!s) return null;
  const { data: t } = await admin.from("topics").select("id, subject, chapter_slug, quest_slug, topic_slug, is_active").eq("id", s.topic_id).maybeSingle();
  if (!t) return null;
  const preview = (s.state as { consent_basis?: string } | null)?.consent_basis === "admin_preview";
  const open = s.status === "active" || s.status === "paused";
  return { to: pathOf(t as TopicRow), search: preview ? { preview: 1 } : open ? {} : { attempt: s.attempt } };
}
