import { useSay } from "@/lib/voice";
import type { ReactNode } from "react";
// The quick fix after "Let's fix it": watch a worked example, then try one with help, step by step.
// The practice question ("Try one alone") is rendered by WarmupStage.
import { useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AlertTriangle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ViewBoard, ViewFixStep, ViewRepair } from "@/shared/contracts/lesson";
import type { Script } from "@/shared/contracts/script";
import { repairDialogFn, repairHintFn, repairStepFn, repairWatchDoneFn } from "@/lib/api/lesson.functions";
import { tapHintNudge, tapHintPill } from "@/shared/idle-hint";
import { voiceSpeaking } from "@/lib/voice";
import { GotItCard, HintCard, qfBurst } from "./whiteboard/QfCards";
import { playSound } from "@/lib/sound";
import { QF_PRIMARY, QfNums } from "./qf-shared";
import { WarmupPopup } from "./WarmupPopup";
import { cn } from "@/lib/utils";
import { useLesson, useOptionalLesson } from "./context";
import { Dock } from "./parts";
import { Fraction, PointBoard } from "./WarmupStage";
import { PlacePointBoard } from "./PlacePointBoard";
import { WorkingPlayer } from "./WorkingPlayer";
import { useReaction } from "./celebrate";
import { WhiteboardDialog } from "./whiteboard/WhiteboardDialog";

type Seg = Script[number] & { display?: string; top?: string; bottom?: string; board?: { path?: [number, number][] } };
type Labels = { watchTitle?: string; tryTitle?: string; nowTry?: string; showAll?: string; togetherTitle?: string; tryAgain?: string; nice?: string; shown?: string; closeTitle?: string; rightTitle?: string; continue?: string };

const HAND = "wb-ink maths text-[clamp(18px,1.8vw,28px)] leading-snug";
const Nums = QfNums;
const LINE = "maths font-body text-[18px] font-semibold leading-snug text-brand";
const PRIMARY = QF_PRIMARY;


function Expr({ seg }: { seg: Seg | null }) {
  if (!seg) return null;
  return (
    <p className="maths my-1 flex justify-start pl-[2em] font-display text-[20px] font-semibold text-brand" aria-label={seg.text}>
      {seg.display === "fraction" ? <Fraction s={seg} /> : <span aria-hidden>{seg.text}</span>}
    </p>
  );
}

