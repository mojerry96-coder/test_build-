// Step 1 · Ready: the warm-up. Multiple-choice questions, an interactive board, and a quick fix.
import { useReaction } from "./celebrate";
import { playSound } from "@/lib/sound";
import { WhiteboardDialog } from "./whiteboard/WhiteboardDialog";
import { useEffect, useRef, useState, type ReactNode, type Ref } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AlertTriangle, ArrowRight, Check, Loader2 } from "lucide-react";
import { WarmupPopup } from "./WarmupPopup";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { ViewBoard, ViewItem, ViewOption } from "@/shared/contracts/lesson";
import type { Script } from "@/shared/contracts/script";
import { checkAnswerFn, closePopupFn, logOptionFn, skipRepairFn } from "@/lib/api/lesson.functions";
import { QuickFix } from "./QuickFix";
import { cn } from "@/lib/utils";
import { useLesson } from "./context";
import { useAdvance } from "./stages-a";
import { splitNumbers } from "@/shared/question-numbers";

function Nums({ text }: { text: string }) {
  return <>{splitNumbers(text).map((p, i) => p.num ? <span key={i} className="text-q-num [-webkit-text-stroke-color:var(--q-num)]">{p.text}</span> : <span key={i}>{p.text}</span>)}</>;
}

const LETTERS = "ABCDEFGH";
const CHECK = "hdr-bounce [--bounce-edge:var(--fh-primary-edge)] squish disabled:pointer-events-none disabled:opacity-80 disabled:bg-fh-primary disabled:text-fh-primary-ink disabled:shadow-[0_5px_0_var(--fh-primary-edge)] h-[50px] flex-1 rounded-full bg-fh-primary text-[16px] font-semibold text-fh-primary-ink shadow-[0_5px_0_var(--fh-primary-edge)] hover:bg-fh-primary hover:brightness-105 active:translate-y-[3px] active:shadow-[0_2px_0_var(--fh-primary-edge)]";
type Seg = Script[number] & { display?: string; top?: string; bottom?: string; role?: string };

const Q = "maths font-hand line-clamp-3 text-[26px] leading-[1.15] tracking-[1px] text-hub-heading [-webkit-text-stroke:1.2px_var(--hub-heading)] sm:text-[34px] lg:text-[clamp(30px,min(2.6vw,5vh),44px)] [text-wrap:balance]";

function Fraction({ s }: { s: Seg }) {
  return (
    <span className="inline-flex flex-col items-center align-middle leading-tight text-q-num [-webkit-text-stroke-color:var(--q-num)]" aria-hidden>
      <span className="px-2">{s.top}</span>
      <span className="my-1 h-[2px] w-full bg-q-num" />
      <span className="px-2">{s.bottom}</span>
    </span>
  );
}

function WarmupPrompt({ script }: { script: Script }) {
  const segs = script as Seg[];
  const main = segs.filter((s) => s.role !== "reminder");
  const reminders = segs.filter((s) => s.role === "reminder");
  const inline = main.some((s) => s.display === "fraction");
  return (
    <div className="anim-spring-in mx-auto max-w-[1080px] space-y-3 text-center text-hub-heading">
      {inline ? (
        <p className={cn(Q, "flex items-center justify-center gap-4")} aria-label={main.map((s) => s.text).join(" ")}>
          {main.map((s, i) => s.display === "fraction" ? <Fraction key={i} s={s} /> : <span key={i} aria-hidden><Nums text={s.text} /></span>)}
        </p>
      ) : main.map((s, i) => <p key={i} className={Q}><Nums text={s.text} /></p>)}
      {reminders.map((s, i) => <p key={`r${i}`} className="text-[16px] font-medium text-ink-2">{s.text}</p>)}
    </div>
  );
}

/** "Here's how it works": Fiti works it out on the whiteboard at the shared reading pace (grid and arrows drawn
 *  on the board), then the Good Job popup a second after she closes or it ends. */
