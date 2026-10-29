import { describe, expect, it } from "vitest";
import { soundsOn } from "@/lib/sound";

describe("game sounds", () => {
  it("are on by default", () => expect(soundsOn(null)).toBe(true));
  it("stay off once she turns them off", () => expect(soundsOn("off")).toBe(false));
});

import { riseRunFrom } from "@/components/lesson/WarmupStage";
describe("rise-and-run triangle labels", () => {
  it("take the numbers from the approved working lines", () => {
    expect(riseRunFrom(["Run = 3 across", "Rise = 2 up"])).toEqual({ rise: "2", run: "3" });
  });
  it("show nothing before those lines appear", () => {
    expect(riseRunFrom(["Start at the origin"])).toEqual({ rise: null, run: null });
  });
});

