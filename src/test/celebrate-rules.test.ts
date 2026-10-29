import { describe, expect, it } from "vitest";
import { nextPraise } from "@/shared/praise";
import { MASTER_GAIN, SOUNDS, fitiMessageAllowed, jitter, soundAllowed } from "@/lib/sound";

const LIST = ["Nice!", "That's it!", "Spot on!", "Great step!", "You got it!"];
describe("praise words", () => {
  it("never repeats the same word twice in a row", () => {
    let last: string | null = null;
    for (let i = 0; i < 200; i++) { const w = nextPraise(last, LIST); expect(w).not.toBe(last); last = w; }
  });
  it("adds the named strategy once in a while", () => {
    expect(nextPraise(null, LIST, { strategy: "You multiplied first.", count: 2, pick: 0 })).toBe("Nice! You multiplied first.");
    expect(nextPraise(null, LIST, { strategy: "You multiplied first.", count: 0, pick: 0 })).toBe("Nice!");
  });
});
describe("balafon sounds", () => {
  it("master gain is 0.08", () => expect(MASTER_GAIN).toBe(0.08));
  it("pitch varies within ±2%", () => {
    expect(jitter(1000, () => 0)).toBe(1000); expect(jitter(1000, () => 1)).toBe(1000);
  });
  it("Fiti's message pluck waits for 3 s of silence", () => {
    expect(fitiMessageAllowed(2999, 0)).toBe(false); expect(fitiMessageAllowed(3000, 0)).toBe(true);
  });
  it("not_quite is a low G4 tok at gain .05", () => {
    const v = SOUNDS.not_quite[0]!; expect(v).toMatchObject({ kind: "bal", f: 392, decay: 0.18 });
    expect((v.gain ?? 1) * MASTER_GAIN).toBeCloseTo(0.05);
  });
  it("small_win is E5 then A5, 0.11 s apart", () => {
    expect(SOUNDS.small_win.map((v) => [v.f, v.at])).toEqual([[659.3, 0], [880, 0.11]]);
  });
  it("is silent in low-data, Override, over Fiti's voice, or when turned off", () => {
    const ok = { on: true, lowData: false, override: false, speaking: false };
    expect(soundAllowed(ok)).toBe(true);
    expect(soundAllowed({ ...ok, lowData: true })).toBe(false);
    expect(soundAllowed({ ...ok, override: true })).toBe(false);
    expect(soundAllowed({ ...ok, speaking: true })).toBe(true);
    expect(soundAllowed({ ...ok, on: false })).toBe(false);
  });
});

import { isDuplicate, pendingFresh, FULL_SOUNDS } from "@/lib/sound";
describe("consistent sounds", () => {
  it("plays the same sound only once within 300 ms", () => {
    expect(isDuplicate("small_win", 1250, { small_win: 1000 })).toBe(true);
    expect(isDuplicate("small_win", 1301, { small_win: 1000 })).toBe(false);
    expect(isDuplicate("tap", 1100, { small_win: 1000 })).toBe(false);
  });
  it("plays a sound held for the first tap only within 2 s", () => {
    expect(pendingFresh(0, 2000)).toBe(true);
    expect(pendingFresh(0, 2001)).toBe(false);
  });
  it("lets the feather, stop-done and lesson-finished tunes finish", () => {
    expect([...FULL_SOUNDS].sort()).toEqual(["big_win", "feather", "stop_done"]);
  });
});
