import { describe, expect, it } from "vitest";
import { greetingFor, nextKey, warmupWords, welcomeKey } from "./intro-welcome";

describe("intro welcome", () => {
  it("time-of-day bands", () => {
    expect(greetingFor(11)).toBe("Good morning");
    expect(greetingFor(12)).toBe("Good afternoon");
    expect(greetingFor(16)).toBe("Good afternoon");
    expect(greetingFor(17)).toBe("Good evening");
  });
  it("count wording", () => {
    expect(warmupWords(3)).toBe("three questions");
    expect(warmupWords(2)).toBe("two quick questions");
    expect(warmupWords(1)).toBe("one quick question");
  });
  it("greeting choice", () => {
    const now = Date.parse("2026-10-20T10:00:00Z");
    expect(welcomeKey(null, now)).toBe("intro_welcome_first");
    expect(welcomeKey("2026-10-17T09:00:00Z", now)).toBe("intro_welcome_back");
    expect(welcomeKey("2026-10-19T09:00:00Z", now)).toBe("intro_welcome");
  });
  it("no warm-up goes to the puzzle line", () => {
    expect(nextKey(0)).toBe("intro_next_skip");
    expect(nextKey(2)).toBe("intro_next_warmup");
  });
});
