import { describe, it, expect } from "vitest";
import { planRank } from "./decide";

describe("Start follows the lesson flow", () => {
  it("puts the next topic before a due review", () => {
    const kinds = ["review", "next"].sort((a, b) => planRank(a) - planRank(b));
    expect(kinds[0]).toBe("next");
  });
  it("puts an open lesson first", () => {
    expect(["review", "teacher", "next", "continue"].sort((a, b) => planRank(a) - planRank(b))[0]).toBe("continue");
  });
});
