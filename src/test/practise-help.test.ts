import { describe, it, expect } from "vitest";
import { helpLevel, checkPractiseReply, hiddenResults, nextStepIndex, setUpOf } from "@/server/lesson/practise-help";

describe("practice help level", () => {
  it("goes up with each ask and stops at 3", () => {
    expect([0, 1, 2, 5].map((n) => helpLevel(n, "independent"))).toEqual([1, 2, 3, 3]);
  });
  it("starts one higher in Teach me", () => { expect(helpLevel(0, "teach_me")).toBe(2); });
  it("starts again at 1 on a new problem (no asks yet)", () => { expect(helpLevel(0, "independent")).toBe(1); });
});

describe("practice reply check", () => {
  const q = "Find the gradient of the line through (1, 2) and (3, 6).";
  const results = hiddenResults(2, "m = (6 − 2) / (3 − 1) = 4/2");
  it("allows numbers from the question", () => {
    expect(checkPractiseReply("First find how much y goes up: from 2 to 6. What is 6 − 2?", { allowedText: [q], results }).ok).toBe(true);
  });
  it("blocks the final answer", () => {
    expect(checkPractiseReply("So the gradient is 2.", { allowedText: [q], results })).toEqual({ ok: false, reason: "reveals_answer" });
  });
  it("blocks the next step's result", () => {
    expect(checkPractiseReply("That gives 4/2 for the line.", { allowedText: [q, "4/2"], results })).toEqual({ ok: false, reason: "reveals_answer" });
  });
  it("blocks numbers not on screen", () => {
    expect(checkPractiseReply("Try 9 minus 2 for y.", { allowedText: [q], results })).toEqual({ ok: false, reason: "new_number" });
  });
  it("allows numbers from her own lines", () => {
    expect(checkPractiseReply("Good, 6 − 2 is your change in y. Now what about x?", { allowedText: [q, "6 − 2"], results }).ok).toBe(true);
  });
});

describe("next step", () => {
  it("never runs past the last worked line", () => { expect(nextStepIndex(5, 3)).toBe(2); });
  it("set-up hides the result", () => { expect(setUpOf("m = (6 − 2) / (3 − 1) = 4/2")).toBe("m = (6 − 2) / (3 − 1)"); });
});
