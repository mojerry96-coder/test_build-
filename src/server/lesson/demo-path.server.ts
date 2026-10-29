import { hintReply } from "./hint-reply";
import { countWords } from "@/shared/count-words";
import { parsePoint, pointMatches } from "@/server/maths/point";
import { shownSkills } from "./shown-skills.server";
import { answerWords, looksRaw } from "@/shared/contracts/chat-safety";
// TEMPORARY demo path: a fixed walk through the 8 steps using the starter pack.
// The Phase 2 lesson engine replaces this module; the screen contract stays the same.
// Uses the admin client only after the caller is confirmed as the session's student.
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/integrations/supabase/types";
import { LESSON_STEPS, type Band, type LessonStep } from "@/shared/contracts/enums";
import type { Script } from "@/shared/contracts/script";
import type {
  CheckResult, CloseSummary, ItemResult, LessonView, LineResult, ViewItem, ViewSimTask,
} from "@/shared/contracts/lesson";
import { answerMatches, checkItemLine, checkLine, evaluate, fracEq, normalise, type Frac } from "@/server/maths/evaluate";

import { chooseBandFrom, defaultBandOf, classifyQuestion, mayTeach, mayAdvance, publicTaskId, settleSimResult, toViewSimTasks } from "./policy";
import { replyAllowed } from "@/server/checks/reply";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Db = SupabaseClient<Database>;
type Any = any;

type DemoState = {
  pos: { step: LessonStep; index: number };
  attempts: Record<string, number>;
  results: Record<string, ItemResult>;
  hints: Record<string, number>;
  band: Band | null;
  prediction: string | null;
  pendingRepair: string | null;
  lines: Record<string, string[]>;
  simDone: string[];
  simSaved?: Record<string, import("@/shared/contracts/simulation").NativeSimAnswer>;
  /** Misconceptions shown in the simulation, counted (closing "one thing to watch"). */
  simMis?: Record<string, number>;
  /** Gradient Lab: her last values per task and whether the built-in board replaced the lab (and why). */
  simProgress?: Record<string, unknown>;
  simFallback?: string | null;
  /** Last wrong answer per task and how often in a row (help prompt on repeats). */
  simWrong?: Record<string, { key: string; n: number }>;
  closed: boolean;
  secure: boolean | null;
  history: { role: "tutor" | "student"; text: string }[];
  worksheetMode: string;
  /** Practice: how often she has asked Fiti for help on each problem (help level). */
  practiseAsks?: Record<string, number>;
  /** Warm-up questions she still needs (skills already shown elsewhere are skipped). Unset until first view. */
  warmupIds?: string[];
  /** Every warm-up question in pack order (for picking lead-ins). */
  warmupAll?: string[];
  /** Why each skipped warm-up question was skipped, with the evidence it relied on. */
  skipReasons?: Record<string, unknown>[];
  /** Warm-up status per skill: shown, repaired (did the quick fix) or not_repaired (skipped it). */
  readiness?: Record<string, "shown" | "repaired" | "not_repaired" | "needs_fix">;
  /** The last warm-up answer whose popup has not been closed yet, so she returns to the same popup. */
  popup?: { itemId: string; optionId: string; correct: boolean; lines: Script; practice: boolean } | null;
  /** The quick fix in progress (part, current step, misses). */
  fix?: FixState | null;
  /** Video: saved play position (s), options tried per check, firm misconceptions (wrong with "Sure"). */
  videoPos?: number;
  tried?: Record<string, string[]>;
  firm?: (string | { misconception_id: string; item_id: string; skill_id: string | null; at: string })[];
  luckyGuesses?: number;
};
import { dialogsFor, judgeStep, newFix, stepEvidence, repairView, slipFor, type FixContent, type FixState } from "./quick-fix";

import { leadKey, pickWarmup, shuffleFor } from "./warmup";
import { clampSeek, pickVideoMove, seekLimit, segmentAt, videoStrength, isFirm, isLuckyGuess } from "@/shared/video";
import { contextHelpSource, isGibberish, mayUseCatch, SCREEN_QUESTION } from "@/shared/context-help";
import { pickHookMove, pickTip, pickWarmupMove, WARMUP_KEY, type WarmupMove } from "@/shared/intro-moves";
import { groundedAnswer, sortMessage, type AiAnswerLog, type FactStage } from "@/server/lesson/tutor-chat.server";
import { aiProvider, teachPractise } from "@/server/providers/ai.server";
import { redactForAi } from "@/shared/intro-moves";
import { boundaryRole } from "@/server/lesson/boundary";
import { cached } from "./wording-cache.server";

const NUM_WORDS = ["no questions", "one question", "two questions", "three questions", "four questions", "five questions"];

export class LessonError extends Error {}

/** Admin preview lessons are excluded from evidence, summaries and metrics. */
async function insertEvidence(admin: Db, row: Database["public"]["Tables"]["evidence"]["Insert"]) {
  const { data } = await admin.from("sessions").select("state").eq("id", row.session_id).maybeSingle();
  if ((data?.state as Any)?.consent_basis === "admin_preview") return { error: null };
  return admin.from("evidence").insert(row);
}

async function loadSession(admin: Db, userId: string, sessionId: string) {
  const { data: s } = await admin.from("sessions").select("*").eq("id", sessionId).eq("student_id", userId).maybeSingle();
  if (!s) throw new LessonError("This lesson isn't yours or no longer exists.");
  const raw = (s.state as Any) ?? {};
  const demo: DemoState = {
    pos: { step: (s.step as LessonStep) ?? "readiness", index: 0 },
    attempts: {}, results: {}, hints: {}, band: null, prediction: null, pendingRepair: null,
    lines: {}, simDone: [], closed: false, secure: null, history: [], worksheetMode: "independent",
    ...(raw.demo ?? {}),
  };
  return { session: s, raw, demo };
}

async function save(admin: Db, sessionId: string, raw: Any, demo: DemoState, extra: Partial<Database["public"]["Tables"]["sessions"]["Update"]> = {}) {
  await admin.from("sessions").update({ state: { ...raw, demo } as unknown as Json, step: demo.pos.step, ...extra }).eq("id", sessionId);
}

import { countsAsTry, revealLimit, shouldReveal, warnBeforeReveal } from "./worksheet-reveal";

async function logEvent(admin: Db, sessionId: string, type: string, step: LessonStep | null, payload: Record<string, unknown>) {
  const { data: last } = await admin.from("events").select("seq").eq("session_id", sessionId).order("seq", { ascending: false }).limit(1).maybeSingle();
  await admin.from("events").insert({ session_id: sessionId, seq: (last?.seq ?? 0) + 1, actor: "student", type, step, payload: payload as Json });
}

async function rule(admin: Db, topicId: string, key: string): Promise<Any> {
  return cached(`rule:${topicId}:${key}`, () => ruleRaw(admin, topicId, key));
}
async function ruleRaw(admin: Db, topicId: string, key: string): Promise<Any> {
  // Topic-specific rule first, then the global one.
  const { data } = await admin.from("rules").select("value").eq("key", key).or(`topic_id.eq.${topicId},topic_id.is.null`).order("topic_id", { ascending: true, nullsFirst: false }).limit(1).maybeSingle();
  return data?.value ?? null;
}

async function fallback(admin: Db, topicId: string, decisionKey: string): Promise<Script> {
  // Cached script, copied so callers can't change the shared copy.
  return structuredClone(await cached(`fb:${topicId}:${decisionKey}`, () => fallbackRaw(admin, topicId, decisionKey)));
}
async function fallbackRaw(admin: Db, topicId: string, decisionKey: string): Promise<Script> {
  // Topic-specific line first, then the global one.
  const { data } = await admin.from("fallback_lines").select("script").eq("decision_key", decisionKey).or(`topic_id.eq.${topicId},topic_id.is.null`).order("topic_id", { ascending: true, nullsFirst: false }).limit(1).maybeSingle();
  const name = await tutorName(admin, topicId);
  return fill(((data?.script as Any) ?? []) as Script, { tutor_name: name });
}

async function hiddenScript(admin: Db, id: string): Promise<Script> {
  const { data } = await admin.from("scripts").select("script").eq("id", id).maybeSingle();
  return ((data?.script as Any) ?? []) as Script;
}

function fill(script: Script, vars: Record<string, string>): Script {
  return script.map((seg) => {
    const rep = (t: string) => t.replace(/\{(\w+)\}/g, (m, k) => vars[k] ?? m);
    return { ...seg, text: rep(seg.text), ...(seg.speakable ? { speakable: rep(seg.speakable) } : {}) };
  });
}

async function practiceItemIds(admin: Db, topicId: string): Promise<Set<string>> {
  return new Set(await cached(`practice:${topicId}`, async () => [...(await practiceItemIdsRaw(admin, topicId))]));
}
async function practiceItemIdsRaw(admin: Db, topicId: string): Promise<Set<string>> {
  const { data } = await admin.from("repairs").select("practice_item_id").eq("topic_id", topicId);
  return new Set((data ?? []).map((r) => r.practice_item_id).filter(Boolean) as string[]);
}

async function toViewItems(admin: Db, rows: Any[]): Promise<ViewItem[]> {
  if (!rows.length) return [];
  const ids = rows.map((r) => r.id);
  const [{ data: hints }, { data: teach }] = await Promise.all([
    admin.from("hints").select("item_id").in("item_id", ids),
    admin.from("scripts").select("owner_id").eq("owner_table", "items").eq("field", "teach_me_model").in("owner_id", ids),
  ]);
  return rows.map((r) => ({
    id: r.id, step: r.step, kind: r.kind, prompt: r.prompt, options: r.options ?? null, fields: r.fields ?? null,
    board: (r.config as Any)?.board ?? null, skillIds: r.skill_ids ?? [],
    hasTeachMe: (teach ?? []).some((t) => t.owner_id === r.id),
    hintCount: (hints ?? []).filter((h) => h.item_id === r.id).length,
  }));
}

async function stepItems(admin: Db, topicId: string, step: LessonStep, demo?: DemoState): Promise<ViewItem[]> {
  const { data } = await admin.from("items").select("id, step, kind, sequence, prompt, options, fields, config, skill_ids").eq("topic_id", topicId).eq("step", step).order("sequence");
  const practice = await practiceItemIds(admin, topicId);
  const keep = step === "readiness" && demo?.warmupIds ? new Set(demo.warmupIds) : null;
  return toViewItems(admin, (data ?? []).filter((r) => !practice.has(r.id) && (!keep || keep.has(r.id))));
}

/** First view of a lesson: drop warm-up questions for skills she has really shown (see shown-skills.server.ts); each skip is logged with its evidence. */
async function chooseWarmup(admin: Db, userId: string, sessionId: string, topicId: string, demo: DemoState, preview: boolean): Promise<boolean> {
  // Lessons started before the honest-skip rule kept skips from restarted attempts: choose again if nothing is answered yet.
  if (demo.warmupIds && !demo.warmupAll && demo.pos.step === "readiness" && demo.pos.index === 0 && !Object.keys(demo.readiness ?? {}).length && !demo.popup) delete demo.warmupIds;
  if (demo.warmupIds) return false;
  const all = await stepItems(admin, topicId, "readiness");
  demo.warmupAll = all.map((i) => i.id);
  // Admin preview lessons always ask every warm-up question, whatever the admin's own record says.
  const shown = preview ? new Map() : await shownSkills(admin, userId);
  demo.warmupIds = pickWarmup(all.map((i) => ({ id: i.id, skillIds: i.skillIds ?? [] })), new Set(shown.keys()));
  demo.skipReasons = all.filter((i) => !demo.warmupIds!.includes(i.id)).map((i) => {
    const skill = (i.skillIds ?? []).find((k) => shown.has(k))!;
    const e = shown.get(skill)!;
    return { item_id: i.id, skill_id: skill, reason: e.status === "shown" ? "skill shown earlier" : `right answer earlier (${e.strength})`,
      evidence_id: e.evidenceId, evidence_session_id: e.sessionId, evidence_at: e.at, strength: e.strength };
  });
  for (const r of demo.skipReasons) await logEvent(admin, sessionId, "warmup_skipped", "readiness", r);
  if (!demo.warmupIds.length && demo.pos.step === "readiness") demo.pos = { step: "hook", index: 0 };
  return true;
}

async function tutorName(admin: Db, topicId: string): Promise<string> {
  const v = await rule(admin, topicId, "tutor_display_name");
  return typeof v === "string" && v.trim() ? v : "Your tutor";
}

async function chooseBand(admin: Db, sessionId: string, topicId: string, demo: DemoState, videoIds: string[]): Promise<Band> {
  const bands = (await rule(admin, topicId, "routing_bands")) ?? {};
  const def = defaultBandOf(await rule(admin, topicId, "default_band"));
  const { band, defaulted } = chooseBandFrom(bands, videoIds, demo.results, def);
  if (defaulted) await logEvent(admin, sessionId, "band_defaulted", "simulation", { band, reason: defaulted, checks: videoIds.length, answered: videoIds.filter((id) => !!demo.results[id]).length });
  return band;
}

type SimTaskRow = { id: string; sequence: number; goal: string; required: boolean; content: Any };
/** Frame-hosted labs (v1 lesson mode, or v2 copied unchanged). */
const isLabEngine = (e: string) => e === "gradient-lab" || e === "gradient-lab-v2";

