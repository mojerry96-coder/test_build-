import { describe, expect, it } from "vitest";
import { countsAsShown, leadKey, pickWarmup, type EvidenceRow } from "./warmup";

const row = (o: Partial<EvidenceRow>): EvidenceRow => ({ id: "e", skill_id: "CALC-01", correct: true, strength: "strong", status: null,
  created_at: "2026-10-19T09:00:00Z", session_status: "completed", consent_basis: "student_login", ...o });

describe("warm-up skip rule", () => {
  it("counts a strong right answer from a real lesson", () => expect(countsAsShown(row({}), null)).toBe(true));
  it("counts a moderate right answer", () => expect(countsAsShown(row({ strength: "moderate" }), null)).toBe(true));
  it("counts a 'shown' row", () => expect(countsAsShown(row({ correct: null, strength: "none", status: "shown" }), null)).toBe(true));
  it("ignores weak or none strength", () => { expect(countsAsShown(row({ strength: "weak" }), null)).toBe(false); expect(countsAsShown(row({ strength: "none" }), null)).toBe(false); });
  it("ignores admin preview lessons", () => expect(countsAsShown(row({ consent_basis: "admin_preview" }), null)).toBe(false));
  it("ignores abandoned or restarted attempts", () => expect(countsAsShown(row({ session_status: "abandoned" }), null)).toBe(false));
  it("ignores evidence from before an admin Restart", () => expect(countsAsShown(row({}), "2026-10-19T10:00:00Z")).toBe(false));
  it("two skills shown leaves one question", () => expect(pickWarmup([{ id: "Q1", skillIds: ["A"] }, { id: "Q2", skillIds: ["B"] }, { id: "Q3", skillIds: ["C"] }], new Set(["A", "B"]))).toEqual(["Q3"]));
});

describe("warm-up lead-ins", () => {
  const all = ["Q1", "Q2", "Q3"];
  it("uses the document's lead-ins when all three are asked in order", () => expect([0, 1, 2].map((i) => leadKey(all, all, i))).toEqual(["doc", "doc", "doc"]));
  it("only question", () => expect(leadKey(["Q3"], all, 0)).toBe("only"));
  it("first and last of two", () => expect([0, 1].map((i) => leadKey(["Q2", "Q3"], all, i))).toEqual(["first", "last"]));
});
