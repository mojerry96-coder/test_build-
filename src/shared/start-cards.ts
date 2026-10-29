/**
 * TEMPORARY DISPLAY CONFIG: the three cards under the ask box on the Ask start screen (from the design).
 * Moves into the content pack later. Only cards with `send` can be tapped; the rest are "Coming soon".
 */
export type StartCard = { key: "maths" | "science" | "english"; title: string; line: string; send?: { text: string; mode: "tutor" | "quiz" } };
export const START_CARDS: StartCard[] = [
  { key: "maths", title: "Practice Maths", line: "Solve it step by step", send: { text: "quiz me", mode: "quiz" } },
  { key: "science", title: "Explore Science", line: "Discover something else" },
  { key: "english", title: "English Language", line: "Learn composition" },
];