function WorkingBox({ label, lines, drawing, heading, resumeKey, onLine, onDone }: { label: string; lines: string[]; drawing?: ReactNode; heading?: ReactNode; resumeKey: string; onLine: (t: string) => void; onDone: (skipped: boolean, blockId?: string | null) => void }) {
  const { view } = useLesson();
  const [open, setOpen] = useState(true);
  const sk = useRef(false);
  const fired = useRef(false);
  const finish = () => { if (fired.current) return; fired.current = true; setOpen(false); onDone(sk.current, null); };
  return (
    <WhiteboardDialog open={open} onClose={finish} title={label} heading={heading} drawing={drawing} lines={lines} pace={view.pace}
      resumeKey={resumeKey} followTurn={false} onLine={(t) => onLine(t)} onDone={(s) => { sk.current = s; }} />
  );
}

/** Coordinate board in the Gradient Lab style: rounded card, pastel grid, point pop + glow, run (blue) then rise (green) drawing on. */
/** Rise and run as written in the approved working lines ("run = 3", "rise is 2"); never computed here. */
export function riseRunFrom(lines: string[]): { rise: string | null; run: string | null } {
  const find = (w: string) => { for (const l of lines) { const m = new RegExp(`\\b${w}\\b[^\\d-]{0,12}(-?\\d+(?:[./]\\d+)?)`, "i").exec(l); if (m) return m[1]!; } return null; };
  return { rise: find("rise"), run: find("run") };
}

