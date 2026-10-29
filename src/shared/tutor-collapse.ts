// Collapsed tutor: message count badge and the short preview in the "Need help?" bubble.

/** Tutor messages posted since the panel was collapsed (never below 0). */
export function newSince(tutorCountNow: number, tutorCountAtCollapse: number): number {
  return Math.max(0, tutorCountNow - tutorCountAtCollapse);
}

/** Badge text: hidden at 0, "9+" above 9. */
export function badgeText(n: number): string | null {
  if (n <= 0) return null;
  return n > 9 ? "9+" : String(n);
}

/** First line of a tutor message, trimmed to about 60 characters with "…" on a word break. */
export function previewLine(text: string, max = 60): string {
  const first = (text.split(/\n/)[0] ?? "").trim().replace(/\s+/g, " ");
  if (first.length <= max) return first;
  const cut = first.slice(0, max);
  const sp = cut.lastIndexOf(" ");
  return `${(sp > max * 0.6 ? cut.slice(0, sp) : cut).replace(/[\s,.;:!?-]+$/, "")}…`;
}

export const PREVIEW_MS = 4000;

/** Storage key for the collapsed state, remembered per lesson session. */
export const collapseKey = (sessionId: string) => `tutor-collapsed:${sessionId}`;
