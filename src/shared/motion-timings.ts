// Every motion and music timing in one place, so the design team's numbers can replace these in one go.
// CSS timings mirror these as --t-* variables in src/styles.css. See docs/motion-timings.md.
export const TIMINGS = {
  termBounceMs: 520,
  tickMs: 700,
  triangleSideMs: 400,
  snapPopMs: 180,
  squishMs: 80,
  liftMs: 200,
  cardInMs: 820,
  springInMs: 640,
  entryStaggerMs: 60,
  rightTickHoldMs: 600,
} as const;

