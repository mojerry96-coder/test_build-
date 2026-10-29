// Home engine: picks the action from the intent, her plan, her learner record and the content.
// Pure and unit-tested. The AI never reaches this point with anything but an intent and copied words.
import { subjectKeyFor } from "@/shared/routes";
import { MAKE_PLAN, type HomeIntent, type HomeDetails } from "@/shared/home-intents";
import type { HomeData, HomePlanItem, HomeProposal, HomeButton, HomePlanView } from "@/shared/contracts/home";

export type EvidenceRow = { skill_id: string | null; correct: boolean | null; confidence: string | null; strength: string | null; created_at: string };

export type Action =
  | { type: "open_item"; item: HomePlanItem; first: boolean }
  | { type: "quiz"; topicId: string; label: string; skillId?: string | undefined }
  | { type: "homework_start"; points: [number, number][] }
  | { type: "homework_answer"; state: { points: [number, number][]; step: number }; answer: string }
  | { type: "propose_change"; item: HomePlanItem; to: string; whenLabel: string; add?: boolean }
  | { type: "apply_change"; proposal: HomeProposal }
  | { type: "locked_item"; item: HomePlanItem }
  | { type: "ask_when"; item: HomePlanItem }
  | { type: "progress" }
  | { type: "topic_answer"; topicId: string; text: string }
  | { type: "unavailable"; subject: string; option: string }
  | { type: "greeting" }
  | { type: "explore" }
  | { type: "list_quests" }
  | { type: "view_plan"; made?: boolean }
  | { type: "rule_line"; key: string; buttons?: HomeButton[] };

/** Skills due for review: weak evidence, firm misconceptions (wrong + Sure), lucky guesses (right + Guessing),
 *  once the latest such evidence is at least `days` old and no strong evidence came after it. */
export function reviewDue(ev: EvidenceRow[], now: Date, days: number): string[] {
  const bySkill = new Map<string, EvidenceRow[]>();
  for (const e of ev) if (e.skill_id) bySkill.set(e.skill_id, [...(bySkill.get(e.skill_id) ?? []), e]);
  const out: { s: string; at: number }[] = [];
  for (const [s, rows] of bySkill) {
    const sorted = [...rows].sort((a, b) => a.created_at.localeCompare(b.created_at));
    const flag = (e: EvidenceRow) => e.strength === "weak" || (e.correct === false && e.confidence === "sure") || (e.correct === true && e.confidence === "guessing");
    const last = [...sorted].reverse().find(flag);
    if (!last) continue;
    const after = sorted.filter((e) => e.created_at > last.created_at);
    if (after.some((e) => e.correct && e.strength === "strong")) continue;
    const at = new Date(last.created_at).getTime();
    if (now.getTime() - at >= days * 86400e3) out.push({ s, at });
  }
  return out.sort((a, b) => a.at - b.at).map((x) => x.s);
}

/** Calendar day in Nigeria time (Africa/Lagos, UTC+1, no daylight saving). */
export const lagosDay = (iso: string | Date) => new Date(new Date(iso).getTime() + 3600e3).toISOString().slice(0, 10);

/** Lagos days that count for the streak: a completed step (evidence) or at least 5 minutes of learning. */
export function learnedDays(evidenceAt: string[], sessions: { start: string; end: string }[]): Set<string> {
  const days = new Set(evidenceAt.map(lagosDay));
  for (const s of sessions) if (new Date(s.end).getTime() - new Date(s.start).getTime() >= 5 * 60e3) days.add(lagosDay(s.end));
  return days;
}

/** Days in a row (ending today or yesterday) with a completed step (evidence) or at least 5 minutes of learning. */
export function streakDays(evidenceAt: string[], sessions: { start: string; end: string }[], now: Date): number {
  const days = learnedDays(evidenceAt, sessions);
  let d = new Date(now); let n = 0;
  if (!days.has(lagosDay(d))) d = new Date(d.getTime() - 86400e3);
  while (days.has(lagosDay(d))) { n++; d = new Date(d.getTime() - 86400e3); }
  return n;
}

