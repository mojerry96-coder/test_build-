import { describe, expect, it } from "vitest";
import { chapterRows, currentChapterName } from "@/shared/chapters-display";

const t = (chapter: string, extra: Partial<{ quest: string; activeSessionId: string | null; lastWorkedAt: string | null }> = {}) =>
  ({ chapter, quest: extra.quest ?? "Q1", activeSessionId: extra.activeSessionId ?? null, lastWorkedAt: extra.lastWorkedAt ?? null });

describe("CURRENT chapter rule", () => {
  it("is the chapter of the active session", () =>
    expect(currentChapterName([t("Calculus", { lastWorkedAt: "2026-10-18" }), t("Coordinate Geometry", { activeSessionId: "s1" })])).toBe("Coordinate Geometry"));
  it("falls back to the chapter last worked in", () =>
    expect(currentChapterName([t("Calculus", { lastWorkedAt: "2026-10-10" }), t("Trigonometry", { lastWorkedAt: "2026-10-18" })])).toBe("Trigonometry"));
  it("is none when she has never started", () => expect(currentChapterName([t("Coordinate Geometry")])).toBeNull());
});

describe("chapter card order and opening", () => {
  it("puts the current chapter first, then the design order (05, 02, 03, 04, 01, 06, 07, 08)", () =>
    expect(chapterRows([t("Coordinate Geometry", { activeSessionId: "s1" })]).map((r) => r.num)).toEqual([5, 2, 3, 4, 1, 6, 7, 8]));
  it("moves a different current chapter to the front", () =>
    expect(chapterRows([t("Calculus", { lastWorkedAt: "2026-10-18" })]).map((r) => r.num)).toEqual([8, 5, 2, 3, 4, 1, 6, 7]));
  it("opens only chapters with an active topic and counts their real quests", () => {
    const rows = chapterRows([t("Coordinate Geometry", { quest: "Lines" })]);
    expect(rows.filter((r) => r.open).map((r) => r.num)).toEqual([5]);
    expect(rows.find((r) => r.num === 5)!.quests).toBe(1);
  });
});
