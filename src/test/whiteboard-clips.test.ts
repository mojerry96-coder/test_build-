import { describe, it, expect } from "vitest";
import { requestClip, clipEnded, useStillOnly, lineJitter } from "@/components/lesson/whiteboard/clip-controller";

describe("Fiti clip controller", () => {
  it("tap outranks nod", () => {
    expect(requestClip({ playing: "nod" }, "tap").playing).toBe("tap");
    expect(requestClip({ playing: "tap" }, "nod").playing).toBe("tap");
  });
  it("a repeated clip never restarts", () => {
    const s = { playing: "nod" as const };
    expect(requestClip(s, "nod")).toBe(s);
  });
  it("always returns to idle", () => expect(clipEnded({ playing: "celebrate" }).playing).toBe("idle"));
  it("a wrong answer plays sad, and a right one straight after wins", () => {
    expect(requestClip({ playing: "nod" }, "sad").playing).toBe("sad");
    expect(requestClip({ playing: "sad" }, "nod").playing).toBe("nod");
  });
  it("reduced motion or low data shows the still only", () => {
    expect(useStillOnly(true, false)).toBe(true);
    expect(useStillOnly(false, true)).toBe(true);
    expect(useStillOnly(false, false)).toBe(false);
  });
  it("line tilt stays within −0.5° and 0.5°", () => {
    for (let i = 0; i < 200; i++) { const j = lineJitter(i); expect(Math.abs(j.tilt)).toBeLessThanOrEqual(0.5); expect(j.offset).toBeLessThanOrEqual(6); }
  });
});
