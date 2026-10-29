import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getLowDataFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { getLowData } = await import("@/server/functions/prefs.server");
    return { lowData: await getLowData(supabaseAdmin, context.userId) };
  });

export const setLowDataFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ on: z.boolean() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { setLowData } = await import("@/server/functions/prefs.server");
    await setLowData(supabaseAdmin, context.userId, data.on);
    return { ok: true as const };
  });
