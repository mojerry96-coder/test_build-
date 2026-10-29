import type { ConversationSummary } from "@/shared/contracts/conversations";
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { HomeData, HomeReply, HomeChatMsg, HomeProposal } from "@/shared/contracts/home";

/** Voice: Fiti may speak only the words of a reply she was sent (each line and the joined message). */
export const spokenOf = (r: { lines: string[] } | null) => r ? [...r.lines, r.lines.join(" ")] : [];
async function noteReply<T extends { lines: string[] } | null>(userId: string, r: T): Promise<T> {
  const { noteShown } = await import("@/server/providers/voice-ledger.server");
  await noteShown(userId, spokenOf(r));
  return r;
}

async function ctx(context: { supabase: any; userId: string }) { // eslint-disable-line @typescript-eslint/no-explicit-any
  const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return { admin: supabaseAdmin, isAdmin: !!isAdmin };
}

export const getHomeFn = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<HomeData> => {
    const { admin, isAdmin } = await ctx(context);
    const { loadHome } = await import("@/server/home/agent.server");
    return loadHome(admin, context.userId, isAdmin);
  });

export const homeHistoryFn = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ conversationId: string | null; msgs: HomeChatMsg[] }> => {
    const { admin } = await ctx(context);
    const { homeHistory } = await import("@/server/home/agent.server");
    return homeHistory(admin, context.userId);
  });

export const openConversationFn = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator((d: { conversationId: string }) => ({ conversationId: String(d?.conversationId ?? "") }))
  .handler(async ({ data, context }): Promise<{ conversationId: string | null; msgs: HomeChatMsg[] }> => {
    const { admin } = await ctx(context);
    const { homeHistory } = await import("@/server/home/agent.server");
    return homeHistory(admin, context.userId, data.conversationId);
  });

export const listConversationsFn = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ConversationSummary[]> => {
    const { admin } = await ctx(context);
    const { listConversations } = await import("@/server/home/agent.server");
    return listConversations(admin, context.userId);
  });

type SendInput = { conversationId?: string | null } & (
  | { kind: "text"; text: string; mode: "tutor" | "quiz" }
  | { kind: "card"; itemId: string | null; cardKind: string }
  | { kind: "start_plan" }
  | { kind: "plan_yes"; proposal: HomeProposal }
  | { kind: "option"; num: number });

/** New Chat: starts a fresh conversation. */
export const newConversationFn = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ conversationId: string }> => {
    const { admin } = await ctx(context);
    const { ensureConversation } = await import("@/server/home/agent.server");
    return { conversationId: await ensureConversation(admin, context.userId, null) };
  });

export const homeSendFn = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator((d: SendInput) => {
    if (d.kind === "text" && (typeof d.text !== "string" || !d.text.trim() || d.text.length > 600)) throw new Error("Bad message");
    if (d.kind === "option" && (!Number.isInteger(d.num) || d.num < 1 || d.num > 20)) throw new Error("Bad option");
    if (d.conversationId != null && !/^[0-9a-f-]{36}$/.test(d.conversationId)) throw new Error("Bad conversation");
    return d;
  })
  .handler(async ({ data, context }): Promise<HomeReply> => {
    const { admin, isAdmin } = await ctx(context);
    const { handleHome, ensureConversation, lastTutorMeta } = await import("@/server/home/agent.server");
    const convId = await ensureConversation(admin, context.userId, data.conversationId, data.kind === "text" ? data.text : undefined);
    // A "Yes" is only honoured for the proposal the tutor actually made last.
    if (data.kind === "plan_yes") {
      const p = ((await lastTutorMeta(admin, context.userId, convId)) as { proposal?: HomeProposal } | null)?.proposal;
      if (!p) throw new Error("Nothing to confirm");
      return noteReply(context.userId, await handleHome(admin, context.userId, isAdmin, { kind: "plan_yes", proposal: p }, convId));
    }
    const { conversationId: _c, ...input } = data; void _c;
    return noteReply(context.userId, await handleHome(admin, context.userId, isAdmin, input as Parameters<typeof handleHome>[3], convId));
  });

export const getQuizFn = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth])
  .inputValidator((d: { sessionId: string }) => d)
  .handler(async ({ data, context }) => {
    const { admin } = await ctx(context);
    const { getQuiz } = await import("@/server/home/quiz.server");
    return getQuiz(admin, context.userId, data.sessionId);
  });

export const answerQuizFn = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator((d: { sessionId: string; itemId: string; option?: string | undefined; text?: string | undefined }) => d)
  .handler(async ({ data, context }) => {
    const { admin } = await ctx(context);
    const { answerQuiz } = await import("@/server/home/quiz.server");
    return answerQuiz(admin, context.userId, data.sessionId, data.itemId, { option: data.option, text: data.text?.slice(0, 60) });
  });

/** Fiti speaks first in a fresh conversation (first-time talk or a situation-aware hello), or null. */
export const homeOpeningFn = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator((d: { conversationId: string | null }) => {
    if (d.conversationId != null && !/^[0-9a-f-]{36}$/.test(d.conversationId)) throw new Error("Bad conversation");
    return d;
  })
  .handler(async ({ data, context }): Promise<HomeReply | null> => {
    const { admin, isAdmin } = await ctx(context);
    const { homeOpening } = await import("@/server/home/agent.server");
    return noteReply(context.userId, await homeOpening(admin, context.userId, isAdmin, data.conversationId));
  });

/** "Talk to me again": the first-time conversation plays on her next visit. Only touches her own row. */
export const talkAgainFn = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ ok: true }> => {
    const { admin } = await ctx(context);
    const { resetIntro } = await import("@/server/home/opening.server");
    await resetIntro(admin, context.userId);
    return { ok: true };
  });

/** "Start again": any signed-in student; touches only her own rows. */
export const restartMyJourneyFn = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ ok: true; ended: number }> => {
    const { admin } = await ctx(context);
    const { restartMyJourney } = await import("@/server/home/restart.server");
    return restartMyJourney(admin, context.userId);
  });
