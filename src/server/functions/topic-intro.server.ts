import { shownSkills } from "@/server/lesson/shown-skills.server";
import { countWords } from "@/shared/count-words";
import { nextKey, warmupWords, welcomeKey } from "@/shared/intro-welcome";
// Topic intro (before the lesson): reads the topic, its warm-up skills and the approved intro lines.
// Replies to typed messages pick one approved move by keyword until the AI is connected.
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import type { TopicPath } from "@/shared/routes";
import { findTopic, pathOf } from "./lesson-open.server";
import type { IntroMove } from "@/shared/intro-moves";
import { groundedAnswer, sortMessage } from "@/server/lesson/tutor-chat.server";
import { boundaryRole } from "@/server/lesson/boundary";

type Db = SupabaseClient<Database>;
const NUM_WORDS = ["no", "one", "two", "three", "four", "five", "six"];

export type TopicIntro =
  | { kind: "intro"; topicId: string; topicName: string; chapter: string | null; quest: string | null; path: TopicPath;
      skills: string[]; body: string[]; opening: string; welcome: string[]; hasActive: boolean;
      /** Approved "Let's Begin" map lines by key; stop placeholders ({stop_n}, {stop_name}, …) are filled in the browser. */
      pathLines: Record<string, string[]> }
  | { kind: "redirect"; to: TopicPath }
  | { kind: "locked"; subject: string }
  | { kind: "notfound" };

async function line(admin: Db, topicId: string, key: string): Promise<string[]> {
  const { data } = await admin.from("fallback_lines").select("topic_id, script").eq("decision_key", key);
  const row = (data ?? []).find((r) => r.topic_id === topicId) ?? (data ?? []).find((r) => r.topic_id == null);
  const name = await tutorNameOf(admin, topicId);
  return ((row?.script ?? []) as { text?: string }[]).map((s) => (s.text ?? "").replace(/\{tutor_name\}/g, name)).filter(Boolean);
}
/** Rule tutor_display_name, topic first then global; "Your tutor" only when the setting is empty. */
async function tutorNameOf(admin: Db, topicId: string): Promise<string> {
  const { data } = await admin.from("rules").select("topic_id, value").eq("key", "tutor_display_name");
  const row = (data ?? []).find((r) => r.topic_id === topicId) ?? (data ?? []).find((r) => r.topic_id == null);
  return typeof row?.value === "string" && row.value.trim() ? row.value : "Your tutor";
}
export const PATH_KEYS = ["path_popup", "path_first", "path_go", "path_warmup", "path_notnow", "path_nudge", "path_ready",
  "path_return", "path_recap", "path_recap_none", "path_done", "path_locked",
  "path_back_title", "path_back_line", "path_back_yes", "path_back_stay", "path_back_error", "path_quick_check_title", "path_quick_check_line", "path_quick_check_button", "home_welcome_title", "home_welcome_line", "home_welcome_button"];
const fill = (t: string, v: Record<string, string>) => t.replace(/\{(\w+)\}/g, (m, k: string) => v[k] ?? m);

async function vars(admin: Db, userId: string, topicId: string) {
  const [{ data: prof }, { data: ts }, ev] = await Promise.all([
    admin.from("profiles").select("display_name").eq("id", userId).maybeSingle(),
    admin.from("topic_skills").select("skill_id, role, skills(name)").eq("topic_id", topicId).eq("role", "prerequisite"),
    shownSkills(admin, userId),
  ]);
  // Skills she has really shown are not warmed up again (same rule as the warm-up).
  const shown = new Set(ev.keys());
  // The intro lists every warm-up skill; the counts in the tutor's words are the questions she will actually get.
  const skills = (ts ?? []).map((r) => (r.skills as { name?: string } | null)?.name ?? r.skill_id);
  const first = (prof?.display_name ?? "").trim().split(/\s+/)[0] || "there";
  const n = (ts ?? []).filter((r) => !shown.has(r.skill_id)).length;
  return { skills, v: { first_name: first, count: String(n), count_words: NUM_WORDS[n] ?? String(n), remaining: String(n),
    count_skills: countWords(n, "skill"), remaining_questions: countWords(n, "quick question"), warmup_words: warmupWords(n) }, n };
}

