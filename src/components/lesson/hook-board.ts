// Placeholder hook board until the illustration kit arrives: both paths share one start point.
// Exact gradients: Path A rises 2 per 1 forward, Path B rises 1 per 2 forward (SVG y grows downward).
export const HOOK_BOARD = { ox: 300, oy: 420, u: 55, lenA: 1.6, lenB: 4 } as const;
export const HOOK_GRADIENTS = { a: { rise: 2, run: 1 }, b: { rise: 1, run: 2 } } as const;

export function pathEnd(id: "a" | "b") {
  const { ox, oy, u, lenA, lenB } = HOOK_BOARD;
  const g = HOOK_GRADIENTS[id];
  const k = id === "a" ? lenA : lenB;
  return { x: ox + g.run * k * u, y: oy - g.rise * k * u };
}

/** Gradient as drawn on screen (rise over run, y flipped back to maths direction). */
export function drawnGradient(id: "a" | "b") {
  const e = pathEnd(id);
  return (HOOK_BOARD.oy - e.y) / (e.x - HOOK_BOARD.ox);
}

/** Hook nudge / skip timing in ms: rules hook_nudge_s and hook_skip_s, default 20 s each. */
export function hookTimers(nudgeS?: number, skipS?: number) {
  const ok = (n: unknown) => typeof n === "number" && n > 0;
  return { nudgeMs: (ok(nudgeS) ? nudgeS! : 20) * 1000, skipMs: (ok(skipS) ? skipS! : 20) * 1000 };
}
