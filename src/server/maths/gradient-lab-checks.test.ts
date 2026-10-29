import { describe, expect, it } from "vitest";
import { checkLabMission, parseFrac } from "./gradient-lab-checks";

const I = (gradient: string, extra: Record<string, unknown> = {}) => ({ engine: "gradient-lab", level: "intermediate", mission: "1", kind: "two_points", gradient, ...extra }) as const;

describe("Gradient Lab mission checks", () => {
  it("uphill / downhill / flat from the m slider", () => {
    const up = { engine: "gradient-lab", level: "beginner", mission: "1", kind: "slope_sign", sign: "+" } as const;
    expect(checkLabMission(up, { m: 0.5, c: 0 })).toBe(true);
    expect(checkLabMission(up, { m: 0, c: 0 })).toBe(false);
    expect(checkLabMission({ ...up, sign: "-" }, { m: -2, c: 1 })).toBe(true);
    expect(checkLabMission({ ...up, sign: "0" }, { m: 0, c: 3 })).toBe(true);
  });
  it("gradient 2 from two points, and ½ exactly", () => {
    expect(checkLabMission(I("2"), { A: { x: 1, y: 1 }, B: { x: 2, y: 3 } })).toBe(true);
    expect(checkLabMission(I("2"), { A: { x: 0, y: 0 }, B: { x: 2, y: 1 } })).toBe(false);
    expect(checkLabMission(I("1/2"), { A: { x: 0, y: 0 }, B: { x: 2, y: 1 } })).toBe(true);
  });
  it("gradient −3 crossing the y-axis at 2", () => {
    const c = I("-3", { intercept: "2" });
    expect(checkLabMission(c, { A: { x: 0, y: 2 }, B: { x: 1, y: -1 } })).toBe(true);
    expect(checkLabMission(c, { A: { x: 0, y: 3 }, B: { x: 1, y: 0 } })).toBe(false);
  });
  it("gradient ⅔ only with points off the y-axis", () => {
    const c = I("2/3", { off_axis: true });
    expect(checkLabMission(c, { A: { x: 1, y: 1 }, B: { x: 4, y: 3 } })).toBe(true);
    expect(checkLabMission(c, { A: { x: 0, y: 1 }, B: { x: 3, y: 3 } })).toBe(false);
  });
  it("two-points equation must match the line through the given points", () => {
    const c = { engine: "gradient-lab", level: "advanced", mission: "two-1", kind: "two_points_equation" } as const;
    expect(checkLabMission(c, { p1: { x: 2, y: 3 }, p2: { x: 4, y: 7 }, m: "2", c: "−1" })).toBe(true);
    expect(checkLabMission(c, { p1: { x: 2, y: 3 }, p2: { x: 4, y: 7 }, m: "2", c: "1" })).toBe(false);
  });
  it("a vertical line or junk never passes", () => {
    expect(checkLabMission(I("2"), { A: { x: 1, y: 1 }, B: { x: 1, y: 3 } })).toBe(false);
    expect(checkLabMission(I("2"), null)).toBe(false);
    expect(parseFrac("abc")).toBeNull();
  });
});