function PointBoard({ board, previewPath, mark, tri, big }: { board: ViewBoard; previewPath: [number, number][] | null; mark?: "ok" | "warn" | null; tri?: { rise: string | null; run: string | null } | undefined; big?: boolean }) {
  const W = 600, H = 400, pad = 40;
  const sx = (x: number) => pad + (x / board.x_max) * (W - pad * 2);
  const sy = (y: number) => H - pad - (y / board.y_max) * (H - pad * 2);
  const [px, py] = board.point;
  const pts: [number, number][] = previewPath ? [[0, 0], ...previewPath] : [];
  const segs = pts.slice(1).map((p, i) => ({ a: pts[i]!, b: p }));
  const hand = { fontFamily: '"Patrick Hand", cursive' };
  return (
    <figure className={cn("anim-spring-in mx-auto w-full rounded-[22px] bg-[var(--board-card)] p-2 shadow-[0_10px_28px_-14px_rgb(10_49_80/0.35)]", mark === "warn" && "anim-shake", mark === "ok" && "anim-success")} style={{ ["--d" as string]: "150ms" }}>
      <svg viewBox={`0 0 ${W} ${H}`} className={big ? "w-full" : "max-h-[200px] w-full sm:max-h-[230px] [.side-by-side_&]:sm:max-h-[260px]"} role="img" aria-label={`Grid with the point ${board.label}`}>
        {Array.from({ length: board.x_max + 1 }, (_, x) => <line key={`x${x}`} className="anim-fade" style={{ ["--d" as string]: `${200 + x * 40}ms` }} x1={sx(x)} x2={sx(x)} y1={sy(0)} y2={sy(board.y_max)} stroke={x === 0 ? "var(--board-axis)" : "var(--board-line)"} strokeWidth={x === 0 ? 2.5 : 1.5} />)}
        {Array.from({ length: board.y_max + 1 }, (_, y) => <line key={`y${y}`} className="anim-fade" style={{ ["--d" as string]: `${200 + y * 40}ms` }} y1={sy(y)} y2={sy(y)} x1={sx(0)} x2={sx(board.x_max)} stroke={y === 0 ? "var(--board-axis)" : "var(--board-line)"} strokeWidth={y === 0 ? 2.5 : 1.5} />)}
        {Array.from({ length: board.x_max }, (_, i) => i + 1).map((x) => <text key={x} x={sx(x)} y={sy(0) + (big ? 32 : 26)} fontSize={big ? 32 : 26} textAnchor="middle" fill="var(--hub-heading)" style={hand}>{x}</text>)}
        {Array.from({ length: board.y_max + 1 }, (_, y) => <text key={y} x={sx(0) - 14} y={sy(y) + 8} fontSize={big ? 32 : 26} textAnchor="end" fill="var(--hub-heading)" style={hand}>{y}</text>)}
        {segs.map(({ a, b }, i) => {
          const len = Math.hypot(sx(b[0]) - sx(a[0]), sy(b[1]) - sy(a[1]));
          const run = a[1] === b[1];
          return <line key={`${pts.join()}-${i}`} x1={sx(a[0])} y1={sy(a[1])} x2={sx(b[0])} y2={sy(b[1])} stroke={run ? "var(--run)" : a[0] === b[0] ? "var(--rise)" : "var(--color-board-path)"} strokeWidth="5" strokeLinecap="round" className="board-draw" style={{ ["--len" as string]: `${len}`, ["--d" as string]: `${i * 300}ms` }} />;
        })}
        {big && !tri && segs.map(({ a, b }, i) => {
          const across = a[1] === b[1], d = Math.abs(across ? b[0] - a[0] : b[1] - a[1]);
          if (!d || (!across && a[0] !== b[0])) return null;
          const x = across ? (sx(a[0]) + sx(b[0])) / 2 : sx(a[0]) + 16, y = across ? sy(a[1]) - 16 : (sy(a[1]) + sy(b[1])) / 2 + 8;
          return <text key={`tag${pts.join()}-${i}`} x={x} y={y} fontSize="26" textAnchor={across ? "middle" : "start"} fill={across ? "var(--run)" : "var(--rise)"} className="board-halo anim-note-pop" style={{ ...hand, ["--d" as string]: `${500 + i * 400}ms` }}>{d} {across ? "across" : "up"}</text>;
        })}
        {tri && (tri.run || tri.rise) && (
          <g aria-label={`run ${tri.run ?? ""}, rise ${tri.rise ?? ""}`}>
            {tri.run && tri.rise && <path d={`M ${sx(0)} ${sy(0)} L ${sx(px)} ${sy(0)} L ${sx(px)} ${sy(py)} Z`} fill="var(--tri)" className="anim-fade" style={{ ["--d" as string]: "800ms" }} />}
            {tri.run && <line x1={sx(0)} y1={sy(0)} x2={sx(px)} y2={sy(0)} stroke="var(--run)" strokeWidth="6" strokeLinecap="round" className="board-draw" style={{ ["--len" as string]: `${sx(px) - sx(0)}` }} />}
            {tri.rise && <line x1={sx(px)} y1={sy(0)} x2={sx(px)} y2={sy(py)} stroke="var(--rise)" strokeWidth="6" strokeLinecap="round" className="board-draw" style={{ ["--len" as string]: `${sy(0) - sy(py)}`, ["--d" as string]: "400ms" }} />}
            {tri.run && <text x={(sx(0) + sx(px)) / 2} y={sy(0) - 12} fontSize="24" textAnchor="middle" fill="var(--run)" className="board-halo anim-note-pop" style={hand}>run = {tri.run}</text>}
            {tri.rise && <text x={sx(px) + 12} y={(sy(0) + sy(py)) / 2 + 8} fontSize="24" fill="var(--rise)" className="board-halo anim-note-pop" style={hand}>rise = {tri.rise}</text>}
          </g>
        )}
        <circle cx={sx(px)} cy={sy(py)} r="10" fill="var(--color-board-point)" className="board-glow" />
        <circle cx={sx(px)} cy={sy(py)} r="9" fill="var(--color-board-point)" className="board-point" style={{ ["--d" as string]: "650ms" }} />
        <text x={sx(px) + 16} y={sy(py) - 14} fontSize="28" fill="var(--hub-heading)" className="board-halo anim-fade" style={{ ...hand, ["--d" as string]: "800ms" }}>{board.label}</text>
        {mark === "ok" && <path d={`M ${sx(px) - 7} ${sy(py)} l 5 5 l 9 -10`} fill="none" stroke="var(--board-card)" strokeWidth="3" strokeLinecap="round" className="board-draw" style={{ ["--len" as string]: "22", ["--d" as string]: "200ms" }} />}
      </svg>
    </figure>
  );
}

