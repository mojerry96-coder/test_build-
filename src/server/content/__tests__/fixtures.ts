// Test-only fixture packs. Never imported into the database.
import { MOVES } from "@/shared/contracts/tutor";

const seg = (text: string) => [{ text, cues: [{ at_ms: 0, type: "board.write", args: {} }] }];

export function validPack(): any {
  return {
    pack_version: "test-1",
    topic: { id: "T_TEST", display_name: "Test topic", subject: "Maths", chapter: "C1", quest: "Q1" },
    skills: [{ id: "SK_PRE" , name: "Pre" }, { id: "SK_MAIN", name: "Main" }],
    topic_skills: [{ skill_id: "SK_PRE", role: "prerequisite" }, { skill_id: "SK_MAIN", role: "taught" }],
    misconceptions: [{ id: "MIS_A", skill_id: "SK_MAIN", label: "A", plain_words: "a" }],
    items: [
      {
        id: "VC1", step: "video", kind: "mcq", sequence: 1, skill_ids: ["SK_MAIN"], tags: {}, prompt: seg("Q"),
        options: [{ id: "a", label: "1" }, { id: "b", label: "2" }],
        key: { kind: "mcq", correct_option_id: "a" },
        feedback: [{ trigger: "option:b", misconception_id: "MIS_A", script: seg("no") }],
        escalation: { attempt_2: seg("e2"), attempt_3: seg("e3") },
        hints: [{ rung: 1, script: seg("h1") }, { rung: 2, script: seg("h2") }],
        config: { status: "seed" },
      },
      { id: "P1", step: "readiness", kind: "numeric", sequence: 1, skill_ids: ["SK_PRE"], tags: {}, prompt: seg("p"),
        key: { kind: "numeric", value: "2", accepted_forms: ["2.0"] } },
    ],
    repairs: [{ id: "REP_1", skill_id: "SK_PRE", micro_lesson: seg("r"), practice_item_id: "P1" }],
    hooks: [{ id: "HOOK_1", type: "prediction", script: seg("h"), asset_url: null, prediction: null, answered_by: null, close_script: seg("c"), is_active: true }],
    clips: [{ id: "CLIP_1", url_low: null, url_standard: null, captions_url: null, poster_url: null, checks: [{ at_seconds: 10, item_id: "VC1" }], skill_ids: ["SK_MAIN"], misconception_ids: [] }],
    simulations: [],
    fallback_lines: MOVES.map((m) => ({ id: `FB_${m.toUpperCase()}`, step: null, decision_key: m, script: seg("ok") })),
    rules: [{ key: "ai_timeout_ms", value: 4000 }],
  };
}

const lineWork = (wp: { line: string; misconception_id: string }) => ({
  id: "WS1", step: "worksheet", kind: "line_work", sequence: 1, skill_ids: ["SK_MAIN"], tags: {}, prompt: seg("w"),
  key: { kind: "line_work", final: "2", worked_solution: ["6 − 2 = 4", "4 ÷ 2 = 2"], accepted_methods: [["6 − 2 = 4", "4 ÷ 2 = 2"]], wrong_paths: [wp] },
});

/** One failing fixture per check (1..10). */
export const failing: Record<number, () => any> = {
  1: () => { const p = validPack(); delete p.topic.id; return p; },
  2: () => { const p = validPack(); p.items[1].skill_ids = ["SK_NOPE"]; return p; },
  3: () => { const p = validPack(); delete p.items[1].key; return p; },
  4: () => { const p = validPack(); p.items[0].feedback.push({ trigger: "option_d", misconception_id: null, script: [] }); return p; },
  5: () => { const p = validPack(); p.clips[0].checks.push({ at_seconds: 20, item_id: "P1" }); return p; },
  6: () => { const p = validPack(); p.items[0].hints = [{ rung: 1, script: [] }, { rung: 3, script: [] }]; return p; },
  7: () => { const p = validPack(); p.hooks.push({ ...p.hooks[0], id: "HOOK_2" }); return p; },
  8: () => { const p = validPack(); p.items[1].prompt = [{ text: "x", cues: [{ at_ms: 0, type: "dance" }] }]; return p; },
  9: () => { const p = validPack(); p.repairs[0].skill_id = "SK_MAIN"; return p; },
  10: () => { const p = validPack(); p.fallback_lines = p.fallback_lines.slice(1); return p; },
  11: () => { const p = validPack(); p.items.push(lineWork({ line: "15/5", misconception_id: "MIS_NOPE" })); return p; },
  12: () => { const p = validPack(); p.items.push(lineWork({ line: "4 ÷ 2 = 2", misconception_id: "MIS_A" })); return p; },
  13: () => { const p = validPack(); p.items[1].prompt = [{ text: "This one is easy." }]; return p; },
};
