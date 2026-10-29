import { supabase } from "@/integrations/supabase/client";

/** The tutor's display name from rule tutor_display_name. Never hard-coded. */
export const tutorNameQuery = {
  queryKey: ["tutor-name"],
  staleTime: 5 * 60_000,
  queryFn: async (): Promise<string | null> => {
    const { data } = await supabase.from("rules").select("value").eq("key", "tutor_display_name").is("topic_id", null).maybeSingle();
    return typeof data?.value === "string" && data.value.trim() ? data.value : null;
  },
};
