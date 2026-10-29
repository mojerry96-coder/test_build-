// "Place the point": an empty grid; she drags (or taps / uses arrow keys) the point, which snaps to the nearest crossing.
// The target ring appears only when the server sends it (after a miss, if the hint allows). Marking is on the server.
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { playSound } from "@/lib/sound";

export function PlacePointBoard({ grid, value, onChange, ring, mark, disabled, help }: {
  grid: { x_max: number; y_max: number }; value: [number, number] | null; onChange: (p: [number, number]) => void;
  ring?: [number, number] | undefined; mark?: "ok" | "warn" | null; disabled?: boolean; help?: string;
}) {
  const W = 600, H = 400, pad = 40;
  const sx = (x: number) => pad + (x / grid.x_max) * (W - pad * 2);
  const sy = (y: number) => H - pad - (y / grid.y_max) * (H - pad * 2);
  const svg = useRef<SVGSVGElement>(null);
  const [drag, setDrag] = useState(false);
  const [popKey, setPopKey] = useState(0);
  const hand = { fontFamily: '"Patrick Hand", cursive' };

  const snap = (cx: number, cy: number) => {
    const r = svg.current!.getBoundingClientRect();
    const x = ((cx - r.left) / r.width) * W, y = ((cy - r.top) / r.height) * H;
    const gx = Math.round(((x - pad) / (W - pad * 2)) * grid.x_max);
    const gy = Math.round(((H - pad - y) / (H - pad * 2)) * grid.y_max);
    return [Math.min(grid.x_max, Math.max(0, gx)), Math.min(grid.y_max, Math.max(0, gy))] as [number, number];
  };
  const set = (p: [number, number]) => {
    if (value && p[0] === value[0] && p[1] === value[1]) return;
    playSound("snap"); setPopKey((k) => k + 1); onChange(p);
  };
  const p = value ?? [0, 0];

  return (
    <figure className={cn("mx-auto w-full max-w-[560px] rounded-[22px] bg-[var(--board-card)] p-2 shadow-[0_10px_28px_-14px_rgb(10_49_80/0.35)]", mark === "warn" && "anim-shake", mark === "ok" && "anim-success")}>
      <svg ref={svg} viewBox={`0 0 ${W} ${H}`} className={cn("w-full touch-none select-none", !disabled && "cursor-crosshair")}
        role="slider" tabIndex={disabled ? -1 : 0} aria-label="Place the point" aria-valuetext={value ? `(${value[0]}, ${value[1]})` : "not placed yet"}
        aria-disabled={disabled || undefined}
        onPointerDown={(e) => { if (disabled) return; svg.current!.setPointerCapture(e.pointerId); setDrag(true); set(snap(e.clientX, e.clientY)); }}
        onPointerMove={(e) => { if (drag && !disabled) set(snap(e.clientX, e.clientY)); }}
        onPointerUp={() => setDrag(false)}
        onKeyDown={(e) => {
          if (disabled) return;
          const d: Record<string, [number, number]> = { ArrowRight: [1, 0], ArrowLeft: [-1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] };
          const m = d[e.key]; if (!m) return; e.preventDefault();
          set([Math.min(grid.x_max, Math.max(0, p[0] + m[0])), Math.min(grid.y_max, Math.max(0, p[1] + m[1]))]);
        }}>
        {Array.from({ length: grid.x_max + 1 }, (_, x) => <line key={`x${x}`} x1={sx(x)} x2={sx(x)} y1={sy(0)} y2={sy(grid.y_max)} stroke={x === 0 ? "var(--board-axis)" : "var(--board-line)"} strokeWidth={x === 0 ? 2.5 : 1.5} />)}
        {Array.from({ length: grid.y_max + 1 }, (_, y) => <line key={`y${y}`} y1={sy(y)} y2={sy(y)} x1={sx(0)} x2={sx(grid.x_max)} stroke={y === 0 ? "var(--board-axis)" : "var(--board-line)"} strokeWidth={y === 0 ? 2.5 : 1.5} />)}
        {Array.from({ length: grid.x_max }, (_, i) => i + 1).map((x) => <text key={x} x={sx(x)} y={sy(0) + 26} fontSize="26" textAnchor="middle" fill="var(--hub-heading)" style={hand}>{x}</text>)}
        {Array.from({ length: grid.y_max + 1 }, (_, y) => <text key={y} x={sx(0) - 14} y={sy(y) + 6} fontSize="26" textAnchor="end" fill="var(--hub-heading)" style={hand}>{y}</text>)}
        {ring && <circle cx={sx(ring[0])} cy={sy(ring[1])} r="20" fill="none" stroke={mark === "ok" ? "var(--rise)" : "var(--run)"} strokeWidth="3" strokeDasharray="6 6" className="path-pulse" />}
        {!value && (
          <g aria-hidden>
            <circle cx={sx(0)} cy={sy(0)} r="22" fill="var(--color-board-point)" opacity="0.2" className="path-pulse" />
            <circle cx={sx(0)} cy={sy(0)} r="12" fill="var(--color-board-point)" />
            <g className="qf-hand" style={{ ["--hx" as string]: `${sx(2) - sx(0)}px`, ["--hy" as string]: `${sy(2) - sy(0)}px` }}>
              <path transform={`translate(${sx(0) + 6} ${sy(0) + 4}) scale(1.6)`} d="M9 2a2 2 0 0 1 2 2v6l1-.5a2 2 0 0 1 2.6 1l2.9 5.6A4 4 0 0 1 14 22H9.5a4 4 0 0 1-3.2-1.6L3 16a1.8 1.8 0 0 1 2.7-2.3L7 15V4a2 2 0 0 1 2-2z" fill="#fff" stroke="var(--hub-heading)" strokeWidth="1.4" strokeLinejoin="round" />
            </g>
          </g>
        )}
        {value && (
          <g key={popKey} className="anim-success" style={{ transformBox: "fill-box", transformOrigin: "center" }}>
            <circle cx={sx(p[0])} cy={sy(p[1])} r="16" fill="var(--color-board-point)" opacity="0.18" />
            <circle cx={sx(p[0])} cy={sy(p[1])} r="11" fill="var(--color-board-point)" />
            <text x={sx(p[0]) + 16} y={sy(p[1]) - 14} fontSize="30" fill="var(--hub-heading)" className="board-halo" style={hand}>({p[0]}, {p[1]})</text>
          </g>
        )}
      </svg>
      {help && <figcaption className="mt-1 pb-1 text-center font-hand text-[clamp(16px,1.4vw,21px)] text-fh-heading">{help}</figcaption>}
    </figure>
  );
}
