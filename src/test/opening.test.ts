import { describe, expect, it } from "vitest";
import { hintFor, isJustStart, isNewVisit, matchFeeling, matchHardest, matchReturnMood, pickOpening, rotateLine, type Prefs } from "@/server/home/opening";

const now = new Date("2026-10-22T19:00:00Z");
const P = (p: Partial<Prefs>): Prefs => ({ maths_feeling: null, hardest_area: null, intro_done_at: "2026-10-01T10:00:00Z", last_opening_line_id: null, last_visit_at: null, ...p });

describe("which opening", () => {
  it("first time = intro", () => expect(pickOpening(null, null, now)).toBe("intro"));
  it("intro not finished = intro", () => expect(pickOpening(P({ intro_done_at: null }), null, now)).toBe("intro"));
  it("next day", () => expect(pickOpening(P({ last_visit_at: "2026-10-21T18:00:00Z" }), null, now)).toBe("next_day"));
  it("5 days away", () => expect(pickOpening(P({ last_visit_at: "2026-10-17T18:00:00Z" }), null, now)).toBe("away"));
  it("exactly 3 days is not away", () => expect(pickOpening(P({ last_visit_at: "2026-10-19T18:00:00Z" }), null, now)).toBe("normal"));
  it("not secure after last visit = struggled (wins over away)", () =>
    expect(pickOpening(P({ last_visit_at: "2026-10-10T18:00:00Z" }), { completedAt: "2026-10-12T18:00:00Z", secure: false, misconceptions: 0 }, now)).toBe("struggled"));
  it("2 misconceptions = struggled", () =>
    expect(pickOpening(P({ last_visit_at: "2026-10-21T08:00:00Z" }), { completedAt: "2026-10-21T18:00:00Z", secure: true, misconceptions: 2 }, now)).toBe("struggled"));
  it("hard lesson already greeted is not repeated", () =>
    expect(pickOpening(P({ last_visit_at: "2026-10-21T20:00:00Z" }), { completedAt: "2026-10-21T18:00:00Z", secure: false, misconceptions: 3 }, now)).toBe("next_day"));
  it("Lagos day decides a new visit (23:30 UTC is next day in Lagos)", () =>
    expect(isNewVisit(P({ last_visit_at: "2026-10-22T22:30:00Z" }), new Date("2026-10-22T23:30:00Z"))).toBe(true));
});

describe("never the same opening twice in a row", () => {
  for (let seed = 0; seed < 6; seed++) it(`seed ${seed}`, () => expect(rotateLine(["a", "b"], "a", seed)).toBe("b"));
});

describe("her answers", () => {
  it("feelings", () => {
    expect(matchFeeling("I enjoy it")).toBe("enjoy");
    expect(matchFeeling("It's OK")).toBe("ok");
    expect(matchFeeling("It's hard for me")).toBe("hard");
    expect(matchFeeling("i hate maths")).toBe("hard");
  });
  it("hardest areas", () => {
    expect(matchHardest("Graphs")).toBe("graphs");
    expect(matchHardest("Algebra")).toBe("algebra");
    expect(matchHardest("Word problems")).toBe("word_problems");
    expect(matchHardest("Not sure yet")).toBe("not_sure");
  });
  it("let's just start", () => { expect(isJustStart("Let's just start")).toBe(true); expect(isJustStart("skip")).toBe(true); });
  it("return moods", () => { expect(matchReturnMood("Good!")).toBe("good"); expect(matchReturnMood("Busy week")).toBe("busy"); expect(matchReturnMood("Struggling a bit")).toBe("low"); });
  it("graphs hint only for a graphs topic", () => { expect(hintFor("graphs", "Gradient of a line")).toBe("graphs"); expect(hintFor("algebra", "Gradient of a line")).toBeNull(); });
});
