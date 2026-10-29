import { describe, expect, it } from "vitest";
import { showStartPage, startBubble } from "@/shared/start-page";

describe("Ask Fiti start page", () => {
  it("shows when the conversation holds only Fiti's opening", () => {
    expect(showStartPage([{ role: "tutor" }], false)).toBe(true);
  });
  it("shows for an empty new conversation", () => expect(showStartPage([], false)).toBe(true));
  it("switches to the chat once she has sent a message", () => {
    expect(showStartPage([{ role: "tutor" }, { role: "student" }], false)).toBe(false);
  });
  it("switches to the chat as soon as she acts", () => expect(showStartPage([{ role: "tutor" }], true)).toBe(false));
  it("bubble is Fiti's latest line", () => {
    expect(startBubble([{ role: "tutor", id: 1 }, { role: "tutor", id: 2 }])).toEqual({ role: "tutor", id: 2 });
    expect(startBubble([])).toBeNull();
  });
});
