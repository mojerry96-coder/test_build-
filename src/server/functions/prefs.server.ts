// Her low-data choice, saved on her account (server-only student_prefs).
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

type Db = SupabaseClient<Database>;

export async function getLowData(admin: Db, userId: string): Promise<boolean | null> {
  const { data } = await admin.from("student_prefs").select("low_data").eq("student_id", userId).maybeSingle();
  return (data?.low_data as boolean | null | undefined) ?? null;
}

export async function setLowData(admin: Db, userId: string, on: boolean): Promise<void> {
  const { error } = await admin.from("student_prefs").upsert({ student_id: userId, low_data: on, updated_at: new Date().toISOString() }, { onConflict: "student_id" });
  if (error) throw new Error("Couldn't save");
}
