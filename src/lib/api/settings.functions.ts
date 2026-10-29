import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Json } from "@/integrations/supabase/types";

export const updateSettingFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ key: z.string().min(1).max(64), value: z.unknown() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { updateSetting } = await import("@/server/functions/settings.server");
    return updateSetting(context.supabase, supabaseAdmin, context.userId, data.key, data.value as Json);
  });

/** Public: only whether this is a test build, so the banner shows on every screen. */
export const getBuildFlagsFn = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin.from("rules").select("value").eq("key", "dev_open_access").is("topic_id", null).maybeSingle();
  return { testBuild: data?.value === true };
});

/** Public: only the tutor's display name (global rule), for the splash. Empty setting → null. */
export const getTutorNameFn = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin.from("rules").select("value").eq("key", "tutor_display_name").is("topic_id", null).maybeSingle();
  return { name: typeof data?.value === "string" && data.value.trim() ? data.value.trim() : null };
});
