import { describe, expect, it } from "vitest";
import { judgeStep, newFix, slipFor, viewSteps, type FixStepContent } from "./quick-fix";

const steps: FixStepContent[] = [
  { id: "S1", prompt: [{ text: "Multiply first: 2 × 4 = ?" }], answer: "8", hint: [{ text: "2x means 2 times x." }], full_line: [{ text: "Multiply first: 2 × 4 = 8." }], filled_line: [{ text: "2x means 2 times 4, which is 8." }] },
  { id: "S2", prompt: [{ text: "Now add 1: 8 + 1 = ?" }], answer: "9", hint: [{ text: "Add the last number." }], full_line: [{ text: "Then add 1: 8 + 1 = 9." }], filled_line: [{ text: "8 + 1 = 9." }] },
];
const tryState = () => ({ ...newFix("REP_SUB_01", "MIS_2X_AS_ADD"), part: "try" as const });

describe("quick fix", () => {
  it("picks the slip line for the misconception, else the default", () => {
    const slip = { MIS_2X_AS_ADD: [{ text: "2x means 2 times x. Let's see it." }], default: [{ text: "Let's go step by step and watch the sign." }] };
    expect(slipFor(slip, "MIS_2X_AS_ADD")[0]!.text).toBe("2x means 2 times x. Let's see it.");
    expect(slipFor(slip, null)[0]!.text).toBe("Let's go step by step and watch the sign.");
  });
  it("a right step moves on", () => {
    const r = judgeStep(tryState(), steps, true);
    expect(r.result).toBe("right"); expect(r.state.step).toBe(1); expect(r.state.outcomes).toEqual(["right"]);
  });
  it("a first miss gives the hint and stays on the step", () => {
    const r = judgeStep(tryState(), steps, false);
    expect(r.result).toBe("hint"); expect(r.state.step).toBe(0);
    expect(viewSteps(r.state, steps)[0]!.hint![0]!.text).toBe("2x means 2 times x.");
  });
  it("a second miss fills the step in", () => {
    const a = judgeStep(tryState(), steps, false).state;
    const r = judgeStep(a, steps, false);
    expect(r.result).toBe("filled"); expect(r.state.step).toBe(1);
    expect(viewSteps(r.state, steps)[0]!.line![0]!.text).toBe("2x means 2 times 4, which is 8.");
  });
  it("right after a hint is recorded as such, and the last step opens the practice question", () => {
    let s = judgeStep(tryState(), steps, true).state;
    s = judgeStep(s, steps, false).state;
    s = judgeStep(s, steps, true).state;
    expect(s.outcomes).toEqual(["right", "hint_right"]); expect(s.part).toBe("practice");
  });
  it("never sends step answers to the browser", () => {
    const view = JSON.stringify(viewSteps(tryState(), steps));
    expect(view).not.toContain('"answer"'); expect(view).not.toContain("= 8."); expect(view).not.toContain("which is 8");
  });
});

import { dialogsFor, stepEvidence } from "./quick-fix";
describe("Your turn dialogs", () => {
  const st = { id: "S1", prompt: [], answer: "8", hint: [{ text: "h" }], full_line: [], filled_line: [{ text: "f" }],
    hint_question: [{ text: "2x means 2 times x. What is 2 × 4?" }], together_text: [{ text: "2 × 4 = 8." }] };
  it("first miss opens You got close with the hint question", () => {
    expect(dialogsFor("hint", st, false, undefined)).toEqual([{ kind: "close", lines: st.hint_question }]);
  });
  it("second miss opens Let's do this one together", () => {
    expect(dialogsFor("filled", st, false, undefined)[0]).toEqual({ kind: "together", lines: st.together_text });
  });
  it("a right step opens no dialog unless it is the last", () => {
    expect(dialogsFor("right", st, false, undefined)).toEqual([]);
    expect(dialogsFor("right", st, true, [{ text: "You worked it out: y = 9." }])).toEqual([{ kind: "done", lines: [{ text: "You worked it out: y = 9." }] }]);
  });
  it("records right first time, right after the hint, filled, tries and time", () => {
    expect(stepEvidence("S1", "right", 0, 1000, 4000)).toEqual({ step_id: "S1", outcome: "right_first_time", tries: 1, ms: 3000 });
    expect(stepEvidence("S1", "right", 1, 0, 10).outcome).toBe("right_after_hint");
    expect(stepEvidence("S1", "filled", 1, 0, 10)).toMatchObject({ outcome: "filled", tries: 2 });
  });
  it("one wrong answer on step 1 reveals nothing ahead (no 8, 8 + 1 = 9, y = 9)", () => {
    const withText: FixStepContent[] = steps.map((x, i) => ({ ...x,
      hint_question: [{ text: i === 0 ? "2x means 2 times x. What is 2 × 4?" : "What is 8 + 1?" }],
      together_text: [{ text: i === 0 ? "2x means 2 times 4, which is 8." : "8 + 1 = 9. So, y = 9." }] }));
    const r = judgeStep(tryState(), withText, false);
    const out = JSON.stringify({ view: viewSteps(r.state, withText), dialog: dialogsFor(r.result as "hint", withText[0]!, false, [{ text: "So, y = 9." }]) });
    expect(out).toContain("What is 2 × 4?");
    for (const leak of ["which is 8", "= 8", "8 + 1", "y = 9", "S2"]) expect(out).not.toContain(leak);
  });
  it("the second miss opens the together dialog; the last step opens Good job", () => {
    expect(dialogsFor("filled", { ...steps[0]!, together_text: [{ text: "T" }] }, false, undefined).map((d) => d.kind)).toEqual(["together"]);
    expect(dialogsFor("right", steps[1]!, true, [{ text: "Done" }]).map((d) => d.kind)).toEqual(["done"]);
    expect(dialogsFor("filled", steps[1]!, true, [{ text: "Done" }]).map((d) => d.kind)).toEqual(["together", "done"]);
  });
});
