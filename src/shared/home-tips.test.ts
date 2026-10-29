import { describe, expect, it } from "vitest";
import { homeTips, nextTip } from "./home-tips";

describe("home tips", () => {
  it("leads with the waiting tip only when a lesson is in progress", () => {
    expect(homeTips(true)[0]).toBe("Your lesson is waiting. Tap Continue Lesson to pick up where you stopped.");
    expect(homeTips(false)[0]).toBe("Start with Mathematics, your first topic is ready.");
  });
  it("goes from greeting to first tip, then loops", () => {
    expect(nextTip(-1, 4)).toBe(0);
    expect(nextTip(3, 4)).toBe(0);
  });
});
