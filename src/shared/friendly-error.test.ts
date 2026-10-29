import { describe, expect, it } from "vitest";
import { friendlyError, FRIENDLY_ERROR } from "./friendly-error";
describe("friendlyError", () => {
  it("hides raw validation text", () => {
    expect(friendlyError('[ { "origin": "string", "code": "too_big", "maximum": 100 } ]')).toBe(FRIENDLY_ERROR);
  });
  it("keeps a plain lesson sentence", () => {
    expect(friendlyError("That question isn't part of this step.")).toBe("That question isn't part of this step.");
  });
  it("empty becomes the friendly line", () => { expect(friendlyError("")).toBe(FRIENDLY_ERROR); });
});
