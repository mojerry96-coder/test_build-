import { playSound } from "@/lib/sound";
// 6 · Prove it (guided): the Practise worksheet look, but answers are only saved; marks show after the last one.
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Check, Delete, Lightbulb, MessageCircleQuestion } from "lucide-react";
import type { CheckResult } from "@/shared/contracts/lesson";
import { checkAnswerFn, explainFn, hintFn } from "@/lib/api/lesson.functions";
import { PRACTISE_NUM_KEYS, PRACTISE_SYM_KEYS, keyLabel } from "@/shared/practise-keys";
import { useSay } from "@/lib/voice";
import { cn } from "@/lib/utils";
import { useLesson } from "./context";
import { useAdvance } from "./stages-a";
import { useReaction } from "./celebrate";
import { TwoPointGraph } from "./PractiseStage";
import { QF_OUTLINE, QfNums, twoPoints } from "./qf-shared";
import { WarmupOptions } from "./WarmupStage";
import { WarmupPopup } from "./WarmupPopup";

const KEY = "squish grid min-h-11 lg:h-[clamp(44px,4.4vh,52px)] place-items-center rounded-[12px] border-2 border-fh-box-line bg-fh-card text-[20px] font-semibold text-fh-heading shadow-[0_3px_0_var(--fh-box-line)] active:translate-y-[2px] active:shadow-none disabled:opacity-60";

