import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Admin-only read of the admin tools switch. */
export const getDevToolsSettingFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) throw new Error("Forbidden");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin.from("rules").select("key, value").in("key", ["dev_tools_enabled", "ai_provider", "fiti_voice_id"]).is("topic_id", null);
    const v = (k: string) => (data ?? []).find((r) => r.key === k)?.value;
    return { enabled: v("dev_tools_enabled") === true, aiOn: v("ai_provider") === "lovable_ai", voiceId: typeof v("fiti_voice_id") === "string" ? (v("fiti_voice_id") as string) : "" };
  });
