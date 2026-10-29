import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { checkAdminFn } from "@/lib/api/me.functions";
import { contentImportFn, listImportsFn, MAX_PACK_BYTES } from "@/lib/api/content-import.functions";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/admin_/content-import")({
  head: () => ({
    meta: [
      { title: "Content import | uLesson AI Tutor" },
      { name: "description", content: "Check and import lesson content packs." },
      { property: "og:title", content: "Content import | uLesson AI Tutor" },
      { property: "og:description", content: "Check and import lesson content packs." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ImportPage,
});

/* eslint-disable @typescript-eslint/no-explicit-any */
type Report = any;

function IssueList({ title, groups, tone }: { title: string; groups: Record<string, string[]>; tone: "error" | "warn" }) {
  const entries = Object.entries(groups ?? {});
  if (!entries.length) return null;
  return (
    <section className={`mt-4 rounded-xl border p-4 ${tone === "error" ? "border-destructive/50" : "border-border bg-muted/40"}`}>
      <h3 className="font-semibold">{title}</h3>
      {entries.map(([g, msgs]) => (
        <div key={g} className="mt-3">
          <p className="text-sm font-medium capitalize text-muted-foreground">{g}</p>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">{msgs.map((m, i) => <li key={i}>{m}</li>)}</ul>
        </div>
      ))}
    </section>
  );
}

function ReportView({ report }: { report: Report }) {
  return (
    <div className="mt-6">
      <p className="text-sm text-muted-foreground">
        Pack version <b>{report.pack_version ?? "—"}</b> · topic <b>{report.topic_id ?? "—"}</b> · {report.dry_run ? "check only" : "import"} ·{" "}
        {report.error_count ? <b className="text-destructive">{report.error_count} errors</b> : <b>no errors</b>} · rows still marked seed: <b>{report.seed_rows ?? 0}</b>
      </p>
      <IssueList title="Errors" groups={report.errors} tone="error" />
      <IssueList title="Warnings" groups={report.warnings} tone="warn" />
      {report.counts && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-muted-foreground"><th className="py-1">Table</th><th>Added</th><th>Updated</th><th>Unchanged</th><th>Removed</th><th>Not in pack</th></tr></thead>
            <tbody>
              {Object.entries(report.counts as Record<string, any>).map(([t, c]) => (
                <tr key={t} className="border-t border-border"><td className="py-1">{t}</td><td>{c.added}</td><td>{c.updated}</td><td>{c.unchanged}</td><td>{c.removed}</td><td>{c.not_in_pack}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ImportPage() {
  const qc = useQueryClient();
  const admin = useQuery({ queryKey: ["is-admin"], queryFn: () => checkAdminFn() });
  const history = useQuery({ queryKey: ["imports"], queryFn: () => listImportsFn(), enabled: !!admin.data?.isAdmin });
  const [json, setJson] = useState("");
  const [removeMissing, setRemoveMissing] = useState(false);
  const [passed, setPassed] = useState<string | null>(null);
  const [report, setReport] = useState<Report | null>(null);
  const [busy, setBusy] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);

  if (admin.isLoading) return <p className="p-6 text-muted-foreground">Loading…</p>;
  if (!admin.data?.isAdmin) return <main className="mx-auto max-w-md px-5 py-12 text-center"><h1 className="text-2xl font-bold">Not available</h1></main>;

  const tooBig = new Blob([json]).size > MAX_PACK_BYTES;
  const sig = `${removeMissing}:${json}`;
  const run = async (dryRun: boolean) => {
    setBusy(true);
    try {
      const res: any = await contentImportFn({ data: { json, dryRun, removeMissing } });
      setReport(res.report);
      setPassed(dryRun && res.ok ? sig : null);
    } catch (e) {
      setReport({ errors: { general: [(e as Error).message] }, error_count: 1, warnings: {} });
    } finally {
      setBusy(false);
      qc.invalidateQueries({ queryKey: ["imports"] });
    }
  };

  return (
    <main className="mx-auto max-w-3xl px-5 py-8">
      <Link to="/admin" className="text-sm text-muted-foreground underline">← Admin</Link>
      <h1 className="mt-2 text-3xl font-bold">Content import</h1>
      <p className="mt-1 text-sm text-muted-foreground">Choose a content pack file or paste it below (up to 2 MB). Run “Check only” first; Import unlocks when the check passes.</p>

      <input type="file" accept="application/json,.json" className="mt-4 block text-sm"
        onChange={async (e) => { const f = e.target.files?.[0]; if (f) setJson(await f.text()); }} />
      <textarea value={json} onChange={(e) => setJson(e.target.value)} rows={10} placeholder="Paste pack JSON here"
        className="mt-3 w-full rounded-xl border border-input bg-background p-3 font-mono text-xs" />
      {tooBig && <p className="text-sm text-destructive">This pack is larger than 2 MB.</p>}

      <label className="mt-3 flex items-center gap-2 text-sm">
        <input type="checkbox" checked={removeMissing} onChange={(e) => setRemoveMissing(e.target.checked)} />
        Remove rows not in this pack
      </label>

      <div className="mt-4 flex flex-wrap gap-3">
        <Button variant="outline" disabled={busy || !json || tooBig} onClick={() => run(true)}>Check only (dry run)</Button>
        <Button disabled={busy || passed !== sig} onClick={() => run(false)}>Import</Button>
      </div>

      {report && <ReportView report={report} />}

      <h2 className="mt-10 text-xl font-semibold">Import history</h2>
      <ul className="mt-3 divide-y divide-border rounded-xl border border-border">
        {(history.data ?? []).map((h: any) => (
          <li key={h.id} className="p-3 text-sm">
            <button className="w-full text-left" onClick={() => setOpenId(openId === h.id ? null : h.id)}>
              {new Date(h.created_at).toLocaleString()} · {h.imported_by_name ?? "—"} · {h.pack_version ?? "—"} · {h.dry_run ? "dry run" : "real import"} · <b>{h.status}</b>
            </button>
            {openId === h.id && <ReportView report={h.report} />}
          </li>
        ))}
        {history.data?.length === 0 && <li className="p-3 text-sm text-muted-foreground">No imports yet.</li>}
      </ul>
    </main>
  );
}
