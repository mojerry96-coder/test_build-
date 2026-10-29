// Thin client-callable wrappers for the lesson screen. Logic lives in src/server/lesson.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

import { taskResultSchema } from "@/shared/contracts/simulation";

const sid = z.string().uuid();
const itemId = z.string().min(1).max(64);

async function core() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const mod = await import("@/server/lesson/demo-path.server");
  return { admin: supabaseAdmin, mod };
}

async function guard<T>(userId: string, fn: () => Promise<T>): Promise<T> {
  try {
    const result = await fn();
    // Voice: note every string sent to her, so the voice endpoint may speak it later and nothing else.
    const { noteShown } = await import("@/server/providers/voice-ledger.server");
    await noteShown(userId, result);
    return result;
  } catch (e) {
    const { LessonError } = await import("@/server/lesson/demo-path.server");
    if (e instanceof LessonError) throw new Error(e.message);
    console.error("lesson function failed", e);
    throw new Error("Something went wrong. Please try again.");
  }
}

export const getLessonFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ sessionId: sid }).parse(d))
  .handler(async ({ data, context }) => guard(context.userId, async () => {
    const { admin, mod } = await core();
    return mod.getLessonView(admin, context.userId, data.sessionId);
  }));

export const checkAnswerFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    sessionId: sid, itemId,
    response: z.object({
      value: z.string().max(1000).optional(), optionId: z.string().max(16).optional(),
      fields: z.record(z.string().max(40), z.string().max(40)).optional(), text: z.string().max(1000).optional(),
    }),
    confidence: z.enum(["sure", "think_so", "guessing"]).nullable().optional(),
  }).parse(d))
  .handler(async ({ data, context }) => guard(context.userId, async () => {
    const { admin, mod } = await core();
    return mod.checkAnswer(admin, context.userId, data.sessionId, data.itemId, data.response, data.confidence ?? null);
  }));

export const checkLinesFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ sessionId: sid, itemId, lines: z.array(z.string().max(120)).min(1).max(20) }).parse(d))
  .handler(async ({ data, context }) => guard(context.userId, async () => {
    const { admin, mod } = await core();
    return mod.checkLines(admin, context.userId, data.sessionId, data.itemId, data.lines);
  }));

export const hintFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ sessionId: sid, itemId }).parse(d))
  .handler(async ({ data, context }) => guard(context.userId, async () => {
    const { admin, mod } = await core();
    return mod.nextHint(admin, context.userId, data.sessionId, data.itemId);
  }));

export const teachMeFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ sessionId: sid, itemId, mode: z.enum(["model", "together"]) }).parse(d))
  .handler(async ({ data, context }) => guard(context.userId, async () => {
    const { admin, mod } = await core();
    return mod.teachMe(admin, context.userId, data.sessionId, data.itemId, data.mode);
  }));

export const explainFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ sessionId: sid }).parse(d))
  .handler(async ({ data, context }) => guard(context.userId, async () => {
    const { admin, mod } = await core();
    return mod.explainQuestion(admin, context.userId, data.sessionId);
  }));

export const predictionFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ sessionId: sid, optionId: z.string().max(16), boxes: z.record(z.string().max(40), z.string().max(20)) }).parse(d))
  .handler(async ({ data, context }) => guard(context.userId, async () => {
    const { admin, mod } = await core();
    const lines = await mod.savePrediction(admin, context.userId, data.sessionId, data.optionId, data.boxes);
    return { ok: true, lines };
  }));

export const simTaskFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ sessionId: sid, result: taskResultSchema }).parse(d))
  .handler(async ({ data, context }) => guard(context.userId, async () => {
    const { admin, mod } = await core();
    return mod.simTaskDone(admin, context.userId, data.sessionId, data.result);
  }));

export const advanceFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ sessionId: sid }).parse(d))
  .handler(async ({ data, context }) => guard(context.userId, async () => {
    const { admin, mod } = await core();
    await mod.advance(admin, context.userId, data.sessionId);
    return { ok: true };
  }));

