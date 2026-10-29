import { describe, expect, it } from "vitest";
import { exitPlan, mayClose as mayZoom, splashPlan } from "@/shared/splash-plan";
describe("splash timings", () => {
  it("first open: letters, zoom no earlier than 2.2 s", () => {
    const p = splashPlan(true, false);
    expect(p.letters).toBe(true);
    expect(mayZoom(p, 2100, true, false)).toBe(false);
    expect(mayZoom(p, 2200, true, false)).toBe(true);
  });
  it("later opens: no letters, about 1.2 s", () => {
    const p = splashPlan(false, false);
    expect(p.letters).toBe(false);
    expect(mayZoom(p, 1199, true, false)).toBe(false);
    expect(mayZoom(p, 1200, true, false)).toBe(true);
  });
  it("never zooms before loading is done unless skipped", () => {
    const p = splashPlan(true, false);
    expect(mayZoom(p, 9000, false, false)).toBe(false);
    expect(mayZoom(p, 100, false, true)).toBe(true);
  });
  it("underline fill lasts at least 0.8 s", () => {
    expect(splashPlan(true, false).minFill).toBe(800);
    expect(splashPlan(false, true).minFill).toBe(800);
  });
});

describe("splash close-out", () => {
  it("staged close: backdrop fades last and the whole close takes 0.9 s", () => {
    const e = splashPlan(true, false).exit;
    expect(e.backdrop).toBeGreaterThanOrEqual(e.fiti);
    expect(e.total).toBe(900);
  });
  it("skip runs the close at double speed", () => expect(exitPlan(false, true).total).toBe(450));
  it("reduced motion is one 0.4 s fade", () => expect(splashPlan(true, true).exit).toMatchObject({ backdropDur: 400, fitiDur: 0, total: 400 }));
  it("waits for the real page, but at most 1.5 s more", () => {
    const p = splashPlan(false, false);
    expect(mayZoom(p, 3000, true, false, false, 1400)).toBe(false);
    expect(mayZoom(p, 3000, true, false, false, 1500)).toBe(true);
    expect(mayZoom(p, 3000, true, false, true, 0)).toBe(true);
  });
});
