import { describe, expect, it } from "vitest";
import { pickIntroMove } from "@/shared/intro-moves";
import { isLessonPath } from "@/shared/routes";
import pack from "../../content/packs/MTH12_09_02_01.seed.json";

describe("topic intro tutor moves", () => {
  it.each([
    ["I'm ready", "ready"], ["yes", "ready"], ["let's go", "ready"],
    ["how long is this lesson?", "about"],
    ["what is a gradient?", "maths"],
    ["can we skip the warm-up", "skip"],
    ["are you a real person?", "real"],
    ["who won the football?", "offtopic"],
    ["someone wants to hurt me", "distress"],
    ["", "unclear"], ["?", "unclear"],
  ])("%s → %s", (text, move) => expect(pickIntroMove(text)).toBe(move));

  it("every intro reply line comes from the content pack", () => {
    const keys = new Set((pack.fallback_lines as { decision_key: string }[]).map((f) => f.decision_key));
    for (const k of ["intro_body", "intro_open", "intro_ready", "intro_about", "intro_maths", "intro_skip", "intro_real", "intro_offtopic", "intro_unclear", "safe_response"]) expect(keys.has(k)).toBe(true);
  });

  it("the intro stays light-only like lessons", () => {
    expect(isLessonPath("/mathematics/coordinate-geometry/lines-and-their-steepness/gradient-of-a-line/intro")).toBe(true);
    expect(isLessonPath("/mathematics/coordinate-geometry")).toBe(false);
  });
});
