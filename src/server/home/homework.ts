// Homework help: breaks a gradient-between-two-points problem into steps she does herself.
// Every step is checked with exact fractions by the maths engine; the final value is never shown.
import { evaluate, fracEq, frac } from "@/server/maths/evaluate";

export type HwStep = { question: string; hint: string; expect: string };

/** Steps for two points, or null when the maths engine can't break the problem into steps. */
export function gradientSteps(points: [number, number][]): HwStep[] | null {
  if (points.length !== 2) return null;
  const [[x1, y1], [x2, y2]] = points as [[number, number], [number, number]];
  if (![x1, y1, x2, y2].every(Number.isInteger) || x1 === x2) return null;
  return [
    { question: `how far up do we go from y = ${y1} to y = ${y2}? Work out ${y2} − ${y1}.`, hint: `take the second y, ${y2}, and subtract the first y, ${y1}.`, expect: `${y2}-(${y1})` },
    { question: `how far across do we go from x = ${x1} to x = ${x2}? Work out ${x2} − ${x1}.`, hint: `take the second x, ${x2}, and subtract the first x, ${x1}.`, expect: `${x2}-(${x1})` },
    { question: `the gradient is up ÷ across. Divide your two answers and type the result.`, hint: `put the "up" answer on top and the "across" answer underneath, then simplify.`, expect: `(${y2}-(${y1}))/(${x2}-(${x1}))` },
  ];
}

/** true / false, or null if her answer can't be read as a number. */
export function checkStep(step: HwStep, answer: string): boolean | null {
  const got = evaluate(answer.replace(/÷/g, "/").replace(/−/g, "-"));
  const want = evaluate(step.expect);
  if (!got || !want) return null;
  return fracEq(got, want) || (want.d === 1n && fracEq(got, frac(want.n)));
}