/** The band's simulation record and the tasks of the engine that is actually running (the lab, or its built-in fallback). */
async function activeSim(admin: Db, topicId: string, demo: DemoState) {
  if (!demo.band) return null;
  const { data: sim } = await admin.from("simulations").select("id,url,init").eq("topic_id", topicId).eq("band", demo.band).maybeSingle();
  if (!sim) return null;
  const init = (sim.init as Any) ?? {};
  const fallbackEngine: string | null = typeof init.fallback_engine === "string" ? init.fallback_engine : null;
  const primary = sim.url ?? "";
  const engine = demo.simFallback && fallbackEngine ? fallbackEngine : primary;
  const { data: rows } = await admin.from("sim_tasks").select("id, sequence, goal, required").eq("simulation_id", sim.id).order("sequence");
  const ids = (rows ?? []).map((r) => `sim_tasks:${r.id}:completion_script`);
  const { data: scripts } = ids.length ? await admin.from("scripts").select("id, script").in("id", ids) : { data: [] as { id: string; script: Json }[] };
  const byId = new Map((scripts ?? []).map((s) => [s.id, s.script as Any]));
  const lab = isLabEngine(engine);
  const tasks: SimTaskRow[] = (rows ?? []).map((r) => ({ ...r, content: byId.get(`sim_tasks:${r.id}:completion_script`) ?? {} }))
    .filter((r) => lab ? r.content?.check?.engine === engine : !isLabEngine(String(r.content?.check?.engine ?? "")));
  return { sim, init, engine, primary, fallbackEngine, tasks };
}

async function linesForPosition(admin: Db, topicId: string, demo: DemoState, items: ViewItem[], vars: Record<string, string>): Promise<Script> {
  const { step, index } = demo.pos;
  if (step === "readiness") {
    const cur = items[index];
    const opener = cur ? await hiddenScript(admin, `items:${cur.id}:opener`) : [];
    // Lead-in matches her real position: the document's own lead-ins only when all questions are asked in order.
    const asked = items.map((i) => i.id);
    const key = leadKey(asked, demo.warmupAll ?? asked, index);
    const parts = opener as (Script[number] & { role?: string })[];
    const body = parts.filter((p) => p.role !== "lead").map((p) => p.text).join(" ");
    const lead = key === "doc" ? parts.filter((p) => p.role === "lead").map((p) => p.text).join(" ")
      : (await fallback(admin, topicId, `warmup_lead_${key}`)).map((p) => p.text).join(" ");
    const turn = parts.length ? (await fallback(admin, topicId, "warmup_your_turn")).map((p) => ({ text: p.text })) : [];
    const line: Script = parts.length ? [{ text: [lead, body].filter(Boolean).join(" ") }, ...turn] : [];
    return fill(line, { ...vars, count_words: NUM_WORDS[items.length] ?? `${items.length} questions` });
  }
  if (step === "simulation" && demo.band) {
    const { data: sim } = await admin.from("simulations").select("id").eq("topic_id", topicId).eq("band", demo.band).maybeSingle();
    if (sim) {
      const opening = (await hiddenScript(admin, `simulations:${sim.id}:opening_lines`)) as Any[];
      const { data: ev } = await admin.from("evidence").select("misconception_id").eq("session_id", (vars["session_id"] ?? "")).not("misconception_id", "is", null).order("created_at", { ascending: false }).limit(5);
      const mis = new Set((ev ?? []).map((e) => e.misconception_id));
      const pick = opening.find((o) => mis.has(o.misconception_id)) ?? opening.find((o) => o.misconception_id === "default");
      if (pick) return pick.script as Script;
    }
    return fallback(admin, topicId, "intro_simulation");
  }
  if (step === "reflection") return fallback(admin, topicId, "ask_reflection");
  if (step === "exit_ticket" || step === "hook") return [];
  if (step === "video") return items.every((i) => !demo.attempts[i.id]) ? fallback(admin, topicId, "video_intro") : [];
  if (index === 0) return fallback(admin, topicId, "ask_item");
  return [];
}

export async function getLessonView(admin: Db, userId: string, sessionId: string): Promise<LessonView> {
  const { session, raw, demo } = await loadSession(admin, userId, sessionId);
  const [{ data: topic }, { data: profile }, name] = await Promise.all([
    admin.from("topics").select("display_name").eq("id", session.topic_id).maybeSingle(),
    admin.from("profiles").select("display_name").eq("id", userId).maybeSingle(),
    tutorName(admin, session.topic_id),
  ]);
  if (await chooseWarmup(admin, userId, sessionId, session.topic_id, demo, raw.consent_basis === "admin_preview")) await save(admin, sessionId, raw, demo);
  const step = demo.pos.step;
  const raws = ["readiness", "video", "worksheet", "guided", "exit_ticket"].includes(step) ? await stepItems(admin, session.topic_id, step, demo) : [];
  // Warm-up options are shuffled per lesson on the server, the same order every time she comes back.
  const items = step === "readiness" || step === "video" ? raws.map((i) => ({ ...i, options: i.options ? shuffleFor(`${sessionId}:${i.id}`, i.options) : null })) : raws;
  let hook: LessonView["hook"] = null;
  if (step === "hook" || step === "reflection") {
    const { data: h } = await admin.from("hooks").select("script, prediction").eq("topic_id", session.topic_id).eq("is_active", true).limit(1).maybeSingle();
    if (h) {
      const p = (h.prediction as Any) ?? {};
      const t = Number(await rule(admin, session.topic_id, "hook_prediction_timeout_s"));
      hook = { script: h.script as unknown as Script, options: p.options ?? [], boxes: p.boxes ?? [], timeoutS: t > 0 ? t : Number(p.timeout_s) || 10,
        videoStart: (await rule(admin, session.topic_id, "video_start_mode")) === "tap" ? "tap" : "auto", saved: demo.prediction,
        nudge: (await fallback(admin, session.topic_id, "hook_nudge")).map((l) => l.text).join(" "),
        skipLink: (await fallback(admin, session.topic_id, "hook_skip_link")).map((l) => l.text).join(" "),
        nudgeS: Number(await rule(admin, session.topic_id, "hook_nudge_s")) || 20,
        skipS: Number(await rule(admin, session.topic_id, "hook_skip_s")) || 20 };
    }
  }
  let simulation: LessonView["simulation"];
  let simTasks: ViewSimTask[] = [];
  let simClosing: LessonView["simClosing"] = null;
  let simCompletedView: string[] = [];
  if (step === "simulation" && demo.band) {
    const act = await activeSim(admin, session.topic_id, demo);
    if (act) {
      const { sim } = act;
      const tasks = act.tasks;
      const lab = isLabEngine(act.engine) ? {
        tasks: tasks.map((t) => ({ id: publicTaskId(t.sequence), level: String(t.content.check.level), mission: String(t.content.check.mission) })),
        timeoutMs: Number(await rule(admin, session.topic_id, "sim_load_timeout_ms")) || 5000,
        fallback: act.fallbackEngine,
        progress: (act.engine === "gradient-lab-v2" ? {} : demo.simProgress ?? {}) as Record<string, import("@/shared/contracts/simulation").LabValues>,
        v2Screen: act.engine === "gradient-lab-v2" ? (Number(((demo.simProgress ?? {}) as Any).v2?.screen) || null) : null,
      } : null;
      simulation = {
        engine: act.engine, lab,
        url: act.engine, goal: (sim.init as Any)?.goal ?? "", introTitle: (await fallback(admin, session.topic_id, "sim_intro_title")).map((x) => x.text).join(" "), tasks: (sim.init as Any)?.tasks ?? [], saved: demo.simSaved ?? {},
        helpIdleS: Number(await rule(admin, session.topic_id, "help_sim_idle_s")) || 30,
        helpRepeats: Number(await rule(admin, session.topic_id, "help_sim_repeats")) || 2,
      };
      const mapped = toViewSimTasks(tasks as ViewSimTask[], demo.simDone);
      simTasks = mapped.tasks; simCompletedView = mapped.completed;
      if (simTasks.length && simCompletedView.length === simTasks.length) {
        const rawClosing = await hiddenScript(admin, `simulations:${sim.id}:closing`) as Any;
        simClosing = await buildSimClosing(rawClosing, demo, tasks);
      }
    }
  }
  let videoChecks: LessonView["videoChecks"] = [];
  let video: LessonView["video"] = null;
  if (step === "video") {
    const { data: clip } = await admin.from("clips").select("id, title, duration_s, poster_url, url_low, url_standard, segments, captions, flow").eq("topic_id", session.topic_id).limit(1).maybeSingle();
    if (clip) {
      const { data: checks } = await admin.from("clip_checks").select("at_seconds, item_id").eq("clip_id", clip.id).order("at_seconds");
      videoChecks = (checks ?? []).map((c) => ({ atSeconds: Number(c.at_seconds), itemId: c.item_id }));
      const line = async (k: string) => (await fallback(admin, session.topic_id, k))[0]?.text ?? "";
      video = {
        title: clip.title ?? "", durationS: Number(clip.duration_s) || (videoChecks.at(-1)?.atSeconds ?? 0) + 60,
        posterUrl: clip.poster_url, urlLow: clip.url_low, urlStandard: clip.url_standard,
        segments: (clip.segments as Any) ?? [], captions: (clip.captions as Any) ?? [],
        startMode: (await rule(admin, session.topic_id, "video_start_mode")) === "tap" ? "tap" : "auto",
        position: demo.videoPos ?? 0,
        tries: Object.fromEntries(videoChecks.map((c) => [c.itemId, { attempts: demo.attempts[c.itemId] ?? 0, tried: demo.tried?.[c.itemId] ?? [] }])),
        labels: { demoTitle: await line("video_demo_title"), followupAck: await line("video_followup_ack"), end: await line("video_end"), endTitle: await line("video_end_title"), unavailable: await line("video_unavailable"), answerRequest: await line("video_answer_request"),
          rightTitle: await line("warmup_popup_right_title"), closeTitle: await line("warmup_popup_close_title"), continue: await line("warmup_popup_continue"),
          intro: Object.fromEntries(await Promise.all(["kicker","title","word","line","begin","how","how_body","welcome"].map(async (k) => [k, await line(`video_intro_${k}`)] as const))) },
        flow: ((clip as Any).flow && !Array.isArray((clip as Any).flow) && (clip as Any).flow.checks?.length) ? (clip as Any).flow : null,
      };
    }
  }
  const vars = { student_name: profile?.display_name ?? "", tutor_name: name, session_id: sessionId };
  const idle = await rule(admin, session.topic_id, "help_board_idle_s");
  const tutorLines = await linesForPosition(admin, session.topic_id, demo, items, vars);
  for (const line of tutorLines) if (!demo.history.some(h => h.role === "tutor" && h.text === line.text)) remember(demo, "tutor", line.text);
  await save(admin, sessionId, raw, demo);
  return {
    sessionId, topicName: topic?.display_name ?? "", tutorName: name, firstName: profile?.display_name ?? null,
    position: demo.pos, completed: session.status === "completed", items, hook, simLevel: ((await rule(admin, session.topic_id, "sim_band_levels")) ?? {})[demo.band ?? ""] ?? null, simCompleted: simCompletedView, simClosing, simulation, devOpenAccess: (await rule(admin, session.topic_id, "dev_open_access")) === true, simTasks, videoChecks, video,
    results: step === "guided" && !items.every(i => demo.results[i.id]) ? Object.fromEntries(Object.entries(demo.results).filter(([id]) => !items.some(i => i.id === id))) : demo.results, tutorLines,
    chatHistory: demo.history.filter((h) => !looksRaw(h.text)),
    // Her own working for the open Practise problem, so it survives a reload (her input, never answers).
    workLines: step === "worksheet" && items[demo.pos.index] ? (demo.lines[items[demo.pos.index]!.id] ?? []) : [],
    workGuide: (step === "worksheet" || step === "guided") && items[demo.pos.index] ? await (async () => {
      const { data: k } = await admin.from("item_keys").select("worked_solution").eq("item_id", items[demo.pos.index]!.id).maybeSingle();
      const first = String(((k?.worked_solution as string[]) ?? [])[0] ?? "").split("=")[0]!.trim();
      const g = fill(await fallback(admin, session.topic_id, "practice_how_to"), { first_step: first }).map((l) => l.text).join(" ");
      return g && !/\{\w+\}/.test(g) ? g : null;
    })() : null,
    chatFallback: await fallback(admin, session.topic_id, "ask_item"),
    boardLines: await (async () => {
      const [c, e, nq, st, th, idle, gi, ph, ro] = await Promise.all([fallback(admin, session.topic_id, "wb_clear_board"), fallback(admin, session.topic_id, "wb_watch_end"), fallback(admin, session.topic_id, "fix_not_quite"), fallback(admin, session.topic_id, "strategy_multiply_first"), fallback(admin, session.topic_id, "qf_tap_hint"), rule(admin, session.topic_id, "qf_idle_hint_ms"), fallback(admin, session.topic_id, "qf_got_it"), fallback(admin, session.topic_id, "qf_place_point_help"), fallback(admin, session.topic_id, "qf_reopen")]);
      return { clear: c.map((l) => l.text).join(" "), end: e.map((l) => l.text).join(" "), notQuite: nq.map((l) => l.text).join(" "), strategy: st.map((l) => l.text).join(" "),
        tapHint: th.map((l) => l.text).join(" "), idleHintMs: typeof idle === "number" ? idle : 8000, gotIt: gi.map((l) => l.text).join(" "), placeHelp: ph.map((l) => l.text).join(" "), reopen: ro.map((l) => l.text).join(" ") };
    })(),
    praise: (await fallback(admin, session.topic_id, "praise")).map((l) => l.text).filter(Boolean),
    askOpener: step === "readiness" ? await fallback(admin, session.topic_id, "warmup_ask_open") : step === "hook" ? await fallback(admin, session.topic_id, "hook_ask_open") : [],
    warmup: step === "readiness" || step === "simulation" ? await warmupView(admin, session.topic_id, demo) : null,
    helpAlertCount: Number(await rule(admin, session.topic_id, "help_board_alerts")) || 2,
    helpIdleSeconds: typeof idle === "number" ? idle : 45,
    avatarAssets: ((await rule(admin, session.topic_id, "tutor_avatar_assets")) ?? null) as LessonView["avatarAssets"],
    pace: {
      cps: Number(await rule(admin, session.topic_id, "chat_stream_chars_per_s")) || 55,
      holdMs: Number(await rule(admin, session.topic_id, "working_line_hold_ms")) || 1200,
      resultPauseMs: Number(await rule(admin, session.topic_id, "working_result_pause_ms")) || 800,
    },
  };
}

