import { describe, it, expect } from "vitest";
import { validatePack } from "../validate";
import { packToRows, diffTables, TABLES, type Row, type Table } from "../plan";
import { validPack, failing } from "./fixtures";

describe("content pack validation", () => {
  it("passing fixture has no errors", () => {
    expect(validatePack(validPack()).errors).toEqual([]);
  });
  for (const n of Object.keys(failing).map(Number)) {
    it(`check ${n} catches its failing fixture`, () => {
      const { errors } = validatePack(failing[n]!());
      expect(errors.some((e) => e.check === n)).toBe(true);
    });
  }
  it("names the exact place for a missing option", () => {
    const { errors } = validatePack(failing[4]!());
    expect(errors.map((e) => e.message)).toContain("Item VC1: feedback refers to option d, which does not exist on this item.");
    expect(errors.find((e) => e.check === 4)?.group).toBe("video");
  });
  it("warns when a feedback trigger is not written option:<id>", () => {
    const p = validPack();
    p.items[0].feedback[0].trigger = "b";
    const v = validatePack(p);
    expect(v.errors).toEqual([]);
    expect(v.warnings.map((w) => w.message)).toContain("Item VC1: feedback trigger 'b' should be written 'option:b'");
  });
  it("does not apply banned words to parent-facing plain words", () => {
    const p = validPack();
    p.misconceptions[0].plain_words = "got the sign of the gradient wrong";
    expect(validatePack(p).errors).toEqual([]);
  });
  it("the starter pack passes with zero errors", async () => {
    const fs = await import("node:fs");
    const pack = JSON.parse(fs.readFileSync("content/packs/MTH12_09_02_01.seed.json", "utf8"));
    expect(validatePack(pack).errors).toEqual([]);
  });
  it("hides every tutor script outside readable rows", () => {
    const rows: any = packToRows(validPack(), []);
    expect(rows.repairs[0].micro_lesson).toEqual([]);
    expect(rows.hooks[0].close_script).toEqual([]);
    expect(rows.scripts.map((r: any) => r.id)).toContain("hooks:HOOK_1:close_script");
  });
  it("skips protected system settings with a warning", () => {
    const p = validPack();
    p.rules.push({ key: "dev_open_access", value: false });
    const v = validatePack(p);
    expect(v.errors).toEqual([]);
    expect(v.skippedSystemKeys).toEqual(["dev_open_access"]);
    const rows: any = packToRows(p, v.skippedSystemKeys);
    expect(rows.rules.map((r: any) => r.key)).toEqual(["ai_timeout_ms"]);
  });
});

describe("item split and diff", () => {
  const empty = () => Object.fromEntries(TABLES.map((t) => [t, [] as Row[]])) as Record<Table, Row[]>;
  it("puts the key, feedback, escalation and hints in server-only tables", () => {
    const rows: any = packToRows(validPack(), []);
    const item = rows.items.find((r: any) => r.id === "VC1")!;
    expect(item).not.toHaveProperty("key");
    expect(rows.item_keys.find((r: any) => r.item_id === "VC1")?.answer).toEqual({ kind: "mcq", correct_option_id: "a" });
    expect(rows.escalations.filter((r: any) => r.item_id === "VC1").map((r: any) => r.attempt)).toEqual([2, 3]);
    expect(rows.hints.filter((r: any) => r.item_id === "VC1").map((r: any) => r.rung)).toEqual([1, 2]);
    expect(rows.clip_checks).toHaveLength(1);
  });
  it("keeps rows missing from the pack unless removal is chosen", () => {
    const rows: any = packToRows(validPack(), []);
    const existing = empty();
    existing.hooks = [{ ...rows.hooks[0] }, { ...rows.hooks[0], id: "OLD_HOOK" }];
    const kept = diffTables(rows, existing, false);
    expect(kept.counts.hooks).toMatchObject({ unchanged: 1, not_in_pack: 1, removed: 0 });
    expect(kept.deletes.hooks).toEqual([]);
    const removed = diffTables(rows, existing, true);
    expect(removed.deletes.hooks).toEqual([{ id: "OLD_HOOK" }]);
  });
});

describe("remove rows not in this pack", async () => {
  const { packToRows, diffTables } = await import("../plan");
  const pack = (await import("../../../../content/packs/MTH12_09_02_01.seed.json")).default as never;
  const rows = packToRows(pack, []);
  const extra = { ...rows.hints[0]!, id: "HINT_EXTRA_OLD" };
  const existing = { ...rows, hints: [...rows.hints, extra] };
  it("off: counts the extra row but deletes nothing", () => {
    const d = diffTables(rows, existing, false);
    expect(d.counts.hints.not_in_pack).toBe(1);
    expect(d.deletes.hints).toHaveLength(0);
  });
  it("on: deletes exactly the extra row", () => {
    const d = diffTables(rows, existing, true);
    expect(d.counts.hints.removed).toBe(1);
    expect(d.deletes.hints).toEqual([{ id: "HINT_EXTRA_OLD" }]);
  });
  it("never removes topics, skills or misconceptions", () => {
    const d = diffTables(rows, { ...rows, skills: [...rows.skills, { ...rows.skills[0]!, id: "OLD-01" }] }, true);
    expect(d.deletes.skills ?? []).toHaveLength(0);
  });
});
