// Tutor text that types in like an AI: dots first, then words at the shared pace (maths stays whole).
// Tap shows the rest at once; never blocks the page; reduced motion shows the full text after the dots.
import { useEffect, useState } from "react";
import { DEFAULT_PACE, typeSchedule, typeUnits } from "@/shared/working-pace";
import { voiceStarted } from "@/lib/voice";

/** Pure: characters per second so typing ends as the voice does (kept between 10 and 90). */
export function paceFor(text: string, speakMs: number, fallback: number): number {
  if (!(speakMs > 0)) return fallback;
  return Math.min(90, Math.max(10, (text.length / (speakMs / 1000)) * 1.05));
}

export function useTypeOn(text: string, { cps = DEFAULT_PACE.cps, live = true, delayMs = 0, onDone, voice = false }: { cps?: number; live?: boolean; delayMs?: number; onDone?: () => void; voice?: boolean } = {}) {
  const units = typeUnits(text);
  const [shown, setShown] = useState(live ? -1 : units.length);
  const [done, setDone] = useState(!live);
  useEffect(() => {
    if (!live) return;
    const reduce = !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const finish = () => { setShown(units.length); setDone(true); onDone?.(); };
    let gone = false;
    const run = (pace: number) => {
      if (gone) return;
      if (reduce) return finish();
      setShown(0);
      const sched = typeSchedule(text, pace);
      sched.forEach((at, i) => timers.push(setTimeout(() => (i === sched.length - 1 ? finish() : setShown(i + 1)), at)));
    };
    timers.push(setTimeout(() => {
      // Voiced line: wait (dots) for the voice to start, then type at the speed he talks.
      if (voice) void voiceStarted(text).then((ms) => run(ms ? paceFor(text, ms, cps) : cps));
      else run(cps);
    }, voice ? 0 : delayMs));
    return () => { gone = true; timers.forEach(clearTimeout); };
  }, [text, live]); // eslint-disable-line react-hooks/exhaustive-deps
  const skip = () => { if (!done) { setShown(units.length); setDone(true); onDone?.(); } };
  return { text: shown < 0 ? null : units.slice(0, shown).join(""), done, skip };
}

export function Cursor() {
  return <span aria-hidden className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[2px] animate-pulse bg-current opacity-60" />;
}

export function Dots() {
  return <span className="flex gap-1 py-1" aria-hidden>{[0, 1, 2].map((d) => <span key={d} className="tp-dot h-1.5 w-1.5 rounded-full bg-brand" style={{ animationDelay: `${d * 150}ms` }} />)}</span>;
}

/** A fresh tutor message: 500–800 ms of dots, then it types in. */
export function StreamingBubbleText({ text, cps, live, onState }: { text: string; cps?: number | undefined; live: boolean; onState?: (typing: boolean) => void }) {
  const [delay] = useState(() => 500 + Math.round(Math.random() * 300));
  const t = useTypeOn(text, { cps: cps ?? DEFAULT_PACE.cps, live, voice: true, delayMs: delay, onDone: () => onState?.(false) });
  useEffect(() => { if (live) onState?.(true); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  if (t.text === null) return <span role="status" aria-label="The tutor is typing"><Dots /></span>;
  return (
    <span onClick={t.skip} className={t.done ? undefined : "cursor-pointer"}>
      <span aria-hidden={!t.done}>{t.text}</span>
      {!t.done && <><Cursor /><span className="sr-only">{text}</span></>}
    </span>
  );
}