async function warmupView(admin: Db, topicId: string, demo: DemoState): Promise<LessonView["warmup"]> {
  const keys = ["warmup_popup_right_title", "warmup_popup_close_title", "warmup_popup_continue", "warmup_fix_button", "warmup_popup_skip", "warmup_popup_practice_continue", "warmup_working_label",
    "warmup_fix_header", "warmup_watch_title", "warmup_try_title", "warmup_now_try", "warmup_show_all", "warmup_alone_title",
    "warmup_fix_together_title", "warmup_fix_try_again", "warmup_fix_nice", "warmup_fix_shown", "warmup_fix_divider", "warmup_fix_back", "warmup_lets_fix", "sim_practice_title"] as const;
  const t = await Promise.all(keys.map(async (k) => (await fallback(admin, topicId, k))[0]?.text ?? ""));
  let repair: NonNullable<LessonView["warmup"]>["repair"] = null;
  if (demo.pendingRepair) {
    const { data: rep } = await admin.from("repairs").select("id, skill_id").eq("practice_item_id", demo.pendingRepair).maybeSingle();
    const { data: p } = await admin.from("items").select("id, step, kind, sequence, prompt, options, fields, config, skill_ids").eq("id", demo.pendingRepair).maybeSingle();
    if (rep && p) {
      const v = (await toViewItems(admin, [p]))[0]!;
      const fix = demo.fix?.repairId === rep.id ? demo.fix : newFix(rep.id, null);
      const { data: sk } = await admin.from("skills").select("name").eq("id", rep.skill_id).maybeSingle();
      repair = { ...repairView(fix, await fixContent(admin, rep.id), { ...v, options: v.options ? shuffleFor(`${rep.id}:${v.id}`, v.options) : null }), skillName: sk?.name ?? undefined };
    }
  }
  return {
    labels: { rightTitle: t[0]!, closeTitle: t[1]!, continue: t[2]!, fix: t[3]!, skip: t[4]!, practiceContinue: t[5]!, working: t[6] ?? null,
      fixHeader: t[7]!, watchTitle: t[8]!, tryTitle: t[9]!, nowTry: t[10]!, showAll: t[11]!, aloneTitle: t[12]!,
      togetherTitle: t[13] || "Let's do this one together", tryAgain: t[14] || "Try again", nice: t[15] || "Nice!", shown: t[16] || "shown", fixDivider: t[17] || "", backDivider: t[18] || "", letsFix: t[19] || "", simPracticeTitle: t[20] || "" },
    popup: demo.popup ?? null, repair,
  };
}

async function fixContent(admin: Db, repairId: string): Promise<FixContent> {
  const { data } = await admin.from("scripts").select("field, script").eq("owner_table", "repairs").eq("owner_id", repairId);
  const by = Object.fromEntries((data ?? []).map((r) => [r.field, r.script as Any]));
  return { slip: by["slip"] ?? {}, watch: by["watch"] ?? { lines: by["micro_lesson"] ?? [] }, you_try: by["you_try"] ?? { steps: [] } };
}

async function currentItem(admin: Db, topicId: string, demo: DemoState) {
  if (demo.pendingRepair) return demo.pendingRepair;
  const items = await stepItems(admin, topicId, demo.pos.step, demo);
  if (["video", "exit_ticket"].includes(demo.pos.step)) return items.find(i => !demo.results[i.id])?.id;
  return items[demo.pos.index]?.id;
}
function remember(demo: DemoState, role: "tutor" | "student", text: string) {
  if (text) demo.history.push({ role, text });
}
type Response = { value?: string | undefined; optionId?: string | undefined; fields?: Record<string, string> | undefined; text?: string | undefined };

function judge(key: Any, accepted: string[] | null, resp: Response): { correct: boolean; trigger: string } {
  switch (key?.kind) {
    case "mcq": {
      const correct = resp.optionId === key.correct_option_id;
      return { correct, trigger: correct ? "correct" : `option:${resp.optionId}` };
    }
    case "numeric": {
      const v = resp.value ?? "";
      const correct = answerMatches(v, accepted?.length ? accepted : [String(key.value)]);
      const ev = evaluate(v);
      const num = ev ? (ev.d === 1n ? `${ev.n}` : `${Number(ev.n) / Number(ev.d)}`) : normalise(v);
      return { correct, trigger: correct ? "correct" : `value:${num}` };
    }
    case "structured": {
      const want = key.fields ?? {};
      const got: Any = resp.fields ?? {};
      const eq = (a: unknown, b: unknown) => normalise(String(a ?? "")) === normalise(String(b ?? ""));
      const correct = Object.keys(want).every((k) => eq(got[k], want[k]));
      if (correct) return { correct, trigger: "correct" };
      const distSwapped = eq(got.across_distance, want.updown_distance) && eq(got.updown_distance, want.across_distance);
      if (distSwapped) return { correct, trigger: "swapped_axes" };
      const distOk = eq(got.across_distance, want.across_distance) && eq(got.updown_distance, want.updown_distance);
      if (distOk) return { correct, trigger: "ignored_negative" };
      return { correct, trigger: "other" };
    }
    case "theory": {
      const final = String(key.final ?? "");
      const [num, word] = final.split(",").map((x) => x.trim());
      const t = normalise(resp.text ?? "");
      const nums = (resp.text ?? "").replace(/[\u2212]/g, "-").match(/-?\d+(\/\d+)?/g) ?? [];
      const numOk = !num || nums.some((n) => answerMatches(n, [num]));
      const wordOk = !word || t.includes(normalise(word).replace(/s$/, ""));
      const correct = numOk && wordOk;
      return { correct, trigger: correct ? "correct" : "other" };
    }
    default:
      return { correct: false, trigger: "other" };
  }
}

async function feedbackFor(admin: Db, topicId: string, itemId: string, trigger: string, correct: boolean): Promise<{ script: Script; misconceptionId: string | null }> {
  const { data } = await admin.from("feedback").select("trigger, misconception_id, script").eq("item_id", itemId);
  const rows = data ?? [];
  const hit = rows.find((r) => r.trigger === trigger) ?? (correct ? null : rows.find((r) => r.trigger === "other"));
  if (hit) return { script: hit.script as unknown as Script, misconceptionId: hit.misconception_id };
  return { script: await fallback(admin, topicId, correct ? "confirm_correct" : "feedback_attempt1"), misconceptionId: null };
}

async function misconceptionLabel(admin: Db, id: string | null): Promise<string | null> {
  if (!id) return null;
  const { data } = await admin.from("misconceptions").select("label").eq("id", id).maybeSingle();
  return data?.label ?? null;
}

export async function checkAnswer(admin: Db, userId: string, sessionId: string, itemId: string, resp: Response, confidence: string | null): Promise<CheckResult> {
  const { session, raw, demo } = await loadSession(admin, userId, sessionId);
  const { data: item } = await admin.from("items").select("id, step, kind, skill_ids, topic_id, options, fields").eq("id", itemId).eq("topic_id", session.topic_id).maybeSingle();
  if (item?.step === "video" && resp.optionId && demo.tried?.[itemId]?.includes(resp.optionId)) throw new LessonError("You've already tried that one.");
  if (!item || await currentItem(admin, session.topic_id, demo) !== itemId) throw new LessonError("That is not the current question.");
  const isRepairPractice = demo.pendingRepair === itemId;
  if (!isRepairPractice && item.step !== demo.pos.step) throw new LessonError("That question isn't part of this step.");
  if (demo.results[itemId]?.correct || (demo.results[itemId] && ["readiness", "guided", "exit_ticket"].includes(item.step) && !isRepairPractice)) {
    throw new LessonError("You've already answered this one.");
  }
  const { data: keyRow } = await admin.from("item_keys").select("answer, accepted_forms").eq("item_id", itemId).maybeSingle();
  const { correct, trigger } = judge(keyRow?.answer, (keyRow?.accepted_forms as string[] | null) ?? null, resp);
  const attempts = (demo.attempts[itemId] ?? 0) + 1;
  demo.attempts[itemId] = attempts;
  const step = item.step as LessonStep;
  const maxTries = step === "video" ? 3 : 1;
  const settled = correct || attempts >= maxTries;

  let lines: Script = [];
  let misId: string | null = null;
  let repair: CheckResult["repair"] = null;
  const fb = await feedbackFor(admin, session.topic_id, itemId, trigger, correct);
  misId = correct ? null : fb.misconceptionId;
  if (step === "exit_ticket" || step === "guided") {
    lines = [];
  } else if (correct || attempts === 1) {
    lines = fb.script;
    const conf = step === "video" ? confidence : null;
    if (correct && isLuckyGuess(correct, conf)) {
      // Right + Guessing: always show why, before moving on.
      const working = fb.script.filter((l) => (l as Any).role === "working");
      const body = working.length ? working : (await fallback(admin, session.topic_id, "full_explanation")).map((l) => ({ ...l, role: "working" }));
      lines = [...(await fallback(admin, session.topic_id, "confidence_lucky_lead")), ...body] as Script;
    } else if (!correct && attempts === 1 && isFirm(correct, conf)) {
      lines = [...(await fallback(admin, session.topic_id, "confidence_firm_lead")), ...fb.script];
    }
  } else {
    const { data: esc } = await admin.from("escalations").select("script").eq("item_id", itemId).eq("attempt", attempts).maybeSingle();
    lines = (esc?.script as unknown as Script) ?? (await fallback(admin, session.topic_id, attempts >= 3 ? "full_explanation" : "parallel_example"));
  }

  if (step === "readiness" && !correct && !isRepairPractice) {
    const { data: rep } = await admin.from("repairs").select("id, practice_item_id").eq("topic_id", session.topic_id).in("skill_id", item.skill_ids ?? []).limit(1).maybeSingle();
    if (rep?.practice_item_id) {
      const content = await fixContent(admin, rep.id);
      const { data: p } = await admin.from("items").select("id, step, kind, sequence, prompt, options, fields").eq("id", rep.practice_item_id).maybeSingle();
      if (p) {
        repair = { lines: slipFor(content.slip, fb.misconceptionId), practiceItem: (await toViewItems(admin, [p]))[0]! };
        demo.pendingRepair = p.id;
        demo.fix = newFix(rep.id, fb.misconceptionId);
      }
    }
  }
  if (step === "readiness") {
    const skill = item.skill_ids?.[0];
    demo.readiness ??= {};
    if (skill) demo.readiness[skill] = isRepairPractice ? "repaired" : correct ? "shown" : "needs_fix";
    demo.popup = { itemId, optionId: resp.optionId ?? "", correct, lines: repair && !correct ? repair.lines : fb.script, practice: isRepairPractice };
  }
  // The practice question stays current until its popup closes (see closePopup).
  if (repair) repair.fixLabel = (await fallback(admin, session.topic_id, "warmup_fix_button"))[0]?.text ?? null;

  if (settled) demo.results[itemId] = { correct, firstTry: correct && attempts === 1, attempts };
  if (step === "video") {
    demo.tried ??= {};
    if (resp.optionId) demo.tried[itemId] = [...new Set([...(demo.tried[itemId] ?? []), resp.optionId])];
    if (isFirm(correct, confidence) && misId && !(demo.firm ?? []).some((f) => (typeof f === "string" ? f : f.misconception_id) === misId))
      demo.firm = [...(demo.firm ?? []), { misconception_id: misId, item_id: itemId, skill_id: item.skill_ids?.[0] ?? null, at: new Date().toISOString() }];
    if (isLuckyGuess(correct, confidence)) demo.luckyGuesses = (demo.luckyGuesses ?? 0) + 1;
  }
  await insertEvidence(admin, {
    session_id: sessionId, student_id: userId, item_id: itemId, skill_id: item.skill_ids?.[0] ?? null, step,
    attempt: attempts, is_first_try: attempts === 1, correct, response: resp as Json,
    confidence: (["sure", "think_so", "guessing"].includes(confidence ?? "") ? confidence : null) as Any,
    hint_rung: demo.hints[itemId] ?? null, opted_out: false,
    strength: step === "video" ? videoStrength(correct, attempts, confidence) : correct ? (attempts === 1 ? "strong" : "moderate") : "weak", misconception_id: misId,
  });
  remember(demo, "student", answerWords(resp, item as Any));
  lines.forEach(l => remember(demo, "tutor", l.text));
  await logEvent(admin, sessionId, "answer_submitted", step, { item_id: itemId, correct, attempt: attempts, option_id: resp.optionId ?? null });
  if (isRepairPractice) await logEvent(admin, sessionId, "repair_practice_answered", step, { item_id: itemId, correct });
  if (step === "readiness") await logEvent(admin, sessionId, "popup_shown", step, { item_id: itemId, kind: correct ? "right" : "close" });
  await save(admin, sessionId, raw, demo);
  if (step === "guided") {
    const items = await stepItems(admin, session.topic_id, "guided");
    if (items.every(i => demo.results[i.id])) return { status: "saved", summary: items.flatMap(i => { const result = demo.results[i.id]; return result ? [{ itemId: i.id, ...result }] : []; }) };
    return { status: "saved" };
  }
  return { correct, attempts, tutorLines: lines, misconceptionLabel: await misconceptionLabel(admin, misId), settled, repair };
}

