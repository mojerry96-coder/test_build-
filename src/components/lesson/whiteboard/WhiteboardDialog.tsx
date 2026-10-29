// Fiti's quick-fix card: animated Fiti (clips) beside a pale panel with the lab's motion; lines are written on,
// the line being explained is spotlit, and Fiti's line plays as a caption under the board.
// Lines come only from the approved worked solution the server sends; nothing is marked here.
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { DEFAULT_PACE, lineHoldMs, typeDurationMs, typeSchedule, typeUnits, type WorkingPace } from "@/shared/working-pace";
import { splitNumbers } from "@/shared/question-numbers";
import { playSound } from "@/lib/sound";
import { cn } from "@/lib/utils";
import { hush, prefetchVoice, say as speakLines, useSay, voiceIdle } from "@/lib/voice";
/** Longest the board waits for Fiti to finish a line before writing the next anyway. */
const VOICE_WAIT_MAX_MS = 8000;
import { FitiClips } from "./FitiClips";
import { useOptionalLesson } from "../context";
/** Approved board lines from the lesson content (empty outside a lesson: the caption is just skipped). */
function useBoardLines() { const l = useOptionalLesson(); return l?.view.boardLines ?? { clear: "", end: "" }; }
import { lineJitter, type Clip } from "./clip-controller";

/** The grid is drawn only while a step about the picture (across / up / rise / run / move) is on the board. */
export function needsDrawing(visible: string[]): boolean {
  return visible.some((t) => /\b(across|up|down|rise|run|move|moves|plot|point)\b/i.test(t));
}

type Ink = "navy" | "blue";
const INK: Record<Ink, string> = { navy: "var(--wb-navy)", blue: "var(--wb-blue)" };
/** The tray has a black and a blue marker: blue for rise/run moves, navy (black marker) otherwise. */
export function inkFor(text: string, _isLast: boolean): Ink {
  return /\b(rise|up|run|across)\b/i.test(text) ? "blue" : "navy";
}

function Numbers({ text }: { text: string }) {
  return <>{splitNumbers(text).map((p, i) => p.num ? <span key={i} className="text-q-num">{p.text}</span> : <span key={i}>{p.text}</span>)}</>;
}

/** Eraser zig-zag: line i sweeps left→right when i is even, right→left when odd; ~250 ms per line. */
export const ERASE_MS_PER_LINE = 250;
export function eraseOrder(count: number): { index: number; dir: "ltr" | "rtl"; delayMs: number }[] {
  return Array.from({ length: count }, (_, i) => ({ index: i, dir: i % 2 === 0 ? "ltr" : "rtl", delayMs: i * ERASE_MS_PER_LINE }));
}
/** Saved place on the board (survives a reload): clamped to the approved line count. */
export function clampResume(saved: { n: number; base: number } | null, total: number): { n: number; base: number } {
  if (!saved) return { n: 0, base: 0 };
  const n = Math.max(0, Math.min(total, Math.floor(saved.n || 0)));
  const base = Math.max(0, Math.min(n, Math.floor(saved.base || 0)));
  return { n, base };
}
const readSaved = (k?: string) => { if (!k) return null; try { const v = sessionStorage.getItem(`wb:${k}`); return v ? JSON.parse(v) as { n: number; base: number } : null; } catch { return null; } };
const writeSaved = (k: string | undefined, v: { n: number; base: number } | null) => { if (!k) return; try { if (v) sessionStorage.setItem(`wb:${k}`, JSON.stringify(v)); else sessionStorage.removeItem(`wb:${k}`); } catch { /* none */ } };