export const closeLessonFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ sessionId: sid, reflection: z.string().max(2000) }).parse(d))
  .handler(async ({ data, context }) => guard(context.userId, async () => {
    const { admin, mod } = await core();
    return mod.closeLesson(admin, context.userId, data.sessionId, data.reflection);
  }));

export const askTutorFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ sessionId: sid, text: z.string().min(1).max(500), intent: z.literal("hint").optional() }).parse(d))
  .handler(async ({ data, context }) => guard(context.userId, async () => {
    const { admin, mod } = await core();
    const r = await mod.askTutor(admin, context.userId, data.sessionId, data.text, data.intent);
    // The sorting label is for admins testing only; students never receive it.
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin && "diag" in r) delete (r as { diag?: unknown }).diag;
    return r;
  }));

export const worksheetModeFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(d => z.object({ sessionId: sid, mode: z.enum(["teach_me", "independent"]) }).parse(d))
  .handler(async ({ data, context }) => guard(context.userId, async () => {
    const { admin, mod } = await core();
    await mod.setWorksheetMode(admin, context.userId, data.sessionId, data.mode);
    return { ok: true };
  }));

export const simHelpFn = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator(d => z.object({ sessionId: sid }).parse(d))
  .handler(async ({ data, context }) => guard(context.userId, async () => { const { admin, mod } = await core(); return mod.simHelp(admin, context.userId, data.sessionId); }));

export const skipRepairFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ sessionId: sid }).parse(d))
  .handler(async ({ data, context }) => guard(context.userId, async () => {
    const { admin, mod } = await core();
    return { lines: await mod.skipRepair(admin, context.userId, data.sessionId) };
  }));

export const closePopupFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ sessionId: sid, action: z.enum(["continue", "fix"]), working: z.enum(["shown", "skipped"]).optional() }).parse(d))
  .handler(async ({ data, context }) => guard(context.userId, async () => {
    const { admin, mod } = await core();
    await mod.closePopup(admin, context.userId, data.sessionId, data.action, data.working);
    return { ok: true };
  }));

export const repairWatchDoneFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ sessionId: sid, skipped: z.boolean() }).parse(d))
  .handler(async ({ data, context }) => guard(context.userId, async () => {
    const { admin, mod } = await core();
    await mod.repairWatchDone(admin, context.userId, data.sessionId, data.skipped);
    return { ok: true };
  }));

export const repairStepFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ sessionId: sid, stepId: z.string().min(1).max(32), value: z.string().min(1).max(40) }).parse(d))
  .handler(async ({ data, context }) => guard(context.userId, async () => {
    const { admin, mod } = await core();
    return mod.repairStep(admin, context.userId, data.sessionId, data.stepId, data.value);
  }));

export const repairHintFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ sessionId: sid, stepId: z.string().min(1).max(32) }).parse(d))
  .handler(async ({ data, context }) => guard(context.userId, async () => {
    const { admin, mod } = await core();
    return mod.repairHint(admin, context.userId, data.sessionId, data.stepId);
  }));

export const repairDialogFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ sessionId: sid }).parse(d))
  .handler(async ({ data, context }) => guard(context.userId, async () => {
    const { admin, mod } = await core();
    await mod.repairDialogDone(admin, context.userId, data.sessionId);
    return { ok: true };
  }));

export const logOptionFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ sessionId: sid, itemId, optionId: z.string().min(1).max(16) }).parse(d))
  .handler(async ({ data, context }) => guard(context.userId, async () => {
    const { admin, mod } = await core();
    await mod.logOption(admin, context.userId, data.sessionId, data.itemId, data.optionId);
    return { ok: true };
  }));

