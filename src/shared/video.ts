// Video step rules shared by the player and the server: seek limits, evidence strength, chat moves.

/** Furthest second she may reach: the first unanswered check (she can't skip past it). */
export function seekLimit(checks: { atSeconds: number; itemId: string }[], answered: (id: string) => boolean, duration: number): number {
  const open = checks.filter((c) => !answered(c.itemId)).map((c) => c.atSeconds).sort((a, b) => a - b)[0];
  return open ?? duration;
}

/** Clamp a seek target to [0, limit]. */
export function clampSeek(target: number, limit: number): number {
  return Math.max(0, Math.min(target, limit));
}

/**
 * Evidence strength for a video check try (PRD STU-15):
 * strong = right first try (Sure or no help); moderate = right after try-1 feedback;
 * weak = right after the try-2 example; none = needed try 3 or still not right.
 */
export function videoStrength(correct: boolean, attempt: number, confidence: string | null = null): "strong" | "moderate" | "weak" | "none" {
  if (!correct || attempt >= 3) return "none";
  if (attempt === 1) return confidenceStrength(confidence) ?? "strong";
  return attempt === 2 ? "moderate" : "weak";
}

/** Right first try: Sure → strong, Think so → moderate, Guessing → weak (a possible lucky guess). null = not asked. */
export function confidenceStrength(confidence: string | null): "strong" | "moderate" | "weak" | null {
  return confidence === "sure" ? "strong" : confidence === "think_so" ? "moderate" : confidence === "guessing" ? "weak" : null;
}

/** Firm misconception = wrong with "Sure"; lucky guess = right with "Guessing". */
export const isFirm = (correct: boolean, confidence: string | null) => !correct && confidence === "sure";
export const isLuckyGuess = (correct: boolean, confidence: string | null) => correct && confidence === "guessing";

/** The segment playing at a given second. */
export function segmentAt<T extends { start: number; end: number }>(segments: T[], t: number): T | undefined {
  return segments.find((s) => t >= s.start && t < s.end) ?? segments.at(-1);
}

/** What she typed during the video: asking for the answer, asking what the video said, or anything else. */
export function pickVideoMove(raw: string): "answer" | "summary" | null {
  const t = raw.toLowerCase().replace(/\s+/g, " ").trim();
  if (/\b(tell|give|show) me the answer\b|\bwhat('s| is) the answer\b|\banswer (is|please)\b|^answer\??$/.test(t)) return "answer";
  if (/\bwhat (did|does) (the |this )?video (say|mean)|\b(repeat|replay|say) (that|it) again\b|\bwhat did (it|she|he|you) (just )?say\b|\bi missed (that|it)\b/.test(t)) return "summary";
  return null;
}
