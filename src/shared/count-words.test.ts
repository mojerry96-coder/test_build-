import { expect, it } from "vitest";
import { countWords } from "./count-words";
it("uses the singular for 1 and the plural otherwise", () => {
  expect(countWords(1, "skill")).toBe("1 skill");
  expect(countWords(3, "skill")).toBe("3 skills");
  expect(countWords(2, "question")).toBe("2 questions");
  expect(countWords(0, "question")).toBe("0 questions");
});
