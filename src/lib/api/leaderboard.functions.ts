// Thin client entry point for the Leaderboard page.
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { LeaderPeriod } from "@/shared/contracts/leaderboard";

export const leaderboardFn = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator((d: { period: LeaderPeriod }) => ({ period: d?.period === "all" ? "all" as const : "week" as const }))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { loadLeaderboard } = await import("@/server/home/leaderboard.server");
    const r = await loadLeaderboard(supabaseAdmin, context.userId, data.period);
    const { noteShown } = await import("@/server/providers/voice-ledger.server");
    await noteShown(context.userId, [r.fitiLine]);
    return r;
  });
