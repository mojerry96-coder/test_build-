// Marks a Gradient Lab mission from her values, with exact whole-number arithmetic (no eval, no floats compared).
// The lab's own "passed" is never trusted: this is the only check that settles a mission.

export type LabCheck =
  | { engine: "gradient-lab"; level: "beginner"; mission: string; kind: "slope_sign"; sign: "+" | "-" | "0" }
  | { engine: "gradient-lab"; level: "intermediate"; mission: string; kind: "two_points"; gradient: string; intercept?: string; off_axis?: boolean }
  | { engine: "gradient-lab"; level: "advanced"; mission: string; kind: "two_points_equation" };

type Frac = { n: number; d: number };
const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));
function norm(n: number, d: number): Frac | null {
  if (!Number.isInteger(n) || !Number.isInteger(d) || d === 0) return null;
  const g = gcd(n, d) || 1, s = d < 0 ? -1 : 1;
  return { n: (s * n) / g, d: (s * d) / g };
}
const eq = (a: Frac | null, b: Frac | null) => !!a && !!b && a.n === b.n && a.d === b.d;

/** "2", "−3", "1/2", "-2/3", "1.5", "⅔", "½" → exact fraction, or null. */
export function parseFrac(raw: unknown): Frac | null {
  if (typeof raw === "number") return parseFrac(String(raw));
  if (typeof raw !== "string") return null;
  const s = raw.trim().replace(/[−–]/g, "-").replace(/½/g, "1/2").replace(/⅔/g, "2/3").replace(/⅓/g, "1/3").replace(/¼/g, "1/4").replace(/¾/g, "3/4").replace(/\s+/g, "");
  let m = /^(-?)(\d{1,6})\/(\d{1,6})$/.exec(s);
  if (m) return norm((m[1] ? -1 : 1) * Number(m[2]), Number(m[3]));
  m = /^(-?)(\d{1,6})(?:\.(\d{1,6}))?$/.exec(s);
  if (m) { const dec = m[3] ?? ""; const d = 10 ** dec.length; return norm((m[1] ? -1 : 1) * (Number(m[2]) * d + Number(dec || 0)), d); }
  return null;
}

type P = { x: number; y: number };
const isP = (p: unknown): p is P => !!p && typeof p === "object" && Number.isInteger((p as P).x) && Number.isInteger((p as P).y)
  && Math.abs((p as P).x) <= 20 && Math.abs((p as P).y) <= 40;

/** Gradient and y-intercept of the line through A and B, exactly (null when vertical or the same point). */
function lineOf(a: P, b: P): { m: Frac; c: Frac } | null {
  const dx = b.x - a.x, dy = b.y - a.y;
  if (dx === 0) return null;
  const m = norm(dy, dx)!;
  // c = y − m·x = (y·d − n·x) / d
  const c = norm(a.y * m.d - m.n * a.x, m.d)!;
  return { m, c };
}

export function checkLabMission(check: LabCheck, state: Record<string, unknown> | null | undefined): boolean {
  if (!state || typeof state !== "object") return false;
  if (check.kind === "slope_sign") {
    const m = parseFrac(state["m"] as unknown);
    if (!m) return false;
    return check.sign === "+" ? m.n > 0 : check.sign === "-" ? m.n < 0 : m.n === 0;
  }
  if (check.kind === "two_points") {
    const A = state["A"], B = state["B"];
    if (!isP(A) || !isP(B)) return false;
    const l = lineOf(A, B);
    if (!l || !eq(l.m, parseFrac(check.gradient))) return false;
    if (check.intercept !== undefined && !eq(l.c, parseFrac(check.intercept))) return false;
    if (check.off_axis && (A.x === 0 || B.x === 0)) return false;
    return true;
  }
  if (check.kind === "two_points_equation") {
    const p1 = state["p1"], p2 = state["p2"];
    if (!isP(p1) || !isP(p2)) return false;
    const l = lineOf(p1, p2);
    return !!l && eq(l.m, parseFrac(state["m"])) && eq(l.c, parseFrac(state["c"]));
  }
  return false;
}
