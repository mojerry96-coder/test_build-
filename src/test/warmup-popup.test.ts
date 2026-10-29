import { describe, expect, it } from "vitest";
import pack from "../../content/packs/MTH12_09_02_01.seed.json";
import { AUTO_CLOSE_MS } from "@/components/lesson/WarmupPopup";

const line = (k: string) => (pack.fallback_lines as { decision_key: string; script: { text: string }[] }[]).find((f) => f.decision_key === k)?.script[0]?.text;
describe("warm-up popups", () => {
  it("closes the Good job popup by itself after 4 seconds", () => expect(AUTO_CLOSE_MS).toBe(4000));
  it("uses the seed titles and buttons from the pack", () => {
    expect(line("warmup_popup_right_title")).toBe("Good Job!");
    expect(line("warmup_popup_close_title")).toBe("You got close!");
    expect(line("warmup_fix_button")).toBe("Let's fix it");
    expect(line("warmup_popup_skip")).toBe("Skip for now");
    expect(line("warmup_skip_repair")).toBe("No problem, you can ask me about this any time.");
  });
  it("has its own feedback for every option of the three warm-up questions", () => {
    for (const id of ["READY_COORD_01", "READY_CALC_01", "READY_SUB_01"]) {
      const it = (pack.items as any[]).find((i) => i.id === id);
      for (const o of it.options) {
        const correct = it.key.correct_option_id === o.id;
        const fb = it.feedback.find((f: any) => f.trigger === (correct ? "correct" : `option:${o.id}`));
        const text = fb?.script.map((x: any) => x.text).join(" ") ?? "";
        expect(text.length).toBeGreaterThan(30);
      }
    }
  });
  it("splits each right answer into working lines then praise", () => {
    const want: Record<string, number> = { READY_COORD_01: 2, READY_CALC_01: 3, READY_SUB_01: 4 };
    for (const [id, n] of Object.entries(want)) {
      const it = (pack.items as any[]).find((i) => i.id === id);
      const fb = it.feedback.find((f: any) => f.trigger === "correct");
      expect(fb.script.filter((x: any) => x.role === "working")).toHaveLength(n);
      expect(fb.script.at(-1).role).toBe("praise");
    }
  });
});

import { pickWarmupMove } from "@/shared/intro-moves";
describe("typed messages during the warm-up", () => {
  it("asking for the answer gets the have-a-go line", () => expect(pickWarmupMove("just tell me the answer")).toBe("answer"));
  it("asking what it means gets the tip", () => expect(pickWarmupMove("what does this mean?")).toBe("help"));
  it("asking to skip gets the skip line", () => expect(pickWarmupMove("can I skip")).toBe("skip"));
});
