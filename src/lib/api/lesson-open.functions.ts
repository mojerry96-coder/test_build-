// Thin wrappers: open a lesson from its readable address; map an old /lesson/[id] address.
import { createServerFn } from "@tanstack/react-start";
import { getRequestHost } from "@tanstack/react-start/server";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const seg = z.string().min(1).max(120).regex(/^[a-z0-9-]+$/);

export const openLessonFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    subject: seg, chapter: seg, quest: seg, topic: seg,
    attempt: z.number().int().min(1).max(999).optional(), preview: z.boolean().optional(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { openLesson } = await import("@/server/functions/lesson-open.server");
    const dev = await import("@/server/functions/dev-tools.server");
    const host = getRequestHost();
    return openLesson(context.supabase, supabaseAdmin, context.userId, data, async (topicId) => {
      if (!(await dev.devAccess(context.supabase, supabaseAdmin, context.userId, host))) throw new Error("Preview lessons are for admins while admin tools are on.");
      return dev.startPreview(supabaseAdmin, context.userId, topicId);
    });
  });

export const lessonPathForSessionFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ sessionId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { lessonPathForSession } = await import("@/server/functions/lesson-open.server");
    return lessonPathForSession(supabaseAdmin, context.userId, data.sessionId);
  });
