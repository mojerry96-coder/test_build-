// Marks Step 4 simulation tasks with exact fractions (no eval). Targets come from hidden content only.
import { evaluate, frac, fracEq, type Frac } from "./evaluate";
import type { NativeSimAnswer } from "@/shared/contracts/simulation";

export type SimTaskKind = "point" | "two_points" | "rise_run_gradient" | "choice";
export type SimCheck = { target: string; kind: SimTaskKind; start: number[]; road?: number[][] };
/** Mistake names match the feedback keys in the content pack. */
export type SimMistake = "inverted" | "sign" | "steep" | "gentle" | "vertical" | "other" | string;
export type SimVerdict = { right: boolean; mistake: SimMistake | null; magnitude: "steep" | "gentle" | null; up: number; across: number; fields: boolean[] };

const MAX_X = 6, MAX_Y = 4;
const onGrid = (p: number[]) => p.length === 2 && Number.isInteger(p[0]) && Number.isInteger(p[1]) && p[0]! >= 0 && p[0]! <= MAX_X && p[1]! >= 0 && p[1]! <= MAX_Y;
const same = (v: string | undefined, w: Frac) => { const x = evaluate(v ?? ""); return !!x && fracEq(x, w); };
const less = (a: Frac, b: Frac) => a.n * b.d < b.n * a.d; // denominators are positive after frac()

export function checkSimulation(t: SimCheck, a: NativeSimAnswer): SimVerdict {
  const none: SimVerdict = { right: false, mistake: "other", magnitude: null, up: 0, across: 0, fields: [] };
  if (t.kind === "choice") {
    const right = !!a.choice && a.choice === t.target;
    return { ...none, right, mistake: right ? null : (a.choice ?? "other") };
  }
  const pts = t.road ?? (t.kind === "two_points" ? a.points ?? [] : [t.start, ...(a.points ?? [])]);
  const p0 = pts[0], p1 = pts[1];
  if (!p0 || !p1 || !pts.every(onGrid)) return none;
  const up = p1[1]! - p0[1]!, across = p1[0]! - p0[0]!;
  const target = evaluate(t.target);
  if (!target) return none;

  let g: Frac | null;
  let fields: boolean[] = [];
  if (t.kind === "rise_run_gradient") {
    fields = [same(a.rise, frac(BigInt(up))), same(a.run, frac(BigInt(across))), same(a.gradient, target)];
    g = evaluate(a.gradient ?? "");
  } else {
    g = across === 0 ? null : frac(BigInt(up), BigInt(across));
  }
  const right = fields.length ? fields.every(Boolean) : !!g && fracEq(g, target);
  if (right) return { right, mistake: null, magnitude: null, up, across, fields };

  const magnitude = g ? (less(target, g) ? "steep" : less(g, target) ? "gentle" : null) : null;
  let mistake: SimMistake = "other";
  const riseValue = evaluate(a.rise ?? "");
  if (t.kind !== "rise_run_gradient" && across === 0) mistake = "vertical";
  else if (g && target.n !== 0n && fracEq(g, frac(target.d, target.n))) mistake = "inverted";
  else if (target.n < 0n && ((g && g.n >= 0n) || (t.kind === "rise_run_gradient" && riseValue && riseValue.n >= 0n))) mistake = "sign";
  else if (magnitude) mistake = magnitude;
  return { right: false, mistake, magnitude, up, across, fields };
}

/** Feedback for a mistake, falling back to the steeper/gentler line, then the task's general line. */
export function pickFeedback(feedback: Record<string, string>, v: SimVerdict): string | null {
  if (v.right) return null;
  return (v.mistake && feedback[v.mistake]) || (v.magnitude && feedback[v.magnitude]) || feedback["other"] || null;
}

export const fillSim = (text: string, v: Pick<SimVerdict, "up" | "across">) =>
  text.replace(/\{up\}/g, String(v.up).replace("-", "−")).replace(/\{across\}/g, String(v.across).replace("-", "−"));
