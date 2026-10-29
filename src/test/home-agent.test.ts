import { describe, expect, it } from "vitest";
import { pickHomeIntentSure, typedOptionNumber } from "@/shared/home-intents";
import { decideAction, findOffered, pickOption, reviewDue, streakDays, weekRow } from "@/server/home/decide";
import { gradientSteps, checkStep } from "@/server/home/homework";
import type { HomeData } from "@/shared/contracts/home";

const intent = (t: string, m: "tutor" | "quiz" = "tutor") => pickHomeIntentSure(t, m).intent;

describe("Home intents (word list)", () => {
  it("sorts the test set", () => {
    expect(intent("teach me gradient")).toBe("learn_topic");
    expect(intent("quiz me", "quiz")).toBe("quiz");
    expect(intent("quiz me on graphs")).toBe("quiz");
    expect(intent("solve this: find the gradient of (1, 4) and (5, 12)")).toBe("homework_help");
    expect(intent("I can't study tomorrow")).toBe("change_plan");
    expect(intent("how am I doing?")).toBe("progress");
    expect(intent("what is a gradient?")).toBe("topic_question");
    expect(intent("how far")).toBe("greeting");
    expect(intent("asdfgh")).toBe("unclear");
  });
  it("algebra and chemistry are not in the content yet", () => {
    expect(intent("add more algebra to my plan")).toBe("unavailable_topic");
    expect(intent("teach me chemistry")).toBe("unavailable_topic");
  });
});

const item = (over: object) => ({ id: "p1", kind: "teacher", label: "Gradient of a line", topicId: "T", source: "teacher", path: { subject: "s", chapter: "c", quest: "q", topic: "t" }, done: false, locked: true, planned_for: null, due_at: null, ...over });
const home = (plan: object[]): HomeData => ({ firstName: "Ada", initials: "A", className: "SS3", streak: 0, planGreeting: "", plan: plan as never, allPlan: plan as never, cards: [], week: [] });
const ctx = (h: HomeData, text: string) => ({ home: h, details: { topicWords: null, day: null, time: null, points: [] }, topics: [{ id: "T", display_name: "Gradient of a line" }], input: { kind: "text", text }, hwState: null });

describe("Home engine rules", () => {
  it("teacher and parent items cannot be removed", () => {
    const h = home([item({})]);
    expect(decideAction("edit_plan", ctx(h, "remove gradient from my plan")).type).toBe("locked_item");
  });
  it("a plan change is only proposed, never saved, until she says Yes", () => {
    const h = home([item({ source: "own", locked: false, kind: "plan" })]);
    const c = { ...ctx(h, "I can't study tomorrow"), details: { topicWords: null, day: "tomorrow", time: null, points: [] } };
    expect(decideAction("change_plan", c).type).toBe("propose_change");
  });
  it("review due: firm misconception and lucky guess after 3 days, not before", () => {
    const now = new Date("2026-10-22T18:00:00Z");
    const ev = [
      { skill_id: "A", correct: false, confidence: "sure", strength: "none", created_at: "2026-10-18T10:00:00Z" },
      { skill_id: "B", correct: true, confidence: "guessing", strength: "weak", created_at: "2026-10-19T10:00:00Z" },
      { skill_id: "C", correct: true, confidence: "guessing", strength: "weak", created_at: "2026-10-21T10:00:00Z" },
      { skill_id: "D", correct: true, confidence: "sure", strength: "strong", created_at: "2026-10-10T10:00:00Z" },
    ];
    expect(reviewDue(ev, now, 3)).toEqual(["A", "B"]);
  });
  it("streak counts Lagos days with a completed step or 5 minutes of learning", () => {
    const now = new Date("2026-10-22T20:00:00Z");
    // 23:30 UTC on the 20th is already the 21st in Lagos.
    expect(streakDays(["2026-10-22T19:00:00Z", "2026-10-20T23:30:00Z"], [], now)).toBe(2);
    expect(streakDays([], [{ start: "2026-10-22T18:00:00Z", end: "2026-10-22T18:04:00Z" }], now)).toBe(0);
    expect(streakDays([], [{ start: "2026-10-22T18:00:00Z", end: "2026-10-22T18:05:00Z" }], now)).toBe(1);
  });
});

describe("Homework help", () => {
  it("breaks two points into steps checked exactly, and never states the final value", () => {
    const s = gradientSteps([[1, 4], [5, 12]])!;
    expect(s.map((x) => checkStep(x, ["8", "4", "2"][s.indexOf(x)]!))).toEqual([true, true, true]);
    expect(checkStep(s[2]!, "8/4")).toBe(true);
    expect(checkStep(s[2]!, "3")).toBe(false);
    expect(s.some((x) => /\b2\b/.test(x.question + x.hint))).toBe(false);
  });
  it("can't step a problem it can't break down", () => {
    expect(gradientSteps([])).toBeNull();
    expect(gradientSteps([[2, 1], [2, 5]])).toBeNull();
  });
});

