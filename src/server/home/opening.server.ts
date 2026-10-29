// Runs Ask Fiti openings and the first-time conversation. Choices come from opening.ts; every line is an
import { resetAt } from "@/server/lesson/shown-skills.server";
// approved fallback line except the feeling reaction, which the AI writes and the reply checks gate.
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import type { HomeButton, HomeData, HomeReply } from "@/shared/contracts/home";
import { homeLine } from "./agent.server";
import { ackAllowed, isTooShort, isTypedByHer, mapHref, hintFor, isJustStart, isNewVisit, matchFeeling, matchHardest, matchReturnMood, pickOpening, rotateLine, type Feeling, type Hardest, type LastLesson, type OnbStep, type Prefs } from "./opening";

type Db = SupabaseClient<Database>;
type Any = any; // eslint-disable-line @typescript-eslint/no-explicit-any
export type OnbPending = { kind: "onboard"; step: OnbStep } | { kind: "return" };

const JUST: HomeButton = { label: "Let's just start", send: "let's just start" };
const AREA: Record<Hardest, string> = { graphs: "graphs", algebra: "algebra", word_problems: "word problems", not_sure: "maths" };

export async function getPrefs(admin: Db, userId: string): Promise<Prefs | null> {
  const { data } = await admin.from("student_prefs").select("maths_feeling, hardest_area, intro_done_at, last_opening_line_id, last_visit_at").eq("student_id", userId).maybeSingle();
  return (data as Prefs | null) ?? null;
}
async function savePrefs(admin: Db, userId: string, patch: Partial<Prefs>) {
  const { error } = await admin.from("student_prefs").upsert({ student_id: userId, ...patch, updated_at: new Date().toISOString() } as Any, { onConflict: "student_id" });
  if (error) console.error("prefs save failed", error.message);
}

async function lastLesson(admin: Db, userId: string): Promise<LastLesson & { label?: string | undefined } | null> {
  const { data: s } = await admin.from("sessions").select("id, topic_id, state, completed_at").eq("student_id", userId).eq("status", "completed").not("completed_at", "is", null).order("completed_at", { ascending: false }).limit(5);
  const cutoff = await resetAt(admin, userId).catch(() => null);
  const lesson = (s ?? []).find((x) => (x.state as Any)?.kind !== "quiz" && (!cutoff || (x.completed_at as string) > cutoff));
  if (!lesson) return null;
  const [{ data: ev }, { data: t }] = await Promise.all([
    admin.from("evidence").select("misconception_id").eq("session_id", lesson.id).not("misconception_id", "is", null),
    admin.from("topics").select("display_name").eq("id", lesson.topic_id).maybeSingle(),
  ]);
  return { completedAt: lesson.completed_at as string, secure: ((lesson.state as Any)?.secure ?? null) as boolean | null, misconceptions: new Set((ev ?? []).map((e) => e.misconception_id)).size, label: t?.display_name };
}

/** Her topic in progress, else her next open one: a finished or locked topic is never offered. */
export const continueTarget = (home: Pick<HomeData, "allPlan">) =>
  home.allPlan.find((i) => i.kind === "continue" && !i.done && !i.locked) ?? home.allPlan.find((i) => !i.done && !i.locked) ?? null;
const startBtns = async (admin: Db, home: HomeData): Promise<HomeButton[]> => {
  const open = continueTarget(home);
  if (!open) return [{ label: "Quiz me", send: "quiz me" }];
  const label = (await homeLine(admin, "home_continue_label"))[0]?.trim() || "Continue Learning";
  return [{ label: "See my plan", send: "show me my plan" }, { label: "Not tonight", send: "not tonight" }, { label, link: mapHref(open.path) }];
};

