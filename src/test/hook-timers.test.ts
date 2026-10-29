import { describe, expect, it } from "vitest";
import { hookTimers } from "@/components/lesson/hook-board";

describe("hook prediction timers", () => {
  it("nudges after 20 s and shows the skip link 20 s after that by default", () => {
    expect(hookTimers()).toEqual({ nudgeMs: 20000, skipMs: 20000 });
  });
  it("follows the rules when set", () => {
    expect(hookTimers(15, 30)).toEqual({ nudgeMs: 15000, skipMs: 30000 });
  });
});