export async function checkLines(admin: Db, userId: string, sessionId: string, itemId: string, lines: string[]): Promise<LineResult> {
  if (lines.length > 100 || lines.some(l => l.length > 512)) throw new LessonError("Please use fewer, shorter working lines.");
  const { session, raw, demo } = await loadSession(admin, userId, sessionId);
  const { data: item } = await admin.from("items").select("id, step, skill_ids").eq("id", itemId).eq("topic_id", session.topic_id).maybeSingle();
  if (!item || await currentItem(admin, session.topic_id, demo) !== itemId || item.step !== demo.pos.step || item.step !== "worksheet") throw new LessonError("That question isn't part of this step.");
  const { data: keyRow } = await admin.from("item_keys").select("answer, wrong_paths, worked_solution, accepted_methods").eq("item_id", itemId).maybeSingle();
  const final = String((keyRow?.answer as Any)?.final ?? "");
  const finalVal = evaluate(final);
  let prev: Frac | null = null;
  for (const l of lines.slice(0, -1)) {
    const v = checkLine(l, prev);
    if (v.value) prev = v.value;
  }
  const last = lines[lines.length - 1] ?? "";
  const wrong = ((keyRow?.wrong_paths as Any[]) ?? []).find((w) => normalise(w.line) === normalise(last) || normalise(last).endsWith("=" + normalise(w.line)));
  demo.lines[itemId] = lines;
  let res: LineResult;
  if (wrong) {
    res = { status: "check", message: wrong.note ?? null, misconceptionLabel: await misconceptionLabel(admin, wrong.misconception_id), solved: false, tutorLines: [] };
  } else {
    const v = checkItemLine(last, prev, final, [
      ...((keyRow?.worked_solution as string[]) ?? []),
      ...((keyRow?.accepted_methods as string[][]) ?? []).flat(),
    ]);
    if (v.status === "check") {
      const msg = v.reason === "not_following" ? "This doesn't follow from the line above. Take another look." : v.reason === "not_equal" ? "The two sides here aren't equal. Take another look." : "I can't read this line yet. Check the brackets and signs.";
      res = { status: "check", message: msg, misconceptionLabel: null, solved: false, tutorLines: [] };
    } else {
      // Solved only when the line ends in a plain number or fraction equal to the answer.
      const tail = normalise(last).split("=").filter(Boolean).pop() ?? "";
      const simple = /^-?\d+(\.\d+)?(\/\d+)?$/.test(tail);
      const hasWorking = lines.slice(0, -1).some(l => /[+−*÷/×-]/.test(l)) || /[=]/.test(last);
      const matchesFinal = simple && !!(v.value && finalVal && fracEq(v.value, finalVal));
      const solved = matchesFinal && hasWorking;
      res = { status: "ok", message: matchesFinal && !hasWorking ? "Show me how you got that" : null, misconceptionLabel: null, solved, tutorLines: solved ? await fallback(admin, session.topic_id, `method_${itemId}`) : [] };
    }
  }
  const reason = !wrong && res.status === "check" ? (res.message?.startsWith("I can't read") ? "unreadable" : "other") : null;
  if (countsAsTry(res.status, reason)) {
    demo.attempts[itemId] = (demo.attempts[itemId] ?? 0) + 1;
    const limit = revealLimit(await rule(admin, session.topic_id, "worksheet_reveal_after"));
    const tries = demo.attempts[itemId]!;
    if (shouldReveal(tries, limit)) {
      const intro = await fallback(admin, session.topic_id, "worksheet_reveal_intro");
      const steps = ((keyRow?.worked_solution as string[]) ?? []).map((text) => ({ text }));
      res.reveal = [...intro, ...steps];
      res.afterReveal = await fallback(admin, session.topic_id, "worksheet_after_reveal");
      demo.results[itemId] = { correct: false, firstTry: false, attempts: tries, revealed: true };
      await insertEvidence(admin, {
        session_id: sessionId, student_id: userId, item_id: itemId, skill_id: item.skill_ids?.[0] ?? null, step: "worksheet",
        attempt: tries, is_first_try: false, correct: false, response: { lines, revealed: true } as Json, hint_rung: demo.hints[itemId] ?? null,
        opted_out: false, strength: "weak", misconception_id: null,
      });
      await logEvent(admin, sessionId, "answer_revealed", "worksheet", { item_id: itemId, attempts: tries });
    } else if (warnBeforeReveal(tries, limit)) {
      res.tutorLines = [...res.tutorLines, ...(await fallback(admin, session.topic_id, "worksheet_reveal_warn"))];
    }
  }
  if (res.solved) {
    const attempts = (demo.attempts[itemId] ?? 0) + 1;
    demo.results[itemId] = { correct: true, firstTry: attempts === 1, attempts };
    await insertEvidence(admin, {
      session_id: sessionId, student_id: userId, item_id: itemId, skill_id: item.skill_ids?.[0] ?? null, step: "worksheet",
      attempt: attempts, is_first_try: attempts === 1, correct: true, response: { lines } as Json, hint_rung: demo.hints[itemId] ?? null,
      opted_out: false, strength: attempts === 1 ? "strong" : "moderate", misconception_id: null,
    });
  } else if (res.status === "check" && wrong && !res.reveal) {
    await insertEvidence(admin, {
      session_id: sessionId, student_id: userId, item_id: itemId, skill_id: item.skill_ids?.[0] ?? null, step: "worksheet",
      attempt: demo.attempts[itemId] ?? 1, is_first_try: false, correct: false, response: { lines } as Json, hint_rung: null,
      opted_out: false, strength: "weak", misconception_id: wrong.misconception_id,
    });
  }
  remember(demo, "student", lines.join("\n"));
  res.tutorLines.forEach(l => remember(demo, "tutor", l.text));
  await logEvent(admin, sessionId, "line_submitted", "worksheet", { item_id: itemId, status: res.status, solved: res.solved });
  await save(admin, sessionId, raw, demo);
  return res;
}

export async function nextHint(admin: Db, userId: string, sessionId: string, itemId: string): Promise<{ rung: number; lines: Script; last: boolean }> {
  const { session, raw, demo } = await loadSession(admin, userId, sessionId);
  const { data: item } = await admin.from("items").select("step").eq("id", itemId).eq("topic_id", session.topic_id).maybeSingle();
  if (!item || item.step !== demo.pos.step || await currentItem(admin, session.topic_id, demo) !== itemId || item.step === "exit_ticket") throw new LessonError("Hints aren't available here.");
  const { data: hints } = await admin.from("hints").select("rung, script").eq("item_id", itemId).order("rung");
  const rung = Math.min((demo.hints[itemId] ?? 0) + 1, (hints ?? []).length);
  const h = (hints ?? []).find((x) => x.rung === rung);
  demo.hints[itemId] = rung;
  await logEvent(admin, sessionId, "hint_opened", item.step as LessonStep, { item_id: itemId, rung });
  const hintLines = (h?.script as unknown as Script) ?? [];
  hintLines.forEach(l => remember(demo, "tutor", l.text));
  await save(admin, sessionId, raw, demo);
  return { rung, lines: (h?.script as unknown as Script) ?? (await fallback(admin, session.topic_id, "give_hint")), last: rung >= (hints ?? []).length };
}

export async function teachMe(admin: Db, userId: string, sessionId: string, itemId: string, mode: "model" | "together"): Promise<Script> {
  const { session, demo, raw } = await loadSession(admin, userId, sessionId);
  const { data: item } = await admin.from("items").select("step").eq("id", itemId).eq("topic_id", session.topic_id).maybeSingle();
  if (!item || !mayTeach(demo.pos.step, await currentItem(admin, session.topic_id, demo), itemId, demo.pos.index, mode, demo.worksheetMode)) throw new LessonError("Teach me isn't available here.");
  await logEvent(admin, sessionId, "teach_me_opened", "worksheet", { item_id: itemId, mode });
  const script = await hiddenScript(admin, `items:${itemId}:teach_me_${mode}`);
  const lines = script.length ? script : await fallback(admin, session.topic_id, "teach_me_missing");
  lines.forEach(l => remember(demo, "tutor", l.text));
  await save(admin, sessionId, raw, demo);
  return lines;
}

export async function explainQuestion(admin: Db, userId: string, sessionId: string): Promise<Script> {
  const { session, raw, demo } = await loadSession(admin, userId, sessionId);
  const id = await currentItem(admin, session.topic_id, demo);
  const { data } = await admin.from("hints").select("script").eq("item_id", id ?? "").eq("rung", 0).maybeSingle();
  const lines = (data?.script as unknown as Script) ?? await fallback(admin, session.topic_id, "explain_question");
  lines.forEach(l => remember(demo, "tutor", l.text));
  await save(admin, sessionId, raw, demo);
  return lines;
}

export async function setWorksheetMode(admin: Db, userId: string, sessionId: string, mode: "teach_me" | "independent") {
  const { raw, demo } = await loadSession(admin, userId, sessionId);
  if (demo.pos.step !== "worksheet") throw new LessonError("Not in the worksheet.");
  demo.worksheetMode = mode;
  await logEvent(admin, sessionId, "worksheet_mode_changed", "worksheet", { mode });
  await save(admin, sessionId, raw, demo);
}

/** Fills {choice} in the hook reply with the option she picked. */
export function hookAckLines(lines: Script, choice: string): Script {
  return lines.map((l) => ({ ...l, text: l.text.replace(/\{choice\}/g, choice) })) as Script;
}

/** Hook: her prediction (an option id, or "none" when the countdown ran out). Never marked. Saved once. */
export async function savePrediction(admin: Db, userId: string, sessionId: string, optionId: string, boxes: Record<string, string>): Promise<Script> {
  const { session, raw, demo } = await loadSession(admin, userId, sessionId);
  if (demo.pos.step !== "hook") throw new LessonError("The prediction is part of the hook.");
  if (demo.prediction !== null) return [];
  const { data: h } = await admin.from("hooks").select("prediction").eq("topic_id", session.topic_id).eq("is_active", true).limit(1).maybeSingle();
  const p = (h?.prediction as Any) ?? {};
  if (optionId !== "none" && !(p.options ?? []).some((o: Any) => o.id === optionId)) throw new LessonError("Pick one of the three choices.");
  const allowed = new Set((p.boxes ?? []).map((b: Any) => b.id));
  const numbers = Object.fromEntries(Object.entries(boxes).filter(([k, v]) => allowed.has(k) && /^-?\d+(\.\d+)?(\s*\/\s*\d+)?$/.test(v.trim())).map(([k, v]) => [k, v.trim()]));
  demo.prediction = optionId;
  const unsure = optionId === "none" || optionId === "d";
  raw.prediction = { choice: unsure ? null : optionId, numbers };
  const label = (p.options ?? []).find((o: Any) => o.id === optionId)?.label ?? "";
  const lines = optionId === "none" ? [] : hookAckLines(await fallback(admin, session.topic_id, unsure ? "hook_ack_unsure" : optionId === "c" ? "hook_ack_same" : "hook_ack_choice"), label);
  if (optionId !== "none") remember(demo, "student", (p.options ?? []).find((o: Any) => o.id === optionId)?.label ?? optionId);
  lines.forEach((l) => remember(demo, "tutor", l.text));
  await logEvent(admin, sessionId, "prediction_made", "hook", { option_id: optionId === "none" ? null : optionId, no_prediction: optionId === "none", boxes: numbers });
  await save(admin, sessionId, raw, demo);
  return lines;
}

export async function simTaskDone(admin: Db, userId: string, sessionId: string, result: import("@/shared/contracts/simulation").SimToApp & { type: "task_result" }): Promise<Script> {
  const { session, raw, demo } = await loadSession(admin, userId, sessionId);
  const act = await activeSim(admin, session.topic_id, demo);
  // Built-in boards and Gradient Lab are marked on the server (simCheck / simLab); a result flag alone never counts for them.
  if (!act || act.engine.startsWith("native:") || isLabEngine(act.engine)) throw new LessonError("Check your answer on the board.");
  const current = act.tasks.find(t => !demo.simDone.includes(t.id));
  const outcome = demo.pos.step === "simulation" ? settleSimResult(current ? publicTaskId(current.sequence) : undefined, result) : "ignore";
  if (outcome === "ignore" || !current) {
    await logEvent(admin, sessionId, "sim_task_ignored", "simulation", { ...result });
    return [];
  }
  await insertEvidence(admin, { session_id: sessionId, student_id: userId, step: "simulation", attempt: result.attempts, is_first_try: result.attempts === 1, correct: result.success, response: result as Json, opted_out: false, strength: result.success ? "moderate" : "weak", misconception_id: result.misconception === "inverted_ratio" ? "MIS_INVERTED" : result.misconception === "sign_error" ? "MIS_SIGN_GRAD" : null });
  if (outcome !== "done") return [];
  demo.simDone.push(current.id);
  await logEvent(admin, sessionId, "sim_task_settled", "simulation", { ...result });
  await save(admin, sessionId, raw, demo);
  return hiddenScript(admin, `sim_tasks:${current.id}:completion_script`);
}
/** Help ladder for the current task: rung 1 guiding question, rung 2 rule, rung 3 a faint answer (or the rise filled in). */
export type LabCue = { highlight?: string; set?: { target: string; value: number | { x: number; y: number } }; yourTurn?: string } | null;
export async function simHelp(admin: Db, userId: string, sessionId: string): Promise<{ lines: Script; rung: number; faint: number[][] | null; fill: { rise: string } | null; choice: string | null; lab: LabCue }> {
  const { session, raw, demo } = await loadSession(admin, userId, sessionId);
  const empty = { lines: [] as Script, rung: 0, faint: null, fill: null, choice: null, lab: null as LabCue };
  if (demo.pos.step !== "simulation") return empty;
  const act = await activeSim(admin, session.topic_id, demo);
  const task = act?.tasks.find(t => !demo.simDone.includes(t.id));
  if (!task) return empty;
  const check = task.content?.check ?? {};
  const rung = Math.min((demo.hints[task.id] ?? 0) + 1, 3);
  demo.hints[task.id] = rung;
  await logEvent(admin, sessionId, "help_requested", "simulation", { task_id: task.id, rung, engine: act!.engine });
  await save(admin, sessionId, raw, demo);
  if (check.engine === "gradient-lab") {
    // Fiti's ladder for the lab: point at the right part first, then show it (lab locked), then "Your turn".
    const step = (check.ladder ?? [])[rung - 1] ?? (check.ladder ?? []).at(-1) ?? {};
    return { ...empty, rung, lines: (step.lines ?? []) as Script, lab: { highlight: step.highlight, set: step.set, yourTurn: step.your_turn } };
  }
  if (rung < 3) return { ...empty, rung, lines: [{ text: check.hints?.[rung - 1] ?? check.hints?.[0] ?? "" }] };
  // Rung 3: Road Inspector fills in the rise; the other engines show one correct answer faintly.
  if (check.kind === "rise_run_gradient" && check.road) {
    const rise = String(check.road[1][1] - check.road[0][1]).replace("-", "−");
    return { ...empty, rung, fill: { rise }, lines: [{ text: check.rung3 ?? "I've filled in the rise for you. Now the run and the gradient." }] };
  }
  if (check.kind === "choice") return { ...empty, rung, choice: check.target, lines: [{ text: check.rung3 ?? check.hints?.[1] ?? "" }] };
  return { ...empty, rung, faint: faintOf(check), lines: [{ text: check.faint_line ?? "Here's one that works. Place your point on it." }] };
}

