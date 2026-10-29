// Home: sorting a message into one intent and pulling out topic/day/time words. Word list first;
// the AI is asked only when the word list is unsure. Neither chooses actions or invents topics.
export const HOME_INTENTS = [
  "start_plan", "view_plan", "learn_topic", "quiz", "homework_help", "change_plan", "edit_plan", "progress",
  "topic_question", "unavailable_topic", "greeting", "is_ai", "personal_boundary", "off_topic", "distress", "unclear",
] as const;
export type HomeIntent = (typeof HOME_INTENTS)[number];
export type HomeMode = "tutor" | "quiz";
export type HomeDetails = { topicWords: string | null; day: string | null; time: string | null; points: [number, number][] };

const norm = (raw: string) => raw.toLowerCase().replace(/\s+/g, " ").trim();

/** Subjects and topics students ask about that are not in the content yet. */
export const NOT_YET = /\b(chemistry|physics|biology|english|literature|economics|government|accounting|commerce|geography|civic|algebra|trigonometry|trig|calculus|integration|differentiation|statistics|probability|quadratic\w*|logarithm\w*|indices|surds?|matri(x|ces)|vectors?|circles?|mensuration|sets?)\b/;
const TOPIC_WORDS = /\b(gr[ae]d[iy]?[ae]nt?s?|slope|steep\w*|graphs?|lines?|coordinates?|straight line)\b/;
const DAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

export function extractDetails(raw: string): HomeDetails {
  const t = norm(raw);
  const nx = t.match(NOT_YET)?.[0] ?? null;
  const tw = t.match(TOPIC_WORDS)?.[0] ?? null;
  const day = t.match(/\b(today|tonight|tomorrow|sun(day)?|mon(day)?|tue(s(day)?)?|wed(nesday)?|thu(rs(day)?)?|fri(day)?|sat(urday)?)\b/)?.[0] ?? null;
  const time = t.match(/\b(\d{1,2})(?::(\d{2}))?\s?(am|pm)\b/)?.[0] ?? null;
  const points = [...t.matchAll(/\(\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*\)/g)].map((m) => [Number(m[1]), Number(m[2])] as [number, number]);
  const fullDay = day && DAYS.find((d) => d.startsWith(day.slice(0, 3)));
  return { topicWords: nx ?? tw, day: fullDay ?? day, time, points };
}

