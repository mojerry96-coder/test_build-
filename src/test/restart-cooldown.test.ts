import { describe, expect, it } from "vitest";
import { canRestart, cooldownSecondsLeft } from "@/server/home/restart.server";

const at = "2026-10-25T13:58:00.000Z";
describe("restart cooldown", () => {
  it("30 s after a restart, 30 s are left", () => {
    expect(cooldownSecondsLeft(at, new Date("2026-10-25T13:58:30.000Z"))).toBe(30);
  });
  it("61 s after, restart is allowed", () => {
    expect(cooldownSecondsLeft(at, new Date("2026-10-25T13:59:01.000Z"))).toBe(0);
    expect(canRestart(at, new Date("2026-10-25T13:59:01.000Z"))).toBe(true);
  });
  it("never restarted → allowed", () => expect(cooldownSecondsLeft(null, new Date())).toBe(0));
});