const faintOf = (check: Any): number[][] | null =>
  !check?.faint ? null : Array.isArray(check.faint[0]) ? check.faint : [check.start, check.faint];

export async function advance(admin: Db, userId: string, sessionId: string): Promise<void> {
  const { session, raw, demo } = await loadSession(admin, userId, sessionId);
  const step = demo.pos.step;
  const all = await stepItems(admin, session.topic_id, step, demo);
  let settled = all.length ? (all[demo.pos.index] ? !!demo.results[all[demo.pos.index]!.id] : true) : true;
  if (["video", "exit_ticket"].includes(step) || demo.pos.index >= all.length - 1) settled = all.every(i => !!demo.results[i.id]) && !demo.pendingRepair;
  if (step === "readiness") settled = settled && !demo.pendingRepair && !demo.popup;
  if (step === "hook") settled = demo.prediction !== null;
  if (step === "simulation") {
    const act = await activeSim(admin, session.topic_id, demo);
    settled = !!act && act.tasks.filter((t) => t.required).every(t => demo.simDone.includes(t.id));
  }
  if (!mayAdvance(await rule(admin, session.topic_id, "dev_open_access"), settled)) throw new LessonError("Finish this step before continuing.");
  // Readiness, worksheet and guided show one item at a time; video and exit ticket are one screen.
  const items = ["readiness", "worksheet", "guided"].includes(step) ? await stepItems(admin, session.topic_id, step, demo) : [];
  if (items.length && demo.pos.index < items.length - 1) {
    demo.pos = { step, index: demo.pos.index + 1 };
  } else {
    const next = LESSON_STEPS[LESSON_STEPS.indexOf(step) + 1];
    if (!next) return;
    if (next === "simulation") {
      const video = await stepItems(admin, session.topic_id, "video");
      demo.band = await chooseBand(admin, sessionId, session.topic_id, demo, video.map((v) => v.id));
      demo.simFallback = null; demo.simProgress = {};
    }
    demo.pos = { step: next, index: 0 };
    demo.pendingRepair = null;
    demo.fix = null;
  }
  await logEvent(admin, sessionId, "step_advanced", demo.pos.step, { from: step });
  await save(admin, sessionId, raw, demo, demo.band ? { band: demo.band } : {});
}

/** She closed a warm-up popup: Continue (right, or practice done) or Let's fix it. */
export async function closePopup(admin: Db, userId: string, sessionId: string, action: "continue" | "fix", working?: "shown" | "skipped"): Promise<void> {
  const { raw, demo } = await loadSession(admin, userId, sessionId);
  const pop = demo.popup;
  if (!pop) return;
  if (working) await logEvent(admin, sessionId, working === "shown" ? "working_shown" : "working_skipped", demo.pos.step, { item_id: pop.itemId });
  if (action === "fix") {
    if (!demo.pendingRepair) throw new LessonError("There is no quick fix for this one.");
    await logEvent(admin, sessionId, "popup_fix", demo.pos.step, { item_id: pop.itemId });
    await logEvent(admin, sessionId, "repair_started", demo.pos.step, { item_id: demo.pendingRepair });
    if (demo.fix) {
      const slip = slipFor((await fixContent(admin, demo.fix.repairId)).slip, demo.fix.slipMis);
      slip.forEach((l) => remember(demo, "tutor", l.text));
      await logEvent(admin, sessionId, "repair_slip_shown", demo.pos.step, { repair_id: demo.fix.repairId, misconception_id: demo.fix.slipMis });
    }
  } else {
    await logEvent(admin, sessionId, "popup_continue", demo.pos.step, { item_id: pop.itemId });
    if (pop.practice) { demo.pendingRepair = null; demo.fix = null; await logEvent(admin, sessionId, "repair_completed", demo.pos.step, { item_id: pop.itemId }); }
  }
  demo.popup = null;
  await save(admin, sessionId, raw, demo);
}

/** She chose not to do the quick fix: note it and carry on with the warm-up. */
export async function skipRepair(admin: Db, userId: string, sessionId: string): Promise<Script> {
  const { session, raw, demo } = await loadSession(admin, userId, sessionId);
  if (!demo.pendingRepair) return [];
  await logEvent(admin, sessionId, "popup_skip", demo.pos.step, { item_id: demo.popup?.itemId ?? null });
  await logEvent(admin, sessionId, "repair_skipped", demo.pos.step, { item_id: demo.pendingRepair });
  const { data: p } = await admin.from("items").select("skill_ids").eq("id", demo.pendingRepair).maybeSingle();
  const skill = p?.skill_ids?.[0];
  if (skill) (demo.readiness ??= {})[skill] = "not_repaired";
  demo.pendingRepair = null;
  demo.popup = null;
  demo.fix = null;
  const lines = await fallback(admin, session.topic_id, "warmup_skip_repair");
  lines.forEach((l) => remember(demo, "tutor", l.text));
  await save(admin, sessionId, raw, demo);
  return lines;
}

export async function closeLesson(admin: Db, userId: string, sessionId: string, reflection: string): Promise<CloseSummary> {
  const { session, raw, demo } = await loadSession(admin, userId, sessionId);
  if (demo.pos.step !== "reflection") throw new LessonError("Finish the exit ticket first.");
  const exit = await stepItems(admin, session.topic_id, "exit_ticket");
  const secure = exit.length > 0 && exit.every((i) => demo.results[i.id]?.correct && demo.results[i.id]?.firstTry && !demo.hints[i.id]);
  const { data: ev } = await admin.from("evidence").select("misconception_id, correct").eq("session_id", sessionId);
  const misIds = [...new Set((ev ?? []).filter((e) => !e.correct && e.misconception_id).map((e) => e.misconception_id as string))];
  const { data: mis } = misIds.length ? await admin.from("misconceptions").select("id, label, plain_words").in("id", misIds) : { data: [] as { id: string; label: string; plain_words: string }[] };
  const { data: hook } = await admin.from("hooks").select("id, prediction").eq("topic_id", session.topic_id).eq("is_active", true).limit(1).maybeSingle();
  let hookClose: Script = [];
  if (hook) {
    const label = ((hook.prediction as Any)?.options ?? []).find((o: Any) => o.id === demo.prediction)?.label ?? "something";
    hookClose = fill(await hiddenScript(admin, `hooks:${hook.id}:close_script`), { prediction: label });
  }
  const results = Object.values(demo.results);
  const didWell: string[] = [];
  if (secure) didWell.push("Every exit question right first time, with no hints.");
  const firstTries = results.filter((r) => r.firstTry).length;
  if (firstTries) didWell.push(`${firstTries} questions right on the first try.`);
  if (results.some((r) => r.correct && !r.firstTry)) didWell.push("You kept going and fixed questions after a first try.");
  demo.closed = true;
  demo.secure = secure;
  remember(demo, "student", reflection);
  await logEvent(admin, sessionId, "reflection_answered", "reflection", { reflection });
  await logEvent(admin, sessionId, "reflection_submitted", "reflection", { reflection });
  const { data: topic } = await admin.from("topics").select("display_name").eq("id", session.topic_id).maybeSingle();
  const { data: evidence } = await admin.from("evidence").select("skill_id, correct").eq("session_id", sessionId);
  const secureIds = [...new Set((evidence ?? []).filter(e => e.correct && e.skill_id).map(e => e.skill_id!))].filter(id => !(evidence ?? []).some(e => e.skill_id === id && !e.correct));
  const { data: skills } = secureIds.length ? await admin.from("skills").select("id, name").in("id", secureIds) : { data: [] };
  const firmIds = [...new Set((demo.firm ?? []).map((f) => (typeof f === "string" ? f : f.misconception_id)))];
  const { data: firmMis } = firmIds.length ? await admin.from("misconceptions").select("id, plain_words").in("id", firmIds) : { data: [] as { id: string; plain_words: string | null }[] };
  const firmWords = (firmMis ?? []).filter((m) => m.plain_words).map((m) => `was sure that ${m.plain_words}`);
  const struggles = [...(mis ?? []).filter((m) => !firmIds.includes(m.id)).map(m => m.plain_words), ...firmWords];
  const content = { topic: topic?.display_name ?? "", time_spent_seconds: Math.max(0, Math.floor((Date.now() - Date.parse(session.started_at)) / 1000)), skills_secure: (skills ?? []).map(s => s.name), struggles, one_thing_to_practise: struggles[0] ?? null, next_lesson: secure ? null : struggles[0] ?? null };
  const { error } = await admin.from("summaries").upsert({ session_id: sessionId, student_id: userId, content }, { onConflict: "session_id" });
  if (error) throw new LessonError("Could not save the lesson summary.");
  await save(admin, sessionId, { ...raw, secure, reflection }, demo, { status: "completed", completed_at: new Date().toISOString() });
  return { secure, hookClose, didWell, watch: (mis ?? []).map((m) => m.plain_words ?? m.label), tutorLines: await fallback(admin, session.topic_id, "summary") };
}

/** Distress is always flagged; a personal-boundary message is flagged at most once per session. */
async function flagOnce(admin: Db, userId: string, sessionId: string, move: string, note: string) {
  if (move !== "distress" && move !== "boundary") return;
  if (move === "boundary") {
    const { count } = await admin.from("flags").select("id", { count: "exact", head: true }).eq("kind", "boundary").eq("session_id", sessionId);
    if (count) return;
  }
  await admin.from("flags").insert({ kind: move, note, created_by: userId, session_id: sessionId });
}

/** Help with what she is doing right now (never "didn't catch that"). */
async function contextHelp(admin: Db, topicId: string, demo: DemoState, itemId: string | null | undefined): Promise<Script> {
  const src = contextHelpSource({ step: demo.pos.step, fixPart: demo.pendingRepair ? (demo.fix?.part as "watch" | "try" | "practice" | undefined) ?? null : null });
  if (src.from === "line") { const l = await fallback(admin, topicId, src.key); if (l.length) return l; }
  if (src.from === "fix_step_hint" && demo.fix) {
    const st = (await fixContent(admin, demo.fix.repairId)).you_try.steps[demo.fix.step];
    const l = st?.hint_question?.length ? st.hint_question : st?.hint;
    if (l?.length) return l;
  }
  if (src.from === "warmup_tip" && itemId) { const l = await fallback(admin, topicId, `warmup_tip__${itemId}`); if (l.length) return l; }
  if (src.from === "first_hint" && itemId) {
    const { data: h } = await admin.from("hints").select("script").eq("item_id", itemId).eq("rung", 1).maybeSingle();
    if (h) return h.script as unknown as Script;
  }
  return fallback(admin, topicId, "ctx_general");
}

/** "Didn't catch that" only for empty/mash, and never twice in a row; otherwise context help. */
async function unclearReply(admin: Db, topicId: string, demo: DemoState, text: string, itemId: string | null | undefined): Promise<Script> {
  if (!isGibberish(text)) return contextHelp(admin, topicId, demo, itemId);
  const c = await fallback(admin, topicId, "unclear");
  const last = demo.history.filter((h) => h.role === "tutor").at(-1)?.text;
  return mayUseCatch(last, c.map((l) => l.text)) ? c : contextHelp(admin, topicId, demo, itemId);
}

