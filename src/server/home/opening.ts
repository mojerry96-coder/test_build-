// Ask Fiti openings: first-time conversation and situation-aware return greetings. Pure, unit-tested.
import { lagosDay } from "./decide";

export type Feeling = "enjoy" | "ok" | "hard";
export type Hardest = "graphs" | "algebra" | "word_problems" | "not_sure";
export type Prefs = { maths_feeling: Feeling | null; hardest_area: Hardest | null; intro_done_at: string | null; last_opening_line_id: string | null; last_visit_at: string | null };
export type LastLesson = { completedAt: string; secure: boolean | null; misconceptions: number } | null;
export type Opening = "intro" | "struggled" | "away" | "next_day" | "normal";

const dayNum = (d: string | Date) => Math.floor(Date.parse(lagosDay(d)) / 86400e3);

/** Which opening she gets. Checked in order: first time, hard last lesson, away > 3 days, next day, normal. */
export function pickOpening(prefs: Prefs | null, last: LastLesson, now: Date): Opening {
  if (!prefs?.intro_done_at) return "intro";
  const seen = prefs.last_visit_at;
  if (last && (!seen || last.completedAt > seen) && (last.secure === false || last.misconceptions >= 2)) return "struggled";
  if (!seen) return "normal";
  const gap = dayNum(now) - dayNum(seen);
  if (gap > 3) return "away";
  if (gap === 1) return "next_day";
  return "normal";
}

/** A new visit = first opening on a new Lagos day. */
export const isNewVisit = (prefs: Prefs | null, now: Date) => !prefs?.last_visit_at || lagosDay(prefs.last_visit_at) !== lagosDay(now);

/** Never the same opening line two visits in a row. */
export function rotateLine(ids: string[], last: string | null, seed: number): string {
  const pool = ids.filter((i) => i !== last);
  const from = pool.length ? pool : ids;
  return from[Math.abs(seed) % from.length]!;
}

export const ONB_STEPS = ["hello", "feeling", "hardest", "how", "plan"] as const;
export type OnbStep = (typeof ONB_STEPS)[number];

const n = (s: string) => s.toLowerCase().replace(/[’']/g, "'").replace(/[^a-z0-9' ]+/g, " ").replace(/\s+/g, " ").trim();
export const isJustStart = (t: string) => /\b(let'?s just start|just start|skip|start now|let'?s go|start the plan)\b/.test(n(t));

export function matchFeeling(t: string): Feeling | null {
  const s = n(t);
  if (/\b(hard|difficult|tough|hate|struggl|confus|scared|bad at|not good|don'?t like|dont like)/.test(s)) return "hard";
  if (/\b(enjoy|love|like it|like maths|fun|great|good at|i like)/.test(s)) return "enjoy";
  if (/\b(ok|okay|fine|alright|not bad|so so|average|normal)\b/.test(s)) return "ok";
  return null;
}
export function matchHardest(t: string): Hardest | null {
  const s = n(t);
  if (/\b(not sure|dunno|don'?t know|no idea|everything|all of it)/.test(s)) return "not_sure";
  if (/\b(word|story|problem)/.test(s)) return "word_problems";
  if (/\b(algebra|equation|expression|x and y|simplif)/.test(s)) return "algebra";
  if (/\b(graph|line|gradient|slope|coordinat|plot)/.test(s)) return "graphs";
  return null;
}
export const matchReturnMood = (t: string): "good" | "busy" | "low" | null => {
  const s = n(t);
  if (/\b(struggl|hard|bad|not great|stress|sad|tired|confus)/.test(s)) return "low";
  if (/\b(busy|no time|hectic|loaded|exam|lots)/.test(s)) return "busy";
  if (/\b(good|great|fine|ok|okay|well|alright|cool)\b/.test(s)) return "good";
  return null;
};

/** "Good news: our first topic is all about graphs." only when tonight's topic is about her hardest area. */
export function hintFor(hardest: Hardest | null, topicLabel: string | null): string | null {
  if (!hardest || !topicLabel) return null;
  if (hardest === "graphs" && /gradient|line|graph|coordinat/i.test(topicLabel)) return "graphs";
  if (hardest === "algebra" && /algebra|equation/i.test(topicLabel)) return "algebra";
  return null;
}

/** Button replies Fiti offers in the first talk; anything else she typed herself. */
const BUTTON_SENDS = new Set(["sure", "let's just start", "i enjoy it", "it's ok", "it's hard for me", "graphs", "algebra", "word problems", "not sure yet", "sounds good", "good", "busy week", "struggling a bit"]);
export const isTypedByHer = (t: string) => { const s = t.trim().toLowerCase(); return s.length > 0 && !BUTTON_SENDS.has(s); };
/** Too short to reply to ("hmm", "ok", an emoji): skip the AI line. */
export const isTooShort = (t: string) => t.replace(/[^\p{L}\p{N}]/gu, "").length < 4;
/** An AI acknowledgement Fiti may show: short, no question, no numbers, name at most once, not a repeat. */
export function ackAllowed(r: string | null, firstName: string | null, previous: string | null): r is string {
  if (!r) return false;
  const t = r.trim();
  if (!t || /\?/.test(t) || /\d/.test(t) || t.split(/(?<=[.!?])\s+/).length > 2 || t.length > 200) return false;
  if (firstName && t.toLowerCase().split(firstName.toLowerCase()).length - 1 > 1) return false;
  return !previous || previous.trim().toLowerCase() !== t.toLowerCase();
}
/** The topic map address for a plan item. */
export const mapHref = (p: { subject: string; chapter: string; quest: string; topic: string }) => `/${p.subject}/${p.chapter}/${p.quest}/${p.topic}/path`;
