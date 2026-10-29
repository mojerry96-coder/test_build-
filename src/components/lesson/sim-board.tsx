// Placeholder grid for the built-in simulations (Step 4). Board style only, so the illustration kit
// can restyle it later. x 0–6 at 75 px, y 0–4 at 74 px, on a 526 × 354 frame.
import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { cn } from "@/lib/utils";

export const GRID_W = 526, GRID_H = 354, STEP_X = 75, STEP_Y = 74, MAX_X = 6, MAX_Y = 4;
const PAD_TOP = GRID_H - MAX_Y * STEP_Y; // room above y = 4 so the top point never touches the frame
const px = (p: number[]) => ({ x: p[0]! * STEP_X, y: GRID_H - p[1]! * STEP_Y });

export type BoardShape = { a: number[]; b: number[]; label?: string; triangle?: boolean };

type Props = {
  /** Fixed points she cannot move (start point, road ends). */
  fixed?: number[][];
  /** Points she placed. */
  placed?: number[][];
  shapes: BoardShape[];
  tone: "idle" | "right" | "wrong";
  /** Show "up n" / "across n" on the first shape (only after a right check). */
  labels?: { up: number; across: number } | null | undefined;
  faint?: BoardShape | null | undefined;
  /** Coordinates written next to fixed points (Road Inspector). */
  showCoords?: boolean;
  locked?: boolean;
  onPlace?: ((p: number[]) => void) | undefined;
  /** Drag a placed point (index into placed) to a crossing; done = finger lifted. */
  onDrag?: ((i: number, p: number[], done: boolean) => void) | undefined;
  ariaLabel: string;
};

const minus = (n: number) => String(n).replace("-", "−");

