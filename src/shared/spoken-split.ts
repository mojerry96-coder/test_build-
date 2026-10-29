// Splits a long tutor line into sentences for voice only (captions keep the whole line), so the first
// sentence can start playing while the rest are still being made. Used by the browser voice queue and by
// the voice ledger, which notes each part so a part is speakable exactly when its whole line was shown.
export const SPLIT_OVER = 60;
/** Lines longer than this get a short first piece so his first word comes fast. */
export const QUICK_START_OVER = 40;
const FIRST_MAX = 45;
const LONG_PART = 90;

const ABBREV = /\b(e\.g|i\.e|etc|vs|Mr|Mrs|Ms|Dr)\.$/i;

/** Pure: sentences of a long line; a short line comes back whole. Never splits "0.5" or "e.g.". */
export function splitSpoken(line: string): string[] {
  const t = line.trim();
  if (!t) return [];
  if (t.length <= SPLIT_OVER) return quickStart([t]);
  const parts: string[] = [];
  let cur = "";
  for (let i = 0; i < t.length; i++) {
    const c = t[i]!;
    cur += c;
    if (".!?".includes(c) && (i + 1 >= t.length || t[i + 1] === " ") && !/\d$/.test(t[i + 1] ?? "") && !ABBREV.test(cur)) {
      if (cur.trim()) parts.push(cur.trim());
      cur = "";
    }
  }
  if (cur.trim()) parts.push(cur.trim());
  // A long sentence is cut again at ": " or ", " so the first piece is short and ready fast.
  const fine = parts.flatMap((p) => (p.length > LONG_PART ? p.split(/(?<=[:,]) (?=\D)/) : [p]));
  // Fold tiny fragments ("Yes!") into the next part so each request is worth making.
  const out: string[] = [];
  for (const p of fine) {
    const prev = out[out.length - 1];
    if (prev !== undefined && prev.length < 25) out[out.length - 1] = `${prev} ${p}`;
    else out.push(p);
  }
  return quickStart(out);
}

/** Pure: cut a long first piece at its first ", " or ". " after 15 characters (whole line over 40 chars). */
function quickStart(parts: string[]): string[] {
  const first = parts[0];
  if (!first || parts.join(" ").length <= QUICK_START_OVER || first.length <= FIRST_MAX) return parts;
  const m = /^.{15,}?(?:, |\. )(?=\D)/.exec(first);
  if (!m || first.length - m[0].length < 8) return parts;
  return [m[0].trim(), first.slice(m[0].length).trim(), ...parts.slice(1)];
}
