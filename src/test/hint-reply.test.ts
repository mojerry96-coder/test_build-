import { describe, it, expect } from "vitest";
import { hintReply, isClearTip } from "@/server/lesson/hint-reply";

const stepTip = [{ text: "What is 5 take away 3?" }];
const tip = [{ text: "Work out the top first, then the bottom." }];
const tryLine = [{ text: "Have a go!" }];
describe("Hint button reply", () => {
  it("uses the checked AI tip when it is one clear action", () =>
    expect(hintReply("Start with the top: what is 6 take away 2?", [tip], tryLine)[0]!.text).toMatch(/^Start with the top/));
  it("rejects screen instructions like 'Watch each step... tap Your turn'", () => {
    expect(isClearTip("Watch each step. When you're ready, tap Your turn and I'll help you.")).toBe(false);
    expect(hintReply("Watch each step, then tap Your turn.", [tip], tryLine)).toEqual(tip);
  });
  it("rejects long or multi-sentence tips", () =>
    expect(isClearTip("Look at the top. Then look at the bottom. Then divide them both carefully.")).toBe(false));
  it("falls back to the step tip first, then the question tip", () => {
    expect(hintReply(null, [stepTip, tip], tryLine)).toEqual(stepTip);
    expect(hintReply(null, [[], tip], tryLine)).toEqual(tip);
  });
});