/** Word-list intent plus whether it is sure enough to skip the AI. The mode chip is a hint. */
export function pickHomeIntentSure(raw: string, mode: HomeMode = "tutor"): { intent: HomeIntent; sure: boolean } {
  const t = norm(raw);
  const letters = t.replace(/[^a-z]/g, "");
  if (!t || letters.length < 2) return { intent: "unclear", sure: true };
  if (/\b(kill|hurt|harm|suicide|die|abuse|abused|unsafe|scared|hit me|beat me|self[- ]?harm)\b/.test(t)) return { intent: "distress", sure: true };
  if (/\b(be my (wife|husband|girlfriend|boyfriend|lover|bae|babe)|marry me|date me|i love you|kiss|sexy|send (me )?(a )?(pic|photo)|where do you live|your (phone|number|address))\b/.test(t)) return { intent: "personal_boundary", sure: true };
  if (/\b(are you (real|human|a person|a robot|an? ai)|real person|robot|bot)\b/.test(t)) return { intent: "is_ai", sure: true };
  if (VIEW_PLAN.test(t) || MAKE_PLAN.test(t)) return { intent: "view_plan", sure: true };
  const plan = /\bplan\b|\bschedule\b|\btimetable\b/.test(t);
  const cant = /\b(can'?t|cannot|won'?t|not able to|unable to) (study|learn|make it|do it|come)\b|\b(move|reschedule|postpone|shift)\b/.test(t);
  if (cant) return { intent: "change_plan", sure: true };
  if (plan && /\b(add|remove|more|less|change|edit|put|drop)\b/.test(t)) {
    return NOT_YET.test(t) ? { intent: "unavailable_topic", sure: true } : { intent: "edit_plan", sure: true };
  }
  if (/\b(start (my |the |tonight'?s )?plan|start with|let'?s go|^start$|^go$)\b/.test(t)) return { intent: "start_plan", sure: true };
  if (/\bhow am i doing\b|\bmy progress\b|\bhow (have|did) i (do|done)\b|\bmy (score|results?)\b/.test(t)) return { intent: "progress", sure: true };
  const pts = (t.match(/\(\s*-?\d/g) ?? []).length;
  if (/\b(solve|find|calculate|work out|homework|assignment)\b/.test(t) && (pts >= 2 || /\d/.test(t))) return { intent: "homework_help", sure: true };
  if (/\bhomework\b|\bhelp me (solve|with) (this|my)\b/.test(t)) return { intent: "homework_help", sure: true };
  if (/\bquiz\b|\btest me\b|\bpractice questions?\b|\bask me questions?\b/.test(t)) {
    return NOT_YET.test(t) ? { intent: "unavailable_topic", sure: true } : { intent: "quiz", sure: true };
  }
  if (/\b(teach|learn|study|lesson|show me|explain)\b/.test(t)) {
    if (NOT_YET.test(t)) return { intent: "unavailable_topic", sure: true };
    if (/^(what|why|how) (is|are|does|do)\b/.test(t)) return { intent: "topic_question", sure: false };
    if (TOPIC_WORDS.test(t) || /\bmath(s|ematics)?\b/.test(t)) return { intent: "learn_topic", sure: true };
  }
  if (/^(what|why|how|when) (is|are|does|do|makes?)\b|\bmeaning of\b|\bwhat'?s an? \w+/.test(t)) {
    if (NOT_YET.test(t)) return { intent: "unavailable_topic", sure: true };
    if (TOPIC_WORDS.test(t)) return { intent: "topic_question", sure: true };
  }
  if (NOT_YET.test(t)) return { intent: "unavailable_topic", sure: false };
  if (/^(hi|hello|hey|hiya|good (morning|afternoon|evening)|how far|how you dey|what'?s up|sup)\b|\bhow are you\b/.test(t)) return { intent: "greeting", sure: t.split(" ").length <= 6 };
  if (/\b(football|match|music|song|movie|film|game|games|fortnite|tiktok|instagram|food|weather|politics|celebrity|party|money|naira|bitcoin|won|win)\b/.test(t)) return { intent: "off_topic", sure: false };
  if (TOPIC_WORDS.test(t)) return { intent: mode === "quiz" ? "quiz" : "learn_topic", sure: false };
  // Random letters with no vowels pattern ("asdfgh") are clearly unclear.
  if (!/\s/.test(t) && !/[aeiou].*[aeiou]/.test(letters)) return { intent: "unclear", sure: true };
  return { intent: mode === "quiz" ? "quiz" : "unclear", sure: false };
}


/** "2", "quest 3", "number one", "option 1" → the option number she typed, else null. */
const NUM_WORDS: Record<string, number> = { one: 1, two: 2, three: 3, four: 4, five: 5, first: 1, second: 2, third: 3 };
export function typedOptionNumber(text: string): number | null {
  const m = text.trim().toLowerCase().replace(/[.!?]+$/, "").match(/^(?:quest|option|number|no\.?|the)?\s*(\d|one|two|three|four|five|first|second|third)(?:\s*(?:one|quest|please))?$/);
  if (!m) return null;
  const w = m[1] ?? "";
  return /\d/.test(w) ? Number(w) : NUM_WORDS[w] ?? null;
}

/** "can i see the plan?", "what's my plan", "show me my plan", "what am I doing this week", "plan". */
/** "make me a lesson plan for my WAEC exam", "what should I study": the engine-built plan is shown. */
export const MAKE_PLAN = /\b(make|create|build|give|draw up|set up|prepare|need|want)\b.{0,30}\b(lesson |study |revision |exam )?(plan|schedule|timetable)\b|\bplan (for|towards?) (my )?(waec|neco|jamb|exam|exams|test)\b|\bwhat should i (study|learn|read|revise)\b/;
const VIEW_PLAN = /^(my )?plan[?!.]*$|\b(see|show|view|check|open)( me)? (my |the |tonight'?s )?plan\b|\bwhat'?s? (is )?(my|the|tonight'?s) plan\b|\bwhat am i (doing|studying|learning) (this week|tonight|today)\b/;

const YES = /^(yes|yeah|yea|yh|yep|yup|ok|okay|k|kk|sure|yes please|ok(ay)? please|let'?s go|lets go|go|start|alright|alright then|oya|abeg yes|of course|definitely|👍|👍🏽|👍🏾|👍🏿|✅)$/u;
const NO = /^(no|nope|nah|no o|no thanks|no thank you|not now|later|maybe later|abeg no|not today|not tonight|no not tonight)$/;
/** Her reply to the question the tutor just asked: yes, no, or neither (then normal sorting runs). */
export function matchPendingReply(raw: string): "yes" | "no" | null {
  const t = norm(raw).replace(/[.!?,]+$/g, "").trim();
  if (YES.test(t)) return "yes";
  if (NO.test(t)) return "no";
  return null;
}

/** An offered option she named by title ("gradient of a line"), else null. */
export function typedOptionTitle<T extends { num: number; title: string }>(text: string, offered: T[] | null | undefined): number | null {
  const t = norm(text).replace(/[.!?]+$/, "");
  if (t.length < 4) return null;
  const hit = (offered ?? []).find((o) => { const n = norm(o.title); return n === t || (t.length >= 6 && n.includes(t)) || t.includes(n); });
  return hit?.num ?? null;
}
