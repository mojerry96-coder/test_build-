import { describe, expect, it } from "vitest";
import { countsAsTry, revealLimit, shouldReveal, warnBeforeReveal } from "@/server/lesson/worksheet-reveal";
import { afterRevealLine } from "@/shared/after-reveal";

describe("practise reveal after 3 tries", () => {
  it("reveals on the 3rd try, not the 2nd", () => {
    expect(shouldReveal(2, 3)).toBe(false);
    expect(shouldReveal(3, 3)).toBe(true);
  });
  it("warns after the 2nd try", () => {
    expect(warnBeforeReveal(2, 3)).toBe(true);
    expect(warnBeforeReveal(1, 3)).toBe(false);
  });
  it("unreadable lines are not tries", () => {
    expect(countsAsTry("check", "unreadable")).toBe(false);
    expect(countsAsTry("check", "not_equal")).toBe(true);
    expect(countsAsTry("ok")).toBe(false);
  });
  it("the 'on your own' line plays only on the problem after the reveal", () => {
    const saved = { from: "P1", text: "Try this one on your own." };
    expect(afterRevealLine(saved, "P1")).toBeNull();
    expect(afterRevealLine(saved, "P2")).toBe("Try this one on your own.");
    expect(afterRevealLine(null, "P2")).toBeNull();
  });
  it("limit comes from the rule, default 3", () => {
    expect(revealLimit(4)).toBe(4);
    expect(revealLimit(null)).toBe(3);
  });
});
