// Pure validation of a content pack. No database access; unit-tested.
import { ALLOWED_CUES } from "@/shared/contracts/script";
import { MOVES } from "@/shared/contracts/tutor";
import { isSystemSettingKey } from "@/shared/contracts/settings";
import { findBannedWords, DEFAULT_BANNED_WORDS } from "@/shared/contracts/banned-words";

export interface Issue {
  check: number | null; // 1..10, null for general/warnings
  group: string; // lesson step or section, e.g. "video", "hooks", "general"
  message: string;
}

export interface ValidationResult {
  errors: Issue[];
  warnings: Issue[];
  skippedSystemKeys: string[];
}

/* eslint-disable @typescript-eslint/no-explicit-any */
type Any = any;
const arr = (v: unknown): Any[] => (Array.isArray(v) ? v : []);
const ID_RE = /^[A-Z0-9_-]+$/;

function forEachScript(pack: Any, fn: (where: string, group: string, script: Any) => void) {
  for (const it of arr(pack.items)) {
    const g = it?.step ?? "items";
    fn(`Item ${it?.id}: prompt`, g, it?.prompt);
    if (it?.config?.opener) fn(`Item ${it.id}: readiness opener`, g, it.config.opener);
    arr(it?.feedback).forEach((f: Any, i: number) => fn(`Item ${it?.id}: feedback ${f?.trigger ?? i + 1}`, g, f?.script));
    if (it?.escalation) {
      fn(`Item ${it.id}: escalation attempt 2`, g, it.escalation.attempt_2);
      fn(`Item ${it.id}: escalation attempt 3`, g, it.escalation.attempt_3);
    }
    arr(it?.hints).forEach((h: Any) => fn(`Item ${it?.id}: hint rung ${h?.rung}`, g, h?.script));
    if (it?.explanation) fn(`Item ${it.id}: explanation`, g, it.explanation);
    if (it?.teach_me) {
      fn(`Item ${it.id}: teach me (model)`, g, it.teach_me.model);
      fn(`Item ${it.id}: teach me (together)`, g, it.teach_me.together);
    }
  }
  for (const h of arr(pack.hooks)) {
    fn(`Hook ${h?.id}: script`, "hook", h?.script);
    fn(`Hook ${h?.id}: close script`, "hook", h?.close_script);
  }
  for (const r of arr(pack.repairs)) {
    if (Array.isArray(r?.micro_lesson)) fn(`Repair ${r?.id}: micro lesson`, "repairs", r.micro_lesson);
    for (const [mis, sc] of Object.entries(r?.slip ?? {})) fn(`Repair ${r?.id}: slip line ${mis}`, "repairs", sc);
    if (r?.watch) fn(`Repair ${r?.id}: watch`, "repairs", r.watch.lines);
    if (r?.you_try?.intro) fn(`Repair ${r?.id}: you try intro`, "repairs", r.you_try.intro);
    if (r?.you_try?.done_summary) fn(`Repair ${r?.id}: done summary`, "repairs", r.you_try.done_summary);
    arr(r?.you_try?.steps).forEach((st: Any) => {
      for (const k of ["prompt", "hint", "full_line", "filled_line", "hint_question", "together_text"]) if (k in (st ?? {}) || ["prompt", "hint", "full_line", "filled_line"].includes(k)) fn(`Repair ${r?.id} step ${st?.id}: ${k}`, "repairs", st?.[k]);
    });
  }
  for (const s of arr(pack.simulations)) {
    arr(s?.tasks).forEach((t: Any) => {
      fn(`Simulation ${s?.id} task ${t?.id}: hint`, "simulation", t?.hint_script);
      fn(`Simulation ${s?.id} task ${t?.id}: completion`, "simulation", t?.completion_script);
    });
    arr(s?.opening_lines).forEach((o: Any) => fn(`Simulation ${s?.id}: opening line for ${o?.misconception_id}`, "simulation", o?.script));
    if (s?.closing) {
      for (const k of ["did_well", "watch", "hook_link"]) fn(`Simulation ${s.id}: closing ${k}`, "simulation", s.closing[k]);
      if (s.closing.closing_line) fn(`Simulation ${s.id}: closing line`, "simulation", s.closing.closing_line);
      for (const [m, sc] of Object.entries(s.closing.watch_by ?? {})) fn(`Simulation ${s.id}: closing watch for ${m}`, "simulation", sc);
    }
  }
  for (const f of arr(pack.fallback_lines)) fn(`Fallback line ${f?.id}`, f?.step ?? "fallback lines", f?.script);
}

