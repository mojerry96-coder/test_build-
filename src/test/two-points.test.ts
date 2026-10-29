import { describe, expect, it } from "vitest";
import { twoPoints } from "@/components/lesson/qf-shared";

describe("practise graph points", () => {
  it("reads the two points from the question", () => {
    expect(twoPoints("Find the gradient of the line through (0, 1) and (2, 7).")).toEqual([[0, 1], [2, 7]]);
  });
  it("draws nothing unless exactly two points are named", () => {
    expect(twoPoints("Find the gradient when rise is 6 and run is 2.")).toBeNull();
  });
});