/** The opening for a fresh visit, or null when the normal start screen should show. */
export async function opening(admin: Db, userId: string, home: HomeData, force = false): Promise<(Omit<HomeReply, "intent" | "actionType" | "source"> & { kind: string; pending: OnbPending | { kind: "item"; itemId: string } | null }) | null> {
  const now = new Date();
  const prefs = await getPrefs(admin, userId);
  if (!force && prefs?.intro_done_at && !isNewVisit(prefs, now)) return null;
  const last = await lastLesson(admin, userId);
  const kind = pickOpening(prefs, last, now);
  const first_name = home.firstName ?? "there";
  const item = home.plan[0]?.label ?? "";
  if (kind === "intro") {
    return { kind, lines: await homeLine(admin, "home_onb_hello", { first_name }), buttons: [{ label: "Sure!", send: "sure" }, JUST], outcome: "onboard_hello", pending: { kind: "onboard", step: "hello" } };
  }
  const pools: Record<string, string[]> = { struggled: ["home_ret_struggle_1", "home_ret_struggle_2"], away: ["home_ret_away_1", "home_ret_away_2"], next_day: ["home_ret_next_1", "home_ret_next_2"], normal: ["home_greeting"] };
  const key = rotateLine(pools[kind]!, prefs?.last_opening_line_id ?? null, now.getUTCDate());
  await savePrefs(admin, userId, { last_opening_line_id: key, last_visit_at: now.toISOString() });
  if (kind === "normal" && !item) return null;
  const vars = { first_name, item, last: last?.label ?? item, streak_words: home.streak >= 2 ? `That's ${home.streak} days in a row!` : "", last_words: last?.label && last.label !== item ? `Last time you worked on ${last.label}.` : "" };
  const lines = (await homeLine(admin, key, vars)).map((l) => l.replace(/\s{2,}/g, " ").trim());
  if (kind === "away") return { kind, lines, buttons: [{ label: "Good!", send: "good" }, { label: "Busy week", send: "busy week" }, { label: "Struggling a bit", send: "struggling a bit" }], outcome: "return_away", pending: { kind: "return" } };
  if (!item) return { kind, lines, buttons: await startBtns(admin, home), outcome: `return_${kind}`, pending: null };
  return { kind, lines, buttons: await startBtns(admin, home), outcome: `return_${kind}`, pending: { kind: "item", itemId: home.plan[0]!.id } };
}

async function reaction(admin: Db, feeling: Feeling, typed: string): Promise<string[]> {
  const fallback = await homeLine(admin, `home_onb_react_${feeling}`);
  const { data: prov } = await admin.from("rules").select("value").eq("key", "ai_provider").limit(1);
  if (prov?.[0]?.value !== "lovable_ai") return fallback;
  const { reactToFeeling } = await import("@/server/providers/ai.server");
  const { checkAiAnswer } = await import("@/server/checks/ai-answer");
  const { data: bw } = await admin.from("rules").select("value").eq("key", "banned_words").limit(1);
  const r = await reactToFeeling(feeling, typed, 3000);
  if (!r || /\?/.test(r)) return fallback;
  const ok = checkAiAnswer(r, { facts: [], studentText: typed, visible: [], hiddenAnswers: [], ...(Array.isArray(bw?.[0]?.value) ? { banned: bw![0]!.value as string[] } : {}) });
  return ok.ok && r.split(/(?<=[.!?])\s+/).length <= 2 ? [r] : fallback;
}

let lastAck: string | null = null;
/** A short AI line answering what she typed; nothing when she tapped a button, the AI is off or the line fails checks. */
async function ack(admin: Db, firstName: string, text: string, step: string): Promise<string[]> {
  if (!isTypedByHer(text) || isTooShort(text)) return [];
  const { data: prov } = await admin.from("rules").select("value").eq("key", "ai_provider").limit(1);
  if (prov?.[0]?.value !== "lovable_ai") return [];
  const { replyToStudent } = await import("@/server/providers/ai.server");
  const { checkAiAnswer } = await import("@/server/checks/ai-answer");
  const { data: bw } = await admin.from("rules").select("value").eq("key", "banned_words").limit(1);
  const r = await replyToStudent(firstName, text, step, 3000).catch(() => null);
  if (!ackAllowed(r, firstName, lastAck)) return [];
  const ok = checkAiAnswer(r, { facts: [], studentText: text, visible: [], hiddenAnswers: [], ...(Array.isArray(bw?.[0]?.value) ? { banned: bw![0]!.value as string[] } : {}) });
  if (!ok.ok) return [];
  lastAck = r;
  return [r];
}

/** Friendly replies that mean "go on": yes words, thanks, greetings, a thumbs up. */
export const isGoOn = (t: string) => !/\b(no|not|nah|nope|later)\b/i.test(t) && /\b(sure|yes|yeah|yep|ok|okay|go on|go ahead|ask|alright|thanks|thank you|thank u|thx|nice|cool|hi|hello|hey|fine|of course|no problem|oya)\b|👍|😊|🙂/iu.test(t);

