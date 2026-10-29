import { describe, expect, it } from "vitest";
import { groupStarts, keepMathsTogether } from "./chat-groups";

describe("chat grouping", () => {
  it("consecutive tutor lines within 60 s form one group", () => {
    expect(groupStarts([{ from: "tutor", at: 0 }, { from: "tutor", at: 5_000 }, { from: "tutor", at: 59_000 }])).toEqual([true, false, false]);
  });
  it("a pause over 60 s starts a new group", () => {
    expect(groupStarts([{ from: "tutor", at: 0 }, { from: "tutor", at: 61_000 }])).toEqual([true, true]);
  });
  it("a student message or a divider starts a new group", () => {
    expect(groupStarts([{ from: "tutor", at: 0 }, { from: "student", at: 1 }, { from: "student", at: 2 }, { from: "divider", at: 3 }, { from: "tutor", at: 4 }]))
      .toEqual([true, true, false, true, true]);
  });
});

describe("maths stays together", () => {
  const NB = "\u00A0";
  it("glues operators and equals signs", () => {
    expect(keepMathsTogether("so 2 × 5 − 4 = 6 now")).toBe(`so 2${NB}×${NB}5${NB}−${NB}4${NB}=${NB}6 now`);
  });
  it("keeps bracket expressions whole", () => {
    expect(keepMathsTogether("(6 − 2) ÷ (5 − 3)")).not.toMatch(/ /);
  });
  it("leaves plain words alone", () => {
    expect(keepMathsTogether("Have a go first")).toBe("Have a go first");
  });
});
