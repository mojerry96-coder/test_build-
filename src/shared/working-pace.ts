// One typing pace for tutor chat messages and worked working.
// Values come from rules (chat_stream_chars_per_s, working_line_hold_ms, working_result_pause_ms); defaults match the starter pack.
import { keepMathsTogether } from "./chat-groups";

export type WorkingPace = { cps: number; holdMs: number; resultPauseMs: number };
export const DEFAULT_PACE: WorkingPace = { cps: 55, holdMs: 1200, resultPauseMs: 800 };
export const SENTENCE_PAUSE_MS = 250;
export const COMMA_PAUSE_MS = 120;

/** Split into the units that appear one at a time: words, with a maths expression kept whole. */
export function typeUnits(text: string): string[] {
  return keepMathsTogether(text).split(/(?<= )/).filter(Boolean);
}

/** For each unit, the time (ms from start) when it has fully appeared. */
export function typeSchedule(text: string, cps = DEFAULT_PACE.cps): number[] {
  let t = 0;
  return typeUnits(text).map((u) => {
    t += (u.length / cps) * 1000;
    const end = t;
    const last = u.trimEnd().slice(-1);
    if (".?!".includes(last) && last) t += SENTENCE_PAUSE_MS;
    else if (",:".includes(last) && last) t += COMMA_PAUSE_MS;
    return Math.round(end);
  });
}

export function typeDurationMs(text: string, cps = DEFAULT_PACE.cps): number {
  const s = typeSchedule(text, cps);
  return s[s.length - 1] ?? 0;
}

/** Time from line `index` starting until line index+1 starts: write-on time, then the hold; the result line waits a little longer. */
export function lineHoldMs(lines: string[], index: number, pace: WorkingPace = DEFAULT_PACE): number {
  const hold = typeDurationMs(lines[index] ?? "", pace.cps) + pace.holdMs;
  return index === lines.length - 2 ? hold + pace.resultPauseMs : hold;
}

/** Two "Next step" taps in a row switch to step-by-step mode (each line waits for her tap). */
export function nextTapMode(prevTapWasNext: boolean, stepMode: boolean): boolean {
  return stepMode || prevTapWasNext;
}

/** The words of `line` that are new compared with `prev` (shown with a short highlight). */
export function changedSpan(prev: string | undefined, line: string): { start: number; end: number } | null {
  if (!prev) return null;
  let s = 0;
  while (s < prev.length && s < line.length && prev[s] === line[s]) s++;
  let e = 0;
  while (e < prev.length - s && e < line.length - s && prev[prev.length - 1 - e] === line[line.length - 1 - e]) e++;
  // widen to word edges
  while (s > 0 && line[s - 1] !== " ") s--;
  let end = line.length - e;
  while (end < line.length && line[end] !== " ") end++;
  if (end <= s || end - s >= line.length) return null;
  return { start: s, end };
}
