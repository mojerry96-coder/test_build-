import { playSound } from "@/lib/sound";
import { musicLift } from "@/lib/music";
// The "Let's Begin" map from the design: 6 stops on a wavy hand-drawn path.
// Lines are SVG; stops are real buttons laid over it (keyboard order = path order).
import { useRef, useEffect, useMemo, useState } from "react";
import { Feather } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { PATH_STOPS, type StopState } from "@/shared/path-stops";

type Pt = [number, number];
// Measured from the reference (desktop) on a 720 x 520 canvas: an S rising from bottom-left to top-right, never crossing.
export const DESK: { w: number; h: number; pts: Pt[] } = {
  w: 720, h: 520, pts: [[70, 450], [469, 420], [142, 262], [585, 241], [353, 115], [660, 82]],
};
// Phones: the same 6 stops top to bottom.
export const PHONE: { w: number; h: number; pts: Pt[] } = {
  w: 300, h: 720, pts: [[80, 60], [220, 180], [90, 300], [215, 420], [85, 540], [215, 660]],
};

/** A hand-drawn line: a small sine wobble along the straight segment. */
function wavy(a: Pt, b: Pt, amp = 3, wave = 11): string {
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const len = Math.hypot(dx, dy);
  const nx = -dy / len, ny = dx / len;
  const n = Math.max(2, Math.round(len / 4));
  let d = `M${a[0]} ${a[1]}`;
  for (let i = 1; i <= n; i++) {
    const t = i / n, o = Math.sin((t * len * 2 * Math.PI) / wave) * amp * Math.min(1, t * 6, (1 - t) * 6);
    d += ` L${(a[0] + dx * t + nx * o).toFixed(1)} ${(a[1] + dy * t + ny * o).toFixed(1)}`;
  }
  return d;
}

