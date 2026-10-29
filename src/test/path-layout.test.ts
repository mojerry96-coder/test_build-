import { describe, expect, it } from "vitest";
import { DESK, PHONE } from "@/components/path/PathMap";
import { afterRestart } from "@/shared/restart-cutoff";

type P = [number, number];
const cross = (a: P, b: P, c: P, d: P) => {
  const o = (p: P, q: P, r: P) => Math.sign((q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0]));
  return o(a, b, c) * o(a, b, d) < 0 && o(c, d, a) * o(c, d, b) < 0;
};
describe("Let's Begin map", () => {
  for (const [name, L] of [["desktop", DESK], ["phone", PHONE]] as const) {
    it(`${name}: no two path lines cross`, () => {
      const segs = L.pts.slice(1).map((p, i) => [L.pts[i]!, p] as [P, P]);
      for (let i = 0; i < segs.length; i++) for (let j = i + 2; j < segs.length; j++) expect(cross(...segs[i]!, ...segs[j]!)).toBe(false);
    });
  }
});
describe("restart cutoff", () => {
  it("ignores sessions started before the restart", () => {
    const rows = [{ id: "old", started_at: "2026-10-20T10:00:00Z" }, { id: "new", started_at: "2026-10-22T10:00:00Z" }];
    expect(afterRestart(rows, "2026-10-21T00:00:00Z").map((r) => r.id)).toEqual(["new"]);
    expect(afterRestart(rows, null)).toHaveLength(2);
  });
});
