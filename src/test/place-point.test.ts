import { describe, expect, it } from "vitest";
import { pointMatches } from "@/server/maths/point";
import { viewSteps, newFix, type FixStepContent } from "@/server/lesson/quick-fix";

const grid = { x_max: 6, y_max: 5 };
describe("place the point", () => {
  it("is right only on the exact crossing", () => expect(pointMatches("5,1", "5,1", grid)).toBe(true));
  it("is not right one square off", () => expect(pointMatches("4,1", "5,1", grid)).toBe(false));
  it("is not right with across and up swapped", () => expect(pointMatches("1,5", "5,1", grid)).toBe(false));
  it("rejects points outside the grid", () => expect(pointMatches("7,1", "7,1", grid)).toBe(false));
  it("never sends the ring before a miss", () => {
    const step = { id: "S3", prompt: [], input: "point", grid, answer: "5,1", hint: [], hint_ring: true, full_line: [], filled_line: [] } as unknown as FixStepContent;
    const st = { ...newFix("R", null), part: "try" as const };
    expect(viewSteps(st, [step])[0]!.ring).toBeUndefined();
    expect(viewSteps({ ...st, misses: 1 }, [step])[0]!.ring).toEqual([5, 1]);
  });
});
