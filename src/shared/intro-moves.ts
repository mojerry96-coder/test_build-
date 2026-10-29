// Word-list sorting for typed messages. Used when the AI is off, slow or unsure, and as a first pass so
// clear messages ("ok", "I'm ready") never need the AI. It only picks a category; the words the student
// sees always come from approved lines in the content pack (or a checked AI answer).
export type IntroMove =
  | "ready" | "about" | "maths" | "prereq" | "skip" | "real" | "greeting" | "boundary"
  | "offtopic" | "distress" | "unclear" | "answer";

/** Every kind the AI may return; mapped onto the moves above. */
export const AI_KINDS = [
  "greeting", "help_request", "ready", "about_lesson", "topic_question", "prerequisite_question",
  "asks_answer", "asks_skip", "is_ai", "personal_boundary", "off_topic", "distress", "unclear",
] as const;
export type AiKind = (typeof AI_KINDS)[number];

const has = (t: string, words: RegExp) => words.test(t);
const norm = (raw: string) => raw.toLowerCase().replace(/\s+/g, " ").trim();

// Spelling-tolerant stems: "codinates", "gradiant", "fration", "subtitute".
const TOPIC = /\b(gr[ae]d[iy]?[ae]nt?s?|slope|steep\w*|lines?|graph\w*|y ?= ?mx|rise|run|negative|positive|calculat\w*|formula|equation|m ?=)\b|[0-9]\s*[-+*/=÷×]/;
const PREREQ = /\b(c[oa]+r?d[iy]?n[ae]t\w*|co-?ord\w*|plot\w*|x[- ]?axis|y[- ]?axis|axis|axes|fra[ck]?t?ions?|numerator|denominator|divid\w*|substit?u?t\w*|subtitut\w*|replace the letter|plug in)\b/;
const GREETING = /^(hi|hello|hey|hiya|good (morning|afternoon|evening)|how are you|how far|how you dey|what'?s up|sup)\b|\bhow are you( doing)?\b/;
const BOUNDARY = /\b(be my (wife|husband|girlfriend|boyfriend|friend|lover|bae|babe)|marry me|date me|i love you|kiss|sexy|send (me )?(a )?(pic|photo)|where do you live|your (phone|number|address))\b/;
const INJECTION = /\b(ignore|forget|bypass) (all |your |the )?(rules|instructions)|pretend you|jailbreak|developer mode\b/;
// "what are we learning today?" with small typos: "ewe", "tody", "lerning", "leson".
const ABOUT = /\b(how long|what (will|do|are|r) (we|ewe|wee|u|you|i) (be )?(l[ea]?a?r?n\w*|do|doing|study\w*|cover\w*)|what is this (lesson|about)|what('?s| is) (today'?s|this|the) (lesson|leson|topic|class)|what topic|which topic|lesson about|leson about|how many minutes)\b/;
const OFFTOPIC = /\b(football|music|song|movie|film|game|games|fortnite|tiktok|instagram|food|weather|politics|celebrity|church|party|money|naira|bitcoin)\b/;

/** Word-list pick plus whether the word list is sure enough to skip the AI. */
export function pickIntroMoveSure(raw: string): { move: IntroMove; sure: boolean } {
  const t = norm(raw);
  if (!t || t.replace(/[^a-z0-9]/g, "").length < 2) return { move: "unclear", sure: true };
  if (has(t, /\b(kill|hurt|harm|suicide|die|abuse|abused|unsafe|scared|hit me|beat me|self[- ]?harm)\b/)) return { move: "distress", sure: true };
  if (has(t, INJECTION)) return { move: "answer", sure: true };
  if (has(t, BOUNDARY)) return { move: "boundary", sure: true };
  if (has(t, /\b(are you (real|human|a person|a robot|an? ai)|real person|human|robot|bot)\b/)) return { move: "real", sure: true };
  if (has(t, /\b(skip|don'?t want (the )?(warm[- ]?up|questions)|no warm[- ]?up|jump ahead)\b/)) return { move: "skip", sure: true };
  if (has(t, /^(yes|yeah|yep|ok|okay|sure|go|ready)[.!]?$|i'?m ready|let'?s (go|start|begin)|^start( the lesson)?$/)) return { move: "ready", sure: true };
  if (has(t, ABOUT)) return { move: "about", sure: true };
  // A maths question wins over a greeting in the same message ("hi, what's a gradient?").
  if (has(t, PREREQ)) return { move: "prereq", sure: false };
  if (has(t, TOPIC)) return { move: "maths", sure: false };
  if (has(t, GREETING)) return { move: "greeting", sure: t.split(" ").length <= 6 };
  if (has(t, OFFTOPIC)) return { move: "offtopic", sure: false };
  return { move: "unclear", sure: false };
}
export const pickIntroMove = (raw: string): IntroMove => pickIntroMoveSure(raw).move;

/** Maps an AI kind onto a move; help requests are handled by each step's own help path. */
export function moveFromAi(k: AiKind): IntroMove | "help" {
  const m: Record<AiKind, IntroMove | "help"> = {
    greeting: "greeting", help_request: "help", ready: "ready", about_lesson: "about", topic_question: "maths",
    prerequisite_question: "prereq", asks_answer: "answer", asks_skip: "skip", is_ai: "real",
    personal_boundary: "boundary", off_topic: "offtopic", distress: "distress", unclear: "unclear",
  };
  return m[k];
}

/** "I'm stuck" phrases: in the warm-up these get the question's tip. */
export const HELP = /\bhow (am i|do i|can i|should i) (supposed to )?(solve|do|work|answer|start)|\bhow (am i supposed to|to solve|to do this)\b|\bsolve this\b|\bexplain\b|\bdon'?t (understand|get (it|this))\b|\bi'?m stuck\b|\bstuck\b|\bwhat do i do\b|^help\b|\bhelp( me)?( please| pls)?[.!?]*$|\bconfus|\bwhat does (this|it|the question) mean\b|\b(a |another )?(hint|tip)s?\b/;

/** Typed messages during the warm-up and quick fix: the intro moves plus a "help" (tip) move. */
export type WarmupMove = Exclude<IntroMove, "ready"> | "meaning" | "help";
export function pickWarmupMove(raw: string): WarmupMove {
  const t = norm(raw);
  const base = pickIntroMove(raw);
  if (["distress", "real", "skip", "boundary", "answer"].includes(base)) return base as WarmupMove;
  if (/\b(what'?s|tell me|give me|show me) the answer\b|\bwhich (one )?is (it|right|correct)\b|\banswer please\b/.test(t)) return "answer";
  if (HELP.test(t)) return "help";
  return base === "ready" ? "maths" : base;
}
export const WARMUP_KEY: Record<Exclude<WarmupMove, "meaning" | "help">, string> = {
  about: "intro_about", maths: "intro_maths", prereq: "intro_prereq", skip: "intro_skip", real: "intro_real",
  greeting: "chat_greeting_lesson", boundary: "chat_boundary",
  offtopic: "intro_offtopic", distress: "safe_response", unclear: "intro_unclear", answer: "warmup_answer",
};

/** Hook: "which is steeper / the answer" and "what is steepness" get hook lines; the rest behave as in the warm-up. */
export function pickHookMove(raw: string): WarmupMove {
  const t = norm(raw);
  const base = pickWarmupMove(raw);
  if (base === "distress" || base === "real" || base === "boundary") return base;
  if (/\bwhat (does|is) (steep|steepness)|\bsteepness mean|\bmeaning of steep/.test(t)) return "meaning";
  if (/\bwhich (one |path )?is (steeper|it)\b|\bsteeper\b|\banswer\b/.test(t)) return "answer";
  return base === "meaning" ? "unclear" : base;
}

/** Strips contact details before a message goes to the AI (students are minors). */
export function redactForAi(raw: string): string {
  return raw
    .replace(/[\w.+-]+@[\w-]+\.[\w.]+/g, "[email]")
    .replace(/\+?\d[\d\s-]{7,}\d/g, "[number]")
    .slice(0, 400);
}

type Line = { text: string };
/** Warm-up tip, or the "have a go" line if the tip was the last thing the tutor said; never the same line twice in a row. */
export function pickTip<T extends Line>(tip: T[], again: T[], lastTutor?: string): { kind: "tip" | "again" | undefined; lines: T[] } {
  const same = (s: T[]) => !!s.length && s.map((l) => l.text).join(" ") === lastTutor;
  if (tip.length && !same(tip)) return { kind: "tip", lines: tip };
  if (again.length && !same(again)) return { kind: "again", lines: again };
  return { kind: undefined, lines: [] };
}
