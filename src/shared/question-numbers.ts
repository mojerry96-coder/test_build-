/** Splits question text so numbers and points like "(3, 2)" can be shown in the number colour. */
export function splitNumbers(text: string): { text: string; num: boolean }[] {
  const re = /\(\s*-?\d+(?:\.\d+)?\s*,\s*-?\d+(?:\.\d+)?\s*\)|-?\d+(?:\.\d+)?/g;
  const out: { text: string; num: boolean }[] = [];
  let last = 0;
  for (const m of text.matchAll(re)) {
    if (m.index! > last) out.push({ text: text.slice(last, m.index), num: false });
    out.push({ text: m[0], num: true });
    last = m.index! + m[0].length;
  }
  if (last < text.length) out.push({ text: text.slice(last), num: false });
  return out;
}

/** Hide the graph only when the prompt gives the point itself and nothing (prompt or tip) names a point on the graph, like "Point Q". */
export function hideGraph(prompt: string, tip?: string | null): boolean {
  const hasCoords = /\(\s*-?\d+(?:\.\d+)?\s*,\s*-?\d+(?:\.\d+)?\s*\)/.test(prompt);
  const namesPoint = (s: string) => /\b[Pp]oint\s+[A-Z]\b/.test(s.replace(/\(\s*-?\d[^)]*\)/g, ""));
  return hasCoords && !namesPoint(prompt) && !(tip && namesPoint(tip));
}
