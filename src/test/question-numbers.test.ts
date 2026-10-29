import { describe, it, expect } from "vitest";
import { splitNumbers } from "@/shared/question-numbers";

describe("splitNumbers", () => {
  it("marks a whole point as one number", () => {
    expect(splitNumbers("Imagine you see the point (3, 2). Which")).toEqual([
      { text: "Imagine you see the point ", num: false }, { text: "(3, 2)", num: true }, { text: ". Which", num: false },
    ]);
  });
  it("marks plain numbers and leaves words alone", () => {
    expect(splitNumbers("Go 4 across").filter((p) => p.num).map((p) => p.text)).toEqual(["4"]);
    expect(splitNumbers("how far up?").some((p) => p.num)).toBe(false);
  });
});
