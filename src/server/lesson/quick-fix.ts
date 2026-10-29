// The quick fix (warm-up repair): slip line -> watch it solved -> you try with help -> try one alone.
// Pure logic so it can be unit-tested; answers never leave this module except as right/hint/filled.
import { parsePoint } from "@/server/maths/point";
import type { Script } from "@/shared/contracts/script";
import type { ViewBoard, ViewFixStep, ViewRepair } from "@/shared/contracts/lesson";

export type FixOutcome = "right" | "hint_right" | "filled";
export type FixState = {
  repairId: string;
  slipMis: string | null;
  part: "watch" | "try" | "practice";
  step: number;
  misses: number;
  outcomes: FixOutcome[];
  /** Dialogs waiting for her tap, in order (survive a reload). */
  dialogs?: FixDialog[];
  /** When the open step opened (ms) and per-step evidence. */
  stepAt?: number;
  evidence?: { step_id: string; outcome: "right_first_time" | "right_after_hint" | "filled"; tries: number; ms: number }[];
};
export type FixDialog = { kind: "close" | "together" | "done"; lines: Script };

export type FixStepContent = {
  id: string; prompt: Script; input?: "number" | "choice" | "point"; choices?: string[];
  /** Point steps: the empty grid she places the point on; hint_ring shows the target ring only after a miss. */
  grid?: { x_max: number; y_max: number }; hint_ring?: boolean;
  answer: string; hint: Script; full_line: Script; filled_line: Script;
  /** Shown in the "You got close!" dialog and the chat after a first miss. */
  hint_question?: Script; together_text?: Script;
};
export type FixContent = {
  slip: Record<string, Script>;
  watch: { lines: Script; board?: ViewBoard | null; expr?: Script[number] | null };
  you_try: { intro?: Script; board?: ViewBoard | null; expr?: Script[number] | null; steps: FixStepContent[]; done_summary?: Script };
};

/** The slip line for the misconception behind the option she picked, else the default line. */
export function slipFor(slip: Record<string, Script> | undefined, mis: string | null): Script {
  if (!slip) return [];
  return (mis && slip[mis]) || slip["default"] || [];
}

export function newFix(repairId: string, slipMis: string | null): FixState {
  return { repairId, slipMis, part: "watch", step: 0, misses: 0, outcomes: [] };
}

/** Check one you-try step. Right moves on; a first miss gives the hint; a second miss fills it in. */
export function judgeStep(state: FixState, steps: FixStepContent[], correct: boolean): { result: "right" | "hint" | "filled"; state: FixState } {
  if (state.part !== "try" || !steps[state.step]) throw new Error("No step to check.");
  const next = { ...state, outcomes: [...state.outcomes] };
  let result: "right" | "hint" | "filled";
  if (correct) {
    next.outcomes.push(state.misses ? "hint_right" : "right");
    result = "right";
  } else if (state.misses === 0) {
    next.misses = 1;
    return { result: "hint", state: next };
  } else {
    next.outcomes.push("filled");
    result = "filled";
  }
  next.step += 1;
  next.misses = 0;
  if (next.step >= steps.length) next.part = "practice";
  return { result, state: next };
}

/** What the browser may see: settled steps with their lines, the open step's prompt (and hint after a miss). Never answers. */
export function viewSteps(state: FixState, steps: FixStepContent[]): ViewFixStep[] {
  if (state.part === "watch") return [];
  const out: ViewFixStep[] = [];
  steps.forEach((s, i) => {
    const base = { id: s.id, prompt: s.prompt, input: s.input ?? "number", ...(s.choices ? { choices: s.choices } : {}), ...(s.grid ? { grid: s.grid } : {}) } as const;
    if (i < state.step) {
      const o = state.outcomes[i] ?? "right";
      out.push({ ...base, state: o, misses: o === "right" ? 0 : o === "hint_right" ? 1 : 2, hint: null, line: o === "filled" ? s.filled_line : s.full_line });
    } else if (i === state.step && state.part === "try") {
      const ring = state.misses && s.input === "point" && s.hint_ring ? parsePoint(String(s.answer)) : null;
      out.push({ ...base, state: "open", misses: state.misses, hint: state.misses ? s.hint : null, line: null, ...(ring ? { ring } : {}) });
    }
  });
  return out;
}

export function repairView(state: FixState, c: FixContent, practiceItem: ViewRepair["practiceItem"]): ViewRepair {
  const slip = slipFor(c.slip, state.slipMis);
  return {
    lines: slip, slip, part: state.part,
    watch: { lines: c.watch?.lines ?? [], board: c.watch?.board ?? null, expr: c.watch?.expr ?? null },
    you: { intro: c.you_try?.intro ?? [], board: c.you_try?.board ?? null, expr: c.you_try?.expr ?? null, steps: viewSteps(state, c.you_try?.steps ?? []) },
    practiceItem,
    dialog: state.dialogs?.[0] ?? null,
  };
}

/** The dialogs one checked step opens: close after a first miss, together after a second, done after the last step. */
export function dialogsFor(result: "right" | "hint" | "filled", step: FixStepContent, last: boolean, done: Script | undefined): FixDialog[] {
  const out: FixDialog[] = [];
  if (result === "hint") return [{ kind: "close", lines: step.hint_question?.length ? step.hint_question : step.hint }];
  if (result === "filled") out.push({ kind: "together", lines: step.together_text?.length ? step.together_text : step.filled_line });
  if (last) out.push({ kind: "done", lines: done ?? [] });
  return out;
}

/** Evidence for a settled step. */
export function stepEvidence(stepId: string, result: "right" | "filled", missesBefore: number, startedAt: number | undefined, now: number) {
  return { step_id: stepId, outcome: result === "filled" ? "filled" as const : missesBefore ? "right_after_hint" as const : "right_first_time" as const, tries: missesBefore + 1, ms: startedAt ? Math.max(0, now - startedAt) : 0 };
}
