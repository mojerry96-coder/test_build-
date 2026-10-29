import { describe, expect, it } from "vitest";
import { isStaleQuestion } from "@/shared/stale-question";

describe("stale question answers reload the lesson instead of showing an error", () => {
  it("treats 'That is not the current question.' as stale", () => {
    expect(isStaleQuestion("That is not the current question.")).toBe(true);
  });
  it("still shows other errors", () => {
    expect(isStaleQuestion("You've already tried that one.")).toBe(false);
  });
});
