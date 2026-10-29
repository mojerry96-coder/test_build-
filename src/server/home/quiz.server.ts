// Quick quiz from Home: one try per question, marked by the maths engine, usual feedback lines, evidence saved.
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { answerMatches } from "@/server/maths/evaluate";
import { homeLine } from "./agent.server";

type Db = SupabaseClient<Database>;
type Any = any; // eslint-disable-line @typescript-eslint/no-explicit-any

export type QuizView = {
  sessionId: string; index: number; total: number; done: boolean; right: number;
  item: { id: string; kind: string; prompt: { text: string }[]; options: { id: string; label: string }[] | null } | null;
  last: { correct: boolean; lines: string[] } | null; closing: string[];
};

async function load(admin: Db, userId: string, sessionId: string) {
  const { data: s } = await admin.from("sessions").select("id, student_id, topic_id, state").eq("id", sessionId).maybeSingle();
  if (!s || s.student_id !== userId || (s.state as Any)?.kind !== "quiz") throw new Error("Quiz not found");
  return s;
}

async function view(admin: Db, s: Any, last: QuizView["last"]): Promise<QuizView> {
  const st = s.state as { items: string[]; answers: Record<string, boolean> };
  const index = Object.keys(st.answers).length;
  const right = Object.values(st.answers).filter(Boolean).length;
  const done = index >= st.items.length;
  let item: QuizView["item"] = null;
  if (!done) {
    const { data } = await admin.from("items").select("id, kind, prompt, options").eq("id", st.items[index]!).single();
    item = { id: data!.id, kind: data!.kind, prompt: (data!.prompt as Any) ?? [], options: (data!.options as Any) ?? null };
  }
  const closing = done ? await homeLine(admin, "home_quiz_done", { right, n: st.items.length }) : [];
  return { sessionId: s.id, index, total: st.items.length, done, right, item, last, closing };
}

export async function getQuiz(admin: Db, userId: string, sessionId: string) { return view(admin, await load(admin, userId, sessionId), null); }

export async function answerQuiz(admin: Db, userId: string, sessionId: string, itemId: string, answer: { option?: string | undefined; text?: string | undefined }) {
  const s = await load(admin, userId, sessionId);
  const st = s.state as Any;
  const expected = st.items[Object.keys(st.answers).length];
  if (expected !== itemId) return view(admin, s, null); // one try each; stale tap
  const [{ data: key }, { data: item }, { data: fb }] = await Promise.all([
    admin.from("item_keys").select("answer, accepted_forms").eq("item_id", itemId).single(),
    admin.from("items").select("skill_ids, step").eq("id", itemId).single(),
    admin.from("feedback").select("trigger, script, misconception_id").eq("item_id", itemId),
  ]);
  const k = (key?.answer ?? {}) as Any;
  let correct = false;
  if (k.kind === "mcq") correct = answer.option === k.correct_option_id;
  else {
    const accepted = [String(k.final ?? k.value ?? ""), ...(((key?.accepted_forms as Any) ?? []) as string[])].filter(Boolean);
    correct = !!answer.text && answerMatches(answer.text, accepted);
  }
  const rows = fb ?? [];
  const pick = correct ? rows.find((f) => f.trigger === "correct") : rows.find((f) => answer.option && f.trigger === `option:${answer.option}`) ?? rows.find((f) => f.trigger === "other");
  let lines = ((pick?.script ?? []) as { text?: string }[]).map((x) => x.text ?? "").filter(Boolean);
  if (!lines.length) lines = await homeLine(admin, correct ? "home_quiz_right" : "home_quiz_not_quite");
  st.answers = { ...st.answers, [itemId]: correct };
  await admin.from("sessions").update({ state: st }).eq("id", sessionId);
  const { error } = await admin.from("evidence").insert({
    session_id: sessionId, student_id: userId, item_id: itemId, skill_id: (item?.skill_ids ?? [])[0] ?? null, step: item?.step ?? null,
    attempt: 1, is_first_try: true, correct, response: answer as Any, strength: correct ? "moderate" : "none",
    misconception_id: correct ? null : pick?.misconception_id ?? null, status: "quiz",
  });
  if (error) console.error("quiz evidence failed", error.message);
  return view(admin, { ...s, state: st }, { correct, lines });
}
