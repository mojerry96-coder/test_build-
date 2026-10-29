// Thin wrappers for the Super Admin panel. All checks live in src/server/functions/dev-tools.server.ts.
import { createServerFn } from "@tanstack/react-start";
import { getRequestHost } from "@tanstack/react-start/server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getDevToolsAccessFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { devAccess } = await import("@/server/functions/dev-tools.server");
    return { allowed: await devAccess(context.supabase, supabaseAdmin, context.userId, getRequestHost()) };
  });

export const devToolsActionFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => d as Record<string, unknown>)
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { devAction } = await import("@/server/functions/dev-tools.server");
    // Validated with zod inside devAction; results are plain JSON.
    return JSON.stringify(await devAction(context.supabase, supabaseAdmin, context.userId, getRequestHost(), data));
  });
