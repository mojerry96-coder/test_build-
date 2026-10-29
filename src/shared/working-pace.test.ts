import { describe, expect, it } from "vitest";
import { changedSpan, lineHoldMs, nextTapMode, typeDurationMs, typeSchedule, typeUnits } from "./working-pace";

describe("typing pace", () => {
  it("types at 55 characters a second", () => expect(typeDurationMs("abcdefghij", 55)).toBe(Math.round((10 / 55) * 1000)));
  it("pauses 250 ms after a full stop and 120 ms after a comma", () => {
    const s = typeSchedule("Hi. So, ok", 55);
    expect(Math.abs(s[1]! - s[0]! - ((4 / 55) * 1000 + 250))).toBeLessThanOrEqual(1);
    expect(Math.abs(s[2]! - s[1]! - ((2 / 55) * 1000 + 120))).toBeLessThanOrEqual(1);
  });
  it("keeps a maths expression whole", () => expect(typeUnits("so y = 2(5) − 4 now").some((u) => u.includes("y\u00A0=\u00A02(5)\u00A0−\u00A04"))).toBe(true));
});

describe("working pace", () => {
  const lines = ["y = 3x + 2", "y = 3(4) + 2", "y = 12 + 2", "So, y = 14."];
  it("each line writes on, then holds 1.2 s", () => expect(lineHoldMs(lines, 0)).toBe(typeDurationMs(lines[0]!) + 1200));
  it("adds 0.8 s before the final result line", () => expect(lineHoldMs(lines, 2)).toBe(typeDurationMs(lines[2]!) + 1200 + 800));
  it("two Next step taps in a row switch to step-by-step mode", () => {
    expect(nextTapMode(false, false)).toBe(false);
    expect(nextTapMode(true, false)).toBe(true);
  });
  it("highlights the part that changed", () => {
    const s = changedSpan("y = 3(4) + 2", "y = 12 + 2")!;
    expect("y = 12 + 2".slice(s.start, s.end)).toBe("12");
  });
});
