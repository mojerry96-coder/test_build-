// Thin wrapper: voice for one line of tutor text already on screen. Logic lives in src/server/lesson/speak.server.ts.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** base64 mp3 for a line the server already sent this user; null when voice is off, the text is unknown, or synthesis fails. */
export const speakFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ text: z.string().min(1).max(2000) }).parse(d))
  .handler(async ({ data, context }) => {
    const { speak } = await import("@/server/lesson/speak.server");
    return speak(context.userId, data.text);
  });
