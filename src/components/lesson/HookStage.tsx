// Step 2 · Hook: a prediction on a living hill picture (never marked, no right or wrong).
// Runs inside the warm-up Fiti shell (Ask Fiti only). Lines come from the hook content and approved fallbacks.
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { useServerFn } from "@tanstack/react-start";
import { RotateCcw } from "lucide-react";
import { predictionFn } from "@/lib/api/lesson.functions";
import { splitNumbers } from "@/shared/question-numbers";
import { typeSchedule, typeUnits } from "@/shared/working-pace";
import { playSound } from "@/lib/sound";
import { useLowData } from "@/lib/ui-prefs";
import { useSay } from "@/lib/voice";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useLesson } from "./context";
import { useAdvance } from "./stages-a";
import { hookTimers } from "./hook-board";

const SAID = new Set<string>();

// Picture geometry: both roads start at O, at the foot of the hill.
const O = { x: 140, y: 330 };
const A_END = { x: 250, y: 110 }; // up 2 for every 1 forward
const B_END = { x: 560, y: 120 }; // up 1 for every 2 forward
const HILL = "M30 345 C 140 340, 170 50, 300 46 C 420 42, 520 84, 585 100 L 585 345 Z";

function useReduced() {
  const [r, setR] = useState(false);
  useEffect(() => { setR(!!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches); }, []);
  return r;
}

/** Cyclist position along a road; t 0..1. The steep road slows near the top and wobbles. */
function along(end: { x: number; y: number }, t: number, steep: boolean) {
  const e = steep ? 1 - Math.pow(1 - t, 2.2) : t;
  const wob = steep && t > 0.7 ? Math.sin(t * 60) * 2.5 * (t - 0.7) / 0.3 : 0;
  return { x: O.x + (end.x - O.x) * e + wob, y: O.y + (end.y - O.y) * e, ang: (Math.atan2(end.y - O.y, end.x - O.x) * 180) / Math.PI };
}

/** A label in a small rounded tag so it never sits on a road or the hill edge. */
function Tag({ x, y, anchor, text, size, hand }: { x: number; y: number; anchor: "end" | "middle"; text: string; size: number; hand?: boolean }) {
  const w = text.length * size * 0.52 + 16, h = size + 10;
  const left = anchor === "end" ? x - w : x - w / 2;
  return (
    <g>
      <rect x={left} y={y - h / 2} width={w} height={h} rx={h / 2} fill="var(--hook-tag)" stroke="var(--hook-board-edge)" strokeOpacity=".35" />
      <text x={left + w / 2} y={y + size * 0.35} textAnchor="middle" fontSize={size} fontWeight={700} fill="var(--hook-tag-ink)" className={hand ? "font-hand" : undefined}>{text}</text>
    </g>
  );
}

