// Practise: after `limit` real "check this line" results on one problem, the tutor shows the worked solution.
// Pure, tested. The limit is rule `worksheet_reveal_after`.
export const DEFAULT_REVEAL_AFTER = 3;

export function revealLimit(v: unknown): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : DEFAULT_REVEAL_AFTER;
}
/** Only real mistakes count: an unreadable line (brackets, signs) is not a try. */
export function countsAsTry(status: "ok" | "check", reason?: string | null): boolean {
  return status === "check" && reason !== "unreadable";
}
export function shouldReveal(attempts: number, limit: number): boolean { return attempts >= limit; }
/** One try before the reveal, the tutor warns her it's coming. */
export function warnBeforeReveal(attempts: number, limit: number): boolean { return limit > 1 && attempts === limit - 1; }
