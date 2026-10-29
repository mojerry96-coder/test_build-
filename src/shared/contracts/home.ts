// Shapes shared by the Home screen and Fitila's Home engine.
export type TopicPath = { subject: string; chapter: string; quest: string; topic: string };
export type HomePlanItem = {
  id: string; kind: "continue" | "review" | "teacher" | "plan" | "next"; label: string; topicId: string; skillId?: string;
  source: "own" | "parent" | "teacher"; path: TopicPath; done: boolean; locked: boolean; planned_for: string | null; due_at: string | null;
};
export type HomeCard = { kind: "continue" | "review" | "teacher" | "explore"; title: string; line: string; item: HomePlanItem | null };
/** One circle on the weekly streak row (Mon to Sun, Nigeria time). */
export type HomeWeekDay = { letter: string; learned: boolean; today: boolean };
export type HomeData = {
  firstName: string | null; initials: string; className: string; streak: number; planGreeting: string;
  plan: HomePlanItem[]; allPlan: HomePlanItem[]; cards: HomeCard[]; week: HomeWeekDay[];
};
export type HomeButton = { label: string; send?: string; link?: string; action?: "start_plan" | "plan_yes" | "plan_other" };
export type HomeProposal = { itemId: string; topicId: string; label: string; to: string; whenLabel: string; add: boolean };
/** A numbered choice the tutor offers. Only available options can be tapped; the server re-reads them on tap. */
export type HomeOption = { num: number; title: string; line: string; available: boolean; path: TopicPath | null };
/** The plan shown inside the chat: tonight numbered, then the rest of the week with day and source labels. */
export type HomePlanView = { tonight: { num: number; label: string }[]; week: { day: string; label: string; source: string }[] };
export type HomeReply = {
  lines: string[]; buttons: HomeButton[]; outcome: string; intent: string; actionType: string; source: string;
  navigate?: { to: "lesson" | "intro" | "quiz" | "subject"; path?: TopicPath; sessionId?: string };
  proposal?: HomeProposal; hw?: { points: [number, number][]; step: number }; options?: HomeOption[]; planView?: HomePlanView;
  conversationId?: string;
  /** Topic this reply opened or quizzed on; names the chat in Chat history. */
  topicTitle?: string;
};
export type HomeChatMsg = { id: string; role: "student" | "tutor"; text: string; buttons: HomeButton[]; options?: HomeOption[]; planView?: HomePlanView };
