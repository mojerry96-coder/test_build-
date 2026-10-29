// Sorting typed messages and writing short grounded answers. The engine decides what is allowed at each
// point; the AI only sorts a message or phrases an answer from approved facts, and every answer is checked.
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { aiProvider, answerQuestion, classifyMessage } from "@/server/providers/ai.server";
import { checkAiAnswer, type AnswerCheck } from "@/server/checks/ai-answer";
import { moveFromAi, pickIntroMoveSure, redactForAi, type IntroMove } from "@/shared/intro-moves";

type Db = SupabaseClient<Database>;
type Any = any; // eslint-disable-line @typescript-eslint/no-explicit-any

async function rule(admin: Db, topicId: string, key: string): Promise<Any> {
  const { data } = await admin.from("rules").select("value").eq("key", key).or(`topic_id.eq.${topicId},topic_id.is.null`).order("topic_id", { ascending: true, nullsFirst: false }).limit(1).maybeSingle();
  return data?.value ?? null;
}

export type Sorted = { move: IntroMove | "help"; source: "words" | "ai" | "words_fallback" };

/** Word list first; the AI only when the word list isn't sure and AI answers are on. */
export async function sortMessage(admin: Db, topicId: string, text: string, step = "intro"): Promise<Sorted & { ms?: number }> {
  const w = pickIntroMoveSure(text);
  if (w.sure) return { move: w.move, source: "words" };
  if (aiProvider(await rule(admin, topicId, "ai_provider")) !== "lovable_ai") return { move: w.move, source: "words" };
  // Sorting has its own short limit; after it the word list decides.
  const ms = Number(await rule(admin, topicId, "ai_classify_timeout_ms")) || 2000;
  const t0 = Date.now();
  const k = await classifyMessage(redactForAi(text), step, ms);
  const took = Date.now() - t0;
  return k ? { move: moveFromAi(k), source: "ai", ms: took } : { move: w.move, source: "words_fallback", ms: took };
}

/** Fact stages, in the order they open: intro (what it is), warmup (warm-up skills), video (method). */
export type FactStage = "intro" | "warmup" | "video";
const LEVEL: Record<FactStage, string> = {
  intro: "Preview only. Say WHAT it is in one plain sentence, never HOW to work it out, then say they will find out in this lesson.",
  warmup: "The student has tried the warm-up question. You may explain the skill briefly using the facts.",
  video: "You may explain the idea using the facts, but never give the answer to any current question.",
};

async function facts(admin: Db, topicId: string, open: FactStage[]): Promise<string[]> {
  const { data } = await admin.from("fallback_lines").select("decision_key, script, topic_id").like("decision_key", "fact\\_%").or(`topic_id.eq.${topicId},topic_id.is.null`);
  return (data ?? [])
    .filter((r) => open.includes((r.decision_key.split("__")[1] ?? "") as FactStage))
    .flatMap((r) => ((r.script as Any) ?? []).map((s: { text?: string }) => s.text ?? "")).filter(Boolean);
}

export type AiAnswerLog = { used: boolean; check?: AnswerCheck["ok"] | string; reply?: string };

/** A checked AI answer, or null (then the caller plays the approved line). */
export async function groundedAnswer(admin: Db, topicId: string, text: string, open: FactStage[], ctx: {
  visible: string[]; hiddenItemIds: string[]; extraHidden?: unknown[]; screen?: boolean;
}): Promise<{ text: string | null; log: AiAnswerLog }> {
  if (!open.length || aiProvider(await rule(admin, topicId, "ai_provider")) !== "lovable_ai") return { text: null, log: { used: false } };
  const f = await facts(admin, topicId, open);
  if (!f.length) return { text: null, log: { used: false } };
  const ms = Number(await rule(admin, topicId, "ai_timeout_ms")) || 4000;
  const top = open.includes("video") ? "video" : open.includes("warmup") ? "warmup" : "intro";
  // A question about the screen: the on-screen text joins the facts, and the reply points back to the current step.
  const level = ctx.screen ? `${LEVEL[top]} She is asking about something on her screen right now. Say what it refers to using only the on-screen text, then point her to the current step with a short question. Never give the result of the current step.` : LEVEL[top];
  const reply = await answerQuestion(redactForAi(text), ctx.screen ? [...f, ...ctx.visible.map((v) => `On screen: ${v}`)] : f, level, ms);
  if (!reply) return { text: null, log: { used: true, check: "timeout_or_error" } };
  const { data: keys } = ctx.hiddenItemIds.length
    ? await admin.from("item_keys").select("answer, accepted_forms").in("item_id", ctx.hiddenItemIds)
    : { data: [] as { answer: unknown; accepted_forms: unknown }[] };
  const banned = await rule(admin, topicId, "banned_words");
  const c = checkAiAnswer(reply, { facts: f, studentText: text, visible: ctx.visible, hiddenAnswers: [...(keys ?? []).flatMap((k) => [k.answer, k.accepted_forms]), ...(ctx.extraHidden ?? [])], banned: banned ?? undefined });
  return c.ok ? { text: reply, log: { used: true, check: true, reply } } : { text: null, log: { used: true, check: c.reason, reply } };
}
