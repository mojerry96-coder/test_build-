// Home helper tips (seed wording, awaiting Instructional Design approval).
const BASE = [
  "Start with Mathematics, your first topic is ready.",
  "You can pause any lesson and pick up where you stopped.",
  "Stuck in a lesson? Ask me anything about it, I'm right there with you.",
];
const WAITING = "Your lesson is waiting. Tap Continue Lesson to pick up where you stopped.";

/** Tips in order; the "lesson waiting" tip leads only when a lesson is in progress. */
export function homeTips(hasLesson: boolean): string[] {
  return hasLesson ? [WAITING, ...BASE] : BASE;
}

/** Next tip index: -1 is the greeting; tips then loop back to the first. */
export const nextTip = (i: number, n: number) => (i + 1) % n;

/** Helper bubble on a chapter page: the first open quest. Shared so the server can note it for the voice. */
export const nextAdventure = (quest: string) => `Our next adventure is ${quest}.`;
