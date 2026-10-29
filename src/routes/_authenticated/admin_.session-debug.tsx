import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { devToolsActionFn } from "@/lib/api/dev-tools.functions";

export const Route = createFileRoute("/_authenticated/admin_/session-debug")({
  head: () => ({
    meta: [
      { title: "Admin · Session debug · uLesson Tutor" },
      { name: "description", content: "Read-only view of your admin preview lesson." },
      { property: "og:title", content: "Admin · Session debug · uLesson Tutor" },
      { property: "og:description", content: "Read-only view of your admin preview lesson." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SessionDebug,
});

type Debug = {
  session: null | { id: string; step: string; attempt: number; status: string; updatedAt: string; prediction: unknown; readiness: unknown; position: unknown; preview: boolean; warmupIds: string[] | null;
    skipReasons: { item_id: string; skill_id: string; reason: string; evidence_id: string; evidence_session_id: string; evidence_at: string }[];
    luckyGuesses?: number; firm?: { misconception_id: string; item_id?: string; at?: string }[] };
  events: { seq: number; type: string; step: string | null; created_at: string; note?: string | null }[];
};

function SessionDebug() {
  const act = useServerFn(devToolsActionFn);
  const { data, isLoading, isError } = useQuery({
    queryKey: ["dev-session-debug"],
    queryFn: async () => JSON.parse(await act({ data: { action: "debug" } })) as Debug,
    retry: false,
  });
  return (
    <main className="mx-auto max-w-3xl px-4 py-8 text-foreground">
      <h1 className="font-display text-3xl font-bold text-heading-dark">Session debug</h1>
      <p className="mt-1 text-sm text-ink-3">Your own open lesson (real first, else preview). Read-only; no answers or hidden scripts.</p>
      {isLoading && <p className="mt-6 text-sm">Loading…</p>}
      {isError && <p className="mt-6 text-sm">Admin tools are off or you are not an admin.</p>}
      {data && !data.session && <p className="mt-6 text-sm">No preview lesson is open. Use Go to page → a Lesson item.</p>}
      {data?.session && (
        <>
          <dl className="mt-6 grid grid-cols-[140px_1fr] gap-x-4 gap-y-2 rounded-2xl bg-card p-5 text-sm shadow-sm">
            <dt className="text-ink-3">Session</dt><dd className="font-mono text-xs">{data.session.id}</dd>
            <dt className="text-ink-3">Step</dt><dd>{data.session.step}</dd>
            <dt className="text-ink-3">Attempt</dt><dd>{data.session.attempt}</dd>
            <dt className="text-ink-3">Status</dt><dd>{data.session.status}</dd>
            <dt className="text-ink-3">Position</dt><dd className="font-mono text-xs">{JSON.stringify(data.session.position)}</dd>
            <dt className="text-ink-3">Prediction</dt><dd className="font-mono text-xs">{JSON.stringify(data.session.prediction)}</dd>
            <dt className="text-ink-3">Warm-up</dt><dd className="font-mono text-xs">{JSON.stringify(data.session.readiness)}</dd>
            <dt className="text-ink-3">Kind</dt><dd>{data.session.preview ? "Preview lesson" : "Real lesson"}</dd>
            <dt className="text-ink-3">Questions asked</dt><dd className="font-mono text-xs">{data.session.warmupIds?.join(", ") ?? "not chosen yet"}</dd>
            <dt className="text-ink-3">Lucky guesses</dt><dd>{data.session.luckyGuesses ?? 0} (right + Guessing)</dd>
            <dt className="text-ink-3">Firm misconceptions</dt><dd>{(data.session.firm ?? []).length} (wrong + Sure)
              {(data.session.firm ?? []).map((f) => <span key={f.misconception_id} className="block font-mono text-xs text-ink-3">{f.misconception_id}{f.item_id ? ` · ${f.item_id}` : ""}{f.at ? ` · ${new Date(f.at).toLocaleString()}` : ""}</span>)}
            </dd>
          </dl>
          <h2 className="mt-6 font-display text-xl font-bold text-heading-dark">Warm-up skip reasons</h2>
          {data.session.skipReasons.length === 0 ? <p className="mt-2 text-sm text-ink-3">No questions were skipped.</p> : (
            <ul className="mt-2 divide-y divide-border rounded-2xl bg-card text-sm shadow-sm">
              {data.session.skipReasons.map((r) => (
                <li key={r.item_id} className="px-4 py-2">
                  <p><b>Skipped {r.item_id}</b> ({r.skill_id}): {r.reason}, on {new Date(r.evidence_at).toLocaleString()}</p>
                  <p className="font-mono text-xs text-ink-3">evidence {r.evidence_id} · lesson {r.evidence_session_id}</p>
                </li>
              ))}
            </ul>
          )}
          <h2 className="mt-6 font-display text-xl font-bold text-heading-dark">Last 20 events</h2>
          <ol className="mt-2 divide-y divide-border rounded-2xl bg-card text-sm shadow-sm">
            {data.events.map((e) => (
              <li key={e.seq} className="flex gap-3 px-4 py-2"><span className="w-10 text-ink-3">{e.seq}</span><span className="flex-1">{e.type}{e.note ? <span className="ml-2 text-ink-3">({e.note})</span> : null}</span><span className="text-ink-3">{e.step}</span></li>
            ))}
          </ol>
        </>
      )}
    </main>
  );
}