export function SimBoard({ fixed = [], placed = [], shapes, tone, labels, faint, showCoords, locked, onPlace, onDrag, ariaLabel }: Props) {
  const ref = useRef<SVGSVGElement>(null);
  const drag = useRef<{ i: number; last: string; moved: boolean } | null>(null);
  const [said, setSaid] = useState("");
  /** Nearest crossing under the pointer, kept inside the grid. */
  const snap = (e: PointerEvent) => {
    const svg = ref.current; if (!svg) return null;
    const m = svg.getScreenCTM(); if (!m) return null;
    const pt = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
    return [Math.min(MAX_X, Math.max(0, Math.round(pt.x / STEP_X))), Math.min(MAX_Y, Math.max(0, Math.round((GRID_H - pt.y) / STEP_Y)))];
  };
  const onDown = (e: PointerEvent) => {
    if (locked || !onDrag) return;
    const p = snap(e); if (!p) return;
    const i = placed.findIndex((q) => q[0] === p[0] && q[1] === p[1]);
    if (i < 0) return;
    e.preventDefault();
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    drag.current = { i, last: p.join(","), moved: false };
  };
  const onMove = (e: PointerEvent) => {
    const d = drag.current; if (!d || !onDrag) return;
    const p = snap(e); if (!p || p.join(",") === d.last) return;
    d.last = p.join(","); d.moved = true;
    onDrag(d.i, p, false);
  };
  const onUp = (e: PointerEvent) => {
    const d = drag.current; drag.current = null;
    if (!d || !onDrag || !d.moved) return;
    const p = snap(e) ?? d.last.split(",").map(Number);
    onDrag(d.i, p, true);
    setSaid(`Point at ${p[0]}, ${p[1]}`);
  };
  const stroke = tone === "wrong" ? "var(--sim-amber)" : "var(--sim-line)";
  const fill = tone === "wrong" ? "var(--sim-amber-fill)" : "var(--sim-fill)";
  const focusPoint = (x: number, y: number) =>
    (ref.current?.querySelector(`[data-pt="${x},${y}"]`) as SVGGElement | null)?.focus();
  const onKey = (e: KeyboardEvent, x: number, y: number) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); if (!locked) onPlace?.([x, y]); return; }
    const d = { ArrowRight: [1, 0], ArrowLeft: [-1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] }[e.key];
    if (!d) return;
    e.preventDefault();
    focusPoint(Math.min(MAX_X, Math.max(0, x + d[0]!)), Math.min(MAX_Y, Math.max(0, y + d[1]!)));
  };

  const drawShape = (s: BoardShape, i: number, ghost = false) => {
    const A = px(s.a), B = px(s.b), C = px([s.b[0]!, s.a[1]!]);
    return (
      <g key={(ghost ? "g" : "s") + i} opacity={ghost ? 0.35 : 1} className={ghost ? "" : "motion-safe:anim-fade-in"}>
        {s.triangle && s.a[0] !== s.b[0] && s.a[1] !== s.b[1] && (
          <polygon points={`${A.x},${A.y} ${C.x},${C.y} ${B.x},${B.y}`} fill={ghost ? "var(--sim-fill)" : fill}
            stroke={ghost ? "var(--sim-line)" : stroke} strokeWidth={4} strokeLinejoin="round" strokeDasharray={ghost ? "8 8" : undefined} />
        )}
        <line x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke={ghost ? "var(--sim-line)" : stroke} strokeWidth={ghost ? 3 : 5} strokeLinecap="round" strokeDasharray={ghost ? "8 8" : undefined} />
        {s.label && (
          <text x={(A.x + B.x) / 2 + 10} y={(A.y + B.y) / 2 - 10} className="fill-sim-ink font-sans text-[16px] font-bold">{s.label}</text>
        )}
        {ghost && <circle cx={B.x} cy={B.y} r={10} fill="var(--sim-point)" stroke="var(--sim-point-ring)" strokeWidth={4} strokeDasharray="4 4" />}
      </g>
    );
  };

  const first = shapes[0];
  return (
    <svg ref={ref} viewBox={`-14 -14 ${GRID_W + 28} ${GRID_H + 40}`} role="group" aria-label={ariaLabel}
      onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={() => { drag.current = null; }}
      className={cn("mx-auto block h-auto w-full max-w-[554px] select-none overflow-visible", onDrag && placed.length ? "touch-none" : "touch-manipulation")}>
      <rect x={0} y={0} width={GRID_W} height={GRID_H} rx={9} fill="none" stroke="var(--sim-grid)" strokeWidth={1} />
      {Array.from({ length: MAX_X }, (_, i) => i + 1).map((x) => (
        <line key={"v" + x} x1={x * STEP_X} x2={x * STEP_X} y1={0} y2={GRID_H} stroke="var(--sim-grid)" strokeWidth={1} />
      ))}
      {Array.from({ length: MAX_Y }, (_, i) => i + 1).map((y) => (
        <line key={"h" + y} x1={0} x2={GRID_W} y1={GRID_H - y * STEP_Y} y2={GRID_H - y * STEP_Y} stroke="var(--sim-grid)" strokeWidth={1} />
      ))}
      {PAD_TOP > 0 && null}
      {shapes.map((s, i) => drawShape(s, i))}
      {faint && drawShape(faint, 0, true)}
      {labels && first && (() => {
        const A = px(first.a), B = px(first.b);
        return (
          <g className="fill-sim-ink font-sans text-[14px] font-bold">
            <text x={B.x + 10} y={(A.y + B.y) / 2 + 5}>up {minus(labels.up)}</text>
            <text x={(A.x + B.x) / 2} y={A.y + 22} textAnchor="middle">across {minus(labels.across)}</text>
          </g>
        );
      })()}
      {/* Intersections: 9 px dots, each with a 44 px+ tap area. */}
      {Array.from({ length: (MAX_X + 1) * (MAX_Y + 1) }, (_, i) => {
        const x = i % (MAX_X + 1), y = Math.floor(i / (MAX_X + 1));
        const c = px([x, y]);
        return (
          <g key={i} data-pt={`${x},${y}`} role={onPlace ? "button" : undefined} tabIndex={onPlace && !locked ? (x === 0 && y === 0 ? 0 : -1) : undefined}
            aria-label={onPlace ? `Point (${x}, ${y})` : undefined} aria-disabled={locked || undefined}
            onClick={() => { if (!locked && !drag.current) { onPlace?.([x, y]); setSaid(`Point at ${x}, ${y}`); } }} onKeyDown={(e) => onKey(e, x, y)}
            style={{ outline: "none", WebkitTapHighlightColor: "transparent" }}
            className={cn("outline-none [&:focus-visible>circle:last-child]:stroke-sim-line [&:focus-visible>circle:last-child]:stroke-[3]", onPlace && !locked && "cursor-pointer")}>
            <rect x={c.x - STEP_X / 2} y={c.y - STEP_Y / 2} width={STEP_X} height={STEP_Y} fill="transparent" style={{ outline: "none" }} />
            <circle cx={c.x} cy={c.y} r={4.5} fill="var(--sim-grid)" />
          </g>
        );
      })}
      {fixed.map((p, i) => {
        const c = px(p);
        return (
          <g key={"f" + i} pointerEvents="none">
            <circle cx={c.x} cy={c.y} r={10} fill="var(--sim-start)" />
            {showCoords && <text x={c.x + 12} y={c.y - 12} className="fill-sim-ink font-sans text-[14px] font-bold">({p[0]}, {p[1]})</text>}
          </g>
        );
      })}
      {placed.map((p, i) => {
        const c = px(p);
        return <circle key={"p" + i} pointerEvents="none" className={onDrag && !locked ? "cursor-grab" : undefined} cx={c.x} cy={c.y} r={8} fill="var(--sim-point)" stroke={tone === "wrong" ? "var(--sim-amber)" : "var(--sim-point-ring)"} strokeWidth={4} />;
      })}
      <foreignObject x={0} y={0} width={1} height={1}><p aria-live="polite" className="sr-only">{said}</p></foreignObject>
    </svg>
  );
}