export function WhiteboardDialog({ open, onClose, title, heading, drawing, lines, pace = DEFAULT_PACE, live = true, onLine, onDone, cta, children, topBar,
  resumeKey, result, followTurn = false, capacity = 3, clearLine, endLine, footer, bubble, tip, nudge = false, ask, overlay, cheer, onFitiTap }: {
  /** A line to pop into Fiti's speech bubble (e.g. the hint after a not-quite answer); bump beat to re-pop. */
  bubble?: { text: string; beat: number } | null;
  /** Lab-style idle tip: Fiti's bubble itself says this for a moment (e.g. "Tap me for a hint!"). */
  tip?: string | null | undefined;
  /** Fiti hops and glows to draw attention to the tip. */
  nudge?: boolean;
  /** The question her turn is on; stays in Fiti's bubble (as in the lab). */
  ask?: string | null | undefined;
  /** A card shown over the dialog (hint card, "You got it!"). */
  overlay?: ReactNode;
  /** Bump to make Fiti play his celebrate move. */
  cheer?: number;
  onFitiTap?: (() => void) | undefined;
  /** Shown under the board (e.g. the "Your turn" answer row). */
  footer?: ReactNode;
  /** Extra board content under the written lines (e.g. the quick fix "Your turn" steps). */
  children?: ReactNode;
  /** Small header row at the top of the dialog (e.g. "Quick fix" and "Skip for now"). */
  topBar?: ReactNode;
  open: boolean;
  onClose: () => void;
  title: string;
  /** The question or expression written large at the top of the board. */
  heading?: ReactNode;
  /** Grid / points / triangle, drawn on the board surface in marker style. */
  drawing?: ReactNode;
  lines: string[];
  pace?: WorkingPace;
  /** false = already watched (e.g. after a reload): all lines at once. */
  live?: boolean;
  onLine?: (text: string, index: number) => void;
  onDone?: (skipped: boolean) => void;
  /** Shown at the bottom once every line is written (e.g. "Your turn"). */
  cta?: (allShown: boolean) => ReactNode;
  /** Saves the place on the board so a reload redraws it instantly and carries on. */
  resumeKey?: string;
  /** A "Your turn" step was marked: Fiti nods (right) or plays retry (not quite). Bump beat per step. */
  result?: { ok: boolean; beat: number } | null;
  /** A your-turn part follows: the close button says "Your turn" and Fiti's last line hands over. */
  followTurn?: boolean;
  /** Lines that fit on the board before it must be cleared. */
  capacity?: number;
  clearLine?: string;
  endLine?: string;
}) {
  const bl = useBoardLines();
  clearLine = clearLine || bl.clear; endLine = endLine || bl.end;
  const start = live ? clampResume(readSaved(resumeKey), lines.length) : { n: lines.length, base: 0 };
  const resumed = useRef(live && start.n > 0);
  const [n, setN] = useState(start.n);
  const [base, setBase] = useState(start.base);
  const [writing, setWriting] = useState(live && start.n === 0);
  const [erasing, setErasing] = useState<null | { lines: string[]; then: () => void }>(null);
  const [paused, setPaused] = useState(false);
  const [caption, setCaption] = useState<string | null>(null);
  const [clip, setClip] = useState<{ c: Clip; b: number }>({ c: "greet", b: 0 });
  const skipped = useRef(false);
  const replaying = useRef(false);
  const [, setEraseStep] = useState(-1);
  const done = useRef(!live || start.n >= lines.length);
  const all = n >= lines.length;
  const want = (c: Clip) => setClip((p) => ({ c, b: p.b + 1 }));
  // Callers pass a new array/object each render; key the timers on content so a refresh never restarts a wait.
  const linesKey = lines.join("\u0001");
  const paceKey = JSON.stringify(pace);
  const reduce = useMemo(() => typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches, []);

  useEffect(() => { if (live) writeSaved(resumeKey, all ? null : { n, base }); }, [n, base, all, live, resumeKey]);
  useEffect(() => { if (result) want(result.ok ? "nod" : "sad"); }, [result?.beat]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (bubble?.text) { setCaption(bubble.text); want("retry"); } }, [bubble?.beat]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (cheer) want("celebrate"); }, [cheer]);
  useEffect(() => { if (nudge) want("greet"); }, [nudge]);

  // Clear the board: Fiti says so, then the eraser zig-zags line by line; the ghost fades after.
  const erase = (then: () => void) => {
    const shown = lines.slice(base, n);
    if (reduce || shown.length === 0) { then(); return; }
    if (clearLine) setCaption(clearLine); want("idle");
    setTimeout(() => {
      playSound("tap");
      setErasing({ lines: shown, then });
      eraseOrder(shown.length).forEach(({ index, delayMs }) => setTimeout(() => setEraseStep(index), delayMs));
      setTimeout(() => { setErasing(null); setEraseStep(-1); setCaption(null); then(); }, shown.length * ERASE_MS_PER_LINE + 700);
    }, 900);
  };

  // Not live (e.g. "Your turn"): a line added later (her right step) is written on with the marker.
  const prevLen = useRef(lines.length);
  const [fresh, setFresh] = useState<number | null>(null);
  useEffect(() => {
    if (!live && lines.length > prevLen.current) {
      const i = lines.length - 1;
      setBase(Math.max(0, lines.length - capacity)); setN(lines.length); setFresh(i); want("tap"); playSound("snap");
      const t = setTimeout(() => setFresh(null), Math.max(400, typeDurationMs(lines[i]!, pace.cps)) + 300);
      prevLen.current = lines.length;
      return () => clearTimeout(t);
    }
    prevLen.current = lines.length;
    return undefined;
  }, [lines.length, live]); // eslint-disable-line react-hooks/exhaustive-deps

  // Write the next line after the previous one's write-on + hold (shared working pace).
  useEffect(() => {
    if (!open || !live || erasing || paused) return;
    if (n >= lines.length) {
      if (done.current) return;
      // Let the last line finish writing (marker back in the tray) before Fiti's closing line.
      const last = lines[lines.length - 1] ?? "";
      const t = setTimeout(() => {
        done.current = true; setWriting(false); want("nod"); playSound("small_win");
        if (followTurn && endLine) setCaption(endLine);
        // A replay (Watch again) never moves the lesson on.
        if (!replaying.current) onDone?.(skipped.current);
        replaying.current = false;
      }, writing ? Math.max(400, typeDurationMs(last, pace.cps)) + 300 : 0);
      return () => clearTimeout(t);
    }
    const wait = n === 0 || resumed.current ? 900 : lineHoldMs(lines, n - 1, pace);
    let gone = false;
    if (n === 0) prefetchVoice(lines[0]);
    const t = setTimeout(async () => {
      // Fiti finishes saying the last line before the next is written (never stuck on a failed clip).
      await Promise.race([voiceIdle(), new Promise((r) => setTimeout(r, Math.max(VOICE_WAIT_MAX_MS, 1500 + (lines[n - 1]?.length ?? 0) * 90)))]);
      if (gone) return;
      resumed.current = false;
      const write = (b: number) => {
        setBase(b); setN(n + 1); setWriting(true); want("tap"); playSound("snap"); onLine?.(lines[n]!, n);
        speakLines([lines[n]!]); prefetchVoice(lines[n + 1]);
      };
      if (n - base >= capacity) erase(() => write(n)); else write(base);
    }, wait);
    return () => { gone = true; clearTimeout(t); };
  }, [open, live, n, linesKey, paceKey, erasing, paused]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fiti's voice belongs to this card: closing, pausing or leaving stops it at once.
  useEffect(() => { if (!open || paused) hush(); }, [open, paused]);
  useEffect(() => () => hush(), []);
  useSay(ask ? [ask] : [], ask ? `wb-ask:${ask}` : "", open && !!ask);
  // The bubble often repeats the line just written; that line is already being spoken.
  useEffect(() => { if (open && bubble?.text && !lines.includes(bubble.text)) speakLines([bubble.text]); }, [bubble?.beat]); // eslint-disable-line react-hooks/exhaustive-deps
  // Reopened mid-way (lines already on the board): say the latest line so Fiti isn't silent.
  useEffect(() => { if (open && live && n > 0 && resumed.current) speakLines([lines[n - 1]!]); }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // Spoken words: light up one by one at reading pace (voice word timings replace this when voice is connected).
  const current = caption ?? (n > 0 ? lines[n - 1]! : "");
  const units = useMemo(() => typeUnits(current), [current]);
  const [w, setW] = useState(0);
  useEffect(() => {
    if ((!writing && !caption) || !live || paused) { if (!paused) setW(units.length); return; }
    setW(0);
    const ts = typeSchedule(current, pace.cps).map((ms, i) => setTimeout(() => setW(i + 1), ms));
    const end = caption ? null : setTimeout(() => setWriting(false), typeDurationMs(current, pace.cps) + 300);
    return () => { ts.forEach(clearTimeout); if (end) clearTimeout(end); };
  }, [current, writing, live, pace.cps, units.length, paused]); // eslint-disable-line react-hooks/exhaustive-deps

  // Tap the board: finish the current line at once.
  const finishLine = () => { if (writing) { setWriting(false); skipped.current = true; } };
  const showAll = () => {
    skipped.current = true; setWriting(false); setPaused(false);
    const b = Math.max(0, lines.length - capacity);
    for (let i = n; i < lines.length; i++) onLine?.(lines[i]!, i);
    setBase(b); setN(lines.length);
  };
  const watchAgain = () => {
    hush();
    setCaption(null);
    replaying.current = true;
    erase(() => { done.current = false; skipped.current = false; setBase(0); setN(0); want("greet"); });
  };
  const visible = erasing ? [] : lines.slice(base, n);
  // The grid draws only after the line that needs it has finished writing (one thing at a time).
  const settled = live && writing ? visible.slice(0, -1) : visible;
  const showDrawing = !!drawing && (erasing ? needsDrawing(erasing.lines) : needsDrawing(settled));
    // Caption shows a line only once it is written (or Fiti's own spoken line).
  const showCaption = !!caption || (!writing && n > 0 && !all) || (all && !live);

  const ctaNode = cta ? cta(all) : all ? <button type="button" onClick={onClose} className="hdr-bounce [--bounce-edge:var(--fh-primary-edge)] squish h-[50px] rounded-full bg-fh-primary px-10 text-[16px] font-semibold text-fh-primary-ink shadow-[0_5px_0_var(--fh-primary-edge)] hover:brightness-105 active:translate-y-[3px] active:shadow-[0_2px_0_var(--fh-primary-edge)]">{followTurn ? "Your turn" : "Got it"}</button> : null;
  // Fiti's bubble (lab style): the tip for a moment, else his spoken line, else the question on her turn.
  const say = caption || (showCaption && current ? current : "") || ask || "";
  const endRow = all && done.current && !erasing && caption !== clearLine;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="[&>button:last-child]:hidden max-w-[min(1620px,94vw)] w-[94vw] h-[min(1020px,92vh)] max-md:h-[100dvh] max-md:w-screen max-md:max-w-none max-md:rounded-none overflow-hidden rounded-[40px] sm:rounded-[40px] max-md:rounded-none border-0 p-0 bg-fh-card overlay-edge gap-0 qf-in">
        <svg aria-hidden width="0" height="0" className="absolute"><filter id="wb-rough"><feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="3" /><feDisplacementMap in="SourceGraphic" scale="2.2" /></filter></svg>
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <DialogDescription className="sr-only">{lines.slice(0, n).join(" ")}</DialogDescription>
        <div className={cn("grid h-full min-h-0 grid-rows-[auto_1fr_auto] gap-y-3 px-[clamp(12px,3.5vw,64px)] py-[clamp(12px,3vh,32px)]", "md:grid-cols-[clamp(220px,30vw,520px)_minmax(0,1fr)] md:gap-x-4", paused && "wb-paused")}>
          {/* Row 1: header (left) and Pause / Show all / Skip / Close lined up with the board's right edge. */}
          <div className="flex min-w-0 items-center gap-4 md:col-span-2">
            <div className="min-w-0 flex-1">{topBar}</div>
            {live && !all && !erasing && (
              <div className="flex shrink-0 items-center gap-4 text-[14px] font-semibold" style={{ color: "var(--qf-ctrl-ink)" }}>
                <button type="button" onClick={() => setPaused((p) => !p)} className="qf-ctrl squish rounded-full border-2 border-fh-box-line bg-fh-card px-4 py-1.5 hover:-translate-y-0.5 transition-transform">{paused ? "Continue" : "Pause"}</button>
                <button type="button" onClick={showAll} className="qf-ctrl squish rounded-full border-2 border-fh-box-line bg-fh-card px-4 py-1.5 hover:-translate-y-0.5 transition-transform">Show all steps</button>
              </div>
            )}
            <button type="button" onClick={onClose} aria-label="Close" className="qf-ctrl squish shrink-0 rounded-full bg-fh-card p-1.5 shadow-sm hover:-translate-y-0.5 transition-transform focus-visible:outline-2"><X className="h-7 w-7" /></button>
          </div>
          {/* Row 2: large pointer Fiti standing level with the board's bottom, then the board. */}
          <div className="relative flex min-h-0 flex-col items-center justify-end overflow-hidden px-2 max-md:hidden">
            {say && (
              <p key={say} role="status" className="qf-say relative z-10 mb-3 w-full max-w-[340px] shrink-0 rounded-[22px] bg-fh-card px-5 py-3 text-center font-hand text-[clamp(18px,1.6vw,26px)] leading-snug shadow-md line-clamp-3" style={{ color: "var(--wb-navy)" }}>
                {say.split(/\s+/).filter(Boolean).map((wd, i) => <span key={i} className="qf-word" style={{ ["--i" as string]: i }}>{wd}</span>)}
              </p>
            )}
            <div className="qf-stage relative flex min-h-0 w-full flex-1 items-end justify-center">
              {onFitiTap
                ? <button type="button" onClick={onFitiTap} aria-label={tip || "Hint"} className={cn("qf-hop flex h-full w-full items-end justify-center focus-visible:outline-2", nudge && "qf-hey qf-glow")}><FitiClips variant="pointer" want={clip.c} beat={clip.b} className="fiti-sway aspect-[748/1065] h-full w-auto max-w-full" /></button>
                : <FitiClips variant="pointer" want={clip.c} beat={clip.b} className="qf-hop fiti-sway aspect-[748/1065] h-full w-auto max-w-full" />}
              {tip && <span role="status" className="qf-avatar-tip">{tip}</span>}
            </div>
          </div>
          <div className="relative flex min-h-0 items-end justify-center">
            <div className="qf-stage absolute -left-1 bottom-0 z-10 flex w-[28%] items-end justify-center md:hidden">
              <button type="button" onClick={onFitiTap} disabled={!onFitiTap} aria-label={tip || "Fiti"} className={cn("block w-full", nudge && "qf-hey qf-glow")}><FitiClips variant="pointer" want={clip.c} beat={clip.b} className="fiti-sway aspect-[748/1065] w-full" /></button>
              {tip && <span role="status" className="qf-avatar-tip">{tip}</span>}
            </div>
            <div onClick={finishLine} className={cn("qf-panel relative h-full w-full overflow-hidden rounded-[28px] bg-[var(--wb-surface-soft)]", footer && "wb-has-turn")}>
                            <div className="absolute inset-x-[6%] top-[8%] bottom-[6%] flex min-h-0 flex-col justify-start overflow-y-auto">
                {heading && <div className="wb-ink-soft mx-auto max-w-[92%] text-center font-hand text-[clamp(13px,1.35vw,22px)] leading-[1.3] line-clamp-2" style={{ color: "var(--wb-muted)" }}>{heading}</div>}
                {heading && <svg aria-hidden viewBox="0 0 400 6" preserveAspectRatio="none" className="wb-drawn mx-auto mt-1.5 h-1.5 w-[86%]"><path d="M2 3 Q100 1 200 3.5 T398 2.5" stroke="var(--wb-muted)" strokeWidth="1.6" fill="none" opacity=".55" /></svg>}
                <div className={cn("mx-auto mt-[clamp(16px,4vh,48px)] flex w-fit max-w-full flex-none items-center justify-center gap-[4%] max-md:flex-col max-md:items-stretch")}>
                  <ol className={cn("relative min-w-0 space-y-[clamp(8px,2.4vh,28px)]", showDrawing ? "flex-none md:max-w-[min(640px,48%)]" : "flex-none")} aria-live="polite">
                    {visible.map((t, k) => {
                      const i = base + k;
                      const j = lineJitter(i + 1);
                      const ink = inkFor(t, false);
                      const isCur = i === n - 1;
                      const anim = (live && isCur && writing) || fresh === i;
                      const dur = `${Math.max(400, typeDurationMs(t, pace.cps))}ms`;
                      return (
                        <li key={i} className={cn("wb-line wb-ink relative flex items-baseline gap-3 font-hand text-[clamp(18px,2.1vw,36px)] leading-snug [overflow-wrap:normal] [word-break:normal]", isCur && "wb-focus")}
                          style={{ color: INK[ink], transform: `rotate(${j.tilt * 0.5}deg)` }} aria-label={anim ? undefined : `Step ${k + 1}: ${t}`}>
                          <span aria-hidden className="w-[1.2em] shrink-0 text-right" style={{ color: "var(--wb-muted)" }}>{k + 1}</span>
                          <span className="relative min-w-0">
                            <span className={cn("block", anim && "wb-writing")} style={{ ["--wb-dur" as string]: dur }}><Numbers text={t} /></span>
                          </span>
                        </li>
                      );
                    })}
                    {erasing && eraseOrder(erasing.lines.length).map(({ index, delayMs }) => {
                      const t = erasing.lines[index]!;
                      const style = { ["--wb-delay" as string]: `${delayMs}ms`, ["--wb-line-ms" as string]: `${ERASE_MS_PER_LINE}ms` };
                      return (
                        <li key={`e${index}`} aria-hidden className="wb-ink relative flex items-baseline gap-3 font-hand text-[clamp(18px,2.1vw,36px)] leading-snug" style={{ color: INK[inkFor(t, false)] }}>
                          <span className="w-[1.2em] shrink-0 text-right" style={{ color: "var(--wb-muted)" }}>{index + 1}</span>
                          <span className="relative min-w-0">
                            <span className="qf-fade-out block" style={style}><Numbers text={t} /></span>
                          </span>
                        </li>
                      );
                    })}
                  </ol>
                  {showDrawing && <div className={cn("wb-drawn wb-on-board anim-fade w-[min(720px,60%)] shrink-0 max-md:w-full", erasing && "qf-fade-out")}>{drawing}</div>}
                </div>
                {children && <div className="mt-3 min-h-0 overflow-y-auto font-body">{children}</div>}
                {footer && <div className="wb-turn mt-[clamp(12px,3%,24px)] w-full flex-none pl-[1.2em] pb-[4%]">{footer}</div>}
              </div>
            </div>
          </div>
          {/* Row 3, under the board only: caption while teaching, then the end buttons in its place. */}
          <div className="min-w-0 md:col-start-2">
            <div className="flex min-h-[3.2em] items-center justify-center">
              {endRow && live ? (
                <div className="qf-spring flex flex-wrap items-center justify-center gap-3">
                  <button type="button" onClick={watchAgain} className={OUTLINE} style={OUTLINE_STYLE}>Watch again</button>
                  {ctaNode}
                </div>
              ) : endRow && ctaNode ? ctaNode : (
                <p key={bubble?.beat ?? 0} role="status" className={cn("qf-bubble md:hidden max-w-[760px] rounded-[22px] bg-fh-card px-5 py-2.5 text-center text-[clamp(15px,1.3vw,19px)] font-medium shadow-sm transition-opacity duration-200", showCaption ? "opacity-100" : "opacity-0")} style={{ color: "var(--wb-navy)" }}>
                  {units.map((u, i) => <span key={i}>{u}</span>)}
                </p>
              )}
            </div>
          </div>
        </div>
        {overlay}
      </DialogContent>
    </Dialog>
  );
}
const OUTLINE = "hdr-bounce [--bounce-edge:var(--fh-primary-edge)] squish h-[50px] rounded-full border-2 border-fh-primary bg-fh-card px-8 text-[16px] font-semibold text-fh-heading shadow-[0_5px_0_var(--fh-primary-edge)] active:translate-y-[3px] active:shadow-[0_2px_0_var(--fh-primary-edge)]";
const OUTLINE_STYLE = {};
