import { describe, it, expect } from "vitest";
import pack from "../../content/packs/MTH12_09_02_01.seed.json";

function collect(o: unknown, out: Record<string, unknown>[] = []) {
  if (Array.isArray(o)) o.forEach((v) => collect(v, out));
  else if (o && typeof o === "object") {
    const p = (o as { paths?: unknown }).paths;
    if (p && typeof p === "object" && !Array.isArray(p) && Object.keys(p).length) out.push(p as Record<string, unknown>);
    Object.values(o).forEach((v) => collect(v, out));
  }
  return out;
}

describe("board option paths", () => {
  it("no two options in one question draw the same route", () => {
    for (const paths of collect(pack)) {
      const s = Object.values(paths).map((v) => JSON.stringify(v));
      expect(new Set(s).size).toBe(s.length);
    }
  });
});
