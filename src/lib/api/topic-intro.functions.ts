// Thin wrappers for the topic intro page.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const seg = z.string().min(1).max(120).regex(/^[a-z0-9-]+$/);
const path = z.object({ subject: seg, chapter: seg, quest: seg, topic: seg });

export const getTopicIntroFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => path.parse(d))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { getTopicIntro } = await import("@/server/functions/topic-intro.server");
    const { noteShown } = await import("@/server/providers/voice-ledger.server");
    const r = await getTopicIntro(supabaseAdmin, context.userId, data);
    await noteShown(context.userId, r); // voice may speak these lines later
    return r;
  });

export const introReplyFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => path.extend({ text: z.string().max(500) }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { introReply } = await import("@/server/functions/topic-intro.server");
    const { noteShown } = await import("@/server/providers/voice-ledger.server");
    const { text, ...p } = data;
    const r = await introReply(supabaseAdmin, context.userId, p, text);
    await noteShown(context.userId, r);
    return r;
  });
