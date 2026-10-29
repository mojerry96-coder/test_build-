// Context-aware help when the tutor can't tell what she means, or she asks about something on screen.
// Pure: picks WHERE the help line comes from; the words always come from approved content.

/** Empty or clear keyboard mash ("asdfgh"): the only case for "didn't catch that". */
export function isGibberish(raw: string): boolean {
  const t = raw.toLowerCase().trim();
  if (!t) return true;
  const letters = t.replace(/[^a-z]/g, "");
  if (/\d/.test(t) && letters.length < 3) return false; // "9", "8+1"
  if (letters.length < 2) return true;
  if (!/[aeiouy]/.test(letters)) return true;
  if (/^(asdf|qwer|zxcv|hjkl|jkl)/.test(letters)) return true;
  if (/(.)\1{3,}/.test(letters)) return true;
  return false;
}

/** "what does 1:8 mean?", "what is this?", "why 8?" */
export const SCREEN_QUESTION = /\bwhat (does|do|is) [^?]{1,30}\bmean\b|\bwhat('?s| is) (this|that)\b|^why\b|\bwhy (is|did|do|does|\d)/;

export type HelpContext = { step: string; fixPart?: "watch" | "try" | "practice" | null };
export type HelpSource =
  | { from: "warmup_tip" }
  | { from: "line"; key: string }
  | { from: "fix_step_hint" }
  | { from: "first_hint" };

export function contextHelpSource(c: HelpContext): HelpSource {
  if (c.fixPart === "watch") return { from: "line", key: "ctx_fix_watch" };
  if (c.fixPart === "try") return { from: "fix_step_hint" };
  if (c.fixPart === "practice") return { from: "line", key: "ctx_fix_practice" };
  if (c.step === "readiness") return { from: "warmup_tip" };
  if (c.step === "guided") return { from: "line", key: "ctx_guided" };
  if (c.step === "video" || c.step === "simulation" || c.step === "worksheet") return { from: "first_hint" };
  return { from: "line", key: "ctx_general" };
}

/** "Didn't catch that" never twice in a row. */
export function mayUseCatch(lastTutorLine: string | undefined, catchLines: string[]): boolean {
  return !lastTutorLine || !catchLines.includes(lastTutorLine);
}
