import { describe, expect, it } from "vitest";
import { hookAckLines } from "./demo-path.server";

describe("hook reply repeats her guess", () => {
  it("fills the path she picked", () => {
    expect(hookAckLines([{ text: "You think {choice} is steeper. Keep that in mind: the video will tell us!" }], "Path A")[0]!.text)
      .toBe("You think Path A is steeper. Keep that in mind: the video will tell us!");
  });
});
