import { describe, expect, it } from "vitest";
import { spokenForm } from "@/shared/spoken-form";

describe("spokenForm", () => {
  it("reads board maths as words", () => {
    expect(spokenForm("First, calculate 6 − 2 = 4.")).toBe("First, calculate 6 minus 2 equals 4.");
    expect(spokenForm("(6 − 2) ÷ (5 − 3)")).toBe("(6 minus 2) divided by (5 minus 3)");
    expect(spokenForm("m = 6/2 = 3")).toBe("m equals 6 over 2 equals 3");
    expect(spokenForm("Start at −3")).toBe("Start at negative 3");
    expect(spokenForm("x^2")).toBe("x squared");
  });
  it("leaves plain words alone", () => {
    expect(spokenForm("Well-done, let's go!")).toBe("Well-done, let's go!");
  });
});
