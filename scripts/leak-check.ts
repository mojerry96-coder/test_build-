// Leak check: proves, with the browser's own access (publishable key + a real user token),
// that no answer-bearing field or hidden tutor script can be read. Runs as a temporary
// student (deleted afterwards) and as the admin.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { execSync } from "node:child_process";

/* eslint-disable @typescript-eslint/no-explicit-any */
const HIDDEN_TABLES = ["item_keys", "feedback", "escalations", "hints", "scripts", "fallback_lines", "turns"];
const FORBIDDEN_COLS = ["answer", "accepted_forms", "worked_solution", "accepted_methods", "wrong_paths", "marking_guide", "teach_me",
  "micro_lesson", "close_script", "hint_script", "completion_script", "opening_lines", "closing"];
const MIN_LEN = 12;
const STUDENT_INPUT = ["evidence.response", "sessions.state", "events.payload", "content_imports.report"]; // last: admin-only load reports quote earlier check results

function psql(sql: string): string[][] {
  const out = execSync(`psql "$SUPABASE_DB_URL" -At -F "|"`, { input: sql.replace(/\s+/g, " "), encoding: "utf8" });
  return out.trim().split("\n").filter(Boolean).map((l) => l.split("|"));
}

/** Readable columns per public table/view for the authenticated role (catalog-based). */
function readableColumns(): Record<string, string[]> {
  const rows = psql(`select c.relname, a.attname from pg_class c join pg_namespace n on n.oid=c.relnamespace
    join pg_attribute a on a.attrelid=c.oid and a.attnum>0 and not a.attisdropped
    where n.nspname='public' and c.relkind in ('r','v','m')
    and (has_column_privilege('authenticated', c.oid, a.attnum, 'SELECT') or has_column_privilege('anon', c.oid, a.attnum, 'SELECT'))
    order by 1, a.attnum`);
  const out: Record<string, string[]> = {};
  for (const [t, c] of rows) (out[t!] ??= []).push(c!);
  return out;
}

function collectStrings(v: unknown, out: Set<string>) {
  if (typeof v === "string") { if (v.length >= MIN_LEN) out.add(v); return; }
  // A part marked role "body" is the question exactly as it shows on screen before she acts, so it isn't secret.
  if (v && typeof v === "object" && !Array.isArray(v) && (v as any).role === "body") return;
  if (Array.isArray(v)) v.forEach((x) => collectStrings(x, out));
  else if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) if (!["type", "args", "id", "misconception_id", "kind", "engine", "level", "mission", "highlight", "target"].includes(k)) collectStrings(x, out);
}

async function hiddenStrings(admin: SupabaseClient<any>) {
  const s = new Set<string>();
  for (const [t, cols] of [["feedback", "script"], ["escalations", "script"], ["hints", "script"], ["scripts", "script"], ["fallback_lines", "script"],
    ["item_keys", "answer,accepted_forms,worked_solution,accepted_methods,wrong_paths,marking_guide"]] as const) {
    const { data } = await admin.from(t).select(cols);
    collectStrings(data, s);
  }
  return [...s];
}

type GuidedField = { repair: string; step: string; field: string; texts: string[] };
const textsOf = (v: unknown): string[] => Array.isArray(v) ? v.map((x: any) => typeof x === "string" ? x : x?.text).filter(Boolean) : [];

/** Every guided-step field of every quick fix in hidden storage: answers, hint questions, bigger hints, together text, done summary. */
async function guidedFields(admin: SupabaseClient<any>): Promise<GuidedField[]> {
  const { data } = await admin.from("scripts").select("*").eq("field", "you_try");
  const out: GuidedField[] = [];
  for (const row of (data ?? []) as any[]) {
    const yt = row.script ?? {}; const repair = row.owner_id ?? row.ref_id ?? row.id;
    for (const st of yt.steps ?? []) {
      out.push({ repair, step: st.id, field: "answer", texts: [String(st.answer)] });
      for (const f of ["hint_question", "bigger_hint", "together_text", "filled_line"]) if (st[f]) out.push({ repair, step: st.id, field: f, texts: textsOf(st[f]) });
    }
    if (yt.done_summary) out.push({ repair, step: "-", field: "done_summary", texts: textsOf(yt.done_summary) });
  }
  return out;
}

/** A guided field leaks if its text appears in any readable row; a short answer leaks if it appears as a stored answer value or the step structure is readable. */
function guidedLeaks(fields: GuidedField[], blobs: [string, string][]) {
  const leaks: string[] = [];
  for (const [t, b] of blobs) if (b.includes("\"you_try\"") || b.includes("together_text") || b.includes("hint_question")) leaks.push(`${t}: guided-step structure readable`);
  for (const g of fields) for (const txt of g.texts) for (const [t, b] of blobs) {
    const hit = g.field === "answer" ? b.includes(`"answer":${JSON.stringify(txt)}`) : b.includes(JSON.stringify(txt).slice(1, -1));
    if (hit) leaks.push(`${t}: ${g.repair} ${g.step} ${g.field}`);
  }
  return leaks;
}