/** Her reply to an onboarding or "how have you been" question. Null = not an answer; sort normally. */
export async function onboardReply(admin: Db, userId: string, home: HomeData, pend: OnbPending, text: string): Promise<(Omit<HomeReply, "intent" | "actionType" | "source"> & { step: string; pending: Any; ai?: boolean }) | null> {
  const first_name = home.firstName ?? "there";
  const item = home.plan[0]?.label ?? "";
  const planReply = async (hardest: Hardest | null, step: string) => {
    await savePrefs(admin, userId, { intro_done_at: new Date().toISOString(), last_visit_at: new Date().toISOString() });
    if (!item) return { step, lines: await homeLine(admin, "home_plan_empty_reply"), buttons: [{ label: "Quiz me", send: "quiz me" }], outcome: "onboard_plan_empty", pending: null };
    const area = hintFor(hardest, item);
    const lines = await homeLine(admin, area ? "home_onb_plan_hint" : "home_onb_plan", { item, area: area ?? "" });
    return { step, lines, buttons: await startBtns(admin, home), outcome: "onboard_plan", pending: { kind: "item", itemId: home.plan[0]!.id } };
  };
  if (pend.kind === "return") {
    const mood = matchReturnMood(text);
    if (!mood) return null;
    const a = await ack(admin, first_name, text, "return");
    if (mood === "good") return { step: "return_good", lines: [...a, ...await homeLine(admin, "home_ret_good", { item })], buttons: await startBtns(admin, home), outcome: "return_good", pending: home.plan[0] ? { kind: "item", itemId: home.plan[0].id } : null };
    if (mood === "busy") return { step: "return_busy", lines: [...a, ...await homeLine(admin, "home_ret_busy", { item: item || "gradient" })], buttons: [{ label: "Quiz me", send: "quiz me" }, { label: "Full lesson", action: "start_plan" }], outcome: "return_busy", pending: { kind: "send", text: "quiz me" } };
    const review = home.allPlan.find((i) => i.kind === "review") ?? home.plan[0];
    return { step: "return_low", lines: [...a, ...await homeLine(admin, "home_ret_low", { first_name, item: review?.label ?? item })], buttons: review ? [{ label: `Start ${review.label}`, send: "yes" }] : [], outcome: "return_low", pending: review ? { kind: "item", itemId: review.id } : null };
  }
  if (isJustStart(text)) return planReply((await getPrefs(admin, userId))?.hardest_area ?? null, "just_start");
  if (pend.step === "hello") {
    if (!isGoOn(text)) return null;
    return { step: "feeling", lines: [...await ack(admin, first_name, text, "hello"), ...await homeLine(admin, "home_onb_feeling")], buttons: [{ label: "I enjoy it", send: "I enjoy it" }, { label: "It's OK", send: "It's OK" }, { label: "It's hard for me", send: "It's hard for me" }, JUST], outcome: "onboard_feeling", pending: { kind: "onboard", step: "feeling" } };
  }
  if (pend.step === "feeling") {
    const f = matchFeeling(text);
    if (!f) return null;
    await savePrefs(admin, userId, { maths_feeling: f });
    const lines = [...await reaction(admin, f, text), ...await homeLine(admin, "home_onb_hardest")];
    return { step: "hardest", lines, buttons: [{ label: "Graphs", send: "Graphs" }, { label: "Algebra", send: "Algebra" }, { label: "Word problems", send: "Word problems" }, { label: "Not sure yet", send: "Not sure yet" }, JUST], outcome: "onboard_hardest", pending: { kind: "onboard", step: "hardest" } };
  }
  if (pend.step === "hardest") {
    const h = matchHardest(text);
    if (!h) return null;
    await savePrefs(admin, userId, { hardest_area: h });
    return { step: "how", lines: [...await ack(admin, first_name, text, "hardest"), ...await homeLine(admin, `home_onb_how_${h}`, { area: AREA[h] })], buttons: [{ label: "Sounds good!", send: "sounds good" }, JUST], outcome: "onboard_how", pending: { kind: "onboard", step: "how" } };
  }
  if (pend.step === "how") {
    if (!isGoOn(text) && !/\b(sound|good|great|fine)\b/i.test(text)) return null;
    return planReply((await getPrefs(admin, userId))?.hardest_area ?? null, "plan");
  }
  return null;
}

/** She left the first conversation by asking something else: don't ask again. */
export const endIntro = (admin: Db, userId: string) => savePrefs(admin, userId, { intro_done_at: new Date().toISOString(), last_visit_at: new Date().toISOString() });
/** "Talk to me again": the first conversation shows on her next visit. */
export const resetIntro = (admin: Db, userId: string) => savePrefs(admin, userId, { intro_done_at: null, last_visit_at: null, last_opening_line_id: null });
