// One banned-word matcher shared by the content-pack check and the live tutor-reply check.
// The list itself is data: rule `banned_words`. This default is used only when the rule is missing.
export const DEFAULT_BANNED_WORDS = ["wrong", "wrongly", "stupid", "dumb", "careless", "carelessly", "obviously", "easy"] as const;

/** Banned words found in text as whole words, case-insensitive. */
export function findBannedWords(text: string, banned: readonly string[]): string[] {
  const found: string[] = [];
  for (const w of banned) {
    const esc = w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (new RegExp(`(^|[^\\p{L}\\p{N}_])${esc}(?=$|[^\\p{L}\\p{N}_])`, "iu").test(text)) found.push(w);
  }
  return found;
}