export const videoPositionFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ sessionId: sid, seconds: z.number().min(0).max(36000), kind: z.enum(["tick", "seek", "replay"]) }).parse(d))
  .handler(async ({ data, context }) => guard(context.userId, async () => {
    const { admin, mod } = await core();
    return { position: await mod.saveVideoPosition(admin, context.userId, data.sessionId, data.seconds, data.kind) };
  }));

export const simCheckFn = createServerFn({ method:"POST" }).middleware([requireSupabaseAuth])
 .inputValidator(d=>z.object({sessionId:sid,moveOnly:z.boolean().optional(),answer:z.object({points:z.array(z.array(z.number().int().min(0).max(6)).length(2)).max(2).optional(),rise:z.string().max(40).optional(),run:z.string().max(40).optional(),gradient:z.string().max(40).optional(),choice:z.string().max(1).optional()})}).parse(d))
 .handler(async({data,context})=>guard(context.userId,async()=>{const {admin,mod}=await core();return mod.simCheck(admin,context.userId,data.sessionId,data.answer,data.moveOnly);}));
// Gradient Lab messages (changed / activity / task_result / others for the log) and the built-in fallback.
const labPoint = z.object({ x: z.number().int().min(-20).max(20), y: z.number().int().min(-40).max(40) });
const labState = z.object({
  m: z.union([z.number().finite(), z.string().max(20)]).optional(), c: z.union([z.number().finite(), z.string().max(20)]).optional(),
  A: labPoint.optional(), B: labPoint.optional(), p1: labPoint.nullable().optional(), p2: labPoint.nullable().optional(),
}).strict();
const taskId = z.string().min(1).max(16);
const labMsg = z.discriminatedUnion("type", [
  z.object({ type: z.literal("changed"), task_id: taskId, state: labState }),
  z.object({ type: z.literal("activity"), task_id: taskId, idle_ms: z.number().int().min(0).max(86_400_000), moves: z.number().int().min(0).max(100000) }),
  z.object({ type: z.literal("task_result"), task_id: taskId, state: labState, passed: z.boolean() }),
  z.object({ type: z.literal("v2_event"), task_id: taskId, event: z.enum(["attempt", "support-offered", "support", "tutorial", "complete", "screen"]), screen: z.number().int().min(1).max(14).optional(),
    answer: z.object({ fields: z.record(z.string().max(20), z.string().max(20)).optional(), sliders: z.object({ m: z.number().min(-20).max(20).optional(), c: z.number().min(-20).max(20).optional() }).optional(), choice: z.number().int().min(0).max(9).nullable().optional() }).optional(), detail: z.record(z.string(), z.union([z.string().max(80), z.number(), z.boolean(), z.null()])).optional() }),
  z.object({ type: z.enum(["ready", "resize", "lock", "unlock", "highlight", "set", "next_task", "help_requested"]), task_id: taskId.optional(), detail: z.record(z.string(), z.union([z.string().max(80), z.number(), z.boolean(), z.null()])).optional() }),
]);
export const simLabFn = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator(d => z.object({ sessionId: sid, msg: labMsg }).parse(d))
  .handler(async ({ data, context }) => guard(context.userId, async () => { const { admin, mod } = await core(); return mod.simLab(admin, context.userId, data.sessionId, data.msg as Parameters<typeof mod.simLab>[3]); }));
export const simFallbackFn = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator(d => z.object({ sessionId: sid, reason: z.enum(["timeout", "error", "frame_error", "low_data"]) }).parse(d))
  .handler(async ({ data, context }) => guard(context.userId, async () => { const { admin, mod } = await core(); return mod.simFallback(admin, context.userId, data.sessionId, data.reason); }));

export const rewindStepFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ sessionId: sid, step: z.enum(["readiness", "hook", "video", "simulation", "worksheet", "guided", "exit_ticket", "reflection"]) }).parse(d))
  .handler(async ({ data, context }) => guard(context.userId, async () => {
    const { admin, mod } = await core();
    return mod.rewindStep(admin, context.userId, data.sessionId, data.step);
  }));
