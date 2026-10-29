import { describe, expect, it } from "vitest";
import { checkSimulation, pickFeedback, type SimCheck } from "./sim-checks";

const pt = (target: string, start = [0, 0]): SimCheck => ({ target, kind: "point", start });
const at = (t: SimCheck, p: number[]) => checkSimulation(t, { points: [p] });
const road = (target: string, r: number[][]): SimCheck => ({ target, kind: "rise_run_gradient", start: [0, 0], road: r });
const rrg = (t: SimCheck, rise: string, run: string, gradient: string) => checkSimulation(t, { rise, run, gradient });

describe("Ramp Builder", () => {
  it("gradient 1 accepts (1,1) to (4,4)", () => {
    for (const p of [[1, 1], [2, 2], [3, 3], [4, 4]]) expect(at(pt("1"), p).right).toBe(true);
  });
  it("gradient 1 says steeper / gentler", () => {
    expect(at(pt("1"), [1, 3]).mistake).toBe("steep");
    expect(at(pt("1"), [3, 1]).mistake).toBe("gentle");
  });
  it("gradient 2 accepts (1,2) and (2,4); gradient ½ built is inverted", () => {
    expect(at(pt("2"), [1, 2]).right).toBe(true);
    expect(at(pt("2"), [2, 4]).right).toBe(true);
    expect(at(pt("2"), [2, 1]).mistake).toBe("inverted");
    expect(at(pt("2"), [1, 1]).mistake).toBe("gentle");
  });
  it("gradient ½ accepts (2,1), (4,2), (6,3); gradient 2 built is inverted", () => {
    for (const p of [[2, 1], [4, 2], [6, 3]]) expect(at(pt("1/2"), p).right).toBe(true);
    expect(at(pt("1/2"), [1, 2]).mistake).toBe("inverted");
  });
});

describe("Road Inspector", () => {
  const A = road("1/2", [[0, 0], [4, 2]]), B = road("2", [[1, 0], [3, 4]]), C = road("-1/2", [[0, 4], [4, 2]]);
  it("Road A accepts 1/2, 0.5, 2/4", () => {
    for (const g of ["1/2", "0.5", "2/4"]) expect(rrg(A, "2", "4", g).right).toBe(true);
    expect(rrg(A, "2", "4", "2").mistake).toBe("inverted");
  });
  it("Road B accepts 2 and 4/2; 1/2 is inverted", () => {
    expect(rrg(B, "4", "2", "2").right).toBe(true);
    expect(rrg(B, "4", "2", "4/2").right).toBe(true);
    expect(rrg(B, "4", "2", "1/2").mistake).toBe("inverted");
  });
  it("Road C accepts −2, 4, −1/2 (and −0.5, −2/4); positive values are a sign slip", () => {
    for (const g of ["−1/2", "-0.5", "−2/4"]) expect(rrg(C, "−2", "4", g).right).toBe(true);
    expect(rrg(C, "2", "4", "1/2").mistake).toBe("sign");
  });
  it("each box is marked on its own", () => {
    expect(rrg(A, "2", "3", "1/2").fields).toEqual([true, false, true]);
  });
  it("Task 4: Road B is right; A and C get their own feedback", () => {
    const t: SimCheck = { target: "B", kind: "choice", start: [0, 0] };
    expect(checkSimulation(t, { choice: "B" }).right).toBe(true);
    expect(checkSimulation(t, { choice: "C" }).mistake).toBe("C");
    expect(checkSimulation(t, { choice: "A" }).mistake).toBe("A");
  });
});

describe("Ramp Designer", () => {
  it("3/2 accepts (2,3); (3,2) is inverted", () => {
    expect(at(pt("3/2"), [2, 3]).right).toBe(true);
    expect(at(pt("3/2"), [3, 2]).mistake).toBe("inverted");
  });
  it("−1 from (0,4) accepts (1,3) to (4,0); flat or uphill is a sign slip", () => {
    for (const p of [[1, 3], [2, 2], [3, 1], [4, 0]]) expect(at(pt("-1", [0, 4]), p).right).toBe(true);
    expect(at(pt("-1", [0, 4]), [2, 4]).mistake).toBe("sign");
  });
  it("steepest under 1 in 3 accepts (3,1), (6,2); steeper and gentler get feedback", () => {
    expect(at(pt("1/3"), [3, 1]).right).toBe(true);
    expect(at(pt("1/3"), [6, 2]).right).toBe(true);
    expect(at(pt("1/3"), [6, 1]).mistake).toBe("gentle");
    const fb = { steep: "too steep", gentle: "allowed" };
    expect(pickFeedback(fb, at(pt("1/3"), [1, 3]))).toBe("too steep"); // inverse falls back to steeper
  });
  it("two points with gradient 2 in any order; vertical and ½ get feedback", () => {
    const t: SimCheck = { target: "2", kind: "two_points", start: [0, 0] };
    expect(checkSimulation(t, { points: [[0, 0], [2, 4]] }).right).toBe(true);
    expect(checkSimulation(t, { points: [[3, 1], [4, 3]] }).right).toBe(true);
    expect(checkSimulation(t, { points: [[4, 3], [3, 1]] }).right).toBe(true);
    expect(checkSimulation(t, { points: [[2, 1], [2, 3]] }).mistake).toBe("vertical");
    expect(checkSimulation(t, { points: [[0, 0], [4, 2]] }).mistake).toBe("inverted");
  });
  it("points off the grid are never right", () => {
    expect(at(pt("1"), [7, 7]).right).toBe(false);
  });
});

describe("two-points gradient 2 task gives its own feedback", () => {
  it("a steeper line gets the 'steeper than 2' line, never another task's", () => {
    const fb = { steep: "steeper than 2", gentle: "gentler than 2", other: "isn't 2" };
    const v = checkSimulation({ kind: "two_points", target: "2", start: [0, 0] }, { points: [[1, 1], [2, 4]] });
    expect(v.right).toBe(false);
    expect(pickFeedback(fb, v)).toBe("steeper than 2");
  });
});