function StepRow({ step, index, onCheck, pending, labels, focusKey, justRight, react, praise }: { step: ViewFixStep; index: number; onCheck: (v: string) => void; pending: boolean; labels: Labels; focusKey: number; justRight: boolean; react: ReturnType<typeof useReaction>; praise?: string | null }) {
  const [v, setV] = useState("");
  const ref = useRef<HTMLInputElement>(null);
  const [tried, setTried] = useState<string[]>([]);
  const [warn, setWarn] = useState(false);
  const [pt, setPt] = useState<[number, number] | null>(null);
  const lastMisses = useRef(step.misses);
  const li = useRef<HTMLLIElement>(null);
  const notQuiteLine = useOptionalLesson()?.view.boardLines?.notQuite ?? "";
  const pointHelp = useOptionalLesson()?.view.boardLines?.placeHelp || "Drag the dot, or tap where it goes";
  useEffect(() => { if (step.misses > lastMisses.current) { setWarn(true); react.notQuite(li.current); } lastMisses.current = step.misses; }, [step.misses]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { setWarn(false); if (step.state === "open") { setV(""); ref.current?.focus({ preventScroll: true }); } }, [step.state, step.id, focusKey]);
  const done = step.state !== "open";
  const promptText = step.prompt.map((p) => p.text).join(" ");
  const submit = (val: string) => { if (!val.trim() || pending) return; if (step.input === "choice") setTried((t) => [...t, val]); onCheck(val); };
  return (
    <li ref={li} className={cn("anim-popup flex flex-col font-hand", done && !justRight && "opacity-60")}>
      <div className="min-w-0 flex-1">
            {done ? (
        <p className="flex flex-wrap items-start gap-2">
          {step.state === "filled"
            ? <span className="mt-1 rounded-full bg-check-off-bg px-2 py-0.5 text-[12px] font-semibold text-work-earlier">{labels.shown || "shown"}</span>
            : <Check aria-label="Correct" className="mt-1 h-5 w-5 shrink-0 text-ans-right" />}
          <span className={cn(HAND, step.state === "filled" && "opacity-70")} style={{ color: "var(--wb-navy)" }}><Nums text={(step.line ?? []).map((l) => l.text).join(" ")} /></span>
        </p>
      ) : (
        <form className="flex flex-col items-start gap-3" onSubmit={(e) => { e.preventDefault(); submit(v); }}>
          <label htmlFor={`qf-${step.id}`} className={cn(HAND, "min-w-0")} style={{ color: "var(--wb-navy)" }}><Nums text={promptText} /></label>
          {step.input === "point" && step.grid ? (
            <div className="w-full space-y-3">
              <PlacePointBoard grid={step.grid} help={pointHelp} value={pt} onChange={(q) => { setPt(q); setWarn(false); }} ring={step.ring} mark={warn ? "warn" : null} disabled={pending} />
              <button type="button" className="hdr-bounce [--bounce-edge:var(--fh-primary-edge)] squish mx-auto flex h-[50px] items-center rounded-full bg-fh-primary px-10 font-body text-[16px] font-semibold text-fh-primary-ink shadow-[0_5px_0_var(--fh-primary-edge)] active:translate-y-[3px] disabled:opacity-60" disabled={!pt || pending} onClick={() => pt && submit(`${pt[0]},${pt[1]}`)}>{pending ? "Checking…" : "Check"}</button>
            </div>
          ) : step.input === "choice" && step.choices ? (
            <div className="flex gap-2">
              {step.choices.map((c) => <Button key={c} type="button" variant="outline" className="min-h-11 rounded-[12px]" disabled={pending || tried.includes(c)} onClick={() => submit(c)}>{c}</Button>)}
            </div>
          ) : (
            <div className="flex w-full max-w-[420px] items-center gap-2">
              <span className="relative flex min-w-0 flex-1 items-center">
              {warn && <AlertTriangle aria-hidden className="pointer-events-none absolute left-3 h-5 w-5 text-ans-warn-border" />}
              <input id={`qf-${step.id}`} ref={ref} value={v} onChange={(e) => { setV(e.target.value); setWarn(false); }} aria-invalid={warn || undefined} inputMode="decimal" autoComplete="off" maxLength={12}
                placeholder="Type your answer"
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); submit(v); } }}
                className={cn("maths h-12 min-w-0 flex-1 rounded-[12px] border-2 px-3 text-center text-[18px] font-semibold outline-none placeholder:text-[15px] placeholder:font-medium placeholder:text-[color:var(--qf-placeholder)] text-[color:var(--qf-input-ink)] focus:outline-none", warn ? "cel-warn border-[3px] border-ans-warn-border bg-ans-warn-bg pl-10" : "bg-[var(--qf-input-bg)] border-fh-box-line focus-visible:border-ans-ring focus-visible:ring-2 focus-visible:ring-ans-ring")} />
              </span>
              <Button type="submit" className="squish min-h-12 rounded-full px-6 font-body font-bold shadow-[0_4px_0_rgb(10_49_80/.35)] disabled:opacity-80 disabled:cursor-not-allowed" style={{ background: "var(--qf-check-bg)", color: "var(--qf-check-ink)" }} disabled={!v.trim() || pending}>{pending ? "Checking…" : "Check"}</Button>
            </div>
          )}
        </form>
      )}
      {warn && !done && <span className="sr-only" role="status">{notQuiteLine}</span>}
      </div>
    </li>
  );
}

function tryPath(board: ViewBoard | null, settled: number): [number, number][] | null {
  if (!board || settled < 1) return null;
  const [x, y] = board.point;
  return settled >= 2 ? [[x, 0], [x, y]] : [[x, 0]];
}

type DialogLabels = Labels & { closeTitle?: string; rightTitle?: string; continue?: string };

