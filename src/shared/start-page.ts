// Ask Fiti opens every new conversation on the "Ready to learn" page; Fiti's own opening line
// (hello, first-time talk, "pick up where you stopped") shows as a bubble there, not as a chat.
// The chat view starts only once she has written, tapped a card or tapped one of Fiti's buttons.
type M = { role: "tutor" | "student" };

export function showStartPage(msgs: readonly M[], started: boolean): boolean {
  return !started && !msgs.some((m) => m.role === "student");
}

/** Fiti's latest line to show in the start-page bubble, if any. */
export function startBubble<T extends M>(msgs: readonly T[]): T | null {
  for (let i = msgs.length - 1; i >= 0; i--) if (msgs[i]!.role === "tutor") return msgs[i]!;
  return null;
}
