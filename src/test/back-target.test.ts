import { describe, expect, it } from "vitest";
import { backTarget } from "@/shared/back-target";

describe("backTarget", () => {
  it("trip started in chat goes to chat", () => expect(backTarget(true)).toBe("chat"));
  it("map opened with ?from=chat goes to chat", () => expect(backTarget(false, true)).toBe("chat"));
  it("trip from Learning Hub goes up one level", () => expect(backTarget(false)).toBe("up"));
});