function Hill({ step, hot, choice, onPick, disabled, reduce, ride, labels }: {
  step: number; hot: "a" | "b" | "c" | null; choice: string | null; onPick: (id: string) => void; disabled: boolean; reduce: boolean;
  ride: { key: number; only?: "a" | "b" }; labels: { a: string; b: string };
}) {
  const [bike, setBike] = useState<{ x: number; y: number; ang: number } | null>(null);
  useEffect(() => {
    if (reduce || step < 4) { setBike(null); return; }
    const legs: ("a" | "b")[] = ride.only ? [ride.only] : ["b", "a"];
    let raf = 0; const t0 = performance.now(); const LEG = 3000;
    const tick = (now: number) => {
      const el = now - t0; const i = Math.floor(el / LEG);
      if (i >= legs.length) { setBike(along(B_END, 0, false)); return; }
      const leg = legs[i]!;
      setBike(along(leg === "a" ? A_END : B_END, (el % LEG) / LEG, leg === "a"));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [ride.key, step >= 4, reduce]); // eslint-disable-line react-hooks/exhaustive-deps
  const lit = (id: "a" | "b") => hot === id || hot === "c" || choice === id;
  const road = (id: "a" | "b", end: { x: number; y: number }, color: string, show: boolean) => (
    <g>
      {lit(id) && <line x1={O.x} y1={O.y} x2={end.x} y2={end.y} stroke={color} strokeOpacity=".25" strokeWidth={22} strokeLinecap="round" />}
      <line x1={O.x} y1={O.y} x2={end.x} y2={end.y} pathLength={1} stroke={color} strokeWidth={lit(id) ? 11 : 8} strokeLinecap="round"
        strokeDasharray="1" strokeDashoffset={show ? 0 : 1} style={{ transition: reduce ? "none" : "stroke-dashoffset 400ms ease-out, stroke-width 200ms" }} />
    </g>
  );
  const tri = (x: number, y: number, run: number, rise: number, label: string, show: boolean, pulse: boolean, lx: number, ly: number, anchor: "end" | "middle") => (
    <g opacity={show ? 1 : 0} className={cn(pulse && "anim-term")} style={{ transition: reduce ? "none" : "opacity 300ms", transformBox: "fill-box", transformOrigin: "center" }}>
      <path d={`M${x} ${y} H${x + run} V${y - rise} Z`} fill="var(--hook-tri-fill)" stroke="none" />
      <line x1={x} y1={y} x2={x + run} y2={y} stroke="var(--run)" strokeWidth={4} strokeLinecap="round" />
      <line x1={x + run} y1={y} x2={x + run} y2={y - rise} stroke="var(--rise)" strokeWidth={4} strokeLinecap="round" />
      <Tag x={lx} y={ly} anchor={anchor} text={label} size={15} hand />
    </g>
  );
  const tapLine = (id: "a" | "b", end: { x: number; y: number }) => (
    <line x1={O.x} y1={O.y} x2={end.x} y2={end.y} stroke="transparent" strokeWidth={44} strokeLinecap="round" pointerEvents="stroke" className="cursor-pointer" onClick={() => onPick(id)} data-testid={`tap-path-${id}`} />
  );
  return (
    <svg viewBox="0 0 600 380" className="block h-auto max-h-[min(42vh,380px)] w-full" role="img"
      aria-label={`A hill with two straight roads from the same point. ${labels.a} goes up 2 for every 1 along. ${labels.b} goes up 1 for every 2 along. A cyclist rides up ${labels.b}, then ${labels.a}.`}>
      <defs>
        <linearGradient id="hook-shine" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stopColor="white" stopOpacity=".55" /><stop offset=".5" stopColor="white" stopOpacity="0" /></linearGradient>
      </defs>
      {!reduce && <g className="hook-clouds" aria-hidden><ellipse cx="120" cy="60" rx="38" ry="12" fill="var(--hook-cloud)" /><ellipse cx="450" cy="40" rx="48" ry="14" fill="var(--hook-cloud)" /></g>}
      <g opacity={step >= 1 ? 1 : 0} style={{ transition: reduce ? "none" : "opacity 500ms" }}>
        <path d={HILL} fill="var(--hook-hill)" />
        <path d={HILL} fill="url(#hook-shine)" className={reduce ? "" : "hook-shine"} />
      </g>
      {tri(O.x, O.y, 50, 100, "up 2, along 1", step >= 3, hot === "a" || hot === "c", O.x - 10, O.y - 50, "end")}
      {tri(300, 250, 100, 50, "up 1, along 2", step >= 3, hot === "b" || hot === "c", 350, 278, "middle")}
      {road("a", A_END, "var(--color-hook-a)", step >= 2)}
      {road("b", B_END, "var(--color-hook-b)", step >= 2.5)}
      <g opacity={step >= 2 ? 1 : 0}><Tag x={A_END.x} y={A_END.y - 22} anchor="middle" text={labels.a} size={18} /></g>
      <g opacity={step >= 2.5 ? 1 : 0}><Tag x={B_END.x - 20} y={B_END.y - 24} anchor="middle" text={labels.b} size={18} /></g>
      {bike && (
        <g transform={`translate(${bike.x} ${bike.y}) rotate(${bike.ang})`} aria-hidden>
          <g transform="translate(0 -12)">
            <circle cx="-8" cy="6" r="6" fill="none" stroke="var(--hub-heading)" strokeWidth="2.2" />
            <circle cx="8" cy="6" r="6" fill="none" stroke="var(--hub-heading)" strokeWidth="2.2" />
            <path d="M-8 6 L0 -2 L8 6 M0 -2 L-2 -10" stroke="var(--hub-heading)" strokeWidth="2.2" fill="none" strokeLinecap="round" />
            <circle cx="-2" cy="-14" r="4" fill="var(--celebrate-orange)" />
          </g>
        </g>
      )}
      {!disabled && <g aria-hidden>{tapLine("a", A_END)}{tapLine("b", B_END)}</g>}
    </svg>
  );
}

/** Fiti's line, words lighting up at reading pace. */
function Bubble({ text, cps }: { text: string; cps: number }) {
  const units = typeUnits(text);
  const [w, setW] = useState(0);
  useEffect(() => { setW(0); const ts = typeSchedule(text, cps).map((ms, i) => setTimeout(() => setW(i + 1), ms)); return () => ts.forEach(clearTimeout); }, [text, cps]);
  return (
    <div key={text} role="status">
      {units.map((u, i) => <span key={i} className={cn("transition-opacity duration-150", i < w ? "opacity-100" : "opacity-30")}>{u}</span>)}
    </div>
  );
}

export function HookStage() {
  const { view, sessionId, say, run, setMood } = useLesson();
  const save = useServerFn(predictionFn);
  const next = useAdvance();
  const hook = view.hook;
  const reduce = useReduced();
  const [low] = useLowData();
  useSay(hook ? hook.script.map((l) => l.speakable ?? l.text) : [], "hook", !!hook);
  const [step, setStep] = useState(0);
  const [choice, setChoice] = useState<string | null>(null);
  const [hot, setHot] = useState<"a" | "b" | "c" | null>(null);
  const [locked, setLocked] = useState(false);
  const [boxes] = useState<Record<string, string>>({});
  const [bubble, setBubble] = useState<string>("");
  const [showSkip, setShowSkip] = useState(false);
  const [ride, setRide] = useState<{ key: number; only?: "a" | "b" }>({ key: 0 });
  const sent = useRef(false);
  const pickTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(pickTimer.current), []);
  const boxesRef = useRef(boxes); boxesRef.current = boxes;

  useEffect(() => { if (hook?.saved) void next(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Fiti greets, then the hill fades in, steep road, gentle road, triangles, cyclist.
  useEffect(() => {
    if (!hook || hook.saved) return;
    setMood("speaking");
    SAID.add(sessionId);
        if (reduce || low) { setStep(4); return; }
    const ts = [[1, 200], [2, 700], [2.5, 1100], [3, 1600], [4, 2300]].map(([s, ms]) => setTimeout(() => setStep(s!), ms));
    const idle = setTimeout(() => setMood("idle"), 2600);
    return () => { ts.forEach(clearTimeout); clearTimeout(idle); };
  }, [reduce, low]); // eslint-disable-line react-hooks/exhaustive-deps

  // No pick: one nudge after hook.nudgeS, then the skip link after hook.skipS more. Paused while a dialog is open.
  useEffect(() => {
    if (!hook || choice || locked) return;
    const { nudgeMs, skipMs } = hookTimers(hook.nudgeS, hook.skipS);
    const t1 = setTimeout(() => {}, 0);
    const t2 = setTimeout(() => setShowSkip(true), nudgeMs + skipMs);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [choice, locked, hook?.nudgeS]); // eslint-disable-line react-hooks/exhaustive-deps

  const finish = async (id: string) => {
    if (sent.current || !hook) return;
    sent.current = true; setLocked(true);
    const r = await run(() => save({ data: { sessionId, optionId: id, boxes: boxesRef.current } }));
    if (!r) { sent.current = false; setLocked(false); return; }
    if (r.lines.length) { say(r.lines, "encouraging"); setBubble(r.lines.map((l) => l.text).join(" ")); }
    setMood("encouraging"); playSound("tap");
    const txt = r.lines.map((l) => l.text).join(" ");
    const typed = txt ? (typeSchedule(txt, view.pace.cps).at(-1) ?? 0) : 0;
    if (hook.videoStart === "auto") setTimeout(() => void next(), id === "none" ? 0 : typed + 2000);
  };

  if (!hook) return <div className="p-8">The hook isn't loaded yet.</div>;
  const labels = { a: hook.options.find((o) => o.id === "a")?.label ?? "Path A", b: hook.options.find((o) => o.id === "b")?.label ?? "Path B" };
  const disabled = step < 2 || locked;
  // Picking: lift + navy outline, tap blip, Fiti nods (acknowledging), the cyclist rides her road; she can change before it saves.
  const pick = (id: string) => {
    if (disabled) return;
    setChoice(id); playSound("tap"); setMood("encouraging");
    if (id === "a" || id === "b") setRide((r) => ({ key: r.key + 1, only: id }));
    clearTimeout(pickTimer.current);
    pickTimer.current = setTimeout(() => void finish(id), 1000);
  };
  const onKey = (e: KeyboardEvent, i: number) => {
    const n = hook.options.length;
    const d = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    document.getElementById(`hook-opt-${hook.options[(i + d + n) % n]!.id}`)?.focus();
  };
  const question = hook.script.map((l) => l.text).join(" ");

  return (
    <div className="flex min-h-[calc(100dvh-180px)] items-center px-2 pb-10 md:px-6">
      <div className="@container mx-auto w-full max-w-[1180px]">
        <div className="grid items-center justify-center gap-6 @[860px]:grid-cols-[minmax(0,620px)_minmax(0,480px)] @[860px]:gap-10">
        <div className="relative mx-auto w-full max-w-[680px] rounded-[24px] border-2 border-[var(--hook-board-edge)] bg-[var(--board-card)] p-3 shadow-[0_8px_0_var(--hook-board-edge)]">
          <Hill step={step} hot={hot} choice={choice} onPick={pick} disabled={disabled} reduce={reduce || low} ride={ride} labels={labels} />
          {!reduce && !low && step >= 4 && (
            <button type="button" onClick={() => setRide((r) => ({ key: r.key + 1 }))} aria-label="Replay the cyclist"
              className="squish absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-fh-card text-hub-heading shadow-md"><RotateCcw className="h-5 w-5" /></button>
          )}
        </div>
        <div className="min-w-0">
          <p className="q-text font-hand text-[clamp(24px,2.2vw,34px)] leading-[1.25] tracking-[0.5px] text-hub-heading [text-wrap:balance]" aria-label={question}>
            {splitNumbers(question).map((p, i) => <span key={i} aria-hidden className={cn("anim-fade", p.num && "text-q-num")} style={{ ["--d" as string]: `${Math.min(i * 30, 900)}ms` }}>{p.text}</span>)}
          </p>
          {bubble && (() => { const note = <div className="tip-pill anim-note-pop mt-4 flex max-w-[520px] items-start rounded-[26px] px-6 py-3 text-[17px] font-medium leading-snug max-md:text-[15px]"><Bubble text={bubble} cps={view.pace.cps} /></div>; const slot = typeof document !== "undefined" ? document.getElementById("warmup-bubble") : null; return slot && slot.offsetParent ? createPortal(note, slot) : note; })()}
          <div role="radiogroup" aria-label={`Which is steeper, ${labels.a} or ${labels.b}?`} className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-x-4 sm:gap-y-4">
            {hook.options.map((o, i) => (
              <button key={o.id} id={`hook-opt-${o.id}`} type="button" role="radio" aria-checked={choice === o.id} data-selected={choice === o.id || undefined} disabled={disabled}
                tabIndex={choice ? (choice === o.id ? 0 : -1) : i === 0 ? 0 : -1} onKeyDown={(e) => onKey(e, i)} onClick={() => pick(o.id)}
                onMouseEnter={() => setHot(o.id === "a" ? "a" : o.id === "b" ? "b" : o.id === "c" ? "c" : null)} onMouseLeave={() => setHot(null)}
                onFocus={() => setHot(o.id === "a" ? "a" : o.id === "b" ? "b" : o.id === "c" ? "c" : null)} onBlur={() => setHot(null)}
                data-pos={i} className={cn("mcq-tile anim-spring-in relative flex min-h-[56px] w-full items-center gap-3 rounded-full py-2 pl-4 pr-5 text-left text-hub-heading focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-mcq-sel disabled:cursor-default", locked && choice !== o.id && "opacity-60")}
                style={{ ["--d" as string]: `${300 + i * 120}ms` }}>
                <span aria-hidden style={{ background: "var(--bd)" }} className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[13px] font-semibold">{"ABCD"[i]}</span>
                <span className="min-w-0 text-[15px] font-medium leading-snug">{o.label}</span>
              </button>
            ))}
          </div>
          <div className="mt-6 flex flex-col items-start gap-3">
            {hook.videoStart === "tap" && locked && <Button size="lg" className="w-full max-w-[280px]" onClick={() => void next()}>Watch the video</Button>}
            {showSkip && !choice && hook.skipLink && (
              <button type="button" onClick={() => void finish("none")} className="text-[14px] font-semibold text-ink-2 hover:underline">{hook.skipLink}</button>
            )}
          </div>
          <p className="sr-only" aria-live="polite">{choice ? `You chose ${hook.options.find((o) => o.id === choice)?.label}` : ""}</p>
        </div>
        </div>
      </div>
    </div>
  );
}
