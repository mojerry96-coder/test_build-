// Thin client entry point for the lesson's Leaderboard (her progress) tab.
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const progressFn = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator((d: { sessionId: string; done: number }) => ({ sessionId: String(d?.sessionId ?? ""), done: Math.max(0, Math.min(8, Math.floor(Number(d?.done) || 0))) }))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { loadProgress } = await import("@/server/home/progress.server");
    const r = await loadProgress(supabaseAdmin, context.userId, data.sessionId, data.done);
    const { noteShown } = await import("@/server/providers/voice-ledger.server");
    await noteShown(context.userId, [r.fitiLine]);
    return r;
  });
