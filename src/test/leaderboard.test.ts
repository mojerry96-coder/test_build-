import { describe, expect, it } from "vitest";
import { countFor, DEFAULT_WEIGHTS, lagosWeekStart, maskName, rankRows, type StudentFacts } from "@/server/home/leaderboard";

const base: StudentFacts = { id: "a", name: "Amara Eze", cutoff: null, sessions: [], evidence: [] };
const done = (at: string) => ({ started_at: at, completed_at: at, status: "completed", quiz: false });

describe("leaderboard", () => {
  it("Overall: 100 per lesson, 10 per star, 10 per correct quiz answer", () => {
    const s = { ...base, sessions: [done("2026-10-20T10:00:00Z")], evidence: [
      { created_at: "2026-10-20T10:00:00Z", correct: true, is_first_try: true, quiz: false },
      { created_at: "2026-10-20T10:00:00Z", correct: true, is_first_try: true, quiz: true },
    ] };
    expect(countFor(s, DEFAULT_WEIGHTS, null, null)).toEqual({ lessons: 1, stars: 1, quizzes: 1, overall: 120 });
  });
  it("abandoned lessons and anything before Start again don't count", () => {
    const s = { ...base, cutoff: "2026-10-21T00:00:00Z", sessions: [done("2026-10-20T10:00:00Z"), { ...done("2026-10-22T10:00:00Z"), status: "abandoned" }] };
    expect(countFor(s, DEFAULT_WEIGHTS, null, null).lessons).toBe(0);
  });
  it("equal scores share a rank", () => {
    expect(rankRows([{ score: 80 }, { score: 100 }, { score: 100 }]).map((r) => r.rank)).toEqual([1, 1, 3]);
  });
  it("shows first name and last initial only", () => {
    expect(maskName("Amara Chioma Eze")).toBe("Amara E.");
    expect(maskName("")).toBe("Student");
  });
  it("the week starts Monday 00:00 Lagos time", () => {
    // Sunday 25 Oct 2026 14:00 UTC → Monday 19 Oct 00:00 Lagos = 18 Oct 23:00 UTC.
    expect(lagosWeekStart(new Date("2026-10-25T14:00:00Z"))).toBe("2026-10-18T23:00:00.000Z");
  });
});

describe("leaderboard samples", async () => {
  const { withSamples, samplesFrom, sampleScore, DEFAULT_WEIGHTS } = await import("@/server/home/leaderboard");
  const s = samplesFrom([{ name: "Chidi O.", week: { lessons: 2, stars: 9, quizzes: 6 }, all: {} }, { name: "" }, null]);
  it("drops bad entries", () => expect(s.length).toBe(1));
  it("overall uses the real weights (2×100 + 9×10 + 6×10 = 350)", () => expect(sampleScore(s[0]!, "overall", "week", DEFAULT_WEIGHTS)).toBe(350));
  it("tags samples and ranks her below a higher sample", () => {
    const rows = withSamples([{ name: "You", score: 0, me: true }], s, "overall", "week", DEFAULT_WEIGHTS);
    expect(rows[0]).toMatchObject({ name: "Chidi O.", rank: 1, sample: true });
    expect(rows[1]).toMatchObject({ name: "You", rank: 2, me: true });
  });
});
