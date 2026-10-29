import { describe, expect, it } from "vitest";
import { clampResume, eraseOrder, ERASE_MS_PER_LINE } from "@/components/lesson/whiteboard/WhiteboardDialog";
import { lowDataOn } from "@/lib/ui-prefs";

describe("whiteboard eraser", () => {
  it("sweeps zig-zag: line 1 left to right, line 2 right to left, 250 ms per line", () => {
    expect(ERASE_MS_PER_LINE).toBe(250);
    expect(eraseOrder(3)).toEqual([
      { index: 0, dir: "ltr", delayMs: 0 },
      { index: 1, dir: "rtl", delayMs: 250 },
      { index: 2, dir: "ltr", delayMs: 500 },
    ]);
  });
});

describe("whiteboard resume", () => {
  it("never resumes past the approved lines", () => {
    expect(clampResume({ n: 9, base: 2 }, 5)).toEqual({ n: 5, base: 2 });
    expect(clampResume({ n: 3, base: 7 }, 5)).toEqual({ n: 3, base: 3 });
    expect(clampResume(null, 5)).toEqual({ n: 0, base: 0 });
  });
});

describe("low-data mode", () => {
  it("turns on by itself on a slow connection unless she switched it off", () => {
    expect(lowDataOn(null, true)).toBe(true);
    expect(lowDataOn("off", true)).toBe(false);
    expect(lowDataOn("on", false)).toBe(true);
    expect(lowDataOn(null, false)).toBe(false);
  });
});

import { needsDrawing } from "@/components/lesson/whiteboard/WhiteboardDialog";
describe("whiteboard grid", () => {
  it("draws the grid only while a step about moving across or up is on the board", () => {
    expect(needsDrawing(["The first number, 3, is the x-coordinate."])).toBe(false);
    expect(needsDrawing(["Move 3 across, then 2 up."])).toBe(true);
  });
});
