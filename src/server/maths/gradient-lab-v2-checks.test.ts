import { describe, expect, it } from "vitest";
import { checkLabV2, nextQuestionIndex, type V2Sets } from "./gradient-lab-v2-checks";
const sets: V2Sets = {
  "6": [{ m: 1, c: 1 }, { m: 2, c: -1 }], "7": [{ A: [-2, -2], B: [2, 2] }, { A: [0, 1], B: [2, 5] }],
  "8": [{ m: 1, c: 1, x: 2 }], "9": [{ m: 0.5, c: 1, choices: [-2, -1, 1, 5] }], "11": [{ targets: [[2, 1], [-2, -3]] }],
};
describe("Gradient Lab v2 marking (our engine)", () => {
  it("screen 6: m = 1, c = 1 is right; m = 1, c = 2 is not", () => {
    expect(checkLabV2(6, 0, { fields: { "m-answer": "1", "c-answer": "1" } }, sets)).toBe(true);
    expect(checkLabV2(6, 0, { fields: { "m-answer": "1", "c-answer": "2" } }, sets)).toBe(false);
  });
  it("screen 6 second question: m = 2, c = −1", () => expect(checkLabV2(6, 1, { fields: { "m-answer": "2", "c-answer": "−1" } }, sets)).toBe(true));
  it("screen 7: A(−2, −2) B(2, 2) gives m = 1, c = 0", () => {
    expect(checkLabV2(7, 0, { fields: { "m-answer": "1", "c-answer": "0" } }, sets)).toBe(true);
    expect(checkLabV2(7, 0, { fields: { "m-answer": "2", "c-answer": "0" } }, sets)).toBe(false);
  });
  it("screen 8: y = x + 1 at x = 2 gives 3", () => {
    expect(checkLabV2(8, 0, { fields: { "y-answer": "3" } }, sets)).toBe(true);
    expect(checkLabV2(8, 0, { fields: { "y-answer": "4" } }, sets)).toBe(false);
  });
  it("screen 9: option C (1) is the intercept", () => {
    expect(checkLabV2(9, 0, { choice: 2 }, sets)).toBe(true);
    expect(checkLabV2(9, 0, { choice: 0 }, sets)).toBe(false);
  });
  it("screen 11: m = 1, c = −1 hits (2, 1) and (−2, −3)", () => {
    expect(checkLabV2(11, 0, { sliders: { m: 1, c: -1 } }, sets)).toBe(true);
    expect(checkLabV2(11, 0, { sliders: { m: 1, c: 0 } }, sets)).toBe(false);
  });
  it("a fresh question moves the index on", () => {
    expect(nextQuestionIndex(0, "support-offered", { freshQuestion: true })).toBe(1);
    expect(nextQuestionIndex(0, "support", { next: "similar-question" })).toBe(1);
    expect(nextQuestionIndex(0, "attempt", {})).toBe(0);
  });
});