/** "option:d", "option_d" or "d" -> "d". */
export function optionOf(trigger: string): string {
  return trigger.replace(/^option[:_]/, "");
}

export function validatePack(pack: Any): ValidationResult {
  const errors: Issue[] = [];
  const warnings: Issue[] = [];
  const err = (check: number | null, group: string, message: string) => errors.push({ check, group, message });
  const warn = (group: string, message: string) => warnings.push({ check: null, group, message });

  if (!pack || typeof pack !== "object" || Array.isArray(pack)) {
    err(null, "general", "The file is not a content pack (expected one JSON object).");
    return { errors, warnings, skippedSystemKeys: [] };
  }
  if (!pack.pack_version || typeof pack.pack_version !== "string") err(null, "general", "pack_version is missing.");

  const items = arr(pack.items);
  const itemById = new Map<string, Any>();
  for (const it of items) {
    if (!it?.id) { err(null, it?.step ?? "items", "An item has no id."); continue; }
    if (itemById.has(it.id)) err(null, it.step ?? "items", `Item ${it.id}: the id is used more than once.`);
    if (!ID_RE.test(it.id)) warn(it.step ?? "items", `Item ${it.id}: ids should be capitals, digits and underscores.`);
    itemById.set(it.id, it);
  }

  // 1. topic id present and every row references this topic
  const topicId = pack.topic?.id;
  if (!topicId) err(1, "general", "topic.id is missing.");
  for (const section of ["items", "repairs", "hooks", "clips", "simulations", "fallback_lines"]) {
    for (const row of arr(pack[section])) {
      if (row && typeof row === "object" && "topic_id" in row && row.topic_id !== topicId) {
        err(1, section, `${section} ${row.id}: refers to topic ${row.topic_id}, but this pack is for topic ${topicId}.`);
      }
    }
  }

  // 2. skill and misconception ids exist in the library
  const skills = new Set(arr(pack.skills).map((s: Any) => s?.id));
  const mis = new Set(arr(pack.misconceptions).map((m: Any) => m?.id));
  const needSkill = (id: string, where: string, group: string) => { if (!skills.has(id)) err(2, group, `${where}: refers to skill ${id}, which is not in the pack's skill list.`); };
  const needMis = (id: string | null | undefined, where: string, group: string) => { if (id && id !== "default" && !mis.has(id)) err(2, group, `${where}: refers to misconception ${id}, which is not in the pack's misconception list.`); };
  arr(pack.topic_skills).forEach((ts: Any) => needSkill(ts?.skill_id, "Topic skill list", "general"));
  arr(pack.misconceptions).forEach((m: Any) => { if (m?.skill_id) needSkill(m.skill_id, `Misconception ${m.id}`, "general"); });
  for (const it of items) {
    const g = it.step ?? "items";
    if (arr(it.skill_ids).length === 0) err(2, g, `Item ${it.id}: has no skill_ids (at least one is needed).`);
    arr(it.skill_ids).forEach((s: string) => needSkill(s, `Item ${it.id}`, g));
    arr(it.feedback).forEach((f: Any) => needMis(f?.misconception_id, `Item ${it.id}: feedback ${f?.trigger}`, g));
  }
  arr(pack.clips).forEach((c: Any) => {
    arr(c?.skill_ids).forEach((s: string) => needSkill(s, `Clip ${c.id}`, "video"));
    arr(c?.misconception_ids).forEach((m: string) => needMis(m, `Clip ${c.id}`, "video"));
  });
  arr(pack.repairs).forEach((r: Any) => needSkill(r?.skill_id, `Repair ${r?.id}`, "repairs"));
  arr(pack.simulations).forEach((s: Any) => arr(s?.opening_lines).forEach((o: Any) => needMis(o?.misconception_id, `Simulation ${s.id}: opening line`, "simulation")));

  // 3. every non-prediction item has a key; 4. option ids exist
  for (const it of items) {
    const g = it.step ?? "items";
    if (it.kind !== "prediction" && !it.key) err(3, g, `Item ${it.id}: has no answer key (every ${it.kind} item needs one).`);
    if (it.kind === "mcq") {
      const opts = new Set(arr(it.options).map((o: Any) => o?.id));
      if (it.key && !opts.has(it.key.correct_option_id)) err(4, g, `Item ${it.id}: the key says option ${it.key.correct_option_id} is correct, which does not exist on this item.`);
      arr(it.feedback).forEach((f: Any) => {
        const trig = String(f?.trigger ?? "");
        if (trig === "other" || trig === "correct") return;
        const optId = optionOf(trig);
        if (!trig.startsWith("option:")) warn(g, `Item ${it.id}: feedback trigger '${trig}' should be written 'option:${optId}'`);
        if (!opts.has(optId)) {
          err(4, g, `Item ${it.id}: feedback refers to option ${optId}, which does not exist on this item.`);
        }
      });
      const mapped = new Set(arr(it.feedback).filter((f: Any) => f?.misconception_id).map((f: Any) => optionOf(String(f.trigger))));
      for (const o of arr(it.options)) {
        if (it.key && o?.id !== it.key.correct_option_id && !mapped.has(o?.id)) warn(g, `Item ${it.id}: wrong option ${o?.id} has no misconception tag.`);
      }
    }
  }

  // 5. clip check items exist and are video items
  const videoChecks = new Set<string>();
  arr(pack.clips).forEach((c: Any) => arr(c?.checks).forEach((ch: Any) => {
    const it = itemById.get(ch?.item_id);
    if (!it) err(5, "video", `Clip ${c.id}: check at ${ch?.at_seconds}s refers to item ${ch?.item_id}, which does not exist.`);
    else if (it.step !== "video") err(5, "video", `Clip ${c.id}: check at ${ch?.at_seconds}s uses item ${ch.item_id}, but that item is in step ${it.step}, not video.`);
    else videoChecks.add(it.id);
  }));

  // 6. hint rungs 1..n without gaps (max 4); video checks have escalation 2 and 3
  for (const it of items) {
    const g = it.step ?? "items";
    const rungs = arr(it.hints).map((h: Any) => h?.rung).sort((a: number, b: number) => a - b);
    if (rungs.length) {
      const ok = rungs.every((r: number, i: number) => r === i + 1) && rungs.length <= 4;
      if (!ok) err(6, g, `Item ${it.id}: hint rungs are ${rungs.join(", ")}; they must run 1 to 4 with no gaps or repeats.`);
    }
    if ((it.step === "video" || videoChecks.has(it.id)) && (!it.escalation?.attempt_2 || !it.escalation?.attempt_3)) {
      err(6, g, `Item ${it.id}: video check needs escalation attempt_2 and attempt_3.`);
    }
  }

  // 11-12. wrong paths: misconceptions exist; not equal to any correct line
  const norm = (x: unknown) => String(x ?? "").replace(/\s+/g, "").replace(/[−–]/g, "-").toLowerCase();
  for (const it of items) {
    const g = it.step ?? "items";
    const wps = arr(it.key?.wrong_paths);
    if (wps.length && it.kind !== "line_work" && it.kind !== "theory") err(11, g, `Item ${it.id}: wrong_paths are only allowed on line_work and theory items.`);
    const good = new Set([...arr(it.key?.worked_solution), ...arr(it.key?.accepted_methods).flat()].map(norm));
    wps.forEach((wp: Any) => {
      if (!wp?.misconception_id || !mis.has(wp.misconception_id)) err(11, g, `Item ${it.id}: wrong path "${wp?.line}" refers to misconception ${wp?.misconception_id}, which is not in the pack's misconception list.`);
      // Arithmetic questions expose operands, not their evaluated result.
      const note = norm(String(wp?.note ?? "").replace(/[−-]?\d+(?:\s+[−+*/÷]\s+[−-]?\d+)+/g, ""));
      const protectedValues = [it.key?.final, ...arr(it.key?.worked_solution).flatMap((line: unknown) => String(line).split("=").slice(1))].filter(Boolean).map(norm);
      if (protectedValues.some((value: string) => new RegExp(`(?<![0-9])${value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![0-9])`).test(note))) err(12, g, `Item ${it.id}: amber feedback must not reveal an answer or worked-solution value.`);
      if (good.has(norm(wp?.line))) err(12, g, `Item ${it.id}: wrong path "${wp?.line}" is the same as a line in the worked solution or an accepted method.`);
    });
  }

  // 7. exactly one active hook
  const active = arr(pack.hooks).filter((h: Any) => h?.is_active);
  if (active.length !== 1) err(7, "hook", `There must be exactly one active hook; this pack has ${active.length}.`);

  // 8. cue types allowed
  const allowed = new Set<string>(ALLOWED_CUES);
  forEachScript(pack, (where, group, script) => {
    arr(script).forEach((seg: Any, i: number) => arr(seg?.cues).forEach((c: Any) => {
      if (!allowed.has(c?.type)) err(8, group, `${where}, segment ${i + 1}: cue type "${c?.type}" is not allowed.`);
    }));
  });

  // 13. banned words in any tutor script (not in parent-facing plain_words)
  const bannedRule = arr(pack.rules).find((x: Any) => x?.key === "banned_words");
  const banned: string[] = Array.isArray(bannedRule?.value) ? bannedRule.value : [...DEFAULT_BANNED_WORDS];
  forEachScript(pack, (where, group, script) => {
    arr(script).forEach((seg: Any, i: number) => {
      const hits = [...new Set([...findBannedWords(String(seg?.text ?? ""), banned), ...findBannedWords(String(seg?.speakable ?? ""), banned)])];
      if (hits.length) err(13, group, `${where}, segment ${i + 1}: uses the banned word${hits.length > 1 ? "s" : ""} "${hits.join('", "')}". Suggestions: "wrong" → "not quite" or "let's check"; "easy" → remove or "you can do this"; "obviously" → remove.`);
    });
  });

  // 9. repair skill is a prerequisite; practice item exists
  const prereq = new Set(arr(pack.topic_skills).filter((t: Any) => t?.role === "prerequisite").map((t: Any) => t.skill_id));
  arr(pack.repairs).forEach((r: Any) => {
    if (!prereq.has(r?.skill_id)) err(9, "repairs", `Repair ${r?.id}: skill ${r?.skill_id} is not a prerequisite skill of this topic.`);
    if (!itemById.has(r?.practice_item_id)) err(9, "repairs", `Repair ${r?.id}: practice item ${r?.practice_item_id} does not exist.`);
    for (const m of Object.keys(r?.slip ?? {})) if (m !== "default" && !mis.has(m)) err(9, "repairs", `Repair ${r?.id}: slip line for unknown misconception ${m}.`);
    arr(r?.you_try?.steps).forEach((st: Any) => { if (st?.answer == null || st.answer === "") err(9, "repairs", `Repair ${r?.id} step ${st?.id}: no answer.`); });
    arr(r?.you_try?.steps).forEach((st: Any) => {
      if (st?.input !== "point") return;
      const g = st.grid, m = /^(\d+),(\d+)$/.exec(String(st.answer ?? ""));
      if (!g || !Number.isInteger(g.x_max) || !Number.isInteger(g.y_max)) err(9, "repairs", `Repair ${r?.id} step ${st?.id}: a place-the-point step needs grid.x_max and grid.y_max.`);
      else if (!m || Number(m[1]) > g.x_max || Number(m[2]) > g.y_max) err(9, "repairs", `Repair ${r?.id} step ${st?.id}: answer must be "x,y" inside the grid.`);
    });
  });

  // 10. a global (step = null) fallback line for every decision key
  const globalKeys = new Set(arr(pack.fallback_lines).filter((f: Any) => f?.step == null).map((f: Any) => f.decision_key));
  const missing = MOVES.filter((m) => !globalKeys.has(m));
  if (missing.length) err(10, "fallback lines", `Missing a global fallback line (step empty) for: ${missing.join(", ")}.`);

  // Protected system settings: skipped with a warning
  const skippedSystemKeys: string[] = [];
  arr(pack.rules).forEach((r: Any) => {
    if (isSystemSettingKey(r?.key)) {
      skippedSystemKeys.push(r.key);
      warn("rules", `Rule ${r.key} is a protected system setting and was skipped. Only an admin can change it.`);
    }
  });

  return { errors, warnings, skippedSystemKeys };
}

/** Group issues for display: { group: messages[] }. */
export function groupIssues(list: Issue[]): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const i of list) (out[i.group] ??= []).push(i.message);
  return out;
}
