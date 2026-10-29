// Practise: after Fiti shows an answer, the next problem opens with one approved "try this on your own" line, once.
// Pure, tested. Storage holds { from: revealed item id, text }.
export type AfterReveal = { from: string; text: string };

/** The line to play on this problem, or null (same problem, nothing saved, or empty). */
export function afterRevealLine(saved: AfterReveal | null, currentItemId: string | undefined): string | null {
  if (!saved || !saved.text || !currentItemId || saved.from === currentItemId) return null;
  return saved.text;
}
