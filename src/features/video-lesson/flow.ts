// Pure clip order for the clip-per-moment video step (tested in src/test/video-flow.test.ts).
import type { VideoFlow } from "@/shared/contracts/content-pack";

export type FlowPhase =
  | { kind: "clip"; qi: number; clip: string; role: "after" | "correct" | "wrong" | "next" | "replay" }
  | { kind: "question"; qi: number }
  | { kind: "end" };

/** Where she starts (or resumes): the first unanswered check — at its question if she has already tried it. */
export function firstPhase(flow: VideoFlow, answered: (id: string) => boolean, attempts: (id: string) => number): FlowPhase {
  const qi = flow.checks.findIndex((c) => !answered(c.item_id));
  if (qi < 0) return { kind: "end" };
  const c = flow.checks[qi]!;
  return attempts(c.item_id) > 0 ? { kind: "question", qi } : { kind: "clip", qi, clip: c.after_clip, role: "after" };
}

/** What follows a finished clip. A correct clip moves on once the check is settled. */
export function nextAfterClip(flow: VideoFlow, p: Extract<FlowPhase, { kind: "clip" }>, answered: (id: string) => boolean): FlowPhase {
  const c = flow.checks[p.qi]!;
  if (p.role === "next") return { kind: "end" };
  if (p.role !== "correct" && !answered(c.item_id)) return { kind: "question", qi: p.qi };
  const n = flow.checks[p.qi + 1];
  if (n) return answered(n.item_id) ? nextAfterClip(flow, { kind: "clip", qi: p.qi + 1, clip: n.correct_clip, role: "correct" }, answered) : { kind: "clip", qi: p.qi + 1, clip: n.after_clip, role: "after" };
  return c.next_clip ? { kind: "clip", qi: p.qi, clip: c.next_clip, role: "next" } : { kind: "end" };
}

/** The clip after a wrong try: by try number only, never by the option chosen. */
export const wrongClip = (flow: VideoFlow, qi: number, attempt: number) => flow.checks[qi]!.wrong_clips[Math.min(Math.max(attempt, 1), 3) - 1]!;

/** Where a seek lands: never before 0, never past what she has already watched (no skipping ahead). */
export function clampSeek(target: number, maxWatched: number, duration: number): number {
  const cap = Math.min(Math.max(maxWatched, 0), Number.isFinite(duration) && duration > 0 ? duration : maxWatched);
  return Math.min(Math.max(target, 0), cap);
}
