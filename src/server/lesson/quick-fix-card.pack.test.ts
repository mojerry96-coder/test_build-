import { describe, expect, it } from "vitest";
import pack from "../../../content/packs/MTH12_09_02_01.seed.json";

type Any = any; // eslint-disable-line @typescript-eslint/no-explicit-any
const p = pack as Any;

describe("quick-fix card agrees with the board", () => {
  it("the SUB-01 board teaches subtraction like its warm-up question", () => {
    const r = p.repairs.find((x: Any) => x.id === "REP_SUB_01");
    const all = JSON.stringify(r.watch) + JSON.stringify(r.you_try);
    expect(all).toContain("−");
    expect(all).not.toMatch(/\+ ?\d/);
    expect(r.you_try.steps.map((s: Any) => s.answer)).toEqual(["8", "7"]);
  });

  it("no slip line (shown on the card) gives away the warm-up answer", () => {
    for (const r of p.repairs) {
      const slips = Object.values(r.slip).flat().map((l: Any) => l.text).join(" ");
      if (r.skill_id === "SUB-01") expect(slips).not.toMatch(/= ?6\b/);
    }
  });
});
