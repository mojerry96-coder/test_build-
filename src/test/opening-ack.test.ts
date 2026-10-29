import { describe, expect, it } from "vitest";
import { ackAllowed, isTooShort, isTypedByHer, mapHref } from "@/server/home/opening";

describe("Fiti's reply to what she typed", () => {
  it("button taps get no extra line", () => { expect(isTypedByHer("It's OK")).toBe(false); expect(isTypedByHer("hello i want to learn")).toBe(true); });
  it("too-short messages get no AI line", () => { expect(isTooShort("hmm")).toBe(true); expect(isTooShort("👍")).toBe(true); });
  it("a line with a question falls back to the approved question only", () => expect(ackAllowed("Ready to start?", "Kingsley", null)).toBe(false));
  it("a line with numbers is refused", () => expect(ackAllowed("You will get 9 marks.", "Kingsley", null)).toBe(false));
  it("her name at most once", () => expect(ackAllowed("Kingsley, hello Kingsley.", "Kingsley", null)).toBe(false));
  it("never the same line twice in a row", () => expect(ackAllowed("Love that energy!", "Kingsley", "love that energy!")).toBe(false));
  it("a short warm line is allowed", () => expect(ackAllowed("Hello Kingsley, I love that you're ready to learn.", "Kingsley", null)).toBe(true));
});
describe("Continue Learning", () => {
  it("points at the topic's map", () => expect(mapHref({ subject: "maths", chapter: "c", quest: "q", topic: "t" })).toBe("/maths/c/q/t/path"));
});
import { continueTarget } from "@/server/home/opening.server";
describe("Continue target", () => {
  const it0 = (o: object) => ({ id: "x", kind: "plan", label: "", topicId: "", source: "own", path: { subject: "s", chapter: "c", quest: "q", topic: "t" }, done: false, locked: false, planned_for: null, due_at: null, ...o }) as never;
  it("a finished or locked topic falls back to the next open one", () => {
    const r = continueTarget({ allPlan: [it0({ id: "a", kind: "continue", done: true }), it0({ id: "b", locked: true }), it0({ id: "c" })] });
    expect(r?.id).toBe("c");
  });
  it("nothing open gives no target", () => expect(continueTarget({ allPlan: [it0({ done: true })] })).toBeNull());
});
