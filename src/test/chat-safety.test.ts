import { readFileSync, readdirSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { answerWords, looksRaw, safeChatLines } from "@/shared/contracts/chat-safety";
import type { Script } from "@/shared/contracts/script";

const dir = `${process.cwd()}/content/packs`;
const scripts: { where: string; script: Script }[] = [];
const walk = (v: unknown, where: string) => {
  if (Array.isArray(v)) {
    if (v.length && v.every((x) => x && typeof x === "object" && typeof (x as { text?: unknown }).text === "string")) scripts.push({ where, script: v as Script });
    else v.forEach((x, i) => walk(x, `${where}[${i}]`));
  } else if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) walk(x, `${where}.${k}`);
};
for (const f of readdirSync(dir).filter((f) => f.endsWith(".json"))) walk(JSON.parse(readFileSync(`${dir}/${f}`, "utf8")), f);

const FALLBACK: Script = [{ text: "Here's the next question. Take your time." }];

describe("every starter-pack script renders in the chat without raw data", () => {
  it("found scripts to check", () => expect(scripts.length).toBeGreaterThan(20));
  for (const { where, script } of scripts) {
    // The engine fills placeholders before anything is shown, so check the filled words.
    const shown = script.map((l) => ({ ...l, text: l.text.replace(/\{(student_name|first_name|count|count_words|count_skills|remaining|remaining_questions|prediction|tutor_name|tasks|skill_name|role)\}/g, "Ada") }));
    it(where, () => expect(safeChatLines(shown, FALLBACK)).toEqual(shown));
  }
});

describe("raw item data never reaches the chat", () => {
  it("a raw structured answer is replaced by the fallback line", () => {
    const raw = JSON.stringify({ fields: { across_direction: "right", across_distance: 3 } });
    expect(safeChatLines([{ text: raw }], FALLBACK)).toEqual(FALLBACK);
  });
  it("field names without JSON are blocked too", () => expect(looksRaw("fields across_direction right")).toBe(true));
  it("a structured answer is put into on-screen words", () => {
    const item = { fields: [{ id: "across_direction", label: "Across", options: [{ id: "right", label: "Right" }] }, { id: "across_distance", label: "by", options: null }] };
    const words = answerWords({ fields: { across_direction: "right", across_distance: "3" } }, item);
    expect(words).toBe("Across Right, by 3");
    expect(looksRaw(words)).toBe(false);
  });
});
