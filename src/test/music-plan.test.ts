import { describe, expect, it } from "vitest";
import { FADE_IN_S, duckLevel, musicMood, musicShouldPlay } from "@/shared/music-plan";

describe("music moods", () => {
  it("Home is explore", () => expect(musicMood("/", null)).toBe("explore"));
  it("lesson warm-up is focus", () => expect(musicMood("/x", "readiness")).toBe("focus"));
  it("video is silent", () => expect(musicMood("/x", "video")).toBe("off"));
  it("worksheet is silent", () => expect(musicMood("/x", "worksheet")).toBe("off"));
  it("exit ticket is silent", () => expect(musicMood("/x", "exit_ticket")).toBe("off"));
  it("reflection is silent", () => expect(musicMood("/x", "reflection")).toBe("off"));
  it("admin is silent", () => expect(musicMood("/admin", null)).toBe("off"));
  it("Ask Fiti is explore", () => expect(musicMood("/ask", null)).toBe("explore"));
  it("hands-on lab is focus", () => expect(musicMood("/x", "simulation")).toBe("focus"));
  it("fades in within a second", () => expect(FADE_IN_S).toBeLessThanOrEqual(0.6));
});
describe("when music plays", () => {
  const base = { on: true, mood: "explore" as const, hidden: false, lowData: false, override: false, videoPlaying: false, idle: false };
  it("plays normally", () => expect(musicShouldPlay(base)).toBe(true));
  it("off when turned off", () => expect(musicShouldPlay({ ...base, on: false })).toBe(false));
  it("off in classroom sessions", () => expect(musicShouldPlay({ ...base, override: true })).toBe(false));
  it("off in low-data", () => expect(musicShouldPlay({ ...base, lowData: true })).toBe(false));
  it("off in background", () => expect(musicShouldPlay({ ...base, hidden: true })).toBe(false));
  it("off during video", () => expect(musicShouldPlay({ ...base, videoPlaying: true })).toBe(false));
  it("off after 2 idle minutes", () => expect(musicShouldPlay({ ...base, idle: true })).toBe(false));
  it("ducks to 30% under Fiti", () => expect(duckLevel({ speaking: true, sfx: true })).toBe(0.3));
  it("ducks to 50% under effects", () => expect(duckLevel({ speaking: false, sfx: true })).toBe(0.5));
});