describe("Ask chat and Learning Hub", () => {
  it('"I want to learn maths" lists the quests', () => {
    expect(pickHomeIntentSure("I want to learn maths").intent).toBe("learn_topic");
    const h = { plan: [], allPlan: [], cards: [] } as unknown as HomeData;
    const a = decideAction("learn_topic", { home: h, details: { topicWords: null, day: null, time: null, points: [] }, topics: [{ id: "T", display_name: "Gradient of a line" }], input: { kind: "text", text: "I want to learn maths" }, hwState: null });
    expect(a.type).toBe("list_quests");
  });
  it("an option tap runs only an offered, available option", () => {
    const offered = [{ num: 1, available: true }, { num: 2, available: false }];
    expect(pickOption(offered, 1)?.num).toBe(1);
    expect(pickOption(offered, 2)).toBeNull();
    expect(pickOption(offered, 3)).toBeNull();
    expect(pickOption(null, 1)).toBeNull();
  });
  it("an offered but unavailable option is found for a reply but never opens", () => {
    const offered = [{ num: 1, available: true }, { num: 2, available: false }];
    expect(findOffered(offered, 2)?.num).toBe(2);
    expect(pickOption(offered, 2)).toBeNull();
    expect(findOffered(offered, 4)).toBeNull();
  });
  it("typed option numbers", () => {
    expect(typedOptionNumber("2")).toBe(2);
    expect(typedOptionNumber("quest 3")).toBe(3);
    expect(typedOptionNumber("number one")).toBe(1);
    expect(typedOptionNumber("I want 2 apples")).toBeNull();
  });
  it("week row marks Lagos days Mon to Sun", () => {
    // Thu 22 Oct 2026, 23:30 UTC = Fri 00:30 in Lagos.
    const now = new Date("2026-10-22T23:30:00Z");
    const w = weekRow(new Set(["2026-10-19", "2026-10-23"]), now);
    expect(w.map((d) => d.learned)).toEqual([true, false, false, false, true, false, false]);
    expect(w.findIndex((d) => d.today)).toBe(4);
  });
});

import { matchPendingReply, typedOptionTitle } from "@/shared/home-intents";
import { avoidRepeat, clarify } from "@/server/home/decide";

describe("Ask Fiti remembers its question", () => {
  it("reads yes words", () => {
    for (const t of ["yes", "yeah", "ok", "okay", "sure", "yes please", "let's go", "go", "start", "alright", "👍", "Yes!", "oya", "yep"]) expect(matchPendingReply(t), t).toBe("yes");
  });
  it("reads no words", () => {
    for (const t of ["no", "not now", "later", "nah", "nope", "abeg no"]) expect(matchPendingReply(t), t).toBe("no");
  });
  it("leaves mixed replies to normal sorting", () => {
    expect(matchPendingReply("yes but show me the plan first")).toBeNull();
  });
  it("matches an option by its name", () => {
    expect(typedOptionTitle("Gradient of a line", [{ num: 2, title: "Gradient of a line" }])).toBe(2);
  });
});

describe("view_plan intent", () => {
  it("sorts plan questions", () => {
    for (const t of ["can i see the plan?", "what's my plan", "show me my plan", "what am I doing this week", "plan"]) expect(intent(t), t).toBe("view_plan");
  });
});

describe("Never repeat", () => {
  it("swaps a repeated line for three buttons", () => {
    const r = avoidRepeat("Do you want to start?", "Do you want to start?");
    expect(r.repeat).toBe(true);
    expect(r.buttons.map((b) => b.label)).toEqual(["Start tonight's plan", "See my plan", "Quiz me"]);
    expect(avoidRepeat("A", "B").repeat).toBe(false);
  });
  it("clarifying questions always offer three buttons", () => {
    expect(clarify()).toHaveLength(3);
  });
});

import { pickHomeIntentSure as _pick } from "@/shared/home-intents";
import { isGoOn } from "@/server/home/opening.server";
describe("Fiti keeps the conversation on track", () => {
  it("a WAEC plan request opens the plan", () => {
    expect(_pick("i want to make a lesson plan for me waec exam").intent).toBe("view_plan");
    expect(_pick("what should i study").intent).toBe("view_plan");
  });
  it("thanks counts as go on during setup, no thanks does not", () => {
    expect(isGoOn("thanks fiti")).toBe(true);
    expect(isGoOn("no thanks")).toBe(false);
  });
});
