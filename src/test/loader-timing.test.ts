import { describe, expect, it } from "vitest";
import { finishPlan, loaderProgress, shouldShowLoader } from "@/shared/loader-timing";

describe("page loader timing", () => {
  it("hides the loader for loads under 0.3 s", () => expect(shouldShowLoader(299)).toBe(false));
  it("shows the loader from 0.3 s", () => expect(shouldShowLoader(300)).toBe(true));
  it("line starts empty", () => expect(loaderProgress(0)).toBe(0));
  it("line keeps filling but stays under 90% while loading", () => {
    expect(loaderProgress(2000)).toBeGreaterThan(loaderProgress(1000));
    expect(loaderProgress(60000)).toBeLessThanOrEqual(0.9);
  });
  it("line is full once the page is ready", () => expect(loaderProgress(500, true)).toBe(1));
  it("no finish wait when the loader never showed", () => expect(finishPlan(false)).toEqual({ finish: false, totalMs: 0 }));
  it("finish never adds more than 0.5 s", () => expect(finishPlan(true).totalMs).toBeLessThanOrEqual(500));
});

import { LOADER_MIN_AFTER_TAP_MS } from "@/shared/loader-timing";
describe("Solo Mode loader", () => {
  it("stays at least 1 s after the tap", () => expect(LOADER_MIN_AFTER_TAP_MS).toBe(1000));
});
