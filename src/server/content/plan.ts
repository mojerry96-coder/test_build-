// Pure: turn a validated pack into rows per table, and diff against existing rows.
/* eslint-disable @typescript-eslint/no-explicit-any */
type Any = any;
const arr = (v: unknown): Any[] => (Array.isArray(v) ? v : []);
const n = <T,>(v: T | undefined): T | null => (v === undefined ? null : v);

export type Row = Record<string, unknown>;

/** Upsert order (parents first). Deletes run in the reverse order. */
export const TABLES = [
  "topics", "skills", "misconceptions", "topic_skills", "items", "item_keys", "feedback", "escalations", "hints",
  "repairs", "hooks", "clips", "clip_checks", "simulations", "sim_tasks", "fallback_lines", "rules", "scripts",
] as const;
export type Table = (typeof TABLES)[number];

export const CONFLICT: Record<Table, string[]> = {
  topics: ["id"], skills: ["id"], misconceptions: ["id"], topic_skills: ["topic_id", "skill_id"], items: ["id"],
  item_keys: ["item_id"], feedback: ["id"], escalations: ["id"], hints: ["id"], repairs: ["id"], hooks: ["id"],
  clips: ["id"], clip_checks: ["clip_id", "item_id"], simulations: ["id"], sim_tasks: ["id"], fallback_lines: ["id"],
  rules: ["key", "topic_id"], scripts: ["id"],
};

/** Library tables shared across topics: never removed by an import. */
export const NEVER_REMOVE: Table[] = ["topics", "skills", "misconceptions"];

export const rowKey = (t: Table, r: Row) => CONFLICT[t].map((c) => String(r[c] ?? "∅")).join("|");

export function packToRows(pack: Any, skipKeys: string[], existingTopic?: Row | null): Record<Table, Row[]> {
  const topicId = pack.topic.id as string;
  const out = Object.fromEntries(TABLES.map((t) => [t, [] as Row[]])) as Record<Table, Row[]>;
  const T = pack.topic;
  out.topics.push({
    id: topicId, display_name: T.display_name, subject: n(T.subject), chapter: n(T.chapter), quest: n(T.quest),
    is_active: (existingTopic?.["is_active"] as boolean | undefined) ?? true,
    created_at: existingTopic?.["created_at"] ?? new Date().toISOString(),
  });
  arr(pack.skills).forEach((s) => out.skills.push({ id: s.id, name: s.name, description: n(s.description) }));
  arr(pack.misconceptions).forEach((m) => out.misconceptions.push({ id: m.id, skill_id: n(m.skill_id), label: m.label, plain_words: n(m.plain_words) }));
  arr(pack.topic_skills).forEach((ts) => out.topic_skills.push({ topic_id: topicId, skill_id: ts.skill_id, role: ts.role }));

  // Every tutor script outside items' prompts goes to the server-only scripts table.
  const hide = (owner_table: string, owner_id: string, field: string, script: unknown) =>
    out.scripts.push({ id: `${owner_table}:${owner_id}:${field}`, owner_table, owner_id, field, topic_id: topicId, script: script ?? [] });

  for (const it of arr(pack.items)) {
    const { opener, ...config } = it.config ?? {};
    if (opener) hide("items", it.id, "opener", opener);
    out.items.push({
      id: it.id, topic_id: topicId, step: it.step, kind: it.kind, sequence: it.sequence ?? 0, prompt: it.prompt ?? [],
      options: n(it.options), fields: n(it.fields), skill_ids: it.skill_ids ?? [], tags: it.tags ?? {}, config,
    });
    if (it.key) {
      const { accepted_forms, worked_solution, accepted_methods, marking_guide, wrong_paths, ...answer } = it.key;
      out.item_keys.push({
        item_id: it.id, answer, accepted_forms: n(accepted_forms), worked_solution: n(worked_solution),
        accepted_methods: n(accepted_methods), marking_guide: n(marking_guide), wrong_paths: n(wrong_paths),
      });
    }
    arr(it.feedback).forEach((f) => out.feedback.push({
      id: `${it.id}__FB__${f.trigger}`, item_id: it.id, trigger: f.trigger, misconception_id: n(f.misconception_id), script: f.script ?? [],
    }));
    if (it.escalation) {
      out.escalations.push({ id: `${it.id}__E2`, item_id: it.id, attempt: 2, script: it.escalation.attempt_2 ?? [] });
      out.escalations.push({ id: `${it.id}__E3`, item_id: it.id, attempt: 3, script: it.escalation.attempt_3 ?? [] });
    }
    // teach_me (worksheet model + together) can contain a solution, so it goes to the server-only scripts table.
    if (it.teach_me) {
      hide("items", it.id, "teach_me_model", it.teach_me.model);
      hide("items", it.id, "teach_me_together", it.teach_me.together);
    }
    if (it.explanation) out.hints.push({ id: `${it.id}__H0`, item_id: it.id, rung: 0, script: it.explanation });
    arr(it.hints).forEach((h) => out.hints.push({ id: `${it.id}__H${h.rung}`, item_id: it.id, rung: h.rung, script: h.script ?? [] }));
  }
  arr(pack.repairs).forEach((r) => {
    out.repairs.push({ id: r.id, topic_id: topicId, skill_id: r.skill_id, micro_lesson: [], practice_item_id: n(r.practice_item_id) });
    // Slip lines, the worked example and the you-try steps (with their answers) are all server-only.
    if (r.micro_lesson) hide("repairs", r.id, "micro_lesson", r.micro_lesson);
    if (r.slip) hide("repairs", r.id, "slip", r.slip);
    if (r.watch) hide("repairs", r.id, "watch", r.watch);
    if (r.you_try) hide("repairs", r.id, "you_try", r.you_try);
  });
  arr(pack.hooks).forEach((h) => {
    out.hooks.push({
      id: h.id, topic_id: topicId, type: h.type, script: h.script ?? [], asset_url: n(h.asset_url), prediction: n(h.prediction),
      answered_by: n(h.answered_by), close_script: [], is_active: !!h.is_active,
    });
    hide("hooks", h.id, "close_script", h.close_script);
  });
  arr(pack.clips).forEach((c) => {
    out.clips.push({
      id: c.id, topic_id: topicId, url_low: n(c.url_low), url_standard: n(c.url_standard), captions_url: n(c.captions_url),
      poster_url: n(c.poster_url), title: n(c.title), duration_s: c.duration_s ?? null, segments: c.segments ?? [], captions: c.captions ?? [], flow: c.flow ?? [], skill_ids: c.skill_ids ?? [], misconception_ids: c.misconception_ids ?? [],
    });
    arr(c.checks).forEach((ch) => out.clip_checks.push({ clip_id: c.id, at_seconds: ch.at_seconds, item_id: ch.item_id }));
  });
  arr(pack.simulations).forEach((s) => {
    out.simulations.push({ id: s.id, topic_id: topicId, band: s.band, url: n(s.url), init: s.init ?? {}, opening_lines: [], closing: {} });
    hide("simulations", s.id, "opening_lines", s.opening_lines);
    hide("simulations", s.id, "closing", s.closing ?? {});
    arr(s.tasks).forEach((t) => {
      out.sim_tasks.push({ id: t.id, simulation_id: s.id, sequence: t.sequence ?? 0, goal: t.goal, hint_script: null, completion_script: null, required: t.required ?? true });
      if (t.hint_script) hide("sim_tasks", t.id, "hint_script", t.hint_script);
      if (t.completion_script) hide("sim_tasks", t.id, "completion_script", t.completion_script);
    });
  });
  arr(pack.fallback_lines).forEach((f) => out.fallback_lines.push({
    id: f.id, topic_id: topicId, step: n(f.step), decision_key: f.decision_key, script: f.script ?? [], audio_url: n(f.audio_url),
  }));
  arr(pack.rules).filter((r) => !skipKeys.includes(r.key)).forEach((r) => out.rules.push({ key: r.key, topic_id: topicId, value: r.value, description: n(r.description) }));
  return out;
}