/** This week, Monday to Sunday in Nigeria time: which days had learning and which is today. */
export function weekRow(days: Set<string>, now: Date): { letter: string; learned: boolean; today: boolean }[] {
  const lagos = new Date(now.getTime() + 3600e3);
  const dow = (lagos.getUTCDay() + 6) % 7; // Monday = 0
  const today = lagosDay(now);
  return ["M", "T", "W", "T", "F", "S", "S"].map((letter, i) => {
    const day = lagosDay(new Date(now.getTime() + (i - dow) * 86400e3));
    return { letter, learned: days.has(day), today: day === today };
  });
}

/** An option tap runs only if that option was offered last and is available. */
export function pickOption<T extends { num: number; available: boolean }>(offered: T[] | null | undefined, num: number): T | null {
  const o = (offered ?? []).find((x) => x.num === num);
  return o && o.available ? o : null;
}

/** Any option that was offered last (open or not). Unavailable ones get a "not ready yet" reply, never a navigation. */
export function findOffered<T extends { num: number }>(offered: T[] | null | undefined, num: number): T | null {
  return (offered ?? []).find((x) => x.num === num) ?? null;
}

const DAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
/** A plan date (ISO, Lagos time) from words like "tomorrow" / "thursday" / "7pm"; default hour from the rule. */
export function planDateFrom(day: string | null, time: string | null, now: Date, defaultHour = 19): { iso: string; label: string } {
  const lagosNow = new Date(now.getTime() + 3600e3);
  let add = 1;
  if (day === "today" || day === "tonight") add = 0;
  else if (day && DAYS.includes(day)) { add = (DAYS.indexOf(day) - lagosNow.getUTCDay() + 7) % 7 || 7; }
  let hour = defaultHour, min = 0;
  const m = time?.match(/(\d{1,2})(?::(\d{2}))?\s?(am|pm)/);
  if (m) { hour = (Number(m[1]) % 12) + (m[3] === "pm" ? 12 : 0); min = Number(m[2] ?? 0); }
  const d = new Date(Date.UTC(lagosNow.getUTCFullYear(), lagosNow.getUTCMonth(), lagosNow.getUTCDate() + add, hour - 1, min));
  const wk = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][(lagosNow.getUTCDay() + add) % 7];
  const h12 = hour % 12 || 12;
  return { iso: d.toISOString(), label: `${wk} ${h12}${min ? `:${String(min).padStart(2, "0")}` : ""} ${hour >= 12 ? "pm" : "am"}` };
}

type Ctx = {
  home: HomeData; details: HomeDetails; topics: { id: string; display_name: string }[];
  input: { kind: string; itemId?: string | null; cardKind?: string; proposal?: HomeProposal; answer?: string; text?: string }; hwState: { points: [number, number][]; step: number } | null;
  now?: Date; defaultHour?: number;
};

const NAMES: Record<string, string> = { chemistry: "Chemistry", physics: "Physics", biology: "Biology", english: "English", literature: "Literature", economics: "Economics", government: "Government", accounting: "Accounting", algebra: "Algebra" };

