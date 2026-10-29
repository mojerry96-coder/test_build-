import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { answerQuizFn, getQuizFn } from "@/lib/api/home.functions";
import { FitilaShell } from "@/components/home/FitilaShell";
import { PageSkeleton, FriendlyError } from "@/components/learn/PageStates";
import { cn } from "@/lib/utils";
import { useHomeData } from "./index";

export const Route = createFileRoute("/_authenticated/quiz/$sessionId")({
  head: () => ({
    meta: [
      { title: "Quick quiz | uLesson AI Tutor" },
      { name: "description", content: "A short quiz chosen by your AI tutor from the skills you need most." },
      { property: "og:title", content: "Quick quiz | uLesson AI Tutor" },
      { property: "og:description", content: "A short quiz chosen by your AI tutor." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Quiz,
});

type View = Awaited<ReturnType<typeof getQuizFn>>;

function Quiz() {
  const { sessionId } = Route.useParams();
  const get = useServerFn(getQuizFn);
  const answer = useServerFn(answerQuizFn);
  const qc = useQueryClient();
  const { me, home, tutorName } = useHomeData();
  const q = useQuery({ queryKey: ["quiz", sessionId], queryFn: () => get({ data: { sessionId } }) });
  const [after, setAfter] = useState<View | null>(null);
  const [pick, setPick] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  if (q.isLoading) return <PageSkeleton rows={3} />;
  if (q.isError || !q.data) return <FriendlyError onRetry={() => q.refetch()} />;
  const v = q.data;
  const check = async () => {
    if (!v.item || busy) return;
    setBusy(true);
    try { setAfter(await answer({ data: { sessionId, itemId: v.item.id, option: pick ?? undefined, text: text || undefined } })); } finally { setBusy(false); }
  };
  const next = () => { if (after) qc.setQueryData(["quiz", sessionId], after); setAfter(null); setPick(null); setText(""); };
  return (
    <FitilaShell initials={home.data?.initials ?? "ME"} streak={home.data?.streak ?? 0} tutorName={tutorName} isAdmin={!!me.data?.isAdmin}>
      <main className="mx-auto w-full max-w-[740px] px-4 pb-28 pt-28">
        <p className="text-sm font-semibold text-fh-box-edge">Quick quiz · {Math.min(v.index + 1, v.total)} of {v.total}</p>
        {v.done ? (
          <section className="mt-4 rounded-[20px] bg-fh-card p-6">
            {v.closing.map((l) => <p key={l} className="text-lg text-fh-ink">{l}</p>)}
            <Link to="/" className="mt-5 inline-flex h-11 items-center rounded-full bg-fh-primary px-6 font-semibold text-fh-primary-ink">Back to Ask Fiti</Link>
          </section>
        ) : v.item && (
          <section className="mt-4 rounded-[20px] bg-fh-card p-6">
            {v.item.prompt.map((p, i) => <p key={i} className="text-xl font-semibold text-fh-ink">{p.text}</p>)}
            {v.item.options ? (
              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {v.item.options.map((o, i) => (
                  <button key={o.id} type="button" role="radio" aria-checked={pick === o.id} data-pos={i % 4} disabled={!!after} onClick={() => setPick(o.id)}
                    className="mcq-tile min-h-[72px] rounded-[14px] px-6 py-3 text-center text-lg font-semibold text-hub-heading">{o.label}</button>
                ))}
              </div>
            ) : (
              <input value={text} onChange={(e) => setText(e.target.value)} disabled={!!after} aria-label="Your answer" placeholder="Type your answer"
                className="mt-5 h-12 w-full rounded-xl border border-fh-box-line bg-fh-card px-4 text-fh-ink" />
            )}
            {after?.last ? (
              <div className="mt-5 rounded-2xl bg-fh-bubble p-4" role="status">
                {after.last.lines.map((l) => <p key={l} className="text-fh-ink">{l}</p>)}
                <button type="button" onClick={next} className="mt-3 h-11 rounded-full bg-fh-primary px-6 font-semibold text-fh-primary-ink">{after.done ? "See my score" : "Next question"}</button>
              </div>
            ) : (
              <button type="button" onClick={check} disabled={busy || (!pick && !text.trim())}
                className="mt-5 h-11 rounded-full bg-fh-primary px-6 font-semibold text-fh-primary-ink disabled:opacity-50">Check Answer</button>
            )}
          </section>
        )}
      </main>
    </FitilaShell>
  );
}
