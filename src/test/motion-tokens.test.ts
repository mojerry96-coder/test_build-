import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
const css = readFileSync(`${process.cwd()}/src/styles.css`, "utf8");
describe("motion and board tokens", () => {
  it("spring curves match the instruction", () => {
    expect(css).toContain("--spring: cubic-bezier(.34, 1.56, .64, 1)");
    expect(css).toContain("--spring-soft: cubic-bezier(.3, 1.3, .6, 1)");
  });
  it("rise is green, run is blue, triangle is soft yellow", () => {
    expect(css).toContain("--rise: #0A8754; --run: #0870B0; --tri: #FFF1B8;");
  });
  it("animations switch off with reduced motion", () => expect(css).toMatch(/prefers-reduced-motion: reduce\) \{\s*\.anim-spring-in/));
});
