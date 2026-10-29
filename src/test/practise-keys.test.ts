import { describe, expect, it } from "vitest";
import { PRACTISE_KEYS, keyLabel } from "@/shared/practise-keys";

describe("practise keypad", () => {
  it("has every digit 0-9 and the letters x and y", () => {
    for (const k of ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "x", "y"]) expect(PRACTISE_KEYS).toContain(k);
  });
  it("keeps one key per job: no ÷ and no arrow keys, no duplicates", () => {
    expect(PRACTISE_KEYS).not.toContain("÷");
    expect(PRACTISE_KEYS).not.toContain("←");
    expect(new Set(PRACTISE_KEYS).size).toBe(PRACTISE_KEYS.length);
  });
  it("gives keys spoken names", () => {
    expect(keyLabel("7")).toBe("seven");
    expect(keyLabel("x")).toBe("x");
  });
});
