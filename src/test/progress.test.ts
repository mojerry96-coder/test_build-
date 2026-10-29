import { describe, expect, it } from "vitest";
import { countProgress, stepsDone } from "@/server/home/progress";

const e = (o: Partial<Parameters<typeof countProgress>[0][number]>) => ({ created_at: "2026-10-20T10:00:00Z", correct: true, is_first_try: true, quiz: false, session_id: "s1", ...o });

describe("progress tab counts", () => {
  it("stars are right-first-time lesson answers, never quizzes", () => {
    const r = countProgress([e({}), e({ is_first_try: false }), e({ quiz: true }), e({ correct: false })], null, ["s1"]);
    expect(r.stars).toBe(1);
  });
  it("correct out of tried includes quizzes and skips unmarked", () => {
    const r = countProgress([e({}), e({ quiz: true }), e({ correct: false }), e({ correct: null })], null, []);
    expect([r.correct, r.tried]).toEqual([2, 3]);
  });
  it("topic stars count only this topic's sessions", () => {
    expect(countProgress([e({}), e({ session_id: "s2" })], null, ["s2"]).topicStars).toBe(1);
  });
  it("Start again resets everything before it", () => {
    const r = countProgress([e({}), e({ created_at: "2026-10-25T10:00:00Z" })], "2026-10-22T00:00:00Z", []);
    expect([r.stars, r.tried]).toEqual([1, 1]);
  });
  it("steps done follows the current step, finished = 8", () => {
    expect(stepsDone(5, false)).toBe(5);
    expect(stepsDone(3, true)).toBe(8);
  });
});