export function decideAction(intent: HomeIntent, c: Ctx): Action {
  const { home, details, topics } = c;
  const firstTopic = topics[0];
  const offer = home.plan[0]?.label ?? firstTopic?.display_name ?? "Gradient of a line";
  // A typed reply while a homework walk-through is open is her step answer.
  if (c.hwState && (c.input.kind === "hw_answer" || (c.input.kind === "text" && /^[\s\d()+\-−*/÷.]+$/.test(c.input.text ?? "")))) {
    return { type: "homework_answer", state: c.hwState, answer: c.input.answer ?? c.input.text ?? "" };
  }
  if (c.input.kind === "plan_yes" && c.input.proposal) return { type: "apply_change", proposal: c.input.proposal };
  if (c.input.kind === "card") {
    const it = home.cards.find((k) => k.item?.id === c.input.itemId)?.item;
    if (it) return { type: "open_item", item: it, first: false };
    return { type: "explore" };
  }
  switch (intent) {
    case "start_plan": return home.plan[0] ? { type: "open_item", item: home.plan[0], first: true } : { type: "rule_line", key: "home_plan_empty_reply" };
    case "learn_topic": {
      // "I want to learn maths": a subject with no topic lists that subject's quests to choose from.
      if (!details.topicWords && /\bmath(s|ematics)?\b/.test((c.input.text ?? "").toLowerCase())) return { type: "list_quests" };
      const t = matchTopic(details.topicWords, topics) ?? (details.topicWords ? null : firstTopic);
      if (!t) return { type: "rule_line", key: "home_unclear", buttons: clarify() };
      const inPlan = home.allPlan.find((i) => i.topicId === t.id && (i.kind === "continue" || i.kind === "next" || i.kind === "plan" || i.kind === "teacher"));
      if (inPlan) return { type: "open_item", item: inPlan, first: false };
      const tt = t as { id: string; display_name: string; subject?: string | null; chapter_slug?: string | null; quest_slug?: string | null; topic_slug?: string | null };
      return { type: "open_item", first: false, item: { id: `topic:${t.id}`, kind: "next", label: t.display_name, topicId: t.id, source: "own", done: false, locked: false, planned_for: null, due_at: null,
        path: { subject: subjectKeyFor(tt.subject), chapter: tt.chapter_slug ?? "general", quest: tt.quest_slug ?? "general", topic: tt.topic_slug ?? "general" } } };
    }
    case "quiz": {
      const t = matchTopic(details.topicWords, topics) ?? firstTopic;
      if (!t) return { type: "rule_line", key: "home_quiz_none" };
      const review = home.allPlan.find((i) => i.kind === "review");
      return { type: "quiz", topicId: t.id, label: details.topicWords ? t.display_name : review?.label ?? t.display_name, skillId: review?.skillId };
    }
    case "homework_help": return { type: "homework_start", points: details.points };
    case "change_plan": case "edit_plan": {
      const item = home.allPlan.find((i) => details.topicWords && i.label.toLowerCase().includes(details.topicWords.slice(0, 5))) ?? home.plan[0];
      if (intent === "edit_plan" && /\b(remove|drop|delete)\b/.test((c.input.text ?? "").toLowerCase()) && item?.locked) return { type: "locked_item", item };
      if (intent === "edit_plan" && /\b(add|more|put)\b/.test((c.input.text ?? "").toLowerCase())) {
        const t = matchTopic(details.topicWords, topics);
        if (!t) return { type: "unavailable", subject: label(details.topicWords), option: offer };
        const when = planDateFrom(details.day, details.time, c.now ?? new Date(), c.defaultHour);
        const fake: HomePlanItem = { id: `new:${t.id}`, kind: "plan", label: t.display_name, topicId: t.id, source: "own", path: { subject: "", chapter: "", quest: "", topic: "" }, done: false, locked: false, planned_for: null, due_at: null };
        return { type: "propose_change", item: fake, to: when.iso, whenLabel: when.label, add: true };
      }
      if (!item) return { type: "rule_line", key: "home_plan_empty_reply" };
      // "I can't study tomorrow": suggest the next free evening after the named day.
      const cantDay = /\b(can'?t|cannot|won'?t|not able)\b/.test((c.input.text ?? "").toLowerCase());
      const day = cantDay ? dayAfter(details.day) : details.day;
      if (!day && !details.time) return { type: "ask_when", item };
      const when = planDateFrom(day, details.time, c.now ?? new Date(), c.defaultHour);
      return { type: "propose_change", item, to: when.iso, whenLabel: when.label };
    }
    case "view_plan": return { type: "view_plan", made: MAKE_PLAN.test((c.input.text ?? "").toLowerCase()) };
    case "progress": return { type: "progress" };
    case "topic_question": {
      if (details.topicWords && !matchTopic(details.topicWords, topics)) return { type: "unavailable", subject: label(details.topicWords), option: offer };
      return firstTopic ? { type: "topic_answer", topicId: matchTopic(details.topicWords, topics)?.id ?? firstTopic.id, text: c.input.text ?? "" } : { type: "rule_line", key: "home_unclear", buttons: clarify() };
    }
    case "unavailable_topic": return { type: "unavailable", subject: label(details.topicWords), option: offer };
    case "greeting": return { type: "greeting" };
    case "is_ai": return { type: "rule_line", key: "intro_real" };
    case "personal_boundary": return { type: "rule_line", key: "chat_boundary" };
    case "off_topic": return { type: "rule_line", key: "home_off_topic", buttons: [{ label: "Start tonight's plan", action: "start_plan" }] };
    case "distress": return { type: "rule_line", key: "safe_response" };
    default: return { type: "rule_line", key: "home_unclear", buttons: clarify() };
  }
}

