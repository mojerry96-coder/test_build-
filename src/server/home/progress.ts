// Pure counting for her progress tab (tested). Only evidence after her latest Start again counts.
export type ProgressEvidence = { created_at: string; correct: boolean | null; is_first_try: boolean; quiz: boolean; session_id: string };

export function countProgress(ev: ProgressEvidence[], cutoff: string | null, topicSessionIds: string[]) {
  const live = ev.filter((e) => !cutoff || e.created_at > cutoff);
  const star = (e: ProgressEvidence) => !e.quiz && e.correct === true && e.is_first_try;
  const marked = live.filter((e) => e.correct !== null);
  return {
    stars: live.filter(star).length,
    topicStars: live.filter((e) => star(e) && topicSessionIds.includes(e.session_id)).length,
    correct: marked.filter((e) => e.correct === true).length,
    tried: marked.length,
  };
}

/** Steps done = position of the current step (finished lesson = all 8). */
export function stepsDone(currentIndex: number, finished: boolean, total = 8): number {
  if (finished) return total;
  return Math.max(0, Math.min(total, currentIndex));
}
