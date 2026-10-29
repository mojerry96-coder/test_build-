/** How long each "look at me" hop/glow lasts on the tutor (as in Gradient Lab). */
export const TAP_HINT_SHOW_MS = 3000;

/** Quick fix: does Fiti wear the "Tap me for a hint!" pill? Whenever a step is open, has a hint not yet seen, and no card is open. */
export function tapHintPill(s: { stepOpen: boolean; hasHint: boolean; seen: boolean; cardOpen: boolean }): boolean {
  return s.stepOpen && s.hasHint && !s.seen && !s.cardOpen;
}

/** Quick fix: is Fiti hopping/glowing now? For TAP_HINT_SHOW_MS at the end of every idleMs of stillness; never while paused or speaking. */
export function tapHintNudge(stillMs: number, idleMs: number, s: { paused: boolean; speaking: boolean }): boolean {
  if (s.paused || s.speaking || idleMs <= 0 || stillMs < idleMs) return false;
  return (stillMs - idleMs) % idleMs < TAP_HINT_SHOW_MS;
}
