import { describe, expect, it } from "vitest";
import { questRows } from "@/shared/quests-display";

describe("quest cards", () => {
  it("only quests with an active topic in the database are enterable", () => {
    const rows = questRows("Coordinate Geometry", [{ chapter: "Coordinate Geometry", quest: "Lines and Their Steepness", displayName: "Gradient of a line" }]);
    expect(rows.filter((r) => r.open).map((r) => r.num)).toEqual([1]);
    expect(rows.find((r) => r.num === 2)?.open).toBe(false);
  });
});
