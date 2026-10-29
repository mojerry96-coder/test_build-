import { describe, expect, it } from "vitest";
import pack from "../../../content/packs/MTH12_09_02_01.seed.json";
import { dialogsFor, judgeStep, newFix, repairView, type FixContent, type FixState, type FixStepContent } from "./quick-fix";

// "Nothing early" against the real starter pack: after one wrong answer on any guided step,
// what the browser receives (screen view + dialog) holds no answer, no together text,
// no worked line for the step, and nothing from the next step.
const texts = (s: unknown) => (Array.isArray(s) ? s.map((x: any) => (typeof x === "string" ? x : x?.text)).filter(Boolean) : []) as string[];
const repairs = (pack as any).repairs as (FixContent & { id: string })[];

describe("nothing early on the real starter pack", () => {
  it("has the three quick fixes", () => {
    expect(repairs.map((r) => r.id).sort()).toEqual(["REP_CALC_01", "REP_COORD_01", "REP_SUB_01"]);
  });

  for (const r of repairs) {
    const steps = r.you_try.steps as FixStepContent[];
    steps.forEach((step, i) => {
      it(`${r.id} step ${step.id}: one wrong answer reveals nothing ahead`, () => {
        let st: FixState = { ...newFix(r.id, null), part: "try" };
        for (let k = 0; k < i; k++) st = judgeStep(st, steps, true).state;
        const before = JSON.stringify(repairView(st, r, null as never));
        const { result, state } = judgeStep(st, steps, false);
        expect(result).toBe("hint");
        const sent = JSON.stringify({ before, view: repairView({ ...state, dialogs: dialogsFor(result, step, false, r.you_try.done_summary) }, r, null as never) });
        expect(sent).not.toMatch(/"answer"/);
        for (const t of [...texts(step.together_text), ...texts(step.full_line), ...texts(step.filled_line)]) expect(sent).not.toContain(t);
        const next = steps[i + 1];
        if (next) for (const t of [...texts(next.prompt), ...texts(next.hint_question), ...texts(next.together_text)]) expect(sent).not.toContain(t);
        else for (const t of texts(r.you_try.done_summary)) expect(sent).not.toContain(t);
        for (const t of texts(step.hint_question)) expect(sent).toContain(t); // the hint is the right moment
      });

      it(`${r.id} step ${step.id}: the together text arrives only on the second miss, then the next step opens`, () => {
        let st: FixState = { ...newFix(r.id, null), part: "try" };
        for (let k = 0; k < i; k++) st = judgeStep(st, steps, true).state;
        st = judgeStep(st, steps, false).state;
        const { result, state } = judgeStep(st, steps, false);
        expect(result).toBe("filled");
        const sent = JSON.stringify(repairView({ ...state, dialogs: dialogsFor(result, step, i === steps.length - 1, r.you_try.done_summary) }, r, null as never));
        for (const t of texts(step.together_text)) expect(sent).toContain(t);
        const next = steps[i + 1];
        if (next) { for (const t of texts(next.prompt)) expect(sent).toContain(t); expect(sent).not.toMatch(/"answer"/); }
      });
    });
  }
});
