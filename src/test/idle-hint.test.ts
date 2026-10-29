import { describe, expect, it } from "vitest";
import { tapHintNudge, tapHintPill } from "@/shared/idle-hint";

const pill = { stepOpen: true, hasHint: true, seen: false, cardOpen: false };
const free = { paused: false, speaking: false };
describe("quick fix tap-for-a-hint", () => {
  it("pill shows from the start of a step", () => expect(tapHintPill(pill)).toBe(true));
  it("pill hides once the hint is seen", () => expect(tapHintPill({ ...pill, seen: true })).toBe(false));
  it("pill hides when the step has no hint", () => expect(tapHintPill({ ...pill, hasHint: false })).toBe(false));
  it("no nudge before 14 s", () => expect(tapHintNudge(13999, 14000, free)).toBe(false));
  it("nudges at 14 s", () => expect(tapHintNudge(14000, 14000, free)).toBe(true));
  it("stops 3 s later", () => expect(tapHintNudge(17000, 14000, free)).toBe(false));
  it("nudges again at 28 s", () => expect(tapHintNudge(28000, 14000, free)).toBe(true));
  it("no nudge during a teacher pause", () => expect(tapHintNudge(14000, 14000, { ...free, paused: true })).toBe(false));
  it("no nudge while the tutor speaks", () => expect(tapHintNudge(14000, 14000, { ...free, speaking: true })).toBe(false));
});
