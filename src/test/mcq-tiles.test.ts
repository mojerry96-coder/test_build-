import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { HELP } from "@/shared/intro-moves";

const css = readFileSync(`${process.cwd()}/src/styles.css`, "utf8");
const hex = (n: string) => css.match(new RegExp(`--${n}: (#[0-9A-Fa-f]{6});`))![1]!;
const lum = (h: string) => {
  const c = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0]! + 0.7152 * c[1]! + 0.0722 * c[2]!;
};
const ratio = (a: string, b: string) => { const x = Math.max(lum(a), lum(b)), y = Math.min(lum(a), lum(b)); return (x + 0.05) / (y + 0.05); };

describe("warm-up option tiles", () => {
  it("use the design colours", () => {
    expect([hex("mcq-a"), hex("mcq-b"), hex("mcq-c"), hex("mcq-d")]).toEqual(["#C3CDF8", "#F6C0A8", "#D4FBE6", "#F8E5A8"]);
    expect([hex("mcq-a-edge"), hex("mcq-b-edge"), hex("mcq-c-edge"), hex("mcq-d-edge")]).toEqual(["#5D6BB0", "#C2562E", "#5AA27A", "#C79A2E"]);
  });
  for (const t of ["mcq-a", "mcq-b", "mcq-c", "mcq-d"]) it(`text on ${t} ≥ 4.5:1`, () => expect(ratio(hex("mcq-ink"), hex(t))).toBeGreaterThanOrEqual(4.5));
  it("right tile text ≥ 4.5:1", () => expect(ratio(hex("mcq-right-ink"), hex("mcq-right"))).toBeGreaterThanOrEqual(4.5));
  it("not-quite tile text ≥ 4.5:1", () => expect(ratio(hex("mcq-amber-ink"), hex("mcq-amber"))).toBeGreaterThanOrEqual(4.5));
});

describe("Hint button message", () => {
  it("is sorted as a warm-up tip request", () => expect(HELP.test("can i have a tip?")).toBe(true));
});

describe("warm-up answer pills and tip pill", () => {
  const all = (n: string) => [...css.matchAll(new RegExp(`--${n}: (#[0-9A-Fa-f]{6});`, "g"))].map((m) => m[1]!);
  it("picked answer text ≥ 4.5:1 in light and dark", () => { const [l, d] = all("ans-sel"); expect(ratio("#FFFFFF", l!)).toBeGreaterThanOrEqual(4.5); expect(ratio("#FFFFFF", d!)).toBeGreaterThanOrEqual(4.5); });
  it("tip text ≥ 4.5:1 in light and dark", () => { const b = all("tip-pill"), i = all("tip-ink"); expect(ratio(i[0]!, b[0]!)).toBeGreaterThanOrEqual(4.5); expect(ratio(i[1]!, b[1]!)).toBeGreaterThanOrEqual(4.5); });
  it("question numbers ≥ 3:1 on the page (large text)", () => { const q = all("q-num"); expect(ratio(q[0]!, "#EDF2F9")).toBeGreaterThanOrEqual(3); expect(ratio(q[1]!, "#0E1A2B")).toBeGreaterThanOrEqual(3); });
});
