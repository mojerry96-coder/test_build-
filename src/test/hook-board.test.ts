import { describe, expect, it } from "vitest";
import { drawnGradient, pathEnd, HOOK_BOARD } from "@/components/lesson/hook-board";
import { pickHookMove } from "@/shared/intro-moves";

describe("hook board", () => {
  it("Path A has gradient exactly 2", () => expect(drawnGradient("a")).toBe(2));
  it("Path B has gradient exactly 1/2", () => expect(drawnGradient("b")).toBe(0.5));
  it("both paths fit inside the picture area", () => {
    for (const id of ["a", "b"] as const) {
      const e = pathEnd(id);
      expect(e.x).toBeLessThan(805); expect(e.y).toBeGreaterThan(26);
    }
    expect(HOOK_BOARD.oy).toBeLessThan(435);
  });
});

describe("hook chat moves", () => {
  it("asking which is steeper never gets the answer", () => expect(pickHookMove("which path is steeper?")).toBe("answer"));
  it("asking what steepness means", () => expect(pickHookMove("what does steepness mean")).toBe("meaning"));
});