function stable(v: unknown): string {
  if (v === undefined || v === null) return "null";
  if (Array.isArray(v)) return `[${v.map(stable).join(",")}]`;
  if (typeof v === "object") {
    return `{${Object.keys(v as object).sort().map((k) => `${JSON.stringify(k)}:${stable((v as Any)[k])}`).join(",")}}`;
  }
  if (typeof v === "number") return String(v);
  if (typeof v === "string" && /^-?\d+(\.\d+)?$/.test(v)) return String(Number(v));
  return JSON.stringify(v);
}

export interface TableCounts { added: number; updated: number; unchanged: number; removed: number; not_in_pack: number }

export function diffTables(packRows: Record<Table, Row[]>, existing: Record<Table, Row[]>, removeMissing: boolean) {
  const counts = {} as Record<Table, TableCounts>;
  const deletes = {} as Record<Table, Row[]>;
  const upserts = {} as Record<Table, Row[]>;
  for (const t of TABLES) {
    const ex = new Map(existing[t].map((r) => [rowKey(t, r), r]));
    const c: TableCounts = { added: 0, updated: 0, unchanged: 0, removed: 0, not_in_pack: 0 };
    upserts[t] = [];
    const seen = new Set<string>();
    for (const r of packRows[t]) {
      const k = rowKey(t, r);
      seen.add(k);
      const old = ex.get(k);
      if (!old) { c.added++; upserts[t].push(r); continue; }
      const same = Object.keys(r).every((col) => stable(r[col]) === stable(old[col]));
      if (same) c.unchanged++; else { c.updated++; upserts[t].push(r); }
    }
    deletes[t] = [];
    if (!NEVER_REMOVE.includes(t)) {
      for (const [k, r] of ex) if (!seen.has(k)) {
        c.not_in_pack++;
        if (removeMissing) { c.removed++; deletes[t].push(Object.fromEntries(CONFLICT[t].map((col) => [col, r[col]]))); }
      }
    }
    counts[t] = c;
  }
  return { counts, deletes, upserts };
}

/** Operations for apply_content_pack: deletes children-first, then upserts parents-first. */
export function buildOps(deletes: Record<Table, Row[]>, upserts: Record<Table, Row[]>) {
  const ops: { table: Table; conflict: string[]; rows: Row[]; delete: Row[] }[] = [];
  for (const t of [...TABLES].reverse()) if (deletes[t].length) ops.push({ table: t, conflict: CONFLICT[t], rows: [], delete: deletes[t] });
  for (const t of TABLES) if (upserts[t].length) ops.push({ table: t, conflict: CONFLICT[t], rows: upserts[t], delete: [] });
  return ops;
}

export const countSeed = (pack: Any) => arr(pack.items).filter((i) => i?.config?.status === "seed").length;
