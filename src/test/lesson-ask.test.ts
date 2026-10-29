import { describe, expect, it } from "vitest";
import { askLocked } from "@/shared/lesson-ask";

describe("lesson ask box", () => {
  it("locks on the exit ticket", () => expect(askLocked("exit_ticket")).toBe(true));
  it("locks when the teacher pauses", () => expect(askLocked("worksheet", "paused")).toBe(true));
  it("stays open on other steps", () => expect(askLocked("worksheet", "active")).toBe(false));
});