export function ProveStage() {
  const { view, busy, run, sessionId, say, refresh } = useLesson();
  const idx = view.position.index;
  const item = view.items[idx];
  const check = useServerFn(checkAnswerFn);
  const hint = useServerFn(hintFn);
  const explain = useServerFn(explainFn);
  const next = useAdvance();
  const react = useReaction();
  const store = `prove:${sessionId}:${item?.id ?? ""}`;
  const [pick, setPick] = useState<string | null>(null);
  const [lines, setLines] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const [hints, setHints] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [summary, setSummary] = useState<CheckResult["summary"]>();
  const [review, setReview] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  useSay(hints.length ? [hints.at(-1)!] : [], `prove-hint:${hints.length}`, hints.length > 0);

  // New question: fresh state; her written lines come back after a reload.
  useEffect(() => {
    setPick(null); setDraft(""); setHints([]); setSubmitted(false);
    try { setLines(JSON.parse(sessionStorage.getItem(store) ?? "[]")); } catch { setLines([]); }
  }, [store]);
  useEffect(() => { if (item) sessionStorage.setItem(store, JSON.stringify(lines)); }, [lines, store, item]);

  if (!item) return null;
  const theory = item.kind === "theory";
  const isLast = idx === view.items.length - 1;
  const done = submitted || !!view.results[item.id];
  const question = item.prompt.map((p) => p.text).join(" ");
  const pts = twoPoints(question);
  const ready = theory ? lines.length > 0 || !!draft.trim() : !!pick;

  const addLine = () => { const t = draft.trim(); if (!t) return; setLines([...lines, t]); setDraft(""); input.current?.focus(); };
  const insert = (k: string) => { const v = k === "a/b" ? "()/()" : k === "√" ? "√()" : k; setDraft(draft + v); input.current?.focus(); };
  const openHint = async () => {
    if (hints.length >= item.hintCount) return;
    const r = await run(() => hint({ data: { sessionId, itemId: item.id } }));
    if (r?.lines.length) { setHints([...hints, r.lines.map((l) => l.text).join(" ")]); playSound("hint"); }
  };
  const doExplain = async () => { const s = await run(() => explain({ data: { sessionId } })); if (s) say(s); };
  const save = async () => {
    const all = draft.trim() ? [...lines, draft.trim()] : lines;
    const response = theory ? { text: all.join("\n").slice(0, 1000) } : { optionId: pick! };
    const r = await run(() => check({ data: { sessionId, itemId: item.id, response } }));
    if (r?.status === "saved") {
      setSubmitted(true); setSummary(r.summary); sessionStorage.removeItem(store);
      if (isLast) {
        const res = view.items.map((i) => r.summary?.find((x) => x.itemId === i.id)?.correct);
        if (res.every((c) => c === true)) react.big();
        setReview(true);
      }
    }
  };
  const results = view.items.map((i) => summary?.find((r) => r.itemId === i.id) ?? view.results[i.id]);

  return (
    <div className="pr-scope relative space-y-5" data-lesson-step="guided">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-body text-[13px] font-bold uppercase tracking-wide text-fh-box-edge">Prove it</p>
        <span className="flex items-center gap-1.5 font-body text-[14px] font-semibold" style={{ color: "var(--wb-muted)" }}>
          <span className="mr-1">Question {idx + 1} of {view.items.length}</span>
          {view.items.map((it, i) => <span key={it.id} aria-hidden className="qf-dot" data-state={view.results[it.id] || (i === idx && done) ? "done" : i === idx ? "now" : "todo"} />)}
        </span>
      </div>

      <div className="grid gap-5 lg:grid-cols-[11fr_9fr] lg:items-stretch lg:min-h-[520px]">
        <section className="relative flex min-h-0 flex-col rounded-[28px] border-2 border-[var(--hook-board-edge)] bg-fh-card px-[clamp(18px,3vw,36px)] pb-7 pt-6 shadow-[0_8px_0_var(--hook-board-edge)]">
          <h2 className="maths font-hand text-[clamp(22px,2.2vw,32px)] leading-snug tracking-[0.5px] [-webkit-text-stroke:0.8px_currentColor]" style={{ color: "var(--wb-navy)" }}><QfNums text={question} /></h2>
          {theory && pts && <div className="mt-4 h-[min(400px,42vh)] min-h-[260px] w-full lg:h-auto lg:min-h-0 lg:flex-1"><TwoPointGraph pts={pts} /></div>}
          {!theory && item.options && (
            <div className="mt-5"><WarmupOptions options={item.options} value={pick} onChange={setPick} locked={done || busy} mark={null} /></div>
          )}
          <div className="mt-5 flex flex-wrap gap-3">
            <button type="button" className={cn(QF_OUTLINE, "flex h-11 items-center gap-2 px-5 text-[15px]")} disabled={busy} onClick={() => void doExplain()}><MessageCircleQuestion className="h-5 w-5" aria-hidden />Explain the question</button>
            {item.hintCount > 0 && !done && hints.length < item.hintCount && (
              <button type="button" className={cn(QF_OUTLINE, "flex h-11 items-center gap-2 px-5 text-[15px]")} disabled={busy} onClick={() => void openHint()}><Lightbulb className="h-5 w-5" aria-hidden />Hint</button>
            )}
          </div>
          {hints.length > 0 && (
            <div role="status" aria-live="polite" className="qf-say anim-note-pop mt-4 rounded-[22px] bg-fh-card px-5 py-4 shadow-lg ring-1 ring-fh-box-line/60">
              <div className="flex items-start gap-3">
                <Lightbulb className="mt-1 h-5 w-5 shrink-0 fill-current text-mcq-hint" aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="font-body text-[13px] font-semibold" style={{ color: "var(--wb-muted)" }}>Hint {hints.length} of {item.hintCount}</p>
                  <p className="font-hand text-[clamp(18px,1.4vw,22px)] leading-snug" style={{ color: "var(--wb-navy)" }}><QfNums text={hints.at(-1)!} /></p>
                </div>
              </div>
            </div>
          )}
        </section>

        <section aria-label="Your working" className="flex min-h-0 flex-col rounded-[24px] bg-fh-card p-[clamp(14px,2vw,24px)] shadow-[0_6px_0_var(--fh-box-line)]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-body text-[13px] font-semibold uppercase tracking-wide" style={{ color: "var(--wb-muted)" }}>{theory ? "Your working" : "Your working (optional)"}</p>
            {!done && <div className="flex gap-2">
              <button type="button" className={cn(QF_OUTLINE, "h-10 px-4 text-[14px]")} disabled={!lines.length} onClick={() => setLines(lines.slice(0, -1))}>Undo</button>
              <button type="button" className={cn(QF_OUTLINE, "h-10 px-4 text-[14px]")} disabled={!lines.length} onClick={() => setLines([])}>Clear</button>
            </div>}
          </div>
          <ol className="mt-4 space-y-3 lg:min-h-[100px] lg:flex-1 lg:overflow-y-auto">
            {lines.length === 0 && theory && view.workGuide && <li className="rounded-[14px] bg-muted px-4 py-3 text-[15px] font-medium leading-snug text-fh-ink">{view.workGuide}</li>}
            {lines.map((l, i) => (
              <li key={i} className="maths flex min-h-12 items-center rounded-[14px] border-2 border-fh-box-line bg-[var(--qf-input-bg)] px-4 py-2.5 font-hand text-[clamp(18px,1.6vw,24px)]" style={{ color: "var(--wb-navy)" }}><QfNums text={l} /></li>
            ))}
          </ol>
          {!done && (
            <div className="mt-3 shrink-0 space-y-2">
              <label htmlFor="pv-line" className="sr-only">Next line</label>
              <input id="pv-line" ref={input} value={draft} maxLength={200} onChange={(e) => setDraft(e.target.value)} autoComplete="off"
                placeholder="Write the next line…" onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addLine(); } }}
                className="maths h-14 w-full rounded-[14px] border-2 border-fh-box-line bg-[var(--qf-input-bg)] px-4 text-[20px] font-semibold text-[color:var(--qf-input-ink)] outline-none placeholder:text-[16px] placeholder:font-medium placeholder:text-[color:var(--qf-placeholder)] focus-visible:border-ans-ring focus-visible:ring-2 focus-visible:ring-ans-ring" />
              <div className="grid gap-3 sm:grid-cols-[3fr_4fr]" aria-label="Maths keyboard">
                <div className="grid grid-cols-3 gap-2" role="group" aria-label="Numbers">
                  {PRACTISE_NUM_KEYS.map((k) => <button key={k} type="button" onClick={() => insert(k)} aria-label={keyLabel(k)} className={cn(KEY, "maths", k === "0" && "col-span-2")}>{k}</button>)}
                </div>
                <div className="grid grid-cols-4 gap-2" role="group" aria-label="Letters and symbols">
                  {PRACTISE_SYM_KEYS.map((k) => <button key={k} type="button" onClick={() => insert(k)} aria-label={keyLabel(k)} className={cn(KEY, "maths")}>{k}</button>)}
                  <button type="button" onClick={() => setDraft(draft.slice(0, -1))} aria-label="Delete" className={cn(KEY, "col-span-2")}><Delete className="h-5 w-5" aria-hidden /></button>
                  <button type="button" onClick={addLine} disabled={!draft.trim()} className={cn(KEY, "col-span-2 text-[15px]")}>Add line</button>
                </div>
              </div>
            </div>
          )}
          {done && <p role="status" className="mt-3 flex items-center gap-2 text-[15px] font-semibold text-fh-ink"><Check className="h-5 w-5 text-ans-right" aria-hidden />Saved. You'll see how you did after all {view.items.length} questions.</p>}
          <div className="mx-auto mt-4 w-full max-w-[340px]">
            {!done
              ? <button type="button" className="vl-cta interactive flex h-14 w-full items-center justify-center rounded-full text-[18px] font-bold disabled:cursor-not-allowed" disabled={busy || !ready} onClick={() => void save()}>{busy ? "Saving…" : "Save answer"}</button>
              : <button type="button" className="vl-cta interactive flex h-14 w-full items-center justify-center rounded-full text-[18px] font-bold" disabled={busy} onClick={isLast ? () => setReview(true) : next}>{isLast ? "See how you did" : "Next question"}</button>}
          </div>
        </section>
      </div>

      {review && (
        <WarmupPopup correct={results.every((r) => r?.correct === true)} title="How you did"
          lines={view.items.map((it, i) => `Question ${i + 1}: ${results[i]?.correct === true ? "right ✓" : typeof results[i]?.correct === "boolean" ? "not quite" : "saved"}`)}
          button="Next: exit ticket" autoClose={false} onButton={() => { setReview(false); void refresh().then(next); }} />
      )}
    </div>
  );
}