export async function askTutor(admin: Db, userId: string, sessionId: string, text: string, intent?: "hint") {
  const { session, raw, demo } = await loadSession(admin, userId, sessionId);
  if (demo.pos.step === "hook") {
    let move = pickHookMove(text);
    if (["maths", "prereq", "unclear", "offtopic", "greeting"].includes(move)) {
      const s2 = await sortMessage(admin, session.topic_id, text, "readiness");
      const m = s2.move === "ready" ? "maths" : s2.move;
      move = m as typeof move;
    }
    const after = demo.prediction !== null;
    const key = after && (move === "answer" || move === "help" || move === "unclear") && !isGibberish(text) ? "hook_after"
      : move === "answer" ? "hook_answer" : move === "meaning" ? "hook_meaning" : move === "help" ? "hook_help" : null;
    const approved = key ? await fallback(admin, session.topic_id, key)
      : move === "unclear" ? (isGibberish(text) ? await unclearReply(admin, session.topic_id, demo, text, null) : await fallback(admin, session.topic_id, "hook_help"))
      : fill(await fallback(admin, session.topic_id, WARMUP_KEY[move as Exclude<typeof move, "meaning" | "help">]), { role: boundaryRole(text) });
    await flagOnce(admin, userId, sessionId, move, "Hook message");
    const banned = await rule(admin, session.topic_id, "banned_words");
    const lines = replyAllowed(approved, approved, null, [], banned ?? undefined) ? approved : [];
    remember(demo, "student", text);
    lines.forEach(l => remember(demo, "tutor", l.text));
    await logEvent(admin, sessionId, "question_asked", "hook", { text, kind: move });
    await save(admin, sessionId, raw, demo);
    return { kind: move, lines };
  }
  if (demo.pos.step === "readiness") {
    let move: WarmupMove = intent === "hint" ? "help" : pickWarmupMove(text);
    let source = intent === "hint" ? "hint_button" : "words";
    let sortMs: number | undefined;
    if (intent !== "hint" && (move === "maths" || move === "prereq" || move === "unclear" || move === "offtopic" || move === "greeting")) {
      const s2 = await sortMessage(admin, session.topic_id, text, "readiness");
      source = s2.source; sortMs = s2.ms;
      move = s2.move === "help" ? "help" : s2.move === "ready" ? "maths" : s2.move;
    }
    const id = await currentItem(admin, session.topic_id, demo);
    const qid = demo.pendingRepair ?? id;
    const { data: item } = await admin.from("items").select("prompt").eq("id", qid ?? "").eq("topic_id", session.topic_id).maybeSingle();
    const prompt = ((item?.prompt as unknown as Script | null) ?? []) as (Script[number] & { role?: string })[];
    let approved: Script = [];
    let ai: AiAnswerLog = { used: false };
    // Warm-up rule: no explanations before she answers; afterwards (or in a quick fix) warm-up skills may be explained.
    const answered = !!demo.pendingRepair || (!!qid && !!demo.results[qid]);
    if (SCREEN_QUESTION.test(text.toLowerCase()) && ["unclear", "maths", "prereq", "help"].includes(move)) move = "meaning";
    // Quick fix: help with the part she is on; a question about the screen may get a checked AI answer first.
    // Hint button (or a typed "tip"/"hint"): always one clear maths action for what is on screen, in every part.
    // The AI may phrase it from approved facts (checked: no answer, no new numbers, banned words, then isClearTip);
    // otherwise the approved step tip, then the question tip plays. Never screen instructions or "try it first".
    const wantsTip = intent === "hint" || /^\s*(can i (have|get) a |give me a |a |any )?(tip|hint|clue)s?\b/i.test(text);
    if (wantsTip && qid) {
      const fc = demo.pendingRepair && demo.fix ? await fixContent(admin, demo.fix.repairId) : null;
      const part = fc ? demo.fix!.part : null;
      const step = fc && part === "try" ? fc.you_try.steps[demo.fix!.step] : undefined;
      const visible = [...prompt.map((p) => p.text), ...(part === "watch" ? (fc!.watch.lines ?? []).map((l) => l.text) : []), ...(step ? (step.prompt ?? []).map((p) => p.text) : [])];
      const r = await groundedAnswer(admin, session.topic_id, "Give me one tip for the maths on my screen: one short sentence that starts with a doing word like Count, Look, Find or Start, under 15 words. Do not tell me to tap or watch anything, and do not give the answer.", ["warmup"], { visible, hiddenItemIds: [qid], extraHidden: step ? [step.answer] : [], screen: true });
      ai = r.log;
      const stepTip = step ? (step.hint_question?.length ? step.hint_question : step.hint ?? []) : [];
      approved = hintReply(r.text, [stepTip, await fallback(admin, session.topic_id, `warmup_tip__${qid}`)], await fallback(admin, session.topic_id, "warmup_try"));
    }
    if (approved.length) { /* hint tip above */ }
    else if (demo.pendingRepair && demo.fix && (move === "help" || move === "meaning" || move === "unclear")) {
      if (move !== "help" && !isGibberish(text)) {
        const step = demo.fix.part === "try" ? (await fixContent(admin, demo.fix.repairId)).you_try.steps[demo.fix.step] : undefined;
        const visible = [...prompt.map((p) => p.text), ...(step ? (step.prompt ?? []).map((p) => p.text) : [])];
        const r = await groundedAnswer(admin, session.topic_id, text, ["intro", "warmup"], { visible, hiddenItemIds: [qid].filter(Boolean) as string[], extraHidden: step ? [step.answer] : [], screen: true });
        ai = r.log;
        if (r.text) approved = [{ text: r.text }];
      }
      if (!approved.length) approved = move === "unclear" ? await unclearReply(admin, session.topic_id, demo, text, qid) : await contextHelp(admin, session.topic_id, demo, qid);
    }
    // Before she answers, help / "what does it mean" / unclear all get this question's tip (never "didn't catch that").
    let tipKind: "tip" | "again" | undefined;
    if (approved.length) { /* quick fix help above */ }
    else if (!answered && (move === "help" || move === "meaning" || move === "unclear") && !(move === "unclear" && isGibberish(text))) {
      const tip = await fallback(admin, session.topic_id, `warmup_tip__${qid}`);
      const lastTutor = demo.history.filter((h) => h.role === "tutor").at(-1)?.text;
      const again = await fallback(admin, session.topic_id, "warmup_tip_again");
      const pick = pickTip(tip, again, lastTutor);
      tipKind = pick.kind; approved = pick.lines;
      if (!approved.length) approved = await fallback(admin, session.topic_id, "warmup_try");
    }
    else if (move === "maths" || (move === "prereq" && answered) || (answered && (move === "help" || move === "meaning"))) {
      const open: FactStage[] = move === "maths" ? ["intro"] : ["intro", "warmup"];
      const r = await groundedAnswer(admin, session.topic_id, text, open, { visible: prompt.map((p) => p.text), hiddenItemIds: [qid, id].filter(Boolean) as string[], screen: move === "meaning" });
      ai = r.log;
      if (r.text) approved = [{ text: r.text }];
    }
    if (approved.length) { /* tip or checked AI answer */ }
    else if (move === "prereq" && !answered) approved = await fallback(admin, session.topic_id, "warmup_try");
    else if (move === "meaning" || move === "help") approved = prompt.length ? [{ text: prompt.map((p) => p.text).join(" ") }] : await contextHelp(admin, session.topic_id, demo, qid);
    else if (move === "unclear") approved = await unclearReply(admin, session.topic_id, demo, text, qid);
    else {
      const ids = demo.warmupIds ?? [];
      const remaining = String(Math.max(1, ids.filter((i) => !demo.results[i]).length));
      approved = fill(await fallback(admin, session.topic_id, WARMUP_KEY[move]), { role: boundaryRole(text), remaining, count: remaining, count_skills: countWords(Number(remaining), "skill"), remaining_questions: countWords(Number(remaining), "quick question") });
    }
    await flagOnce(admin, userId, sessionId, move, "Warm-up message");
    const banned = await rule(admin, session.topic_id, "banned_words");
    const lines = ai.check === true || replyAllowed(approved, approved, item, demo.lines[qid ?? ""], banned ?? undefined) ? approved : [];
    remember(demo, "student", text);
    lines.forEach(l => remember(demo, "tutor", l.text));
    await logEvent(admin, sessionId, "question_asked", demo.pos.step, { text, kind: move, item_id: qid, sorted_by: source, sort_ms: sortMs, ai, tip: tipKind });
    await save(admin, sessionId, raw, demo);
    return { kind: move, lines, diag: { category: move, source, ms: sortMs ?? null } };
  }
  if (demo.pos.step === "video") {
    const move = pickVideoMove(text);
    if (move) {
      let approved: Script = await fallback(admin, session.topic_id, "video_answer_request");
      if (move === "summary") {
        const { data: clip } = await admin.from("clips").select("segments").eq("topic_id", session.topic_id).limit(1).maybeSingle();
        const seg = segmentAt(((clip?.segments as Any) ?? []) as { start: number; end: number; summary: string }[], demo.videoPos ?? 0);
        if (seg) approved = [{ text: seg.summary }];
      }
      const id = await currentItem(admin, session.topic_id, demo);
      const { data: item } = await admin.from("items").select("prompt").eq("id", id ?? "").eq("topic_id", session.topic_id).maybeSingle();
      const banned = await rule(admin, session.topic_id, "banned_words");
      const lines = replyAllowed(approved, approved, item, [], banned ?? undefined) ? approved : [];
      remember(demo, "student", text);
      lines.forEach(l => remember(demo, "tutor", l.text));
      await logEvent(admin, sessionId, "question_asked", "video", { text, kind: move, item_id: id });
      await save(admin, sessionId, raw, demo);
      return { kind: move, lines };
    }
  }
  // Video, simulation and worksheet: maths questions may get a checked AI answer from the facts covered so far.
  // Guided assessment and the exit ticket get nothing beyond the hint ladder.
  const sorted = await sortMessage(admin, session.topic_id, text, demo.pos.step);
  let aiLog: AiAnswerLog | undefined;
  const chatKey: Partial<Record<string, string>> = { greeting: "chat_greeting_lesson", boundary: "chat_boundary", real: "intro_real", offtopic: "intro_offtopic", distress: "safe_response" };
  const screenQ = SCREEN_QUESTION.test(text.toLowerCase()) && !isGibberish(text);
  // Practice: teach her next step on the problem on screen, with more help each time she asks.
  if (demo.pos.step === "worksheet" && (sorted.move === "maths" || sorted.move === "prereq" || sorted.move === "help" || sorted.move === "unclear" || screenQ) && !(sorted.move === "unclear" && isGibberish(text))) {
    const cur = await currentItem(admin, session.topic_id, demo);
    if (cur) {
      const ph = await import("@/server/lesson/practise-help");
      const asks = demo.practiseAsks?.[cur] ?? 0;
      const level = ph.helpLevel(asks, demo.worksheetMode);
      const [{ data: it }, { data: key }, { data: hints }] = await Promise.all([
        admin.from("items").select("prompt").eq("id", cur).eq("topic_id", session.topic_id).maybeSingle(),
        admin.from("item_keys").select("answer, accepted_forms, worked_solution").eq("item_id", cur).maybeSingle(),
        admin.from("hints").select("rung, script").eq("item_id", cur).order("rung"),
      ]);
      const question = (((it?.prompt as unknown as Script | null) ?? []) as Script).map((p) => p.text).join(" ");
      const her = demo.lines[cur] ?? [];
      const worked = ((key?.worked_solution as string[] | null) ?? []).map(String);
      const k = ph.nextStepIndex(her.length, worked.length);
      const nextLine = worked[k];
      const rungs = (hints ?? []).map((h) => ((h.script as unknown as Script) ?? []).map((l) => l.text).join(" ")).filter(Boolean);
      const stepHint = rungs.length ? [rungs[Math.min(level - 1, rungs.length - 1)]!] : [];
      const setUp = level >= 2 && nextLine ? ph.setUpOf(nextLine) : undefined;
      const recent = demo.history.slice(-4);
      let reply: string | null = null; let check: string | boolean = "off";
      if (aiProvider(await rule(admin, session.topic_id, "ai_provider")) === "lovable_ai") {
        const ms = Number(await rule(admin, session.topic_id, "ai_timeout_ms")) || 4000;
        const raw2 = await teachPractise(redactForAi(text), { question, herLines: her.map((t) => ({ text: t })), stepHint, setUp, history: recent, level: ph.LEVEL_TEXT[level] }, ms);
        if (!raw2) check = "timeout_or_error";
        else {
          const banned = await rule(admin, session.topic_id, "banned_words");
          const c = ph.checkPractiseReply(raw2, { allowedText: [question, text, ...her, ...(setUp ? [setUp] : []), ...stepHint], results: [...ph.hiddenResults(key?.answer, nextLine), ...ph.hiddenResults(key?.accepted_forms, undefined)], banned: banned ?? undefined });
          check = c.ok ? true : c.reason;
          if (c.ok) reply = raw2;
        }
      }
      const lastTutor = demo.history.filter((h) => h.role === "tutor").at(-1)?.text;
      const fallbackLine = rungs.find((r, i) => i >= level - 1 && r !== lastTutor) ?? rungs.find((r) => r !== lastTutor) ?? null;
      const lines: Script = reply ? [{ text: reply }] : fallbackLine ? [{ text: fallbackLine }] : [];
      if (lines.length) {
        demo.practiseAsks = { ...(demo.practiseAsks ?? {}), [cur]: asks + 1 };
        remember(demo, "student", text); lines.forEach((l) => remember(demo, "tutor", l.text));
        await logEvent(admin, sessionId, "question_asked", "worksheet", { text, kind: sorted.move, item_id: cur, sorted_by: sorted.source, sort_ms: sorted.ms, help_level: level, ai: { used: check !== "off", check, reply: reply ?? undefined } });
        await save(admin, sessionId, raw, demo);
        return { kind: sorted.move, lines, diag: { category: sorted.move, source: sorted.source, ms: sorted.ms ?? null } };
      }
    }
  }
  if (["video", "simulation", "worksheet"].includes(demo.pos.step) && (sorted.move === "maths" || sorted.move === "prereq" || sorted.move === "help" || screenQ)) {
    const open: FactStage[] = demo.pos.step === "video" ? ["intro", "warmup", ...((demo.videoPos ?? 0) > 0 ? ["video" as const] : [])] : ["intro", "warmup", "video"];
    const cur = await currentItem(admin, session.topic_id, demo);
    const { data: it } = await admin.from("items").select("prompt").eq("id", cur ?? "").eq("topic_id", session.topic_id).maybeSingle();
    const vis = (((it?.prompt as unknown as Script | null) ?? []) as Script).map((p) => p.text);
    const r = await groundedAnswer(admin, session.topic_id, text, open, { visible: vis, hiddenItemIds: cur ? [cur] : [], screen: screenQ });
    if (r.text) {
      remember(demo, "student", text); remember(demo, "tutor", r.text);
      await logEvent(admin, sessionId, "question_asked", demo.pos.step, { text, kind: sorted.move, item_id: cur, sorted_by: sorted.source, sort_ms: sorted.ms, ai: r.log });
      await save(admin, sessionId, raw, demo);
      return { kind: sorted.move, lines: [{ text: r.text }], diag: { category: sorted.move, source: sorted.source, ms: sorted.ms ?? null } };
    }
    aiLog = r.log; // falls through to the approved line; logged with that turn
  }
  const ck = chatKey[sorted.move];
  if (ck && demo.pos.step !== "guided") {
    const approved = fill(await fallback(admin, session.topic_id, ck), { role: boundaryRole(text) });
    await flagOnce(admin, userId, sessionId, sorted.move, `Message on ${demo.pos.step}`);
    remember(demo, "student", text); approved.forEach((l) => remember(demo, "tutor", l.text));
    await logEvent(admin, sessionId, "question_asked", demo.pos.step, { text, kind: sorted.move, sorted_by: sorted.source });
    await save(admin, sessionId, raw, demo);
    return { kind: sorted.move, lines: approved, diag: { category: sorted.move, source: sorted.source, ms: sorted.ms ?? null } };
  }
  const repeated = demo.history.filter(h => h.role === "student").at(-1)?.text.trim().toLowerCase() === text.trim().toLowerCase();
  const kind = repeated ? "repeat_question" : classifyQuestion(text);
  const id = await currentItem(admin, session.topic_id, demo);
  const { data: item } = await admin.from("items").select("prompt").eq("id", id ?? "").eq("topic_id", session.topic_id).maybeSingle();
  let approved = kind === "unclear" || kind === "dont_understand" ? await (kind === "unclear" ? unclearReply(admin, session.topic_id, demo, text, id) : contextHelp(admin, session.topic_id, demo, id)) : await fallback(admin, session.topic_id, kind);
  if (kind === "dont_understand" && id) {
    const { data: h } = await admin.from("hints").select("script").eq("item_id", id).eq("rung", 0).maybeSingle();
    if (h) approved = h.script as unknown as Script;
  }
  // Never the same line twice in a row: step up to the next approved hint instead.
  const lastTutor = demo.history.filter((h) => h.role === "tutor").at(-1)?.text;
  if (id && lastTutor && approved.some((l) => l.text === lastTutor) && demo.pos.step !== "exit_ticket") {
    const rung = (demo.hints[id] ?? 0) + 1;
    const { data: h } = await admin.from("hints").select("script").eq("item_id", id).eq("rung", rung).maybeSingle();
    if (h) { approved = h.script as unknown as Script; demo.hints[id] = rung; }
  }
  if (kind === "hint_request" && id && demo.pos.step !== "exit_ticket") {
    const { data: h } = await admin.from("hints").select("script").eq("item_id", id).eq("rung", (demo.hints[id] ?? 0) + 1).maybeSingle();
    if (h) { approved = h.script as unknown as Script; demo.hints[id] = (demo.hints[id] ?? 0) + 1; }
  }
  const banned = await rule(admin, session.topic_id, "banned_words");
  const lines = replyAllowed(approved, approved, item, demo.lines[id ?? ""], banned ?? undefined) ? approved : [];
  remember(demo, "student", text);
  lines.forEach(l => remember(demo, "tutor", l.text));
  await logEvent(admin, sessionId, "question_asked", demo.pos.step, { text, kind, item_id: id, sorted_by: sorted.source, sort_ms: sorted.ms, ai: aiLog });
  await save(admin, sessionId, raw, demo);
  return { kind, lines, diag: { category: kind, source: sorted.source, ms: sorted.ms ?? null } };
}

