import { describe, expect, it } from "vitest";
import { clampSeek, pickVideoMove, seekLimit, videoStrength, isFirm, isLuckyGuess } from "./video";
import { pickBand } from "@/server/lesson/policy";

const checks = [{ atSeconds: 60, itemId: "VC1" }, { atSeconds: 120, itemId: "VC2" }, { atSeconds: 180, itemId: "VC3" }];

describe("video seek limit", () => {
  it("stops at the first unanswered check", () => {
    expect(seekLimit(checks, () => false, 240)).toBe(60);
    expect(seekLimit(checks, (id) => id === "VC1", 240)).toBe(120);
    expect(clampSeek(200, seekLimit(checks, (id) => id === "VC1", 240))).toBe(120);
  });
  it("allows the whole clip once all checks are answered", () => {
    expect(seekLimit(checks, () => true, 240)).toBe(240);
  });
});

describe("video evidence strength", () => {
  it("right first try is strong", () => expect(videoStrength(true, 1)).toBe("strong"));
  it("right after try-1 feedback is moderate", () => expect(videoStrength(true, 2)).toBe("moderate"));
  it("needing try 3 is none", () => { expect(videoStrength(true, 3)).toBe("none"); expect(videoStrength(false, 3)).toBe("none"); });
});

describe("routing band from first-try correct answers", () => {
  const bands = { "3": { rebuild: [0, 0], bridge: [1, 1], stretch: [2, 3] } } as const;
  it("0 → rebuild", () => expect(pickBand(bands, 3, 0)).toBe("rebuild"));
  it("1 → bridge", () => expect(pickBand(bands, 3, 1)).toBe("bridge"));
  it("2 or 3 → stretch", () => { expect(pickBand(bands, 3, 2)).toBe("stretch"); expect(pickBand(bands, 3, 3)).toBe("stretch"); });
});

describe("video chat moves", () => {
  it("asking for the answer", () => expect(pickVideoMove("just tell me the answer")).toBe("answer"));
  it("asking what the video said", () => expect(pickVideoMove("What did the video say?")).toBe("summary"));
  it("anything else", () => expect(pickVideoMove("I don't understand")).toBeNull());
});

describe("confidence changes how strong a right first try counts", () => {
  it("Sure → strong", () => expect(videoStrength(true, 1, "sure")).toBe("strong"));
  it("Think so → moderate", () => expect(videoStrength(true, 1, "think_so")).toBe("moderate"));
  it("Guessing → weak, never strong", () => expect(videoStrength(true, 1, "guessing")).toBe("weak"));
  it("not asked → strong as before", () => expect(videoStrength(true, 1, null)).toBe("strong"));
  it("after help stays as before, whatever the confidence", () => { expect(videoStrength(true, 2, "sure")).toBe("moderate"); expect(videoStrength(true, 3, "sure")).toBe("none"); });
  it("wrong + Sure is a firm misconception", () => { expect(isFirm(false, "sure")).toBe(true); expect(isFirm(false, "think_so")).toBe(false); });
  it("right + Guessing is a lucky guess", () => { expect(isLuckyGuess(true, "guessing")).toBe(true); expect(isLuckyGuess(true, "sure")).toBe(false); });
});
