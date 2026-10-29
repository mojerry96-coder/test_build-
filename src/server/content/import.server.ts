import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/integrations/supabase/types";
import { validatePack, groupIssues } from "./validate";
import { packToRows, diffTables, buildOps, countSeed, TABLES, type Row, type Table } from "./plan";

type Db = SupabaseClient<Database>;
/* eslint-disable @typescript-eslint/no-explicit-any */

async function requireAdmin(user: Db, userId: string) {
  const { data } = await user.rpc("has_role", { _user_id: userId, _role: "admin" });
  if (!data) throw new Error("Forbidden: admins only");
}

async function loadExisting(admin: Db, pack: any): Promise<Record<Table, Row[]>> {
  const topicId = pack.topic.id as string;
  const a = admin as any;
  const ids = (xs: any[]) => (xs.length ? xs : ["__none__"]);
  const sel = async (t: string, col: string, vals: string[] | string) => {
    const q = a.from(t).select("*");
    const { data, error } = Array.isArray(vals) ? await q.in(col, ids(vals)) : await q.eq(col, vals);
    if (error) throw new Error(`Could not read ${t}: ${error.message}`);
    return (data ?? []) as Row[];
  };
  const items = await sel("items", "topic_id", topicId);
  const itemIds = [...new Set([...items.map((r) => r["id"] as string), ...(pack.items ?? []).map((i: any) => i.id)])];
  const clips = await sel("clips", "topic_id", topicId);
  const sims = await sel("simulations", "topic_id", topicId);
  const clipIds = [...new Set([...clips.map((r) => r["id"] as string), ...(pack.clips ?? []).map((c: any) => c.id)])];
  const simIds = [...new Set([...sims.map((r) => r["id"] as string), ...(pack.simulations ?? []).map((s: any) => s.id)])];
  return {
    topics: await sel("topics", "id", [topicId]),
    skills: await sel("skills", "id", (pack.skills ?? []).map((s: any) => s.id)),
    misconceptions: await sel("misconceptions", "id", (pack.misconceptions ?? []).map((m: any) => m.id)),
    topic_skills: await sel("topic_skills", "topic_id", topicId),
    items,
    item_keys: await sel("item_keys", "item_id", itemIds),
    feedback: await sel("feedback", "item_id", itemIds),
    escalations: await sel("escalations", "item_id", itemIds),
    hints: await sel("hints", "item_id", itemIds),
    repairs: await sel("repairs", "topic_id", topicId),
    hooks: await sel("hooks", "topic_id", topicId),
    clips,
    clip_checks: await sel("clip_checks", "clip_id", clipIds),
    simulations: sims,
    sim_tasks: await sel("sim_tasks", "simulation_id", simIds),
    fallback_lines: await sel("fallback_lines", "topic_id", topicId),
    rules: await sel("rules", "topic_id", topicId),
    scripts: await sel("scripts", "topic_id", topicId),
  };
}

export async function runContentImport(
  user: Db, admin: Db, userId: string,
  input: { pack: unknown; dryRun: boolean; removeMissing: boolean },
) {
  await requireAdmin(user, userId);
  return importPack(admin, userId, input);
}

/** Core import with no caller check. Only call after verifying the caller (admin) or from trusted server scripts. */
export async function importPack(admin: Db, userId: string, input: { pack: unknown; dryRun: boolean; removeMissing: boolean }) {
  const pack: any = input.pack;
  const v = validatePack(pack);
  const report: any = {
    pack_version: pack?.pack_version ?? null,
    topic_id: pack?.topic?.id ?? null,
    dry_run: input.dryRun,
    remove_missing: input.removeMissing,
    errors: groupIssues(v.errors),
    error_count: v.errors.length,
    warnings: groupIssues(v.warnings),
    seed_rows: countSeed(pack ?? {}),
    counts: null,
  };
  const record = async (status: string) => {
    await admin.from("content_imports").insert({
      topic_id: report.topic_id, pack_version: report.pack_version, dry_run: input.dryRun, status,
      report: report as Json, imported_by: userId,
    });
  };
  if (v.errors.length) { await record("failed"); return { ok: false, report }; }

  const existing = await loadExisting(admin, pack);
  const rows = packToRows(pack, v.skippedSystemKeys, existing.topics[0] ?? null);
  const { counts, deletes, upserts } = diffTables(rows, existing, input.removeMissing);
  report.counts = counts;
  const notInPack = TABLES.reduce((s, t) => s + counts[t].not_in_pack, 0);
  if (notInPack && !input.removeMissing) {
    (report.warnings.database ??= []).push(`${notInPack} rows exist in the database but not in this pack. They were kept; tick "Remove rows not in this pack" to delete them.`);
  }

  if (input.dryRun) { await record("passed"); return { ok: true, report }; }

  const { error } = await (admin as any).rpc("apply_content_pack", {
    _ops: buildOps(deletes, upserts),
    _import: { topic_id: report.topic_id, pack_version: report.pack_version, imported_by: userId, report },
  });
  (await import("@/server/lesson/wording-cache.server")).clearWordingCache();
  if (error) {
    report.errors = { database: [`Nothing was imported. The database refused the change: ${error.message}`] };
    report.error_count = 1;
    await record("failed");
    return { ok: false, report };
  }
  return { ok: true, report };
}

export async function listImports(user: Db, userId: string) {
  await requireAdmin(user, userId);
  const { data, error } = await user.from("content_imports")
    .select("id, created_at, topic_id, pack_version, dry_run, status, imported_by, report")
    .order("created_at", { ascending: false }).limit(50);
  if (error) throw new Error(error.message);
  const who = [...new Set((data ?? []).map((r) => r.imported_by).filter(Boolean))] as string[];
  const { data: profiles } = who.length ? await user.from("profiles").select("id, display_name").in("id", who) : { data: [] };
  const names = new Map((profiles ?? []).map((p) => [p.id, p.display_name]));
  return (data ?? []).map((r) => ({ ...r, imported_by_name: r.imported_by ? names.get(r.imported_by) ?? "Admin" : null }));
}
