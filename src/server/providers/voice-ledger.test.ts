import { describe, expect, it } from "vitest";
import { collectHashes, hashText } from "./voice-ledger.server";

describe("voice ledger", () => {
  it("notes every string in the response, wherever it sits", () => {
    const h = collectHashes({
      tutorLines: [{ text: "Which path is steeper?" }],
      warmup: { popup: { lines: [{ speakable: "Nice, that is right." }] } },
    });
    expect(h.has(hashText("  Which path is steeper?  "))).toBe(true);
    expect(h.has(hashText("Nice, that is right."))).toBe(true);
    expect(h.has(hashText("The gradient is 2."))).toBe(false);
  });
  it("notes every greeting the browser may fill in", () => {
    const h = collectHashes({ welcome: ["{greeting}, John! Ready to start?"] });
    expect(h.has(hashText("Good afternoon, John! Ready to start?"))).toBe(true);
    expect(h.has(hashText("Hello, John! Ready to start?"))).toBe(false);
  });
});
