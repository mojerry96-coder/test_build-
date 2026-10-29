import { describe, expect, it } from "vitest";
import { sameMap, withContinue } from "@/shared/continue-link";

const p = { subject: "mathematics", chapter: "c", quest: "q", topic: "t" };

describe("continue link", () => {
  it("a reply that opens a map gets a Continue button to it", () =>
    expect(withContinue([], p)).toEqual([{ label: "Continue learning", link: "/mathematics/c/q/t/path?from=chat" }]));
  it("no map, no button", () => expect(withContinue([], undefined)).toEqual([]));
  it("never adds a second link to the same map", () =>
    expect(withContinue([{ label: "x", link: "/mathematics/c/q/t/path" }], p)).toHaveLength(1));
  it("?from=chat does not make it a different map", () =>
    expect(sameMap("/a/b/c/d/path?from=chat", "/a/b/c/d/path")).toBe(true));
});