export async function getTopicIntro(admin: Db, userId: string, p: TopicPath): Promise<TopicIntro> {
  const found = await findTopic(admin, p);
  if (!found) return { kind: "notfound" };
  if (found.renamed) return { kind: "redirect", to: pathOf(found.topic) };
  if (!found.topic.is_active) return { kind: "locked", subject: p.subject };
  const id = found.topic.id;
  const [{ data: t }, { skills, v, n }, body, opening, { data: active }, { data: last }] = await Promise.all([
    admin.from("topics").select("display_name, chapter, quest").eq("id", id).single(),
    vars(admin, userId, id),
    line(admin, id, "intro_body"),
    line(admin, id, "intro_open"),
    admin.from("sessions").select("id, state").eq("student_id", userId).eq("topic_id", id).eq("status", "active"),
    admin.from("sessions").select("updated_at, state").eq("student_id", userId).order("updated_at", { ascending: false }).limit(20),
  ]);
  const real = (last ?? []).find((s) => (s.state as { consent_basis?: string } | null)?.consent_basis !== "admin_preview");
  // {greeting} stays for the browser to fill from her device clock.
  const welcome = (await Promise.all([welcomeKey(real?.updated_at ?? null), "intro_mission", nextKey(n)].map((k) => line(admin, id, k))))
    .flat().map((b) => fill(b, v));
  const keys = PATH_KEYS;
  const vt = { ...v, topic_name: t?.display_name ?? "" };
  const pl = await Promise.all(keys.map((k) => line(admin, id, k)));
  const pathLines = Object.fromEntries(keys.map((k, i) => [k, pl[i]!.map((b) => fill(b, vt))]));
  return {
    pathLines,
    kind: "intro", topicId: id, topicName: t?.display_name ?? "", chapter: t?.chapter ?? null, quest: t?.quest ?? null,
    path: pathOf(found.topic), skills, body: body.map((b) => fill(b, v)), opening: opening.map((b) => fill(b, v)).join(" "), welcome,
    hasActive: (active ?? []).some((s) => (s.state as { consent_basis?: string } | null)?.consent_basis !== "admin_preview"),
  };
}

const KEY: Record<IntroMove | "help", string> = {
  ready: "intro_ready", about: "intro_about", maths: "intro_maths", prereq: "intro_prereq", skip: "intro_skip",
  real: "intro_real", greeting: "chat_greeting_intro", boundary: "chat_boundary", answer: "intro_maths",
  offtopic: "intro_offtopic", distress: "safe_response", unclear: "intro_unclear", help: "intro_unclear",
};

/** One typed message on the intro: sorts it, returns an approved line (or a checked AI answer), flags distress/boundary. */
export async function introReply(admin: Db, userId: string, p: TopicPath, text: string) {
  const found = await findTopic(admin, p);
  if (!found || !found.topic.is_active) return { move: "unclear" as IntroMove | "help", lines: [] as string[] };
  const id = found.topic.id;
  const { move } = await sortMessage(admin, id, text);
  const { v } = await vars(admin, userId, id);
  if (move === "maths") {
    const body = await line(admin, id, "intro_body");
    const ai = await groundedAnswer(admin, id, text, ["intro"], { visible: body, hiddenItemIds: [] });
    if (ai.text) return { move, lines: [ai.text] };
  }
  const lines = (await line(admin, id, KEY[move])).map((l) => fill(l, { ...v, role: boundaryRole(text) }));
  if (move === "distress" || move === "boundary") {
    const since = new Date(Date.now() - 3600_000).toISOString();
    const { count } = move === "boundary"
      ? await admin.from("flags").select("id", { count: "exact", head: true }).eq("kind", "boundary").eq("created_by", userId).gte("created_at", since)
      : { count: 0 };
    if (!count) await admin.from("flags").insert({ kind: move, note: `Topic intro ${id}`, created_by: userId, session_id: null });
  }
  return { move, lines };
}
