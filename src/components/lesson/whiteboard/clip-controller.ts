// Fiti clip controller (same rules as the Gradient Lab simulation). Pure logic, tested.
// idle loops while writing/waiting; one-shot clips play once then hand back to idle on the shared rest frame.
export type Clip = "idle" | "greet" | "nod" | "retry" | "celebrate" | "tap" | "point" | "sad";

/** Higher wins when two one-shots compete. tap outranks nod. */
export const CLIP_PRIORITY: Record<Clip, number> = { idle: 0, point: 1, nod: 2, retry: 2, sad: 2, tap: 3, greet: 4, celebrate: 4 };

export type ClipState = { playing: Clip };

/** Ask for a clip: a repeat of the clip already playing never restarts it; a lower-priority one-shot is ignored. */
export function requestClip(s: ClipState, want: Clip): ClipState {
  if (want === s.playing) return s;
  if (s.playing !== "idle" && CLIP_PRIORITY[want] < CLIP_PRIORITY[s.playing]) return s;
  return { playing: want };
}

/** A one-shot clip ended: always back to idle. */
export function clipEnded(_s: ClipState): ClipState {
  return { playing: "idle" };
}

/** Reduced motion or low data: only the still rest frame, no video. */
export function useStillOnly(reducedMotion: boolean, lowData: boolean): boolean {
  return reducedMotion || lowData;
}

/** Each board line: a tiny tilt in −0.5°…0.5° and a few pixels off the left edge, stable per line. */
export function lineJitter(seed: number): { tilt: number; offset: number } {
  const r = (n: number) => { const x = Math.sin(seed * 12.9898 + n * 78.233) * 43758.5453; return x - Math.floor(x); };
  return { tilt: Math.round((r(1) - 0.5) * 100) / 100, offset: Math.round(r(2) * 6) };
}
