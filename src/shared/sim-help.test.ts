import { describe, expect, it } from "vitest";
import { shouldPromptSimHelp } from "./sim-help";

const base = { idleMs: 0, repeats: 0, prompted: false, lastPrompt: -Infinity };
describe("simulation help prompt", () => {
  it("fires after 30 s with no meaningful action", () => {
    expect(shouldPromptSimHelp({ ...base, idleMs: 29_999 }, 1e9)).toBe(false);
    expect(shouldPromptSimHelp({ ...base, idleMs: 30_000 }, 1e9)).toBe(true);
  });
  it("fires after the same wrong answer twice", () => {
    expect(shouldPromptSimHelp({ ...base, repeats: 1 }, 1e9)).toBe(false);
    expect(shouldPromptSimHelp({ ...base, repeats: 2 }, 1e9)).toBe(true);
  });
  it("only once per task", () => {
    expect(shouldPromptSimHelp({ ...base, idleMs: 60_000, prompted: true }, 1e9)).toBe(false);
  });
  it("never twice within 2 minutes", () => {
    expect(shouldPromptSimHelp({ ...base, idleMs: 60_000, lastPrompt: 1e9 - 119_000 }, 1e9)).toBe(false);
    expect(shouldPromptSimHelp({ ...base, idleMs: 60_000, lastPrompt: 1e9 - 120_000 }, 1e9)).toBe(true);
  });
  it("never while paused", () => {
    expect(shouldPromptSimHelp({ ...base, idleMs: 60_000 }, 1e9, 30, 2, true)).toBe(false);
  });
});
