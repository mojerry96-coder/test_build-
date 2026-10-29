import { describe, expect, it } from "vitest";
import { GO_WORDS, lockedMessage, stopOf, stopStates } from "@/shared/path-stops";

describe("path map stops", () => {
  it("not started: stop 1 next, the rest locked", () =>
    expect(stopStates(null, false)).toEqual(["next", "locked", "locked", "locked", "locked", "locked"]));
  it("on the video: warm-up and puzzle done", () =>
    expect(stopStates("video", false)).toEqual(["done", "done", "next", "locked", "locked", "locked"]));
  it("practice is not done until both its steps are", () =>
    expect(stopStates("guided", false)[4]).toBe("next"));
  it("finished topic: every stop done", () => expect(stopStates(null, true).every((s) => s === "done")).toBe(true));
  it("exit ticket and reflect share the last stop", () => { expect(stopOf("exit_ticket")).toBe(5); expect(stopOf("reflection")).toBe(5); });
  it("locked message names the previous stop", () => expect(lockedMessage(2)).toBe("Finish Puzzle first."));
  it("yes words start, other text does not", () => {
    for (const w of ["yes", "ok", "Ready", "go", "Let's go!", "let's go"]) expect(GO_WORDS.test(w)).toBe(true);
    for (const w of ["what's a warm-up?", "not now", "no"]) expect(GO_WORDS.test(w)).toBe(false);
  });
});
