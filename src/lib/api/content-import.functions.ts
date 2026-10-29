import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const MAX_PACK_BYTES = 2 * 1024 * 1024;

export const contentImportFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({ json: z.string().max(MAX_PACK_BYTES), dryRun: z.boolean(), removeMissing: z.boolean() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { runContentImport } = await import("@/server/content/import.server");
    let pack: unknown;
    try { pack = JSON.parse(data.json); } catch (e) {
      return { ok: false, report: { errors: { general: [`The file is not valid JSON: ${(e as Error).message}`] }, error_count: 1, warnings: {}, counts: null } };
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    return runContentImport(context.supabase, supabaseAdmin, context.userId, { pack, dryRun: data.dryRun, removeMissing: data.removeMissing });
  });

export const listImportsFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { listImports } = await import("@/server/content/import.server");
    return listImports(context.supabase, context.userId);
  });
