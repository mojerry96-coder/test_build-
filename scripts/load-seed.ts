// Loads a content pack through the same import logic as the admin page, then runs the
// re-import check and the leak check, and prints the load report.
// Usage: bun scripts/load-seed.ts [path] [--as <admin-user-uuid>] [--remove-missing]
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/integrations/supabase/types";
import { importPack } from "../src/server/content/import.server";
import { TABLES } from "../src/server/content/plan";
import { runLeakCheck } from "./leak-check";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";

// Gradient Lab v2 must stay byte-for-byte the simulation team's copy: warn if any file differs from SOURCE.md.
{
  const notes = existsSync("public/sims/gradient-lab-v2.SOURCE.md") ? readFileSync("public/sims/gradient-lab-v2.SOURCE.md", "utf8") : "";
  const bad = [...notes.matchAll(/^([0-9a-f]{64})\s+\.\/(.+)$/gm)].filter(([, sum, file]) => {
    const p = `public/sims/gradient-lab-v2/${file}`;
    return !existsSync(p) || createHash("sha256").update(readFileSync(p)).digest("hex") !== sum;
  });
  if (bad.length) console.warn(`WARNING: Gradient Lab v2 differs from its source in ${bad.length} file(s): ${bad.map((b) => b[2]).slice(0, 5).join(", ")}`);
}

const args = process.argv.slice(2);
const path = args.find((a) => !a.startsWith("--") && !/^[0-9a-f-]{36}$/.test(a)) ?? "content/packs/MTH12_09_02_01.seed.json";
const asIdx = args.indexOf("--as");
const url = process.env["SUPABASE_URL"]!;
const service = process.env["SUPABASE_SERVICE_ROLE_KEY"]!;
const admin = createClient<Database>(url, service, { auth: { persistSession: false, autoRefreshToken: false } });

const pack = await Bun.file(path).json();
let actor = asIdx >= 0 ? args[asIdx + 1]! : "";
if (!actor) {
  // Default importer: the project owner's admin account, named explicitly for a clear history.
  const OWNER_EMAIL = process.env["SEED_IMPORTER_EMAIL"] ?? "kingsley@miva.university";
  const { data: list } = await admin.auth.admin.listUsers({ perPage: 1000 });
  const u = list?.users.find((x) => x.email?.toLowerCase() === OWNER_EMAIL);
  if (!u) throw new Error(`importer ${OWNER_EMAIL} not found; pass --as <uuid>`);
  const { data: isAdmin } = await admin.from("user_roles").select("user_id").eq("user_id", u.id).eq("role", "admin").maybeSingle();
  if (!isAdmin) throw new Error(`${OWNER_EMAIL} is not an admin`);
  actor = u.id;
}

async function tableCounts(topicId: string) {
  const out: Record<string, number> = {};
  for (const t of TABLES) {
    const { count } = await (admin as any).from(t).select("*", { count: "exact", head: true });
    out[t] = count ?? 0;
  }
  return out;
}

const first = await importPack(admin, actor, { pack, dryRun: false, removeMissing: args.includes("--remove-missing") });
if (!first.ok) {
console.log(JSON.stringify({ step: "load", ok: false, report: first.report }, null, 2));
  process.exit(1);
}
await admin.from("topics").update({ is_active: true }).eq("id", pack.topic.id);
const before = await tableCounts(pack.topic.id);

// Re-import check: same pack again must be all unchanged, with identical row counts.
const second = await importPack(admin, actor, { pack, dryRun: false, removeMissing: false });
const after = await tableCounts(pack.topic.id);
const counts2 = second.report.counts as Record<string, { added: number; updated: number; removed: number }>;
const changed = Object.entries(counts2).filter(([, c]) => c.added || c.updated || c.removed).map(([t]) => t);
const grew = Object.keys(before).filter((t) => before[t] !== after[t]);
const reimport = { ok: second.ok && changed.length === 0 && grew.length === 0, changed_tables: changed, row_count_changes: grew };

const leak = await runLeakCheck(admin, url);

// Save both check results on the second load's import-history entry.
const { data: last } = await admin.from("content_imports").select("id, report").eq("dry_run", false)
  .eq("topic_id", pack.topic.id).order("created_at", { ascending: false }).limit(1).single();
if (last) await admin.from("content_imports").update({ report: { ...(last.report as object), reimport_check: reimport, leak_check: leak } } as never).eq("id", last.id);

console.log(JSON.stringify({
  pack_version: first.report.pack_version, topic: pack.topic.id,
  counts_first_load: first.report.counts, warnings: first.report.warnings, seed_rows: first.report.seed_rows,
  reimport_check: reimport, leak_check: leak,
}, null, 2));
if (!reimport.ok || !leak.ok) process.exit(1);
