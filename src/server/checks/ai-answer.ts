// Checks on every AI-written answer before a student sees it. Pure, unit-tested.
import { replyBannedWords } from "./banned-words";

const nums = (s: string) => (s.match(/-?\d+(?:[./]\d+)?/g) ?? []).map((n) => n.replace(/^-/, ""));

/** Flattens a hidden answer (number, string, fraction object, list) into comparable tokens. */
export function answerTokens(answer: unknown): string[] {
  const out: string[] = [];
  const walk = (v: unknown) => {
    if (v == null) return;
    if (typeof v === "number") out.push(String(Math.abs(v)));
    else if (typeof v === "string") { const t = v.trim().toLowerCase(); if (t) out.push(t); nums(t).forEach((n) => out.push(n)); }
    else if (Array.isArray(v)) v.forEach(walk);
    else if (typeof v === "object") {
      const o = v as Record<string, unknown>;
      if (typeof o["num"] === "number" && typeof o["den"] === "number") out.push(`${Math.abs(o["num"] as number)}/${o["den"]}`);
      Object.values(o).forEach(walk);
    }
  };
  walk(answer);
  return [...new Set(out)];
}

export type AnswerCheck = { ok: true } | { ok: false; reason: "empty" | "too_long" | "banned_word" | "new_number" | "reveals_answer" | "off_topic" };

export function checkAiAnswer(reply: string, opts: {
  facts: string[]; studentText: string; visible: string[]; hiddenAnswers: unknown[]; banned?: readonly string[];
}): AnswerCheck {
  const r = reply.trim();
  if (!r) return { ok: false, reason: "empty" };
  const sentences = r.split(/(?<=[.!?])\s+/).filter((s) => s.trim());
  if (sentences.length > 3 || r.length > 320) return { ok: false, reason: "too_long" };
  if (replyBannedWords([{ text: r }], opts.banned).length) return { ok: false, reason: "banned_word" };
  const allowed = new Set([...opts.facts, opts.studentText, ...opts.visible].flatMap(nums));
  if (nums(r).some((n) => !allowed.has(n))) return { ok: false, reason: "new_number" };
  const lower = r.toLowerCase();
  const tokens = opts.hiddenAnswers.flatMap(answerTokens);
  const reveals = tokens.some((t) => /^[\d./]+$/.test(t)
    ? nums(lower).includes(t)
    : t.length >= 3 && lower.includes(t));
  if (reveals) return { ok: false, reason: "reveals_answer" };
  if (!/\b(gradient|steep|line|graph|coordinate|across|up|fraction|divide|top|bottom|letter|number|multiply|lesson|warm-up|video|maths|add|step|times|sign|x|y)\b/i.test(r)) return { ok: false, reason: "off_topic" };
  return { ok: true };
}