export const clarify = (): HomeButton[] => [{ label: "Start tonight's plan", action: "start_plan" }, { label: "See my plan", send: "show me my plan" }, { label: "Quiz me", send: "quiz me" }];

/** Never the same tutor line twice in a row: a repeat becomes "pick one" with the three likeliest actions. */
export function avoidRepeat(prev: string | null | undefined, next: string): { repeat: boolean; buttons: HomeButton[] } {
  const n = (x: string) => x.toLowerCase().replace(/\s+/g, " ").trim();
  return prev != null && n(prev) === n(next) ? { repeat: true, buttons: clarify() } : { repeat: false, buttons: [] };
}

const SOURCE_LABEL = (i: HomePlanItem) => i.source === "teacher" ? "from your teacher" : i.source === "parent" ? "your mum's plan" : i.kind === "plan" ? "your plan" : "recommended";
/** Tonight's items numbered, then everything else with day and source. Built only from her plan. */
export function planView(home: HomeData): HomePlanView {
  const ids = new Set(home.plan.map((i) => i.id));
  const day = (iso: string | null) => iso ? new Date(iso).toLocaleDateString("en-GB", { weekday: "short", timeZone: "Africa/Lagos" }) : "Anytime";
  return {
    tonight: home.plan.map((i, k) => ({ num: k + 1, label: i.label })),
    week: home.allPlan.filter((i) => !ids.has(i.id)).map((i) => ({ day: day(i.planned_for ?? i.due_at), label: i.label, source: SOURCE_LABEL(i) })),
  };
}
const label = (w: string | null) => (w ? NAMES[w] ?? w.charAt(0).toUpperCase() + w.slice(1) : "That topic");
function dayAfter(day: string | null): string | null {
  if (!day || day === "today" || day === "tonight") return "tomorrow";
  if (day === "tomorrow") return DAYS[(new Date(Date.now() + 3600e3).getUTCDay() + 2) % 7]!;
  return DAYS[(DAYS.indexOf(day) + 1) % 7] ?? null;
}
/** Only real topics: gradient/slope/steepness/lines/graphs/coordinates map to the gradient topic. */
export function matchTopic(words: string | null, topics: { id: string; display_name: string }[]) {
  if (!words) return null;
  const w = words.toLowerCase();
  const direct = topics.find((t) => t.display_name.toLowerCase().includes(w));
  if (direct) return direct;
  if (/gr[ae]d|slope|steep|line|graph|coord/.test(w)) return topics.find((t) => /gradient/i.test(t.display_name)) ?? null;
  return null;
}

/** Plan order: continue lesson, next topic, parent/teacher/own plan items, then reviews (Start = first item). */
export function planRank(kind: "continue" | "next" | "review" | "plan" | "teacher" | string): number {
  return kind === "continue" ? 0 : kind === "next" ? 1 : kind === "review" ? 3 : 2;
}
