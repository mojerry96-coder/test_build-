import { describe, expect, it } from "vitest";
import { badgeText, newSince, previewLine } from "./tutor-collapse";

describe("collapsed tutor badge", () => {
  it("counts only tutor messages posted since collapsing", () => expect(newSince(7, 4)).toBe(3));
  it("never goes below zero", () => expect(newSince(2, 5)).toBe(0));
  it("is hidden at 0", () => expect(badgeText(0)).toBeNull());
  it("shows the number up to 9", () => expect(badgeText(9)).toBe("9"));
  it("shows 9+ above 9", () => expect(badgeText(10)).toBe("9+"));
});

describe("collapsed tutor preview", () => {
  it("keeps a short line as is", () => expect(previewLine("Need a hint?")).toBe("Need a hint?"));
  it("trims to about 60 characters and ends with …", () => {
    const p = previewLine("Let's inspect some roads together. Count the rise and the run on each one carefully.");
    expect(p.endsWith("…")).toBe(true);
    expect(p.length).toBeLessThanOrEqual(61);
  });
  it("uses only the first line", () => expect(previewLine("First line\nSecond line")).toBe("First line"));
});