/** Quick fix: she finished watching the worked example (or tapped Show all) and moves on to "You try". */
export async function repairWatchDone(admin: Db, userId: string, sessionId: string, skipped: boolean): Promise<void> {
  const { session, raw, demo } = await loadSession(admin, userId, sessionId);
  const fix = demo.fix;
  if (!demo.pendingRepair || !fix || demo.popup) throw new LessonError("There is no quick fix open.");
  if (fix.part !== "watch") return;
  const c = await fixContent(admin, fix.repairId);
  c.watch.lines.forEach((l) => { if (!demo.history.some((h) => h.role === "tutor" && h.text === l.text)) remember(demo, "tutor", l.text); });
  demo.fix = { ...fix, part: c.you_try.steps.length ? "try" : "practice", stepAt: Date.now() };
  await logEvent(admin, sessionId, skipped ? "repair_watch_skipped" : "repair_watch_done", "readiness", { repair_id: fix.repairId, topic_id: session.topic_id });
  await save(admin, sessionId, raw, demo);
}

/** Quick fix: she tapped Fiti for a hint on the open step. Shows the step's approved hint; never a try, never the answer. */
export async function repairHint(admin: Db, userId: string, sessionId: string, stepId: string): Promise<Script> {
  const { demo } = await loadSession(admin, userId, sessionId);
  const fix = demo.fix;
  if (!demo.pendingRepair || !fix || fix.part !== "try") return [];
  const cur = (await fixContent(admin, fix.repairId)).you_try.steps[fix.step];
  if (!cur || cur.id !== stepId) return [];
  const line = cur.hint_question?.length ? cur.hint_question : cur.hint;
  await logEvent(admin, sessionId, "repair_hint_tapped", "readiness", { repair_id: fix.repairId, step_id: cur.id });
  return line ?? [];
}

/** Quick fix: check one you-try step on the server. The answer never goes to the browser. */
export async function repairStep(admin: Db, userId: string, sessionId: string, stepId: string, value: string): Promise<import("@/shared/contracts/lesson").FixStepResult> {
  const { raw, demo } = await loadSession(admin, userId, sessionId);
  const fix = demo.fix;
  if (!demo.pendingRepair || !fix || fix.part !== "try") throw new LessonError("There is no step to check.");
  const steps = (await fixContent(admin, fix.repairId)).you_try.steps;
  const cur = steps[fix.step];
  if (!cur || cur.id !== stepId) throw new LessonError("That step is already done.");
  const v = value.trim();
  if (!v) throw new LessonError("Type an answer first.");
  if (fix.dialogs?.length) throw new LessonError("Close the message first.");
  const ok = cur.input === "point" ? pointMatches(v, String(cur.answer), cur.grid) : answerMatches(v, [String(cur.answer)]);
  const { result, state } = judgeStep(fix, steps, ok);
  const all = await fixContent(admin, fix.repairId);
  const last = result !== "hint" && state.part === "practice";
  const dialogs = dialogsFor(result, cur, last, all.you_try.done_summary);
  const now = Date.now();
  state.dialogs = dialogs;
  if (result !== "hint") {
    state.evidence = [...(fix.evidence ?? []), stepEvidence(cur.id, result, fix.misses, fix.stepAt, now)];
    state.stepAt = now;
  }
  demo.fix = state;
  // Her step answers stay on the stage: never added to the chat history.
  const settled = result !== "hint";
  const line = result === "right" ? cur.full_line : result === "filled" ? cur.filled_line : (cur.hint_question?.length ? cur.hint_question : cur.hint);
  line.forEach((l) => remember(demo, "tutor", l.text));
  const ev = result === "hint" ? null : state.evidence?.[state.evidence.length - 1];
  await logEvent(admin, sessionId, "repair_step", "readiness", {
    repair_id: fix.repairId, step_id: cur.id, outcome: result === "hint" ? "hint_shown" : ev?.outcome, tries: ev?.tries ?? fix.misses + 1, ms: ev?.ms ?? null,
  });
  await save(admin, sessionId, raw, demo);
  return {
    result, last, dialog: dialogs[0] ?? null,
    step: { id: cur.id, prompt: cur.prompt, input: cur.input ?? "number", state: settled ? (result === "filled" ? "filled" : fix.misses ? "hint_right" : "right") : "open",
      misses: state.misses, hint: settled ? null : line, line: settled ? line : null,
      ...(cur.grid ? { grid: cur.grid } : {}),
      ...(!settled && cur.input === "point" && cur.hint_ring ? (() => { const r = parsePoint(String(cur.answer)); return r ? { ring: r } : {}; })() : {}) },
  };
}

/** Quick fix: she closed the dialog on top (Try again / Continue). */
export async function repairDialogDone(admin: Db, userId: string, sessionId: string): Promise<void> {
  const { raw, demo } = await loadSession(admin, userId, sessionId);
  if (!demo.fix?.dialogs?.length) return;
  demo.fix = { ...demo.fix, dialogs: demo.fix.dialogs.slice(1) };
  await save(admin, sessionId, raw, demo);
}

/** She picked or changed an option before checking: logged only. */
export async function logOption(admin: Db, userId: string, sessionId: string, itemId: string, optionId: string): Promise<void> {
  const { session, demo } = await loadSession(admin, userId, sessionId);
  if (await currentItem(admin, session.topic_id, demo) !== itemId) return;
  await logEvent(admin, sessionId, "option_changed", demo.pos.step, { item_id: itemId, option_id: optionId });
}

/** Save the video play position; seeks past an unanswered check are clamped. Logged as video_seeked when she jumps. */
export async function saveVideoPosition(admin: Db, userId: string, sessionId: string, seconds: number, kind: "tick" | "seek" | "replay"): Promise<number> {
  const { session, raw, demo } = await loadSession(admin, userId, sessionId);
  if (demo.pos.step !== "video") return demo.videoPos ?? 0;
  const { data: clip } = await admin.from("clips").select("id, duration_s").eq("topic_id", session.topic_id).limit(1).maybeSingle();
  const { data: checks } = await admin.from("clip_checks").select("at_seconds, item_id").eq("clip_id", clip?.id ?? "");
  const list = (checks ?? []).map((c) => ({ atSeconds: Number(c.at_seconds), itemId: c.item_id }));
  const limit = seekLimit(list, (id) => !!demo.results[id], Number(clip?.duration_s) || 240);
  demo.videoPos = clampSeek(seconds, limit);
  if (kind !== "tick") await logEvent(admin, sessionId, kind === "replay" ? "video_replayed_segment" : "video_seeked", "video", { to: demo.videoPos, asked: seconds });
  await save(admin, sessionId, raw, demo);
  return demo.videoPos;
}


export type SimCheckReply = { right: boolean; misconception: string | null; lines: Script; fields: boolean[]; faint: number[][] | null; choice: string | null; repeats: number; labels: { up: number; across: number } | null };

const MIS_ID: Record<string, string> = { inverted: "MIS_INVERTED", sign: "MIS_SIGN_GRAD" };
const minus = (s: string) => s.replace(/-/g, "−");

/** Marks only the current task, from hidden content; the browser never sees a target. */
export async function simCheck(admin: Db, userId: string, sessionId: string, answer: import("@/shared/contracts/simulation").NativeSimAnswer, moveOnly = false): Promise<SimCheckReply | null> {
  const { session, raw, demo } = await loadSession(admin, userId, sessionId);
  if (demo.pos.step !== "simulation") throw new LessonError("This task is not open.");
  const act = await activeSim(admin, session.topic_id, demo);
  if (act && isLabEngine(act.engine)) throw new LessonError("This task is not open.");
  const task = act?.tasks.find((t) => !demo.simDone.includes(t.id));
  if (!task) throw new LessonError("This task is complete.");
  demo.simSaved = { ...demo.simSaved, [publicTaskId(task.sequence)]: answer };
  const startKey = `sim_start:${task.id}`;
  if (!demo.lines[startKey]) demo.lines[startKey] = [new Date().toISOString()];
  if (moveOnly) { await save(admin, sessionId, raw, demo); return null; }

  const check = task.content.check;
  const { checkSimulation, pickFeedback, fillSim } = await import("@/server/maths/sim-checks");
  const v = checkSimulation(check, answer);
  const attempts = (demo.attempts[task.id] ?? 0) + 1;
  demo.attempts[task.id] = attempts;
  const misconception = v.mistake ? MIS_ID[v.mistake] ?? null : null;
  if (misconception) demo.simMis = { ...demo.simMis, [misconception]: (demo.simMis?.[misconception] ?? 0) + 1 };

  // Same wrong answer twice in a row counts toward the help prompt.
  const key = JSON.stringify(answer);
  const prev = demo.simWrong?.[task.id];
  const repeats = v.right ? 0 : prev?.key === key ? prev.n + 1 : 1;
  demo.simWrong = { ...demo.simWrong, [task.id]: { key, n: repeats } };

  let lines: Script;
  if (v.right) {
    const target = minus(check.target);
    const working = check.kind === "choice" ? (check.working ?? "")
      : check.kind === "rise_run_gradient" ? `Rise ${minus(String(v.up))}, run ${v.across}: ${minus(String(v.up))} ÷ ${v.across} = ${target}`
      : `Up ${minus(String(v.up))}, across ${minus(String(v.across))}: ${minus(String(v.up))} ÷ ${minus(String(v.across))} = ${target}`;
    lines = [{ text: working }];
    demo.simDone.push(task.id);
  } else {
    const fb = pickFeedback(check.feedback ?? {}, v) ?? check.hints?.[0] ?? "";
    lines = [{ text: fillSim(fb, v) }];
    if (attempts >= 3) lines.push({ text: check.faint_line ?? "Here's one that works. Place your point on it." });
  }
  demo.history.push(...lines.map((l) => ({ role: "tutor" as const, text: l.text })));

  const started = Date.parse(demo.lines[startKey]?.[0] ?? "") || Date.now();
  const downhill = String(check.target).startsWith("-");
  const payload = {
    band: demo.band, task_id: task.id, attempts, first_try: attempts === 1, hints: demo.hints[task.id] ?? 0,
    misconception, final_answer: answer, correct: v.right, time_ms: Date.now() - started,
  };
  await logEvent(admin, sessionId, "task_result", "simulation", payload);
  await insertEvidence(admin, {
    session_id: sessionId, student_id: userId, step: "simulation", skill_id: downhill ? "GRAD-02" : "GRAD-01",
    attempt: attempts, is_first_try: attempts === 1, correct: v.right, response: payload as unknown as Json,
    hint_rung: demo.hints[task.id] ?? null, opted_out: false, strength: v.right ? "moderate" : "weak", misconception_id: misconception,
  });
  await save(admin, sessionId, raw, demo);
  const third = !v.right && attempts >= 3;
  return {
    right: v.right, misconception, lines, fields: v.fields, repeats,
    faint: third && check.kind !== "choice" && check.kind !== "rise_run_gradient" ? faintOf(check) : null,
    choice: third && check.kind === "choice" ? check.target : null,
    labels: v.right && check.kind !== "choice" ? { up: v.up, across: v.across } : null,
  };
}

