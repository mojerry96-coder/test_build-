import { describe, expect, it } from "vitest";
import { pickWarmup, shuffleFor } from "./warmup";

const items = [{ id: "Q1", skillIds: ["COORD-01"] }, { id: "Q2", skillIds: ["CALC-01"] }, { id: "Q3", skillIds: ["SUB-01"] }];
describe("warm-up", () => {
  it("skips questions for skills already shown", () => {
    expect(pickWarmup(items, new Set(["CALC-01"]))).toEqual(["Q1", "Q3"]);
  });
  it("is empty when all three skills are shown, so she goes straight to the hook", () => {
    expect(pickWarmup(items, new Set(["COORD-01", "CALC-01", "SUB-01"]))).toEqual([]);
  });
  it("keeps the same option order for the same lesson", () => {
    expect(shuffleFor("s1:Q1", ["a", "b", "c", "d"])).toEqual(shuffleFor("s1:Q1", ["a", "b", "c", "d"]));
    expect([...shuffleFor("s1:Q1", ["a", "b", "c", "d"])].sort()).toEqual(["a", "b", "c", "d"]);
  });
});
