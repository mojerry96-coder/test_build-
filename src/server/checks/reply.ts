import type { Script } from '@/shared/contracts/script';
import { replyBannedWords } from './banned-words';
export function replyAllowed(reply: Script, approved: Script, item: unknown, work: unknown, banned?: readonly string[]): boolean {
  const numbers = (s: string) => s.match(/-?\d+(?:\.\d+)?/g) ?? [];
  const allowed = new Set(numbers(JSON.stringify([approved, item, work])));
  return reply.every(s => approved.some(a => a.text === s.text && a.speakable === s.speakable)) && !replyBannedWords(reply, banned).length && reply.every(s => numbers(s.text + ' ' + (s.speakable ?? '')).every(n => allowed.has(n)));
}