async function studentSession(admin: SupabaseClient<any>, url: string, key: string) {
  const email = `leakcheck-${Date.now()}@example.com`;
  const { data: u, error } = await admin.auth.admin.createUser({ email, email_confirm: true, user_metadata: { given_name: "Leak" } });
  if (error) throw error;
  await admin.from("user_roles").delete().eq("user_id", u.user.id).neq("role", "student");
  await admin.from("user_roles").upsert({ user_id: u.user.id, role: "student", granted_via: "system" }, { onConflict: "user_id,role" });
  const { data: link, error: le } = await admin.auth.admin.generateLink({ type: "magiclink", email });
  if (le) throw le;
  const anon = createClient(url, key, { auth: { persistSession: false } });
  const { data: sess, error: ve } = await anon.auth.verifyOtp({ type: "magiclink", token_hash: link.properties.hashed_token });
  if (ve || !sess.session) throw ve ?? new Error("no session");
  return { userId: u.user.id, token: sess.session.access_token };
}

async function asUser(url: string, key: string, token: string, readable: Record<string, string[]>, hidden: string[]) {
  const c = createClient(url, key, { auth: { persistSession: false }, global: { headers: { Authorization: `Bearer ${token}` } } });
  const hiddenAccess: string[] = [];
  for (const t of HIDDEN_TABLES) {
    const { data, error } = await c.from(t).select("*").limit(1);
    if (!error && (data?.length ?? 0) > 0) hiddenAccess.push(t);
    else if (!error) hiddenAccess.push(`${t} (no error returned)`);
  }
  const textMatches: string[] = [];
  let rowsScanned = 0;
  const blobs: [string, string][] = [];
  for (const [t, all] of Object.entries(readable)) {
    // Skip columns holding what the student typed (their own working can equal a worked-solution line).
    const cols = all.filter((col) => !STUDENT_INPUT.includes(`${t}.${col}`));
    if (!cols.length) continue;
    const { data, error } = await c.from(t).select(cols.join(",")).limit(5000);
    if (error) continue;
    rowsScanned += data?.length ?? 0;
    const blob = JSON.stringify(data ?? []);
    for (const h of hidden) if (blob.includes(JSON.stringify(h).slice(1, -1))) textMatches.push(`${t}: "${h.slice(0, 60)}"`);
    blobs.push([t, blob]);
  }
  return { hidden_tables_readable: hiddenAccess, text_matches: textMatches, rows_scanned: rowsScanned, blobs };
}

export async function runLeakCheck(admin: SupabaseClient<any>, url: string) {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"] ?? process.env["VITE_SUPABASE_PUBLISHABLE_KEY"]!;
  const readable = readableColumns();
  const structure: string[] = [];
  for (const [t, cols] of Object.entries(readable)) {
    if (HIDDEN_TABLES.includes(t)) structure.push(`${t}: table is readable`);
    for (const col of cols) {
      if (FORBIDDEN_COLS.includes(col)) structure.push(`${t}.${col}`);
      if (col === "script" && t !== "hooks") structure.push(`${t}.script`);
    }
  }
  const hidden = await hiddenStrings(admin);
  const guided = await guidedFields(admin);

  const stu = await studentSession(admin, url, key);
  let student;
  try { student = await asUser(url, key, stu.token, readable, hidden); }
  finally { await admin.auth.admin.deleteUser(stu.userId); }

  // Signed-out pass: a visitor with only the publishable key must read no rows at all.
  const anonC = createClient(url, key, { auth: { persistSession: false } });
  const anonReadable: string[] = [];
  for (const t of [...new Set([...Object.keys(readable), ...HIDDEN_TABLES])]) {
    const { data, error } = await anonC.from(t).select("*").limit(1);
    if (!error && (data?.length ?? 0) > 0) anonReadable.push(t);
  }
  const signedOut = { tables_with_rows: anonReadable };

  const adminToken = process.env["LOVABLE_BROWSER_SUPABASE_ACCESS_TOKEN"];
  const adminRes = adminToken ? await asUser(url, key, adminToken, readable, hidden) : null;

  const guidedStudent = guidedLeaks(guided, student.blobs);
  const guidedAdmin = adminRes ? guidedLeaks(guided, adminRes.blobs) : [];
  const perRepair: Record<string, Record<string, string>> = {};
  for (const g of guided) (perRepair[g.repair] ??= {})[g.field] = [...guidedStudent, ...guidedAdmin].some((l) => l.endsWith(`${g.repair} ${g.step} ${g.field}`)) ? "LEAK" : "pass";
  const strip = (r: any) => r && { ...r, blobs: undefined };
  const ok = guided.length > 0 && guidedStudent.length === 0 && guidedAdmin.length === 0 && structure.length === 0 && anonReadable.length === 0 && student.hidden_tables_readable.length === 0 && student.text_matches.length === 0
    && (!adminRes || (adminRes.hidden_tables_readable.length === 0 && adminRes.text_matches.length === 0));
  return {
    ok, readable_tables: Object.keys(readable).length, hidden_strings_checked: hidden.length,
    structure_problems: structure, signed_out: signedOut, student: strip(student), admin: strip(adminRes) ?? "skipped (no admin session available)",
    guided_steps: { fields_checked: guided.length, leaks: [...guidedStudent, ...guidedAdmin], per_quick_fix: perRepair },
  };
}
