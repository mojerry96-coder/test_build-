import { describe, it, expect } from "vitest";
import { hideGraph } from "@/shared/question-numbers";
describe("hideGraph", () => {
  it("hides when the prompt gives the point", () => expect(hideGraph("Which quadrant is (3, 2) in?")).toBe(true));
  it("keeps the graph with no coordinates", () => expect(hideGraph("Read the gradient of the line")).toBe(false));
  it("keeps the graph when the tip names a point", () => expect(hideGraph("Which quadrant is (3, 2) in?", "Look at Point Q")).toBe(false));
});
