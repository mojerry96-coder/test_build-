// Display-only arithmetic for the placeholder lab (shows rise ÷ run). Never used for marking.
export function evaluate(s: string): number | null {
  const t = s.replace(/[\u2212]/g, "-").replace(/\s+/g, "");
  if (!/^-?\d+(\.\d+)?(\/-?\d+(\.\d+)?)?$/.test(t)) return null;
  const [a, b] = t.split("/");
  const v = b === undefined ? Number(a) : Number(a) / Number(b);
  return Number.isFinite(v) ? v : null;
}
