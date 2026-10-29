// Practice (worksheet) teaching: how much help Fiti gives, what he may say, and the check on his reply.
// Pure, tested. The AI only phrases; this decides the level and blocks any reply that gives a result away.
import { replyBannedWords } from "@/server/checks/banned-words";

export type HelpLevel = 1 | 2 | 3;

/** Help level for this ask: one more each ask on the same problem; "Teach me" starts a level higher. */
export function helpLevel(asksBefore: number, mode: string): HelpLevel {
  const start = mode === "teach_me" ? 2 : 1;
  return Math.min(3, start + Math.max(0, asksBefore)) as HelpLevel;
}

export const LEVEL_TEXT: Record<HelpLevel, string> = {
  1: "Name only the next step in plain words, using the numbers from the question, then ask her to try it.",
  2: "Show how to set up the next step with her numbers (for example which number takes away which), but never work out its result. End by asking her what it comes to.",
  3: "Walk her through the next step only: set it up with her numbers, then tell her she can also tap Teach me to see a worked example. Never give its result or the final answer.",
};

const nums = (s: string) => (s.match(/-?\d+(?:\.\d+)?(?:\/\d+)?/g) ?? []).map((n) => n.replace(/^-/, ""));

/** The left side (set-up) of a worked line, e.g. "(6 − 2) / (3 − 1)" from "m = (6 − 2) / (3 − 1) = 4/2". */
export function setUpOf(line: string): string {
  const parts = line.split("=").map((p) => p.trim()).filter(Boolean);
  if (parts.length >= 3) return parts.slice(0, 2).join(" = ");
  return parts.length === 2 && /\d/.test(parts[0]!) ? parts[0]! : (parts[0] ?? "");
}

/** Which worked-solution line she is on: one per line she has written, never past the last. */
export function nextStepIndex(herLines: number, total: number): number {
  return Math.max(0, Math.min(herLines, Math.max(0, total - 1)));
}

export type PractiseCheck = { ok: true } | { ok: false; reason: "empty" | "too_long" | "banned_word" | "new_number" | "reveals_answer" };

/**
 * A practice reply may use numbers from the question, her lines and the shown set-up, but must never state a
 * hidden result: no "= n", "is n", "gives n", "comes to n" where n is the final answer or the next step's result.
 */
export function checkPractiseReply(reply: string, o: { allowedText: string[]; results: string[]; banned?: readonly string[] }): PractiseCheck {
  const r = reply.trim();
  if (!r) return { ok: false, reason: "empty" };
  const sentences = r.split(/(?<=[.!?])\s+/).filter((s) => s.trim());
  if (sentences.length > 3 || r.length > 320) return { ok: false, reason: "too_long" };
  if (replyBannedWords([{ text: r }], o.banned).length) return { ok: false, reason: "banned_word" };
  const allowed = new Set(o.allowedText.flatMap(nums));
  if (nums(r).some((n) => !allowed.has(n))) return { ok: false, reason: "new_number" };
  const res = o.results.map((x) => x.trim()).filter(Boolean);
  for (const n of res) {
    const esc = n.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");
    const re = new RegExp(`(=|\\bis|\\bequals|\\bgives|\\bcomes to|\\bget|\\bmakes|\\banswer)\\s*:?\\s*-?${esc}(?![\\d/]|\\.\\d)`, "i");
    if (re.test(r)) return { ok: false, reason: "reveals_answer" };
  }
  return { ok: true };
}

/** Results hidden from a reply: the final answer and the right side of the next worked line. */
export function hiddenResults(finalAnswer: unknown, nextLine: string | undefined): string[] {
  const out: string[] = [];
  const flat = (a: unknown): void => {
    if (a == null) return;
    if (typeof a === "number" || typeof a === "string") out.push(String(a));
    else if (Array.isArray(a)) a.forEach(flat);
    else if (typeof a === "object") { const o = a as Record<string, unknown>; if (o['num'] != null && o['den'] != null) out.push(`${o['num']}/${o['den']}`); Object.values(o).forEach(flat); }
  };
  flat(finalAnswer);
  if (nextLine) { const tail = nextLine.split("=").pop()?.trim(); if (tail && /\d/.test(tail) && nextLine.includes("=")) out.push(tail); }
  return [...new Set(out)];
}
