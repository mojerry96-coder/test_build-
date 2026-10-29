import { describe, expect, it } from "vitest";
import { summarize } from "@/server/home/conversations";

const c = (id: string, updated: string, created = updated, title: string | null = null) => ({ id, title, updated_at: updated, created_at: created });
const m = (conv: string, text: string, at = "2026-10-20T10:00:00Z", role = "student") => ({ conversation_id: conv, role, text, created_at: at });

describe("chat history list", () => {
  it("newest first, titled by her first message", () => {
    const r = summarize([c("a", "2026-10-20T10:00:00Z"), c("b", "2026-10-21T10:00:00Z")], [m("a", "Gradients please"), m("b", "Quiz me"), m("b", "later", "2026-10-21T11:00:00Z")]);
    expect(r.map((x) => [x.id, x.title])).toEqual([["b", "Quiz Me"], ["a", "Gradients Please"]]);
  });
  it("hides chats she never wrote in", () => {
    expect(summarize([c("a", "2026-10-20T10:00:00Z")], [m("a", "Hello!", undefined, "tutor")])).toEqual([]);
  });
  it("keeps chats from before Start again", () => {
    const r = summarize([c("old", "2026-10-25T10:00:00Z", "2026-10-19T10:00:00Z"), c("new", "2026-10-24T10:00:00Z", "2026-10-23T10:00:00Z")], [m("old", "x"), m("new", "y")]);
    expect(r.map((x) => x.id)).toEqual(["old", "new"]);
  });
});

import { chatTitle, firstMessageTitle, checkChatTitle } from "@/server/home/conversations";
const s = (text: string, meta = {}) => ({ role: "student", text, meta });
const t = (meta: Record<string, unknown>) => ({ role: "tutor", text: "…", meta });

describe("chat titles", () => {
  it("an opened topic beats a greeting", () =>
    expect(chatTitle([s("hello fiti"), t({ outcome: "listed" }), s("Lines and Their Steepness", { option: 1 }), t({ outcome: "opened", action: "open_option" })])).toBe("Lines and Their Steepness"));
  it("a quiz is named after its topic", () => expect(chatTitle([s("quiz me"), t({ outcome: "quiz_built", topicTitle: "Gradient" })])).toBe("Quiz: Gradient"));
  it("plan chats are My Study Plan", () => expect(chatTitle([s("show my plan"), t({ intent: "view_plan", outcome: "plan" })])).toBe("My Study Plan"));
  it("first-time talk is Getting to Know Fiti", () => expect(chatTitle([t({ intent: "onboard", outcome: "onboard_feeling" })])).toBe("Getting to Know Fiti"));
  it("greetings are skipped for the first-message title", () => expect(firstMessageTitle([s("hello fiti"), s("i want to learn math")])).toBe("I Want to Learn Math"));
  it("AI title with a banned word is rejected", () => expect(checkChatTitle("Easy Gradient Help", "help me")).toBe(false));
  it("AI title with a number she didn't type is rejected", () => expect(checkChatTitle("Gradient of 3", "what is a gradient")).toBe(false));
  it("a clean AI title is kept", () => expect(checkChatTitle("What Is a Gradient?", "what is a gradient")).toBe(true));
});
