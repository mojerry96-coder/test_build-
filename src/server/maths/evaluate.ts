// Maths engine (first slice): normalises student answers and evaluates plain arithmetic
// exactly with fractions, so "−8/4", "-2" and "−2.0" compare equal. No AI, no eval().

export type Frac = { n: bigint; d: bigint };

const gcd = (a: bigint, b: bigint): bigint => {
  a = a < 0n ? -a : a;
  b = b < 0n ? -b : b;
  while (b) [a, b] = [b, a % b];
  return a || 1n;
};
export const frac = (n: bigint, d: bigint = 1n): Frac => {
  if (d === 0n) throw new Error("divide by zero");
  if (d < 0n) { n = -n; d = -d; }
  const g = gcd(n, d);
  return { n: n / g, d: d / g };
};
const add = (a: Frac, b: Frac) => frac(a.n * b.d + b.n * a.d, a.d * b.d);
const sub = (a: Frac, b: Frac) => frac(a.n * b.d - b.n * a.d, a.d * b.d);
const mul = (a: Frac, b: Frac) => frac(a.n * b.n, a.d * b.d);
const div = (a: Frac, b: Frac) => frac(a.n * b.d, a.d * b.n);
export const fracEq = (a: Frac, b: Frac) => a.n === b.n && a.d === b.d;
export const fracToString = (f: Frac) => (f.d === 1n ? `${f.n}` : `${f.n}/${f.d}`);

/** Unifies unicode maths symbols and spacing. */
export function normalise(s: string): string {
  return s
    .replace(/[\u2212\u2013\u2014]/g, "-")
    .replace(/[×x\*](?=\s*[\d(])/g, "*")
    .replace(/÷/g, "/")
    .replace(/½/g, "1/2").replace(/⅓/g, "1/3").replace(/⅔/g, "2/3").replace(/¼/g, "1/4").replace(/¾/g, "3/4")
    .replace(/\s+/g, "")
    .toLowerCase();
}

function parseDecimal(t: string): Frac {
  const [i, f = ""] = t.split(".");
  const d = 10n ** BigInt(f.length);
  return frac(BigInt((i || "0") + f), d);
}

/** Evaluates + - * / ( ) and unary minus over decimals. Returns null if not plain arithmetic. */
export function evaluate(expr: string): Frac | null {
  if (expr.length > 512) return null;
  const deadline = performance.now() + 25;
  let iterations = 0;
  const tick = () => { if (++iterations > 1024 || performance.now() > deadline) throw new Error("maths budget"); };
  const s = normalise(expr);
  if (!s || /[^0-9.+\-*/()]/.test(s)) return null;
  let i = 0;
  const peek = () => s[i];
  function primary(): Frac {
    tick();
    if (peek() === "-") { i++; const v = primary(); return frac(-v.n, v.d); }
    if (peek() === "+") { i++; return primary(); }
    if (peek() === "(") {
      i++;
      const v = expression();
      if (peek() !== ")") throw new Error("bracket");
      i++;
      return v;
    }
    const m = /^\d+(\.\d+)?|^\.\d+/.exec(s.slice(i));
    if (!m) throw new Error("number");
    i += m[0].length;
    return parseDecimal(m[0]);
  }
  function term(): Frac {
    let v = primary();
    while (peek() === "*" || peek() === "/" || peek() === "(") {
      const op = peek();
      if (op === "(") { v = mul(v, primary()); continue; }
      i++;
      const r = primary();
      v = op === "*" ? mul(v, r) : div(v, r);
    }
    return v;
  }
  function expression(): Frac {
    let v = term();
    while (peek() === "+" || peek() === "-") {
      const op = s[i++];
      const r = term();
      v = op === "+" ? add(v, r) : sub(v, r);
    }
    return v;
  }
  try {
    const v = expression();
    return i === s.length ? v : null;
  } catch {
    return null;
  }
}

/** True when the student's answer matches any accepted form, by value or by exact text. */
export function answerMatches(answer: string, accepted: string[]): boolean {
  const a = normalise(answer);
  if (!a) return false;
  const av = evaluate(a);
  return accepted.some((f) => {
    if (normalise(f) === a) return true;
    const fv = evaluate(f);
    return !!(av && fv && fracEq(av, fv));
  });
}

export type LineVerdict =
  | { status: "ok"; value: Frac | null }
  | { status: "check"; value: Frac | null; reason: "not_equal" | "not_following" | "unreadable" };

/**
 * Checks one whiteboard line. "a = b" must balance; a line starting "=" must equal the
 * previous line's value; a formula line (letters) is accepted without a value.
 */
export function checkLine(line: string, previous: Frac | null): LineVerdict {
  if (line.length > 512) return { status: "check", value: null, reason: "unreadable" };
  const s = normalise(line);
  if (!s) return { status: "check", value: null, reason: "unreadable" };
  if (/[a-z₁₂]/.test(s)) return { status: "ok", value: null };
  const continues = s.startsWith("=");
  const parts = (continues ? s.slice(1) : s).split("=").filter(Boolean);
  const values = parts.map(evaluate);
  if (values.some((v) => v === null)) return { status: "check", value: null, reason: "unreadable" };
  const vs = values as Frac[];
  for (let k = 1; k < vs.length; k++) if (!fracEq(vs[0]!, vs[k]!)) return { status: "check", value: vs[k]!, reason: "not_equal" };
  const value = vs[vs.length - 1]!;
  if (continues && previous && !fracEq(previous, vs[0]!)) return { status: "check", value, reason: "not_following" };
  return { status: "ok", value };
}

/** Arithmetic truth alone is insufficient: work must belong to this item's method. */
export function checkItemLine(line: string, previous: Frac | null, final: string, method: string[]): LineVerdict {
  const verdict = checkLine(line, previous);
  if (verdict.status === "check") return verdict;
  const parts = normalise(line).replace(/^=/, "").split("=");
  const value = verdict.value;
  const finalValue = evaluate(final);
  if (value && finalValue && fracEq(value, finalValue)) return verdict;
  // Match expressions, not just values: 6/3 must not match a coordinate difference of 2.
  const expressions = method.flatMap(l => normalise(l).split("="));
  if (parts.every(p => expressions.includes(p))) return verdict;
  return { status: "check", value, reason: "not_following" };
}
