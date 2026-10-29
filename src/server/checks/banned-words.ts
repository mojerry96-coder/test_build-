// Live reply check entry point; uses the same matcher and list as the content-pack check.
import { findBannedWords, DEFAULT_BANNED_WORDS } from "@/shared/contracts/banned-words";

export function replyBannedWords(segments: { text: string; speakable?: string }[], banned: readonly string[] = DEFAULT_BANNED_WORDS) {
  return [...new Set(segments.flatMap((s) => [...findBannedWords(s.text, banned), ...findBannedWords(s.speakable ?? "", banned)]))];
}