export function WarmupOptions({ options, value, onChange, locked, mark, off, glow, compact }: { options: ViewOption[]; value: string | null; onChange: (id: string) => void; locked: boolean; mark: "ok" | "warn" | null; off?: string[]; stacked?: boolean; glow?: boolean; /** Smaller tiles with hand-written answers (video question card). */ compact?: boolean }) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  return (
    <div role="radiogroup" aria-label="Choose an answer" className={cn("answer-grid mx-auto grid w-full grid-cols-2 gap-3", compact ? "max-w-[460px]" : options.some((o) => o.label.length > 12) ? "max-w-[580px]" : "max-w-[560px]", "rounded-[30px] transition-shadow duration-500 sm:gap-x-4 sm:gap-y-[clamp(10px,1.8vh,18px)]", glow && "options-glow")}>
      {options.map((o, i) => {
        const sel = value === o.id;
        const m = sel ? mark : null;
                return (
          <button key={o.id} ref={(el) => { refs.current[i] = el; }} type="button" role="radio" aria-checked={sel} data-pos={i % 4} data-mark={m ?? undefined}
            aria-label={`Option ${LETTERS[i]}, ${o.label}`} tabIndex={sel || (!value && i === 0) ? 0 : -1} disabled={(locked && !sel) || (!!off?.includes(o.id) && !sel)}
            onClick={() => { if (!locked && !off?.includes(o.id)) { playSound("tap"); onChange(o.id); } }}
            onKeyDown={(e) => {
              if (locked || !["ArrowDown", "ArrowRight", "ArrowUp", "ArrowLeft"].includes(e.key)) return;
              e.preventDefault();
              const n = (i + (["ArrowDown", "ArrowRight"].includes(e.key) ? 1 : options.length - 1)) % options.length;
              onChange(options[n]!.id); refs.current[n]?.focus();
            }}
            style={{ ["--d" as string]: `${300 + i * 60}ms` }}
            onKeyUp={(e) => { if (e.key === "Enter" && sel) (document.querySelector("[data-check-answer]") as HTMLButtonElement | null)?.click(); }}
            className={cn("mcq-tile anim-spring-in interactive relative flex w-full min-w-0 items-center justify-center overflow-hidden break-words text-center text-hub-heading focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-mcq-sel disabled:cursor-default", compact ? "min-h-[64px] rounded-[12px] px-7 py-2 sm:min-h-[72px]" : "min-h-[72px] rounded-[14px] px-10 py-3 sm:min-h-[clamp(80px,12vh,110px)]", compact && off?.includes(o.id) && !sel && "opacity-50")}>
            <span aria-hidden className={cn("absolute grid place-items-center rounded-full bg-[var(--bd)] font-bold text-fh-card", compact ? "left-2 top-2 h-[18px] w-[18px] text-[9px]" : "left-3 top-3 h-6 w-6 text-[11px]")}>
              {m === "warn" ? <AlertTriangle className="h-4 w-4" /> : LETTERS[i]}
            </span>
            <span className={cn("maths w-full min-w-0 text-center font-semibold leading-snug line-clamp-3", compact ? (o.label.length <= 6 ? "font-hand-bold text-[30px] leading-none" : "font-hand-bold text-[18px] leading-tight") : o.label.length <= 6 ? "font-hand text-[clamp(32px,3.4vw,48px)]" : o.label.length <= 24 ? "text-[19px]" : "text-[16px]")}>{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}

type Popup = NonNullable<NonNullable<ReturnType<typeof useLesson>["view"]["warmup"]>["popup"]>;

function QuestionBody({ item, pick, setPick, popup, answered, boardPath, actions, glow, optionsRef, tri }: { tri?: { rise: string | null; run: string | null } | undefined; item: ViewItem; pick: string | null; setPick: (id: string) => void; popup: Popup | null; answered: boolean; boardPath?: [number, number][] | null; actions?: ReactNode; glow?: boolean; optionsRef?: Ref<HTMLDivElement> }) {
  // The graph shows only when the question needs it; a question that already gives the point, like (3, 2), shows none.
  const chosen = popup?.itemId === item.id ? popup.optionId : pick;
  const opts = (
    <div ref={optionsRef}>
      <WarmupOptions options={item.options ?? []} value={chosen} onChange={setPick} locked={answered || !!popup} stacked={false} glow={!!glow}
        mark={popup?.itemId === item.id ? (popup.correct ? "ok" : "warn") : null} />
    </div>
  );
  return (
    <>
      <div className="grid gap-6 sm:gap-8"><div><WarmupPrompt script={item.prompt} /></div></div>
      <div className="mt-6 sm:mt-8">{opts}</div>
    </>
  );
}

export { Fraction, PointBoard, QuestionBody };

export function WarmupStage() {
  const { view, busy, run, sessionId, say, refresh, setMood, addDivider, blockEnd } = useLesson();
  const index = view.position.index;
  const item = view.items[index];
  const w = view.warmup ?? null;
  const next = useAdvance();
  const check = useServerFn(checkAnswerFn);
  const close = useServerFn(closePopupFn);
  const skip = useServerFn(skipRepairFn);
  const logOpt = useServerFn(logOptionFn);
  const optTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Picking or changing an option before checking is logged; quick double taps are saved once.
  const logPick = (itemId: string, optionId: string) => {
    if (optTimer.current) clearTimeout(optTimer.current);
    optTimer.current = setTimeout(() => { void logOpt({ data: { sessionId, itemId, optionId } }).catch(() => {}); }, 400);
  };
  const [pick, setPick] = useState<string | null>(null);
  const [localPopup, setLocalPopup] = useState<{ itemId: string; optionId: string; correct: boolean; lines: Script; practice: boolean } | null>(null);
  const [practicePick, setPracticePick] = useState<string | null>(null);
  const [offline, setOffline] = useState(false);
  const [working, setWorking] = useState<string | null>(null);
  const [shownWork, setShownWork] = useState<string[]>([]);
  useEffect(() => { setShownWork([]); }, [working]);
  const workingLog = useRef<"shown" | "skipped" | undefined>(undefined);
  // Right answer: tick (0.6 s) → working → Good Job; the chat working block closes and praise posts after the popup.
  const [tickHold, setTickHold] = useState(false);
  const heldBlock = useRef<string | null>(null);
  const praiseLater = useRef<Seg[]>([]);
  useEffect(() => { setPick(null); setPracticePick(null); }, [item?.id]);
  // Hand-over: once the tutor's "Your turn" line has typed out, the options glow for 1.5 s and scroll into view.
  const optionsRef = useRef<HTMLDivElement | null>(null);
  const [glow, setGlow] = useState(false);
  const [optsVisible, setOptsVisible] = useState(true);
  useEffect(() => {
    const el = optionsRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => setOptsVisible(!!e && e.intersectionRatio > 0.98), { threshold: [0, 0.99, 1] });
    io.observe(el);
    return () => io.disconnect();
  }, [item?.id, view.position.index]);
  useEffect(() => {
    if (!item || view.results[item.id]) return;
    const t1 = setTimeout(() => {
      setGlow(true);
      const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      optionsRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "nearest" });
    }, 3500);
    const t2 = setTimeout(() => setGlow(false), 5000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [item?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  // Chat dividers: "Quick fix · {skill}" when a quick fix starts, "Back to the warm-up" when it ends.
  const fixOn = !!w?.repair && (!w.popup || w.popup.practice);
  const wasFix = useRef<boolean | null>(null);
  useEffect(() => {
    if (wasFix.current === null) { wasFix.current = fixOn; return; }
    if (fixOn === wasFix.current) return;
    wasFix.current = fixOn;
    if (!fixOn) addDivider(w?.labels.backDivider ?? "");
  }, [fixOn]); // eslint-disable-line react-hooks/exhaustive-deps
  const [boardOpen, setBoardOpen] = useState(true);
  useEffect(() => { if (fixOn) setBoardOpen(true); }, [fixOn, w?.repair?.skillName]);
  if (!item || !w) return null;
  // The popup opens from the check reply at once; the lesson reload catches up behind it.
  const popup = w.popup ?? localPopup;
  const repair = !popup || popup.practice ? w.repair : null;
  const inFix = !!w.repair && (!popup || popup.practice);
  const practice = w.repair?.practiceItem ?? null;
  const showPractice = inFix && !w.repair?.dialog && (w.repair?.part === "practice" || !!popup?.practice);
  const total = view.items.length;
  const done = !!view.results[item.id];

  const react = useReaction();
  const submit = async (target: ViewItem, optionId: string | null) => {
    if (!optionId || busy) return;
    if (!navigator.onLine) setOffline(true);
    const r = await run(() => check({ data: { sessionId, itemId: target.id, response: { optionId }, confidence: null } }));
    setOffline(false);
    if (r && "correct" in r) {
      if (r.correct) { react.small(document.querySelector('[role="radio"][aria-checked="true"]')); setTimeout(() => react.big(), 300); } else react.notQuite(document.querySelector('[role="radio"][aria-checked="true"]'));
      const segs = (r.tutorLines ?? []) as Seg[];
      const hasWorking = r.correct && segs.some((l) => l.role === "working");
      if (hasWorking) { setWorking(target.id); setTickHold(true); setTimeout(() => { setTickHold(false); setMood("speaking"); }, 600); }
      else if (segs.length) say(segs, r.correct ? "celebrate" : "encouraging");
      // Wrong answers wait for the proper card (it knows if a fix follows), so only one "You got close!" shows.
      if (r.correct === true) setLocalPopup({ itemId: target.id, optionId, correct: r.correct, lines: segs, practice: target.id === practice?.id });
      await refresh();
      setLocalPopup(null);
    }
  };
  const onContinue = async () => {
    setLocalPopup(null);
    if (heldBlock.current) { blockEnd(heldBlock.current); heldBlock.current = null; }
    if (praiseLater.current.length) { say(praiseLater.current, "celebrate"); praiseLater.current = []; }
    const ok = await run(() => close({ data: { sessionId, action: "continue", working: workingLog.current } }));
    if (ok) await next();
  };
  const onFix = async () => {
    setLocalPopup(null);
    addDivider((w.labels.fixDivider ?? "").replace("{skill_name}", w.repair?.skillName ?? "").replace(/ · $/, ""));
    const ok = await run(() => close({ data: { sessionId, action: "fix" } }));
    if (ok) {
      if (w.repair?.slip.length) say(w.repair.slip, "speaking");
      await refresh();
    }
  };
  const onSkip = async () => {
    const r = await run(() => skip({ data: { sessionId } }));
    if (r) { say(r.lines, "encouraging"); await next(); }
  };

  const workingLines = popup?.correct ? (popup.lines as Seg[]).filter((l) => l.role === "working").map((l) => l.text) : [];
  const workingOpen = !!popup && working === popup.itemId && workingLines.length > 0;
  const popupLive = popup && !workingOpen;

  const actions = (
    <>
        {(popup?.correct && working) ? null : inFix && !showPractice ? null : inFix && practice ? (
          <Button size="lg" className={CHECK} data-check-answer disabled={busy || !!popup || !practicePick} onClick={() => practicePick ? submit(practice, practicePick) : toast("Choose an answer first")}>{busy && <Loader2 className="animate-spin" aria-hidden />}Check Answer</Button>
        ) : done && !popup && !repair ? (
          <Button size="lg" className={CHECK} disabled={busy} onClick={next}>Next</Button>
        ) : (
          <Button size="lg" className={CHECK} data-check-answer disabled={busy || done || !pick} onClick={() => pick ? submit(item, pick) : toast("Choose an answer first")}>{busy && <Loader2 className="animate-spin" aria-hidden />}Check Answer</Button>
        )}
    </>
  );

  return (
    <div>
      <div>
        <div className={cn("px-4 pb-8 sm:px-10", inFix ? "pt-4" : "pt-2", !item.board && !inFix && "md:pt-[6vh]")} aria-label={`Warm-up, question ${index + 1} of ${total}`}>

        {!inFix && <QuestionBody item={item} pick={pick} setPick={(id) => { setPick(id); logPick(item.id, id); }} popup={popup && !popup.practice ? popup : null} answered={done}
          actions={actions} glow={glow} optionsRef={optionsRef} tri={workingOpen && popup?.itemId === item.id ? riseRunFrom(shownWork) : undefined} />}
        {!inFix && !optsVisible && !pick && !done && (
          <button type="button" onClick={() => optionsRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" })}
            className="sticky bottom-24 z-10 mx-auto mt-4 flex rounded-full bg-tutor-bubble px-4 py-2 text-[14px] font-semibold text-brand shadow-md md:bottom-4">↓ Choose your answer</button>
        )}

        {/* Quick fix: the page keeps the question; all solving happens on Fiti's whiteboard dialog. */}
        {inFix && w.repair && !showPractice && (
          <>
            <QuestionBody item={item} pick={pick} setPick={() => {}} popup={null} answered actions={null} glow={false} optionsRef={optionsRef} />
            {!boardOpen && (
              <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
                <button type="button" className="squish inline-flex min-h-11 items-center rounded-full bg-fh-primary px-6 text-[16px] font-semibold text-fh-primary-ink shadow-[0_4px_0_var(--fh-primary-edge)]" onClick={() => setBoardOpen(true)}>{view.boardLines?.reopen || "Back to the fix"}</button>
                <button type="button" className="squish inline-flex min-h-11 items-center gap-2 px-2 font-hand text-[22px] text-q-num outline-none focus:outline-none focus-visible:underline underline-offset-4" disabled={busy} onClick={onSkip}>{w.labels.skip}<ArrowRight className="h-6 w-6" aria-hidden /></button>
              </div>
            )}
            <QuickFix repair={w.repair} labels={w.labels} open={boardOpen} onClose={() => setBoardOpen(false)}
              topBar={
                <div className="flex items-center justify-between gap-3">
                  <span />
                  {!popup && <button type="button" className="squish inline-flex min-h-11 items-center gap-3 px-2 font-hand text-[22px] text-q-num outline-none focus:outline-none focus-visible:underline underline-offset-4" disabled={busy} onClick={onSkip}>{w.labels.skip}<ArrowRight className="h-6 w-6" aria-hidden /></button>}
                </div>
              } />
          </>
        )}

        {inFix && practice && showPractice && (
          <>
            {w.labels.aloneTitle && <h3 className="mb-4 text-center text-[12px] font-bold uppercase tracking-wide text-ink-3">{w.labels.aloneTitle}</h3>}
            <QuestionBody item={practice} pick={practicePick} setPick={(id) => { setPracticePick(id); logPick(practice.id, id); }} popup={popup?.practice ? popup : null} answered={!!popup?.practice} />
          </>
        )}

        {workingOpen && popup && !tickHold && (
          <WorkingBox key={popup.itemId} label={w.labels.working ?? "Here's how it works"} lines={workingLines}
            resumeKey={`${sessionId}:warm:${popup.itemId}`}
            heading={<span className="text-[0.7em]">{item.prompt.map((p) => p.text).join(" ")}</span>}
            drawing={item.board ? <PointBoard board={item.board} previewPath={pick ? item.board.paths[pick] ?? null : null} tri={riseRunFrom(shownWork)} /> : undefined}
            onLine={(l) => setShownWork((a) => [...a, l])}
            onDone={(skipped, blockId) => {
              workingLog.current = skipped ? "skipped" : "shown";
              heldBlock.current = blockId ?? null;
              praiseLater.current = (popup.lines as Seg[]).filter((l) => l.role !== "working");
              setMood("celebrate");
              setWorking(null);
            }} />
        )}
        {offline && <p role="status" className="mt-4 text-center text-[14px] font-semibold text-ink-2">Will check when you're back online</p>}
        <div style={{ ["--d" as string]: "600ms" }} className={cn("anim-spring-in mx-auto mt-[clamp(16px,4vh,40px)] hidden w-full max-w-[300px] md:flex")}>{actions}</div>
        </div>
      </div>
      <div className="fixed inset-x-0 bottom-16 z-20 flex bg-fh-page px-4 pb-3 pt-3 md:hidden">{actions}</div>


      {popupLive && (
        <WarmupPopup key={`${popup.itemId}:${popup.practice}`} correct={popup.correct}
          title={popup.correct ? w.labels.rightTitle : w.labels.closeTitle}
          lines={(popup.lines as Seg[]).filter((l) => l.role !== "working").map((l) => l.text)}
          spokenAfter={!popup.correct && !popup.practice && w.repair && w.labels.letsFix ? w.labels.letsFix : null}
          button={popup.correct || popup.practice ? (popup.practice && !popup.correct ? w.labels.practiceContinue : w.labels.continue) : w.labels.fix}
          link={!popup.correct && !popup.practice && w.repair ? w.labels.skip : null}
          onButton={popup.correct || popup.practice || !w.repair ? onContinue : onFix}
          onLink={onSkip}
          autoClose={popup.correct} />
      )}
    </div>
  );
}
