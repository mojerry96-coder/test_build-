// Practise (worksheet), Prove (guided), Exit ticket and Reflect stages.
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { AlertTriangle, Check, Feather, Lightbulb, MessageCircleQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CheckResult, CloseSummary, LineResult } from "@/shared/contracts/lesson";
import type { Script } from "@/shared/contracts/script";
import { WhiteboardDialog } from "./whiteboard/WhiteboardDialog";
import { askTutorFn, checkAnswerFn, checkLinesFn, closeLessonFn, explainFn, hintFn, teachMeFn, worksheetModeFn } from "@/lib/api/lesson.functions";
import { cn } from "@/lib/utils";
import { TutorAvatar } from "@/components/tutor/TutorAvatar";
import { useLesson } from "./context";
import { useAdvance } from "./stages-a";
import { Card, Dock, Eyebrow, ItemAnswer, MathInput, Prompt, ResultBanner, isAnswered, useIdle, type ItemResponse } from "./parts";

export { WorksheetStage } from "./PractiseStage";

import { useSay } from "@/lib/voice";
import { WavingFiti } from "@/components/learn/WavingFiti";
import { WarmupOptions } from "./WarmupStage";
import { QfNums } from "./qf-shared";

/* ---------- 6 · Prove (guided) ---------- */
export function GuidedStage() {
  const { view, busy, run, sessionId, say, refresh } = useLesson();
  const item = view.items[view.position.index];
  const check = useServerFn(checkAnswerFn);
  const hint = useServerFn(hintFn);
  const explain = useServerFn(explainFn);
  const next = useAdvance();
  const [resp, setResp] = useState<ItemResponse>({});
  const [hints, setHints] = useState<Script[]>([]);
  useSay((hints.at(-1) ?? []).map((l) => l.speakable ?? l.text), `hint:${hints.length}`, hints.length > 0);
  const [submitted, setSubmitted] = useState(false);
  const [summary, setSummary] = useState<CheckResult["summary"]>();
  if (!item) return null;
  const isLast = view.position.index === view.items.length - 1;
  const done = submitted || !!view.results[item.id];
  const allResults = view.items.map((i) => summary?.find((r) => r.itemId === i.id) ?? view.results[i.id]);
  const showFeedback = isLast && done;

  const openHint = async () => {
    const r = await run(() => hint({ data: { sessionId, itemId: item.id } }));
    if (r) setHints([...hints, r.lines]);
  };
  const doExplain = async () => {
    const s = await run(() => explain({ data: { sessionId } }));
    if (s) say(s);
  };
  const submit = async () => {
    const r = await run(() => check({ data: { sessionId, itemId: item.id, response: resp } }));
    if (r?.status === "saved") { setSubmitted(true); setSummary(r.summary); if (isLast) await refresh(); }
  };
  return (
    <div className="space-y-4">
      <div className="flex gap-2 text-xs font-semibold">
        {view.items.map((it, i) => (
          <span key={it.id} className={cn("rounded-full px-2.5 py-1", i === view.position.index ? "bg-info text-info-foreground" : view.results[it.id] ? "bg-muted text-foreground" : "bg-muted text-muted-foreground")}>
            {it.kind === "theory" ? "Theory" : `Q${i + 1}`} · {i === view.position.index ? "now" : view.results[it.id] ? "answered" : "next"}
          </span>
        ))}
      </div>
      <Card>
        <Prompt script={item.prompt} />
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="outline" className="h-11" onClick={doExplain} disabled={busy}><MessageCircleQuestion className="h-4 w-4" aria-hidden />Explain the question</Button>
        </div>
        <div className="mt-4"><ItemAnswer item={item} value={resp} onChange={setResp} disabled={done} /></div>
        {done && !showFeedback && <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-muted-foreground"><Check className="h-4 w-4" aria-hidden />Saved. Feedback comes after all {view.items.length} questions.</p>}
      </Card>
      {item.hintCount > 0 && !done && (
        <Card>
          <Eyebrow>Hints · {hints.length} of {item.hintCount} opened</Eyebrow>
          <ol className="space-y-2">
            {hints.map((h, i) => <li key={i} className="rounded-xl bg-accent px-3 py-2 text-sm"><span className="font-bold">{i + 1} · </span>{h.map((l) => l.text).join(" ")}</li>)}
          </ol>
          {hints.length < item.hintCount && <Button variant="outline" className="mt-3 h-11" onClick={openHint} disabled={busy}><Lightbulb className="h-4 w-4" aria-hidden />Open hint {hints.length + 1}</Button>}
        </Card>
      )}
      {showFeedback && (
        <Card>
          <Eyebrow>Combined review</Eyebrow>
          <ul className="space-y-2">
            {view.items.map((it, i) => {
              const r = allResults[i] ?? (it.id === item.id ? undefined : undefined);
              return <li key={it.id} className="flex items-center gap-2 text-sm">{typeof r?.correct !== "boolean" ? <Check className="h-4 w-4 text-muted-foreground" aria-label="Saved" /> : r.correct ? <Check className="h-4 w-4 text-success" aria-label="Right" /> : <AlertTriangle className="h-4 w-4 text-warning-foreground" aria-label="Not quite" />}Question {i + 1}{typeof r?.correct === "boolean" ? (r.correct ? ": right" : ": not quite") : ": saved"}</li>;
            })}
          </ul>
        </Card>
      )}
      <Dock>
        {!done ? (
          <Button size="lg" className="h-13 flex-1 rounded-xl text-base" disabled={busy || !isAnswered(item, resp)} onClick={submit}>Submit answer</Button>
        ) : (
          <Button size="lg" className="h-13 flex-1 rounded-xl text-base" disabled={busy} onClick={next}>{isLast ? "Next: exit ticket" : "Next question"}</Button>
        )}
      </Dock>
    </div>
  );
}

/* ---------- 7 · Exit ticket (no tutor, hints or alerts) ---------- */
const BOARD = "relative rounded-[28px] border-2 border-[var(--hook-board-edge)] bg-fh-card px-[clamp(18px,3vw,36px)] pb-7 pt-6 shadow-[0_8px_0_var(--hook-board-edge)]";
const HAND = "maths font-hand leading-snug tracking-[0.5px] [-webkit-text-stroke:0.8px_currentColor]";
const CTA = "vl-cta interactive flex h-14 w-full items-center justify-center rounded-full text-[18px] font-bold disabled:cursor-not-allowed";
const LABEL = "font-body text-[13px] font-bold uppercase tracking-wide text-fh-box-edge";

export function ExitStage() {
  const { view, busy, run, sessionId, refresh } = useLesson();
  const check = useServerFn(checkAnswerFn);
  const next = useAdvance();
  const [resps, setResps] = useState<Record<string, ItemResponse>>({});
  const handIn = async () => {
    for (const it of view.items) {
      if (view.results[it.id]) continue;
      const r = await run(() => check({ data: { sessionId, itemId: it.id, response: resps[it.id] ?? {} } }));
      if (!r) { await refresh(); return; }
    }
    await next();
  };
  const ready = view.items.every((it) => view.results[it.id] || isAnswered(it, resps[it.id] ?? {}));
  return (
    <div className="pr-scope relative space-y-5" data-lesson-step="exit">
      <div className={BOARD}>
        <p className={LABEL}>Exit ticket</p>
        <h2 className={cn(HAND, "mt-1 text-[clamp(24px,2.4vw,34px)]")} style={{ color: "var(--wb-navy)" }}>On your own now</h2>
        <p className="mt-1 font-body text-[15px] font-medium" style={{ color: "var(--wb-muted)" }}>No hints, no tutor, no alerts. Show what you know.</p>
      </div>
      {view.items.map((it, i) => {
        const v = resps[it.id] ?? {};
        const set = (r: ItemResponse) => setResps({ ...resps, [it.id]: r });
        const locked = !!view.results[it.id];
        return (
          <section key={it.id} className={BOARD}>
            <p className={LABEL}>Question {i + 1} of {view.items.length}</p>
            <h3 className={cn(HAND, "mt-2 text-[clamp(20px,2vw,28px)]")} style={{ color: "var(--wb-navy)" }}><QfNums text={it.prompt.map((p) => p.text).join(" ")} /></h3>
            <div className="mt-5">
              {it.kind === "mcq" && it.options
                ? <WarmupOptions options={it.options} value={v.optionId ?? null} onChange={(id) => set({ ...v, optionId: id })} locked={locked || busy} mark={null} />
                : <ItemAnswer item={it} value={v} onChange={set} disabled={locked} />}
            </div>
          </section>
        );
      })}
      <div className="mx-auto w-full max-w-[340px]">
        <button type="button" className={CTA} disabled={busy || !ready} onClick={() => void handIn()}>{busy ? "Handing in…" : "Hand in"}</button>
      </div>
    </div>
  );
}

/* ---------- 8 · Reflect and close ---------- */
export function ReflectStage() {
  const { view, busy, run, sessionId, say } = useLesson();
  const close = useServerFn(closeLessonFn);
  const [text, setText] = useState("");
  const [summary, setSummary] = useState<CloseSummary | null>(null);
  useSay(summary ? [...summary.hookClose.map((l) => l.speakable ?? l.text), ...summary.didWell, ...summary.watch] : [], "summary", !!summary);
  const home = <div className="mx-auto w-full max-w-[340px]"><Link to="/" className={CTA}>Back to subjects</Link></div>;
  if (view.completed && !summary) {
    return (
      <div className="pr-scope space-y-5" data-lesson-step="reflection">
        <div className={cn(BOARD, "text-center")}>
          <TutorAvatar mood="celebrate" size={120} className="mx-auto block" live />
          <h2 className={cn(HAND, "mt-3 text-[clamp(24px,2.4vw,34px)]")} style={{ color: "var(--wb-navy)" }}>This lesson is complete</h2>
        </div>
        {home}
      </div>
    );
  }
  const finish = async () => {
    const s = await run(() => close({ data: { sessionId, reflection: text } }));
    if (s) { setSummary(s); say(s.tutorLines, s.secure ? "celebrate" : "encouraging"); }
  };
  if (summary) {
    return (
      <div className="pr-scope space-y-5" data-lesson-step="reflection">
        {summary.hookClose.length > 0 && <div className={BOARD}>{summary.hookClose.map((l, i) => <p key={i} className={cn(HAND, "text-[clamp(18px,1.6vw,24px)]")} style={{ color: "var(--wb-navy)" }}>{l.text}</p>)}</div>}
        {(summary.didWell.length > 0 || summary.watch.length > 0) && (
          <div className="grid gap-5 sm:grid-cols-2">
            {summary.didWell.length > 0 && <section className={BOARD}><p className={LABEL}>You did well</p><ul className="mt-2 space-y-2">{summary.didWell.map((d) => <li key={d} className="flex gap-2 font-body text-[15px] font-medium text-fh-ink"><Check className="mt-0.5 h-5 w-5 shrink-0 text-ans-right" aria-hidden />{d}</li>)}</ul></section>}
            {summary.watch.length > 0 && <section className={BOARD}><p className={LABEL}>Watch next time</p><ul className="mt-2 space-y-2">{summary.watch.map((d) => <li key={d} className="flex gap-2 font-body text-[15px] font-medium text-fh-ink"><Lightbulb className="mt-0.5 h-5 w-5 shrink-0 fill-current text-mcq-hint" aria-hidden />{d}</li>)}</ul></section>}
          </div>
        )}
        {summary.secure ? (
          <div className="flex items-center gap-4 rounded-[28px] border-2 border-reward bg-reward-soft px-6 py-5 shadow-[0_8px_0_var(--reward)]">
            <TutorAvatar mood="celebrate" size={88} className="shrink-0" live />
            <Feather className="anim-feather h-12 w-12 shrink-0 text-reward" aria-hidden />
            <div><p className="text-lg font-extrabold text-fh-heading">Red feather earned</p><p className="text-sm text-fh-ink">Secure: {view.topicName}</p></div>
          </div>
        ) : (
          <div className={BOARD}><p className="font-bold text-fh-heading">Not secure yet</p><p className="mt-1 text-sm" style={{ color: "var(--wb-muted)" }}>A quick practice on the skills to watch comes first next time. You can still move on.</p></div>
        )}
        {home}
      </div>
    );
  }
  return (
    <div className="pr-scope space-y-5" data-lesson-step="reflection">
      <div className="grid items-end gap-4 sm:grid-cols-[auto_1fr]">
        <WavingFiti className="mx-auto h-[clamp(120px,18vh,190px)] w-auto sm:mx-0" />
        <section className={BOARD}>
          <p className={LABEL}>Reflect</p>
          <label htmlFor="reflect" className={cn(HAND, "mt-1 block text-[clamp(22px,2.2vw,32px)]")} style={{ color: "var(--wb-navy)" }}>What tripped you up today, and what helped?</label>
          <textarea id="reflect" value={text} onChange={(e) => setText(e.target.value)} rows={4} maxLength={2000} placeholder="Type it here…"
            className="mt-4 w-full rounded-[14px] border-2 border-fh-box-line bg-[var(--qf-input-bg)] p-4 text-[17px] font-medium text-[color:var(--qf-input-ink)] outline-none placeholder:text-[color:var(--qf-placeholder)] focus-visible:border-ans-ring" />
        </section>
      </div>
      <div className="mx-auto w-full max-w-[340px]">
        <button type="button" className={CTA} disabled={busy || !text.trim()} onClick={() => void finish()}>{busy ? "Finishing…" : "Finish lesson"}</button>
      </div>
    </div>
  );
}
