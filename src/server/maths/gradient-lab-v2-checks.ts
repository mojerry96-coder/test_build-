// Marks Gradient Lab v2 answers ourselves, from values read off the lab's screen.
// The question sets are copied from the lab into the content pack (hidden check.question_sets).
import { parseFrac } from "./gradient-lab-checks";

export type V2Answer = {
  fields?: Record<string, string>;
  sliders?: { m?: number; c?: number };
  choice?: number | null;
};
type Pt = [number, number];
export type V2Sets = {
  "6"?: { m: number; c: number }[];
  "7"?: { A: Pt; B: Pt }[];
  "8"?: { m: number; c: number; x: number }[];
  "9"?: { m: number; c: number; choices: number[] }[];
  "11"?: { targets: Pt[] }[];
};

const num = (s: string | undefined): number | null => {
  if (s == null) return null;
  const f = parseFrac(s.trim().replace(/[−–]/g, "-"));
  return f == null ? null : f.n / f.d;
};
const same = (a: number | null, b: number) => a != null && Math.abs(a - b) < 1e-6;
const pick = <T,>(list: T[] | undefined, q: number): T | undefined => (list && list.length ? list[((q % list.length) + list.length) % list.length] : undefined);

/** Screens with answers: 4/5 (gradient of the drawn line = 1), 6, 7, 8, 9, 11. Null = not a marked screen or no question. */
export function checkLabV2(screen: number, q: number, a: V2Answer, sets: V2Sets): boolean | null {
  const f = a.fields ?? {};
  switch (screen) {
    case 4: case 5: return same(num(f["m-answer"]), 1);
    case 6: { const Q = pick(sets["6"], q); return Q ? same(num(f["m-answer"]), Q.m) && same(num(f["c-answer"]), Q.c) : null; }
    case 7: {
      const Q = pick(sets["7"], q); if (!Q) return null;
      const m = (Q.B[1] - Q.A[1]) / (Q.B[0] - Q.A[0]), c = Q.A[1] - m * Q.A[0];
      return same(num(f["m-answer"]), m) && same(num(f["c-answer"]), c);
    }
    case 8: { const Q = pick(sets["8"], q); return Q ? same(num(f["y-answer"]), Q.m * Q.x + Q.c) : null; }
    case 9: {
      const Q = pick(sets["9"], q); if (!Q) return null;
      const i = a.choice; return i != null && i >= 0 && i < Q.choices.length && Q.choices[i] === Q.c;
    }
    case 11: {
      const Q = pick(sets["11"], q); const m = a.sliders?.m, c = a.sliders?.c;
      if (!Q || m == null || c == null) return null;
      return Q.targets.every(([x, y]) => Math.abs(m * x + c - y) < 0.08);
    }
    default: return null;
  }
}

/** Question index the lab is on: +1 each time it moves to a fresh question of the same kind. */
export function nextQuestionIndex(q: number, event: string, detail: Record<string, unknown>): number {
  if (event === "support-offered" && detail["freshQuestion"] === true) return q + 1;
  if (event === "support" && detail["next"] === "similar-question") return q + 1;
  return q;
}