function YouTry({ repair, labels, onBubble, onIdle, onAsk, onRight, onDialog: liftDialog }: { repair: ViewRepair; labels: DialogLabels; onBubble: (text: string) => void; onIdle: (stepId: string | null) => void; onAsk: (q: string | null) => void; onRight: (praise: string, release: () => void) => void; onDialog: (node: ReactNode) => void }) {
  useSay(repair.you.intro.map((l) => l.speakable ?? l.text), `you:${repair.you.intro.map((l) => l.text).join("\n")}`);
  const { sessionId, run, say, refresh, busy, setMood, view } = useLesson();
  const check = useServerFn(repairStepFn);
  const closeDialog = useServerFn(repairDialogFn);
  const [pending, setPending] = useState(false);
  const [offline, setOffline] = useState(false);
  const [focusKey, setFocusKey] = useState(0);
  const [nice, setNice] = useState<string | null>(null);
  const react = useReaction();
  const [praise, setPraise] = useState<string | null>(null);
  // A right step stays on screen 1.5 s with "Nice!" before the next step opens.
  const [hold, setHold] = useState<ViewFixStep | null>(null);
  const steps = repair.you.steps;
  const settled = steps.filter((s) => s.state !== "open").length;
  // Right steps are written onto the board itself; only the open step (or the one just right) shows here.
  const shownSteps = hold ? steps.filter((s) => s.id === hold.id) : steps.filter((s) => s.state === "open").slice(0, 1);
  const dialog = hold ? null : repair.dialog;
  const onCheck = async (step: ViewFixStep, value: string) => {
    if (pending) return;
    setPending(true);
    if (!navigator.onLine) setOffline(true);
    const r = await run(() => check({ data: { sessionId, stepId: step.id, value } }));
    setOffline(false);
    if (r) {
      const l = r.result === "hint" ? r.step.hint : r.step.line;
      if (l?.length) say(l, r.result === "right" ? "celebrate" : "encouraging");
      if (r.result === "hint" && l?.length) onBubble(l.map((x) => x.text).join(" "));
      if (r.result === "right") { const p = react.small(null, view.boardLines?.strategy || null) || ""; setPraise(p); setNice(step.id); setHold(r.step); onRight(p, () => setHold(null)); }
      await refresh();
    }
    setPending(false);
  };
  const onDialog = async () => {
    const kind = repair.dialog?.kind;
    const ok = await run(() => closeDialog({ data: { sessionId } }));
    if (ok) { setMood("idle"); if (kind === "close") setFocusKey((k) => k + 1); await refresh(); }
  };
  const openStep = !hold && !dialog ? steps.find((s) => s.state === "open") ?? null : null;
  useEffect(() => { onIdle(openStep?.id ?? null); onAsk(openStep ? openStep.prompt.map((p) => p.text).join(" ") : null); }, [openStep?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <section className="mt-2" aria-labelledby="qf-try">
      <div className="flex flex-wrap items-center gap-3">
        <h3 id="qf-try" className="font-hand text-[clamp(16px,1.4vw,22px)] tracking-wide" style={{ color: "var(--wb-navy)" }}>{labels.tryTitle || "Your turn"}</h3>
        <div className="flex items-center gap-1.5 font-body text-[13px] font-semibold" style={{ color: "var(--wb-muted)" }}>
          <span className="mr-1">· Step {Math.min(settled + 1, steps.length)} of {steps.length}</span>
          {steps.map((s, i) => <span key={s.id} aria-hidden className="qf-dot" data-state={s.state !== "open" ? "done" : i === settled ? "now" : "todo"} />)}
        </div>
      </div>

      <Expr seg={repair.you.expr as Seg | null} />
      <div className={cn("mt-2 grid gap-5", repair.you.board && "lg:grid-cols-[1fr_minmax(0,1.1fr)] lg:items-center")}>
        <ol className="space-y-[clamp(10px,2vh,20px)]" aria-live="polite">
          {shownSteps.map((s, i) => {
            const st = hold && s.id === hold.id ? hold : s;
            return <StepRow key={s.id} react={react} praise={praise} step={st} index={steps.findIndex((x) => x.id === s.id)} labels={labels} focusKey={focusKey} justRight={nice === s.id} pending={pending || busy || !!dialog || !!hold} onCheck={(v) => onCheck(s, v)} />;
          })}
        </ol>
        {repair.you.board && !steps.some((s) => s.state === "open" && s.input === "point") && <PointBoard big board={repair.you.board} previewPath={tryPath(repair.you.board, settled)} />}
      </div>
      {offline && <p role="status" className="mt-3 text-[14px] font-semibold text-ink-2">Will check when you're back online</p>}
      <LiftDialog lift={liftDialog} node={dialog ? (
        <WarmupPopup contained key={`${dialog.kind}:${settled}`} correct={dialog.kind === "done"} autoClose={false} dismissable={dialog.kind === "close"}
          title={dialog.kind === "close" ? labels.closeTitle || "You got close!" : dialog.kind === "together" ? labels.togetherTitle || "Let's do this one together" : labels.rightTitle || "Good job!"}
          lines={dialog.lines.map((l) => l.text)}
          button={dialog.kind === "close" ? labels.tryAgain || "Try again" : labels.continue || "Continue"}
          onButton={onDialog} />
      ) : null} />
    </section>
  );
}


/** Hands a card up to the whiteboard screen so it centres over the whole dialog, not inside the board. */
function LiftDialog({ lift, node }: { lift: (n: ReactNode) => void; node: ReactNode }) {
  useEffect(() => { lift(node); });
  useEffect(() => () => lift(null), []); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

/** The whole quick fix runs on Fiti's whiteboard (dialog): watch the worked example, then "Your turn" steps on the same board.
 *  The page underneath keeps showing the question. */
export function QuickFix({ repair, labels, open, onClose, topBar }: { repair: ViewRepair; labels: Labels; open: boolean; onClose: () => void; topBar?: ReactNode }) {
  // The slip line was already spoken on the "You got close!" card; saying it again here talked over the board.
  const { sessionId, run, refresh, setMood, say, busy, view } = useLesson();
  const watchDone = useServerFn(repairWatchDoneFn);
  const lines = repair.watch.lines as Seg[];
  const live = repair.part === "watch";
  const skipped = useRef(false);
  const [n, setN] = useState(live ? 0 : lines.length);
  const path = lines.slice(0, Math.max(n, 1)).reduce<[number, number][] | null>((p, l) => l.board?.path ?? p, null);
  const trying = repair.part === "try" || !!repair.dialog;
  // A "Your turn" step was marked: Fiti nods (right) or plays retry (not quite).
  const beat = useRef(0);
  const d = repair.dialog as { kind?: string } | null | undefined;
  const result = useMemo(() => (d?.kind ? { ok: d.kind === "done", beat: ++beat.current } : null), [d]); // eslint-disable-line react-hooks/exhaustive-deps
  const react = useReaction();
  useEffect(() => { if (d?.kind === "done") react.big(); }, [d?.kind]); // eslint-disable-line react-hooks/exhaustive-deps
  const slipText = repair.slip.map((l) => l.text).join(" ");
  const tryLines = [slipText, ...repair.you.intro.map((l) => l.text), ...repair.you.steps.filter((s) => s.state === "right").map((s) => `${(s.line ?? []).map((l) => l.text).join(" ")} ✓`)].filter(Boolean);
  // Fiti's bubble (hint after not quite, or a tapped hint) and the lab-style "tap me for a hint" tag after a still spell.
  const [bubble, setBubble] = useState<{ text: string; beat: number } | null>(null);
  const pop = (text: string) => setBubble((b) => ({ text, beat: (b?.beat ?? 0) + 1 }));
  const [idleStep, setIdleStep] = useState<string | null>(null);
  const [still, setStill] = useState(0);
  const tapLine = view.boardLines?.tapHint || "";
  const idleMs = view.boardLines?.idleHintMs ?? 8000;
  const paused = (view as { paused?: boolean }).paused === true;
  const watchIdle = live && !trying && n >= lines.length;
  const idleOn = !!idleStep || watchIdle;
  useEffect(() => {
    if (!idleOn || !open) return;
    let last = Date.now();
    const reset = () => { last = Date.now(); setStill(0); };
    const evs = ["pointerdown", "keydown", "input"];
    evs.forEach((e) => window.addEventListener(e, reset, true));
    const t = window.setInterval(() => setStill(Date.now() - last), 250);
    return () => { evs.forEach((e) => window.removeEventListener(e, reset, true)); window.clearInterval(t); setStill(0); };
  }, [idleStep, idleOn, open]);
  const [seen, setSeen] = useState<Set<string>>(() => new Set());
  const seenKey = idleStep ?? (watchIdle ? "watch" : "");
  const hintFn = useServerFn(repairHintFn);
  const [ask, setAsk] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [got, setGot] = useState<{ praise: string; release: () => void } | null>(null);
  const [cheer, setCheer] = useState(0);
  const [stepCard, setStepCard] = useState<ReactNode>(null);
  const showTag = idleOn && tapHintPill({ stepOpen: idleOn, hasHint: !!tapLine, seen: seen.has(seenKey), cardOpen: !!hint || !!got || !!stepCard });
  const nudge = showTag && tapHintNudge(still, idleMs, { paused, speaking: voiceSpeaking() });
  const markSeen = () => setSeen((p) => new Set(p).add(seenKey));
  const watchQ = (repair.watch.expr as Seg | null)?.text || slipText;
  const tapFiti = async () => {
    if (busy || hint || got) return;
    if (watchIdle) { const last = lines[lines.length - 1]?.text; if (last) { setAsk(watchQ || null); setHint(last); markSeen(); } return; }
    if (!idleStep) return;
    const l = await run(() => hintFn({ data: { sessionId, stepId: idleStep } }));
    if (l && l.length) { setHint(l.map((x) => x.text).join(" ")); say(l, "encouraging"); markSeen(); }
  };
  const onRight = (praise: string, release: () => void) => { qfBurst(); playSound("small_win"); setCheer((c) => c + 1); setGot({ praise, release }); };
  const finishWatch = async () => { const ok = await run(() => watchDone({ data: { sessionId, skipped: skipped.current } })); if (ok) { setMood("idle"); await refresh(); } };
  return (
    <WhiteboardDialog key={live ? "watch" : "try"} open={open} onClose={onClose} title={labels.watchTitle || "Watch how it's done"}
      topBar={topBar} resumeKey={`${sessionId}:fix:${repair.watch.lines.length}`} followTurn result={result}
      heading={trying ? undefined : (repair.watch.expr as Seg | null)?.text ? <Expr seg={repair.watch.expr as Seg | null} /> : undefined}
      drawing={!trying && repair.watch.board ? <PointBoard big board={repair.watch.board} previewPath={path} /> : undefined}
      lines={trying ? tryLines : [...((repair.watch.expr as Seg | null)?.text || !slipText ? [] : [slipText]), ...lines.map((l) => l.text)]} capacity={3} pace={view.pace} live={live}
      onLine={(t, i) => { say([{ text: t }], "speaking"); setN(i + 1); }}
      onDone={(sk) => { skipped.current = sk; setN(lines.length); }}
      footer={trying ? <YouTry repair={repair} labels={labels} onBubble={pop} onIdle={setIdleStep} onAsk={setAsk} onRight={onRight} onDialog={setStepCard} /> : undefined}
      bubble={bubble} tip={showTag ? tapLine : null} nudge={nudge} ask={trying ? ask : null} cheer={cheer}
      overlay={hint ? <HintCard title={ask || (watchIdle ? watchQ : "")} body={hint} onClose={() => setHint(null)} />
        : got ? <GotItCard title={view.boardLines?.gotIt || "You got it!"} body={got.praise} action={labels.continue || "Continue"} onContinue={() => { got.release(); setGot(null); }} /> : stepCard} onFitiTap={tapLine && ((trying && idleStep) || watchIdle) ? () => void tapFiti() : undefined}
      cta={(all) => live && all ? <Button size="lg" className={cn(PRIMARY, "flex-none px-10")} disabled={busy} onClick={finishWatch}>{labels.nowTry || "Your turn"}</Button> : null}>
    </WhiteboardDialog>
  );
}
