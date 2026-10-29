// Shared player for every worked working (warm-up "Here's how it works", quick fix watch card, video demos).
// Paced from rules working_line_*; Pause/Play, Next step, Show all; two Next taps → step-by-step for the session.
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronRight, Pause, Play } from "lucide-react";
import { changedSpan, DEFAULT_PACE, lineHoldMs, type WorkingPace } from "@/shared/working-pace";
import { cn } from "@/lib/utils";
import { keepMathsTogether } from "@/shared/chat-groups";
import { useLesson } from "./context";
import { Cursor, useTypeOn } from "./StreamingText";
import { say } from "@/lib/voice";

const STEP_KEY = "working-step-mode";

function Line({ text, prev, current, animate, cps }: { text: string; prev?: string | undefined; current: boolean; animate: boolean; cps: number }) {
  // The current line writes on at the shared typing pace (maths whole); earlier lines show in full.
  const typing = useTypeOn(text, { cps, live: animate && current });
  if (animate && current && !typing.done) {
    return <li className="maths font-body text-[18px] font-semibold leading-snug text-work-current"><span aria-hidden>{typing.text ?? ""}</span><Cursor /><span className="sr-only">{text}</span></li>;
  }
  const span = animate ? changedSpan(prev, text) : null;
  return (
    <li className={cn("maths font-body text-[18px] font-semibold leading-snug transition-colors duration-300", current ? "text-work-current" : "text-work-earlier", animate && "anim-write")}>
      {span ? <>{keepMathsTogether(text.slice(0, span.start))}<span className="anim-work-glow anim-term">{keepMathsTogether(text.slice(span.start, span.end))}</span>{keepMathsTogether(text.slice(span.end))}</> : keepMathsTogether(text)}
    </li>
  );
}

export function WorkingPlayer({ lines, pace = DEFAULT_PACE, live = true, onLine, onDone, footer, chatTitle, holdBlock = false }: {
  /** Keep the chat block open after the last line; the caller closes it (via the block id passed to onDone). */
  holdBlock?: boolean;
  lines: string[];
  /** Mirror the lines into one collapsible chat block with this title. */
  chatTitle?: string;
  pace?: WorkingPace;
  /** false = already watched: show all lines, no controls. */
  live?: boolean;
  onLine?: (text: string) => void;
  /** Called once when the last line is up; skipped = she used Show all. */
  onDone?: (skipped: boolean, blockId?: string | null) => void;
  footer?: (allShown: boolean) => ReactNode;
}) {
  const [reduce, setReduce] = useState(false);
  const [n, setN] = useState(live ? 1 : lines.length);
  const [paused, setPaused] = useState(false);
  const [stepMode, setStepMode] = useState(false);
  const lastWasNext = useRef(false);
  const said = useRef(live ? 0 : lines.length);
  const skipped = useRef(false);
  const doneSent = useRef(!live);
  useEffect(() => {
    setReduce(!!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
    setStepMode(sessionStorage.getItem(STEP_KEY) === "1");
  }, []);
  const all = n >= lines.length;
  const { blockStart, blockLine, blockEnd } = useLesson();
  const block = useRef<string | null>(null);
  useEffect(() => {
    if (live && chatTitle && !block.current) block.current = blockStart(chatTitle, lines.length);
    while (said.current < n) { const l = lines[said.current++]; if (l) { onLine?.(l); if (block.current) blockLine(block.current, l); if (live) say([l]); } }
    if (all) { if (!doneSent.current) { doneSent.current = true; if (block.current && !holdBlock) blockEnd(block.current); onDone?.(skipped.current, block.current); } return; }
    if (paused || stepMode) return;
    let t: ReturnType<typeof setTimeout> | null = null;
    const tick = (ms: number) => { t = setTimeout(() => { if (document.hidden) tick(500); else setN((x) => x + 1); }, ms); };
    tick(lineHoldMs(lines, n - 1, pace));
    return () => { if (t) clearTimeout(t); };
  }, [n, paused, stepMode]); // eslint-disable-line react-hooks/exhaustive-deps

  const next = () => {
    if (lastWasNext.current && !stepMode) { setStepMode(true); sessionStorage.setItem(STEP_KEY, "1"); }
    lastWasNext.current = true;
    setN((x) => Math.min(x + 1, lines.length));
  };
  const showAll = () => { lastWasNext.current = false; skipped.current = true; setN(lines.length); };
  const ctl = "btn-soft inline-flex min-h-11 items-center gap-1 px-2 text-[14px] font-semibold text-work-control";
  return (
    <div>
      <ol className="space-y-2" aria-live="polite">
        {lines.slice(0, n).map((l, i) => <Line key={i} text={l} prev={lines[i - 1]} current={live && i === n - 1} animate={live && !reduce} cps={pace.cps} />)}
      </ol>
      {live && !all && (
        <div className="mt-4 flex flex-wrap items-center gap-2" role="group" aria-label="Working controls">
          {!stepMode && (
            <button type="button" className={ctl} aria-label={paused ? "Play" : "Pause"} onClick={() => { lastWasNext.current = false; setPaused((p) => !p); }}>
              {paused ? <Play aria-hidden className="h-4 w-4" /> : <Pause aria-hidden className="h-4 w-4" />}{paused ? "Play" : "Pause"}
            </button>
          )}
          <button type="button" className={ctl} onClick={next}>Next step<ChevronRight aria-hidden className="h-4 w-4" /></button>
          <button type="button" className={cn(ctl, "ml-auto underline")} onClick={showAll}>Show all</button>
        </div>
      )}
      {footer?.(all)}
    </div>
  );
}
