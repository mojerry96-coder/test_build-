import { describe, expect, it } from "vitest";
import { labV2AnswerShown, labV2Level, labV2Url } from "./lab-v2";
describe("Gradient Lab v2 level from her band", () => {
  it("Rebuild opens Beginner", () => expect(labV2Level("rebuild")).toBe("beginner"));
  it("Bridge opens Intermediate", () => expect(labV2Level("bridge")).toBe("intermediate"));
  it("Extend opens Advanced", () => expect(labV2Level("extend")).toBe("advanced"));
  it("record level Advanced is passed through the lab's own setting", () => expect(labV2Url("Advanced")).toBe("/sims/gradient-lab-v2/index.html?level=advanced"));
});
describe("Gradient Lab v2 saved screen", () => {
  it("reopens at her saved screen inside her level", () => expect(labV2Url("bridge", 7)).toBe("/sims/gradient-lab-v2/index.html?level=intermediate#7"));
  it("ignores a screen outside her level", () => expect(labV2Url("bridge", 11)).toBe("/sims/gradient-lab-v2/index.html?level=intermediate"));
  it("Beginner's extra screen 14 reopens", () => expect(labV2Url("rebuild", 14)).toBe("/sims/gradient-lab-v2/index.html?level=beginner#14"));
  it("unknown band still sends a level (never the lab's Beginner default)", () => expect(labV2Url("??")).toBe("/sims/gradient-lab-v2/index.html?level=intermediate"));
});
describe("Gradient Lab v2 answer shown", () => {
  it("last wrong try = answer shown", () => expect(labV2AnswerShown("attempt", { correct: false, attemptsLeft: 0 })).toBe(true));
  it("earlier wrong try is not", () => expect(labV2AnswerShown("attempt", { correct: false, attemptsLeft: 1 })).toBe(false));
});
