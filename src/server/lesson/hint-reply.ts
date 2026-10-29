import type { Script } from "@/shared/contracts/script";

/** Max words in a Hint tip: one short, clear action. */
export const TIP_MAX_WORDS = 22;
const SCREEN_WORDS = /\b(tap|click|press|watch|your turn|ready|check answer|button)\b/i;

/** A Hint tip must be one plain maths action: one sentence, short, no app instructions. */
export function isClearTip(text: string): boolean {
  const t = text.trim();
  if (!t || SCREEN_WORDS.test(t)) return false;
  if (t.split(/\s+/).length > TIP_MAX_WORDS) return false;
  return (t.match(/[.!?](\s|$)/g) ?? []).length <= 1;
}

/** Hint button reply: the checked AI tip if it is a clear tip, else the first approved tip, else the "try" line. */
export function hintReply(aiText: string | null, tips: Script[], tryLine: Script): Script {
  if (aiText && isClearTip(aiText)) return [{ text: aiText.trim() }];
  return tips.find((t) => t.length) ?? tryLine;
}