export function PathMap({ states, secure, phone, filling, onStop }: {
  states: StopState[]; secure: boolean; phone: boolean;
  /** Index of the stop the path is filling up to right now (Let's go!), or null. */
  filling: number | null;
  onStop: (i: number) => void;
}) {
  const L = phone ? PHONE : DESK;
  const segs = useMemo(() => L.pts.slice(1).map((p, i) => ({ d: wavy(L.pts[i]!, p), len: Math.hypot(p[0] - L.pts[i]![0], p[1] - L.pts[i]![1]) * 1.08 })), [L]);
  const [grown, setGrown] = useState(false);
  const featherShown = useRef(false);
  useEffect(() => { if (secure && !featherShown.current) { featherShown.current = true; playSound("feather"); musicLift(); } }, [secure]);
  const [bounce, setBounce] = useState<number | null>(null);
  const tap = (i: number) => { { setBounce(i); window.setTimeout(() => setBounce(null), 260); } onStop(i); };
  useEffect(() => { setGrown(false); if (filling == null) return; const r = requestAnimationFrame(() => setGrown(true)); return () => cancelAnimationFrame(r); }, [filling]);

  return (
    <div className="relative mx-auto w-full" style={{ maxWidth: phone ? 340 : 820, aspectRatio: `${L.w} / ${L.h}` }}>
      <svg viewBox={`0 0 ${L.w} ${L.h}`} className="absolute inset-0 h-full w-full overflow-visible" aria-hidden fill="none" strokeLinecap="round" strokeLinejoin="round">
        {segs.map((s, i) => <g key={i} className="text-path-line">
          <path d={s.d} stroke="currentColor" strokeWidth={9} />
          <path d={s.d} className="text-fh-card" stroke="currentColor" strokeOpacity={0.55} strokeWidth={2.5} strokeDasharray="5 7" />
        </g>)}
        {filling != null && filling > 0 && segs[filling - 1] && (
          <path d={segs[filling - 1]!.d} className="path-grow text-path-done" stroke="currentColor" strokeWidth={6}
            strokeDasharray={segs[filling - 1]!.len} strokeDashoffset={grown ? 0 : segs[filling - 1]!.len} />
        )}
      </svg>
      <ol className="absolute inset-0">
        {L.pts.map(([x, y], i) => (
          <li key={i} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${(x / L.w) * 100}%`, top: `${(y / L.h) * 100}%` }}>
            <StopBadge i={i} state={states[i] ?? "locked"} feather={i === PATH_STOPS.length - 1 && secure} pop={(filling === i && grown) || bounce === i} onClick={() => tap(i)} />
          </li>
        ))}
      </ol>
    </div>
  );
}

// Pebble outline (slightly uneven, a little taller than wide) on a 100 x 108 box.
const PEBBLE = "M50 3C76 2 97 21 97 50C98 80 77 104 50 104C22 105 3 82 3 52C2 23 24 4 50 3Z";
const LOCK = "M-9 -2h18a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-18a2 2 0 0 1-2-2v-12a2 2 0 0 1 2-2z";
const STAR = "M0 -20L5.9 -8.1L19 -6.2L9.5 3.1L11.8 16.2L0 10L-11.8 16.2L-9.5 3.1L-19 -6.2L-5.9 -8.1Z";

function Pebble({ ring, inner, children }: { ring: string; inner: string; children: ReactNode }) {
  return (
    <svg viewBox="0 0 100 112" className="h-full w-full overflow-visible" shapeRendering="geometricPrecision" aria-hidden>
      <path d={PEBBLE} transform="translate(0 5)" className={ring} fill="currentColor" style={{ filter: "brightness(0.82)" }} />
      <path d={PEBBLE} className={ring} fill="currentColor" />
      <path d={PEBBLE} transform="translate(50 53.5) scale(0.84) translate(-50 -53.5)" className="text-fh-card" fill="currentColor" />
      <path d={PEBBLE} transform="translate(50 53.5) scale(0.74) translate(-50 -53.5)" className={inner} fill="currentColor" />
      <g transform="translate(50 54)">{children}</g>
    </svg>
  );
}

function StopBadge({ i, state, feather, pop, onClick }: { i: number; state: StopState; feather: boolean; pop: boolean; onClick: () => void }) {
  const name = PATH_STOPS[i]!.name;
  const label = `Stop ${i + 1}, ${name}, ${state === "next" ? "next" : state === "done" ? "done" : "locked"}`;
  return (
    <span className="anim-card-in group/stop relative inline-block" style={{ ["--d" as string]: `${i * 60}ms` }}>
    <span aria-hidden className="pointer-events-none absolute bottom-[calc(100%+6px)] left-1/2 z-20 -translate-x-1/2 translate-y-1 whitespace-nowrap rounded-xl bg-fh-card px-3 py-1.5 text-center opacity-0 shadow-md transition duration-150 group-hover/stop:translate-y-0 group-hover/stop:opacity-100 group-focus-within/stop:translate-y-0 group-focus-within/stop:opacity-100 motion-reduce:transition-none">
      <span className="block text-sm font-bold text-fh-heading">{name}</span>
      {state !== "next" && <span className="block text-xs font-semibold text-fh-sub">{state === "done" ? "Done" : "Locked"}</span>}
    </span>
    <button type="button" onClick={onClick} aria-label={label} aria-disabled={state === "locked" || undefined}
      className={cn("squish group relative block h-[clamp(70px,6.4vw,92px)] w-[clamp(64px,5.9vw,84px)] transition-transform duration-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-fh-box-edge motion-reduce:transition-none",
        state !== "locked" && "hover:-translate-y-0.5", pop && "scale-110")}>
      <span className={cn("block h-full w-full", state === "next" && "path-pulse motion-reduce:animate-none")}>
        {state === "next" ? (
          <Pebble ring="text-path-next-ring" inner="text-path-next">
            <path d={STAR} className="text-path-star" fill="currentColor" stroke="currentColor" strokeWidth={3} strokeLinejoin="round" />
          </Pebble>
        ) : state === "done" ? (
          <Pebble ring="text-path-done-ring" inner="text-path-done">
            <path d={STAR} className="text-path-done-star" fill="currentColor" stroke="currentColor" strokeWidth={3} strokeLinejoin="round" />
            {feather ? <g transform="translate(-14 -14)"><Feather width={28} height={28} className="text-path-next-ring" strokeWidth={2.4} /></g>
              : <path d="M-12 0l8 8l16 -16" className="anim-tick text-fh-card" fill="none" stroke="currentColor" strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />}
          </Pebble>
        ) : (
          <Pebble ring="text-path-ring" inner="text-path-badge">
            <path d={STAR} transform="scale(1.25)" className="text-fh-card" fill="currentColor" fillOpacity={0.14} />
            <path d={LOCK} className="text-path-lock" fill="currentColor" stroke="currentColor" strokeWidth={0.5} />
            <path d="M-5.5 -2v-4a5.5 5.5 0 0 1 11 0v4" className="text-path-lock" fill="none" stroke="currentColor" strokeWidth={3} />
          </Pebble>
        )}
      </span>
    </button>
    {state === "next" && (
      <button type="button" onClick={onClick} tabIndex={-1} aria-hidden
        className="squish absolute left-1/2 top-[calc(100%-10px)] -translate-x-1/2 rounded-full bg-path-next px-6 py-1 text-sm font-semibold text-fh-card shadow-[0_3px_0_var(--path-next-edge)] hover:brightness-105">
        Start
      </button>
    )}
    </span>
  );
}
