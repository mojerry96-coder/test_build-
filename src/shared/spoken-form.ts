// Maths written on the board, turned into words for Fiti's voice ("6 − 2 = 4" → "6 minus 2 equals 4").
// Only changes how a line sounds; the words on screen stay exactly as written.
export function spokenForm(text: string): string {
  return text
    .replace(/(\d)\s*\/\s*(\d)/g, "$1 over $2")
    .replace(/\s*[−–]\s*(?=[\d(a-z])/gi, (_m: string, off: number, s: string) => (off > 0 && /[\d)]\s*$/.test(s.slice(0, off)) ? " minus " : " negative "))
    .replace(/(?<=[\d)a-z]\s*)-(?=\s*[\d(])/gi, " minus ")
    .replace(/\s*÷\s*/g, " divided by ")
    .replace(/\s*[×]\s*/g, " times ")
    .replace(/\s*=\s*/g, " equals ")
    .replace(/\^\s*2\b/g, " squared")
    .replace(/\s*\^\s*/g, " to the power ")
    .replace(/\s{2,}/g, " ")
    .trim();
}
