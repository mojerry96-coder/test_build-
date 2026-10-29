import { describe, expect, it } from "vitest";
import { splitSpoken } from "@/shared/spoken-split";
import { collectHashes, hashText } from "@/server/providers/voice-ledger.server";

const LONG = "Graphs it is. Here's how I teach: I ask before I tell, I give hints instead of answers, and you always do the last step. The gradient is 0.5 here, e.g. a gentle slope. Ready?";

describe("splitSpoken", () => {
  it("gives a long line a short first piece so he starts fast", () => {
    const l = "Maths feels hard for you right now, and that can be frustrating. You deserve patience and support as you prepare for WAEC. Which part feels hardest?";
    const p = splitSpoken(l);
    expect(p[0]).toBe("Maths feels hard for you right now,");
    expect(p.join(" ")).toBe(l);
  });
  it("keeps short lines whole", () => {
    expect(splitSpoken("Well done! The gradient is 3.")).toEqual(["Well done! The gradient is 3."]);
  });
  it("splits long lines at sentence ends, not inside 0.5 or e.g.", () => {
    const p = splitSpoken(LONG);
    expect(p.length).toBeGreaterThan(1);
    expect(p.join(" ")).toBe(LONG);
    expect(p.some((s) => s.includes("0.5 here, e.g. a gentle slope."))).toBe(true);
  });
  it("the voice ledger notes each part of a shown line", () => {
    const h = collectHashes({ text: LONG });
    for (const part of splitSpoken(LONG)) expect(h.has(hashText(part))).toBe(true);
  });
});