/** Closing card from her results: tasks right first time, and the misconception she showed most. */
export async function buildSimClosing(raw: Any, demo: DemoState, tasks: { id: string; sequence: number }[]): Promise<{ did_well: Script; watch: Script; hook_link: Script; closing_line: Script }> {
  const c = raw ?? {};
  const first = tasks.filter((t) => demo.attempts[t.id] === 1 && demo.simDone.includes(t.id)).map((t) => `Task ${t.sequence}`);
  const list = first.length <= 1 ? first.join("") : `${first.slice(0, -1).join(", ")} and ${first[first.length - 1]}`;
  const didWell = first.length ? (c.did_well?.[0]?.text ?? "").replace("{tasks}", list) : (c.did_well?.[1]?.text ?? "");
  const top = Object.entries(demo.simMis ?? {}).sort((a, b) => b[1] - a[1])[0]?.[0];
  const watch = (top && c.watch_by?.[top]) || c.watch || [];
  return { did_well: [{ text: didWell }], watch, hook_link: c.hook_link ?? [], closing_line: c.closing_line ?? [] };
}


// ---------- Gradient Lab (frame engine) ----------
type LabMsg =
  | { type: "changed"; task_id: string; state: Record<string, unknown> }
  | { type: "activity"; task_id: string; idle_ms: number; moves: number }
  | { type: "task_result"; task_id: string; state: Record<string, unknown>; passed: boolean; hints_used?: number; ms?: number }
  | { type: "v2_event"; task_id: string; event: string; screen?: number; answer?: import("@/server/maths/gradient-lab-v2-checks").V2Answer; detail?: Record<string, unknown> }
  | { type: "ready" | "resize" | "lock" | "unlock" | "highlight" | "set" | "next_task" | "help_requested"; task_id?: string; detail?: Record<string, unknown> };

/** Every message from the lab is logged; her values are saved for resume; a result is settled only by the maths check. */
export async function simLab(admin: Db, userId: string, sessionId: string, msg: LabMsg): Promise<{ done: boolean; lines: Script; reaction: "nod" | "retry" | null }> {
  const { session, raw, demo } = await loadSession(admin, userId, sessionId);
  const none = { done: false, lines: [] as Script, reaction: null };
  await logEvent(admin, sessionId, `sim_msg_${msg.type}`, "simulation", msg as unknown as Record<string, unknown>);
  if (demo.pos.step !== "simulation") return none;
  const act = await activeSim(admin, session.topic_id, demo);
  if (!act || !isLabEngine(act.engine)) return none;
  const task = act.tasks.find((t) => !demo.simDone.includes(t.id));
  if (!task || !("task_id" in msg) || msg.task_id !== publicTaskId(task.sequence)) return none;
  if (act.engine === "gradient-lab-v2") {
    // v2 runs unchanged; we read her answer off its screen and mark it ourselves (src/server/maths/gradient-lab-v2-checks.ts).
    if (msg.type !== "v2_event") return none;
    const { checkLabV2, nextQuestionIndex } = await import("@/server/maths/gradient-lab-v2-checks");
    const detail = (msg.detail ?? {}) as Record<string, unknown>;
    const prog = ((demo.simProgress ?? {}) as Any).v2 ?? { screen: null, q: {} };
    const screen = Number(msg.screen ?? detail["screen"]) || prog.screen || 0;
    if (msg.event === "screen") {
      if (screen && screen !== prog.screen) { demo.simProgress = { ...demo.simProgress, v2: { ...prog, screen } }; await save(admin, sessionId, raw, demo); }
      return none;
    }
    const qKey = String(screen);
    const q = Number(prog.q?.[qKey] ?? 0);
    let ours: boolean | null = null, reaction: "nod" | "retry" | null = null;
    if (msg.event === "attempt") {
      const labSaid = detail["correct"] === true;
      ours = msg.answer ? checkLabV2(screen, q, msg.answer, (task.content.check?.question_sets ?? {}) as never) : null;
      const verdict = ours ?? labSaid;
      const source = ours == null ? "lab_reported" : "our_engine";
      if (ours == null) await logEvent(admin, sessionId, "sim_v2_read_failed", "simulation", { task_id: task.id, screen });
      if (ours != null && ours !== labSaid) await logEvent(admin, sessionId, "sim_result_disagrees", "simulation", { task_id: task.id, screen, lab_passed: labSaid, ours });
      await logEvent(admin, sessionId, "sim_v2_marked", "simulation", { task_id: task.id, screen, q, lab: labSaid, ours, source });
      // After her last try the lab shows the answer and its working: recorded as answer shown, never as right.
      const { labV2AnswerShown } = await import("@/shared/lab-v2");
      const shown = labV2AnswerShown(msg.event, detail);
      if (shown) await logEvent(admin, sessionId, "sim_v2_answer_shown", "simulation", { task_id: task.id, screen, q });
      if (ours != null) {
        const key = `${task.id}:${screen}:${q}`;
        const attempts = (demo.attempts[key] ?? 0) + 1; demo.attempts[key] = attempts;
        const firstTry = attempts === 1;
        await insertEvidence(admin, { session_id: sessionId, student_id: userId, step: "simulation", attempt: attempts, is_first_try: firstTry, correct: shown ? false : ours,
          response: { engine: "gradient-lab-v2", screen, q, answer: msg.answer, lab_correct: labSaid, answer_shown: shown } as Json,
          opted_out: false, strength: ours ? (firstTry ? "strong" : "moderate") : "weak", misconception_id: null });
      }
      reaction = verdict ? "nod" : "retry";
    } else {
      await logEvent(admin, sessionId, `sim_v2_${msg.event}`, "simulation", { task_id: task.id, screen, source: "lab_reported", ...detail });
    }
    const nq = nextQuestionIndex(q, msg.event, detail);
    demo.simProgress = { ...demo.simProgress, v2: { screen: screen || prog.screen, q: { ...(prog.q ?? {}), [qKey]: nq } } };
    if (msg.event !== "complete") { await save(admin, sessionId, raw, demo); return { done: false, lines: [], reaction }; }
    demo.simDone.push(task.id);
    await logEvent(admin, sessionId, "sim_task_settled", "simulation", { task_id: task.id, source: "lab_reported" });
    await save(admin, sessionId, raw, demo);
    return { done: true, lines: (task.content.praise ?? []) as Script, reaction: "nod" };
  }
  if (msg.type === "changed") {
    demo.simProgress = { ...demo.simProgress, [msg.task_id]: msg.state };
    const startKey = `sim_start:${task.id}`;
    if (!demo.lines[startKey]) demo.lines[startKey] = [new Date().toISOString()];
    await save(admin, sessionId, raw, demo);
    return none;
  }
  if (msg.type !== "task_result") return none;
  const { checkLabMission } = await import("@/server/maths/gradient-lab-checks");
  const right = checkLabMission(task.content.check, msg.state);
  const attempts = (demo.attempts[task.id] ?? 0) + 1;
  demo.attempts[task.id] = attempts;
  const hints = demo.hints[task.id] ?? 0;
  const started = demo.lines[`sim_start:${task.id}`]?.[0];
  const ms = started ? Date.now() - Date.parse(started) : null;
  const firstTry = attempts === 1 && hints === 0;
  if (msg.passed && !right) await logEvent(admin, sessionId, "sim_result_disagrees", "simulation", { task_id: task.id, lab_passed: true });
  await insertEvidence(admin, { session_id: sessionId, student_id: userId, step: "simulation", attempt: attempts, is_first_try: firstTry, correct: right,
    response: { engine: "gradient-lab", mission: task.content.check.mission, level: task.content.check.level, state: msg.state, hints_used: hints, ms } as Json,
    opted_out: false, strength: right ? (firstTry ? "strong" : "moderate") : "weak", misconception_id: null });
  demo.simProgress = { ...demo.simProgress, [msg.task_id]: msg.state };
  if (!right) { await save(admin, sessionId, raw, demo); return { done: false, lines: (task.content.not_yet ?? []) as Script, reaction: "retry" }; }
  demo.simDone.push(task.id);
  await logEvent(admin, sessionId, "sim_task_settled", "simulation", { task_id: task.id, first_try: firstTry, hints_used: hints, ms });
  await save(admin, sessionId, raw, demo);
  return { done: true, lines: (task.content.praise ?? []) as Script, reaction: "nod" };
}

/** The lab did not load in time, reported an error, or low-data mode is on: the band's built-in board takes over for the rest of the step. */
export async function simFallback(admin: Db, userId: string, sessionId: string, reason: string): Promise<{ ok: boolean }> {
  const { session, raw, demo } = await loadSession(admin, userId, sessionId);
  if (demo.pos.step !== "simulation" || demo.simFallback) return { ok: false };
  const act = await activeSim(admin, session.topic_id, demo);
  if (!act || !isLabEngine(act.engine) || !act.fallbackEngine) return { ok: false };
  demo.simFallback = reason;
  await logEvent(admin, sessionId, reason === "low_data" ? "sim_low_data" : "sim_fallback", "simulation", { reason, from: act.primary, to: act.fallbackEngine, band: demo.band });
  await save(admin, sessionId, raw, demo);
  return { ok: true };
}

/** Map "go back": move her open lesson back to an earlier step and clear that step and every later one.
 *  Evidence rows stay (records); only her place and in-step state move. A fresh run of a finished topic may jump to any step. */
export async function rewindStep(admin: Db, userId: string, sessionId: string, target: LessonStep): Promise<{ ok: true }> {
  const { session, raw, demo } = await loadSession(admin, userId, sessionId);
  if (session.status !== "active" && session.status !== "paused") throw new LessonError("This lesson is already closed.");
  const cur = LESSON_STEPS.indexOf(demo.pos.step), to = LESSON_STEPS.indexOf(target);
  if (to < 0) throw new LessonError("That step doesn't exist.");
  if (to >= cur) {
    // Only a fresh run of a topic she has finished may jump forward.
    const fresh = cur === 0 && demo.pos.index === 0 && !Object.keys(demo.results).length;
    const { count } = await admin.from("sessions").select("id", { count: "exact", head: true })
      .eq("student_id", userId).eq("topic_id", session.topic_id).eq("status", "completed").neq("id", sessionId);
    // A fresh run is already at the warm-up: going "back" to it needs no move.
    if (to === cur && fresh) return { ok: true };
    if (!(to > cur && fresh && count)) throw new LessonError("You can only go back to a step you've done.");
  }
  const { stepsFrom } = await import("@/shared/path-stops");
  const cleared = new Set<string>(stepsFrom(target));
  const { data: items } = await admin.from("items").select("id, step").eq("topic_id", session.topic_id);
  const ids = (items ?? []).filter((i) => cleared.has(i.step as string)).map((i) => i.id);
  for (const id of ids) { delete demo.results[id]; delete demo.attempts[id]; delete demo.hints[id]; delete demo.lines[id]; if (demo.tried) delete demo.tried[id]; }
  if (cleared.has("readiness")) {
    // Warm-up runs in full again (no skips from earlier evidence).
    const all = (items ?? []).filter((i) => i.step === "readiness").map((i) => i.id);
    const practice = await practiceItemIds(admin, session.topic_id);
    demo.warmupAll = all.filter((id) => !practice.has(id)); demo.warmupIds = [...demo.warmupAll];
    demo.skipReasons = []; demo.readiness = {};
  }
  if (cleared.has("hook")) demo.prediction = null;
  if (cleared.has("video")) { demo.videoPos = 0; demo.firm = []; demo.luckyGuesses = 0; }
  if (cleared.has("simulation")) { demo.simDone = []; demo.simSaved = {}; demo.simMis = {}; demo.simProgress = {}; demo.simFallback = null; demo.simWrong = {}; demo.band = null; }
  if (cleared.has("worksheet")) demo.worksheetMode = "independent";
  demo.popup = null; demo.fix = null; demo.pendingRepair = null; demo.closed = false;
  const from = demo.pos.step;
  demo.pos = { step: target, index: 0 };
  await logEvent(admin, sessionId, "step_rewound", target, { from, cleared: [...cleared] });
  await save(admin, sessionId, raw, demo, { band: demo.band });
  return { ok: true };
}
