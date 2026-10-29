import { describe, it, expect } from "vitest";
import { canRestart } from "./restart.server";

describe("student Start again", () => {
  const now = new Date("2026-10-23T10:00:00Z");
  it("is allowed with no earlier restart", () => expect(canRestart(null, now)).toBe(true));
  it("is blocked within a minute of the last one", () => expect(canRestart("2026-10-23T09:59:30Z", now)).toBe(false));
  it("is allowed after a minute", () => expect(canRestart("2026-10-23T09:58:59Z", now)).toBe(true));
});
