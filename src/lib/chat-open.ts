// Remembers that she left the Ask Fiti chat for a learning page, so every Back reopens the conversation
// (not the "Ready to learn" start page or the chapter pages). Lives for the browser tab only.
const KEY = "ul.chatOpen";
const TRAIL = "ul.trailFromChat";

/** She is leaving the chat for a learning page (or returning to it): reopen the chat, and every Back leads there. */
export function markChatOpen(): void {
  try { sessionStorage.setItem(KEY, "1"); sessionStorage.setItem(TRAIL, "1"); } catch { /* storage off */ }
}

/** True once after she left the chat; clears the note. */
export function takeChatOpen(): boolean {
  try { const v = sessionStorage.getItem(KEY) === "1"; sessionStorage.removeItem(KEY); return v; } catch { return false; }
}

/** True while the current learning trip started in the chat. */
export function cameFromChat(): boolean {
  try { return sessionStorage.getItem(TRAIL) === "1"; } catch { return false; }
}

/** A new trip that didn't start in chat (Learning Hub, back in the chat itself, Start again). */
export function clearTrail(): void {
  try { sessionStorage.removeItem(TRAIL); } catch { /* storage off */ }
}
