import { describe, it, expect } from "vitest";
import { answerMatches, checkLine, evaluate, fracToString } from "../evaluate";

describe("answer matching", () => {
  it("accepts −2 written as -2, −2.0 and −8/4", () => {
    for (const a of ["-2", "−2", "−2.0", "-8/4", " - 2 "]) expect(answerMatches(a, ["-2"])).toBe(true);
  });
  it("rejects 2 for −2", () => expect(answerMatches("2", ["-2"])).toBe(false));
  it("accepts 12/4 and 3 for 3", () => {
    expect(answerMatches("12/4", ["3"])).toBe(true);
    expect(answerMatches("3", ["3"])).toBe(true);
  });
  it("accepts ½ for 1/2", () => expect(answerMatches("½", ["1/2"])).toBe(true));
});

describe("whiteboard lines", () => {
  it("evaluates (−10 − 5) ÷ (3 − (−2)) to −3", () => {
    expect(fracToString(evaluate("(−10 − 5) ÷ (3 − (−2))")!)).toBe("-3");
  });
  it("flags = −15 ÷ 1 after a line worth −3", () => {
    const prev = evaluate("(−10 − 5) ÷ (3 − (−2))");
    expect(checkLine("= −15 ÷ 1", prev).status).toBe("check");
  });
  it("accepts = −15 ÷ 5 after a line worth −3", () => {
    const prev = evaluate("(−10 − 5) ÷ (3 − (−2))");
    expect(checkLine("= −15 ÷ 5", prev).status).toBe("ok");
  });
  it("flags an unbalanced line 3 − (−2) = 1", () => expect(checkLine("3 − (−2) = 1", null).status).toBe("check"));
  it("accepts a formula line", () => expect(checkLine("m = (y₂ − y₁) ÷ (x₂ − x₁)", null).status).toBe("ok"));
});

describe("problem 4 regression and bounds", () => {
  it("checks 6/3 on GRAD_WS4 promptly without accepting the inverted gradient", async () => {
    const { default: pack } = await import("../../../../content/packs/MTH12_09_02_01.seed.json");
    const item = pack.items.find(i => i.id === "GRAD_WS4")!;
    const start = performance.now();
    expect(checkLine("6/3", null).status).toBe("ok");
    expect(answerMatches("6/3", [(item.key as { final: string }).final])).toBe(false);
    expect(performance.now() - start).toBeLessThan(100);
  });
  it("rejects oversized and deeply nested input within the budget", () => {
    expect(evaluate("9".repeat(10000))).toBeNull();
    expect(evaluate("(".repeat(10000))).toBeNull();
    expect(checkLine("=".repeat(10000), null).status).toBe("check");
  });
});
