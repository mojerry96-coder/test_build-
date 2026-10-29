import { describe, expect, it } from "vitest";
import { contextHelpSource, isGibberish, mayUseCatch, SCREEN_QUESTION } from "./context-help";

describe("context help", () => {
  it("only empty or mash counts as gibberish", () => {
    expect(isGibberish("")).toBe(true);
    expect(isGibberish("asdfgh")).toBe(true);
    expect(isGibberish("what does 1:8 mean?")).toBe(false);
    expect(isGibberish("9")).toBe(false);
  });
  it("spots questions about the screen", () => {
    expect(SCREEN_QUESTION.test("what does 1:8 mean?")).toBe(true);
    expect(SCREEN_QUESTION.test("what is this?")).toBe(true);
    expect(SCREEN_QUESTION.test("why 8?")).toBe(true);
  });
  it("picks help from what she is doing", () => {
    expect(contextHelpSource({ step: "readiness", fixPart: "watch" })).toEqual({ from: "line", key: "ctx_fix_watch" });
    expect(contextHelpSource({ step: "readiness", fixPart: "try" })).toEqual({ from: "fix_step_hint" });
    expect(contextHelpSource({ step: "readiness", fixPart: "practice" })).toEqual({ from: "line", key: "ctx_fix_practice" });
    expect(contextHelpSource({ step: "readiness" })).toEqual({ from: "warmup_tip" });
    expect(contextHelpSource({ step: "guided" })).toEqual({ from: "line", key: "ctx_guided" });
    expect(contextHelpSource({ step: "simulation" })).toEqual({ from: "first_hint" });
  });
  it("never says didn't catch that twice in a row", () => {
    const c = ["Sorry, I didn't catch that. Could you say it another way?"];
    expect(mayUseCatch(c[0], c)).toBe(false);
    expect(mayUseCatch("Nice!", c)).toBe(true);
  });
});
