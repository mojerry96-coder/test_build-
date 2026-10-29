import { motion, useMotionValue, useReducedMotion, useSpring, useTransform, type MotionValue } from "framer-motion";
import { useEffect } from "react";
import { backgroundLayers, type LayerKind } from "./background-layers";

/** Depth (px of travel at full cursor offset) and spring feel per layer kind.
 *  Different stiffness per layer = overlapping action / follow-through. */
const DEPTH: Record<LayerKind, { travel: number; stiffness: number; damping: number }> = {
  blob: { travel: 10, stiffness: 40, damping: 18 },
  cloud: { travel: 20, stiffness: 60, damping: 16 },
  sparkle: { travel: 32, stiffness: 90, damping: 12 },
  accent: { travel: 26, stiffness: 75, damping: 14 },
};

function Layer({
  kind, index, node, mx, my, reduce,
}: { kind: LayerKind; index: number; node: React.ReactNode; mx: MotionValue<number>; my: MotionValue<number>; reduce: boolean }) {
  const d = DEPTH[kind];
  // slight per-layer variation so neighbours don't move in lockstep
  const travel = d.travel * (1 + ((index % 3) - 1) * 0.15);
  const spring = { stiffness: d.stiffness + (index % 4) * 6, damping: d.damping };
  const x = useSpring(useTransform(mx, [-1, 1], [-travel, travel]), spring);
  const y = useSpring(useTransform(my, [-1, 1], [-travel * 0.6, travel * 0.6]), spring);

  if (reduce) return <g>{node}</g>;

  // Idle secondary action along a small arc (circular keyframes).
  const r = kind === "blob" ? 6 : kind === "cloud" ? 8 : 5;
  const dur = 9 + (index % 5) * 1.7;
  return (
    <motion.g style={{ x, y }}>
      <motion.g
        animate={{
          x: [0, r, 0, -r, 0],
          y: [0, -r * 0.7, -r * 1.2, -r * 0.7, 0],
          ...(kind === "sparkle" ? { opacity: [1, 0.55, 1, 0.8, 1] } : {}),
          ...(kind === "cloud" ? { scale: [1, 1.015, 1] } : {}),
        }}
        transition={{ duration: dur, repeat: Infinity, ease: "easeInOut", delay: index * 0.35 }}
      >
        {node}
      </motion.g>
    </motion.g>
  );
}

export function ParallaxBackground({ className = "" }: { className?: string }) {
  const reduce = useReducedMotion() ?? false;
  const mx = useMotionValue(0);
  const my = useMotionValue(0);

  useEffect(() => {
    if (reduce) return;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      mx.set((e.clientX / window.innerWidth) * 2 - 1);
      my.set((e.clientY / window.innerHeight) * 2 - 1);
    };
    const onLeave = () => { mx.set(0); my.set(0); };
    window.addEventListener("pointermove", onMove);
    document.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, [mx, my, reduce]);

  return (
    <svg
      aria-hidden
      viewBox="0 0 1920 1080"
      preserveAspectRatio="xMidYMid slice"
      className={`pointer-events-none absolute inset-0 h-full w-full bg-vl-bg ${className}`}
    >
      <rect x="-100" y="-100" width="2120" height="1280" fill="var(--vl-bg)" />
      {backgroundLayers.map((l, i) => (
        <Layer key={l.id} kind={l.kind} index={i} node={l.node} mx={mx} my={my} reduce={reduce} />
      ))}
    </svg>
  );
}
