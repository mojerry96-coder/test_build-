// After an admin Restart, only sessions started after it count (map, topic cards, greetings).
export function afterRestart<T extends { started_at: string | null }>(rows: T[], cutoff: string | null): T[] {
  if (!cutoff) return rows;
  return rows.filter((r) => !!r.started_at && r.started_at > cutoff);
}
