import { describe, expect, it } from "vitest";
import { firstPhase, nextAfterClip, wrongClip } from "@/features/video-lesson/flow";
import { chooseBandFrom } from "@/server/lesson/policy";
import type { VideoFlow } from "@/shared/contracts/content-pack";

const flow: VideoFlow = { media: {}, checks: [
  { item_id: "Q1", after_clip: "v01", correct_clip: "v02", wrong_clips: ["v03", "v04", "v05"], next_clip: null },
  { item_id: "Q2", after_clip: "v06", correct_clip: "v07", wrong_clips: ["v08", "v09", "v10"], next_clip: "v11" },
] };
const none = () => false;

describe("video clip flow", () => {
  it("right first time: v01 → Q1 → v02 → v06 → Q2 → v07 → v11 → end", () => {
    expect(firstPhase(flow, none, () => 0)).toEqual({ kind: "clip", qi: 0, clip: "v01", role: "after" });
    expect(nextAfterClip(flow, { kind: "clip", qi: 0, clip: "v01", role: "after" }, none)).toEqual({ kind: "question", qi: 0 });
    const a1 = (id: string) => id === "Q1";
    expect(nextAfterClip(flow, { kind: "clip", qi: 0, clip: "v02", role: "correct" }, a1)).toEqual({ kind: "clip", qi: 1, clip: "v06", role: "after" });
    const a2 = () => true;
    expect(nextAfterClip(flow, { kind: "clip", qi: 1, clip: "v07", role: "correct" }, a2)).toEqual({ kind: "clip", qi: 1, clip: "v11", role: "next" });
    expect(nextAfterClip(flow, { kind: "clip", qi: 1, clip: "v11", role: "next" }, a2)).toEqual({ kind: "end" });
  });
  it("wrong tries pick clips by try number and return to the question", () => {
    expect([1, 2, 3].map((n) => wrongClip(flow, 0, n))).toEqual(["v03", "v04", "v05"]);
    expect(nextAfterClip(flow, { kind: "clip", qi: 0, clip: "v03", role: "wrong" }, none)).toEqual({ kind: "question", qi: 0 });
  });
  it("resumes at the question once she has tried it", () => {
    expect(firstPhase(flow, (id) => id === "Q1", (id) => (id === "Q2" ? 1 : 0))).toEqual({ kind: "question", qi: 1 });
  });
});

describe("band from two video checks", () => {
  const bands = { "2": { rebuild: [0, 0], bridge: [1, 1], stretch: [2, 2] } } as never;
  const r = (a: boolean, b: boolean) => ({ Q1: { correct: true, firstTry: a }, Q2: { correct: true, firstTry: b } });
  it("0 → rebuild, 1 → bridge, 2 → stretch (first tries only)", () => {
    expect(chooseBandFrom(bands, ["Q1", "Q2"], r(false, false), "bridge").band).toBe("rebuild");
    expect(chooseBandFrom(bands, ["Q1", "Q2"], r(true, false), "bridge").band).toBe("bridge");
    expect(chooseBandFrom(bands, ["Q1", "Q2"], r(true, true), "bridge").band).toBe("stretch");
  });
});

import { clampSeek } from "@/features/video-lesson/flow";
describe("clampSeek", () => {
  it("allows going back, blocks skipping ahead", () => {
    expect(clampSeek(10, 40, 100)).toBe(10);
    expect(clampSeek(80, 40, 100)).toBe(40);
    expect(clampSeek(-5, 40, 100)).toBe(0);
  });
});
