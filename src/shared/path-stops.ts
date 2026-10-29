// The "Let's Begin" map: 6 stops drawn in the design, carrying the 8 lesson steps.
import { LESSON_STEPS, type LessonStep } from "@/shared/contracts/enums";

export const PATH_STOPS: { name: string; steps: LessonStep[] }[] = [
  { name: "Warm-up", steps: ["readiness"] },
  { name: "Puzzle", steps: ["hook"] },
  { name: "Video", steps: ["video"] },
  { name: "Hands-on", steps: ["simulation"] },
  { name: "Practice", steps: ["worksheet", "guided"] },
  { name: "Finish", steps: ["exit_ticket", "reflection"] },
];

export type StopState = "done" | "next" | "locked";

/** Index of the stop holding a step. */
export function stopOf(step: LessonStep): number {
  return PATH_STOPS.findIndex((s) => s.steps.includes(step));
}

/** States from the open lesson's step (null = not started) and whether the topic is finished.
 *  A stop is done only when every step in it is behind her current step. */
export function stopStates(activeStep: LessonStep | null, finished: boolean): StopState[] {
  if (finished && !activeStep) return PATH_STOPS.map(() => "done");
  const cur = activeStep ? LESSON_STEPS.indexOf(activeStep) : 0;
  const next = PATH_STOPS.findIndex((s) => s.steps.some((st) => LESSON_STEPS.indexOf(st) >= cur));
  return PATH_STOPS.map((_, i) => (i < next ? "done" : i === next ? "next" : "locked"));
}

/** "Finish {previous stop} first" for a locked stop. */
export function lockedMessage(i: number): string {
  return `Finish ${PATH_STOPS[Math.max(0, i - 1)]!.name} first.`;
}

/** Her typed or spoken yes for the map's "Ready?". */
export const GO_WORDS = /^\s*(yes|yeah|yep|yes please|ok|okay|sure|ready|i'?m ready|go|let'?s go!?|start|alright|👍)[\s.!]*$/i;

/** The step a tap on stop i goes back to (its first step), or null when that stop can't be gone back to (only done stops can). */
export function rewindTarget(i: number, states: StopState[]): LessonStep | null {
  return states[i] === "done" ? PATH_STOPS[i]?.steps[0] ?? null : null;
}

/** Steps cleared when she goes back to `target`: that step and every step after it. */
export function stepsFrom(target: LessonStep): LessonStep[] {
  return LESSON_STEPS.slice(LESSON_STEPS.indexOf(target)) as LessonStep[];
}
