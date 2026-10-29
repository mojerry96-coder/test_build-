import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/integrations/supabase/types";
import { isSystemSettingKey } from "@/shared/contracts/settings";

type Db = SupabaseClient<Database>;

/** Admin-only change of a global system setting, recorded in settings_audit. */
export async function updateSetting(user: Db, admin: Db, userId: string, key: string, value: Json) {
  const { data: isAdmin } = await user.rpc("has_role", { _user_id: userId, _role: "admin" });
  if (!isAdmin) throw new Error("Forbidden");
  if (!isSystemSettingKey(key)) throw new Error("Not a system setting");

  const { data: old } = await admin.from("rules").select("value").eq("key", key).is("topic_id", null).maybeSingle();
  if (old) {
    await admin.from("rules").update({ value }).eq("key", key).is("topic_id", null);
  } else {
    await admin.from("rules").insert({ key, topic_id: null, value });
  }
  await admin.from("settings_audit").insert({
    key, topic_id: null, old_value: old?.value ?? null, new_value: value, changed_by: userId,
  });
  await admin.from("admin_audit").insert({
    action: "setting_changed", actor_id: userId, key, old_value: old?.value ?? null, new_value: value,
  });
  return { ok: true as const };
}
