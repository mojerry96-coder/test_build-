/**
 * TEMPORARY DISPLAY CONFIG — Mathematics chapter cards on "Choose a chapter".
 * Numbers, symbols, colour slots and one-line descriptions come from the Figma design and
 * are meant to move into the content pack later. Which chapters are OPEN is never decided
 * here: a chapter opens only when the topics table has an active topic in it.
 */
export type ChapterDisplay = {
  num: number;
  name: string;
  /** Text symbol; shown when no image is given. */
  symbol: string;
  /** Key of an uploaded symbol image (src/assets/chapters). */
  image?: "xy" | "infinity" | "pir2" | "triangle" | "sin" | "integral";
  description: string;
};

export const MATHS_CHAPTERS: ChapterDisplay[] = [
  { num: 1, name: "Number & Numeration", symbol: "∞", image: "infinity", description: "Master numbers, bases and sequences" },
  { num: 2, name: "Algebraic Processes", symbol: "x²", description: "Turn patterns into powerful equations" },
  { num: 3, name: "Mensuration", symbol: "πr²", image: "pir2", description: "Measure shapes, spaces and solids" },
  { num: 4, name: "Plane Geometry", symbol: "△", image: "triangle", description: "Discover rules hidden inside shapes" },
  { num: 5, name: "Coordinate Geometry", symbol: "(x,y)", image: "xy", description: "Plot points and decode straight lines" },
  { num: 6, name: "Trigonometry", symbol: "sin", image: "sin", description: "Connect angles, sides and ratios" },
  { num: 7, name: "Statistics & Probability", symbol: "P(A)", description: "Read data and predict what comes next" },
  { num: 8, name: "Calculus", symbol: "∫", image: "integral", description: "Explore change, rates and motion" },
];

const norm = (s: string) => s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, " ").trim();
export const sameChapter = (a: string | null | undefined, b: string) => !!a && norm(a) === norm(b);

type TopicLike = { chapter: string | null; quest: string | null; activeSessionId: string | null; lastWorkedAt: string | null };

/** CURRENT: chapter of the active session; else the chapter last worked in; else none. */
export function currentChapterName(topics: TopicLike[]): string | null {
  const active = topics.find((t) => t.activeSessionId);
  if (active?.chapter) return active.chapter;
  const worked = topics.filter((t) => t.lastWorkedAt).sort((a, b) => (b.lastWorkedAt! > a.lastWorkedAt! ? 1 : -1));
  return worked[0]?.chapter ?? null;
}

/** Grid order exactly as the design (current chapter is then moved to the front). */
export const DESIGN_ORDER = [5, 2, 3, 4, 1, 6, 7, 8];

export type ChapterRow = ChapterDisplay & { open: boolean; quests: number; current: boolean; dbName: string | null };

/** Card rows: current first, then the design order. Open = has an active topic. */
export function chapterRows(topics: TopicLike[]): ChapterRow[] {
  const current = currentChapterName(topics);
  const rows = MATHS_CHAPTERS.map((c) => {
    const mine = topics.filter((t) => sameChapter(t.chapter, c.name));
    return {
      ...c, open: mine.length > 0, quests: new Set(mine.map((t) => t.quest ?? "")).size,
      current: !!current && sameChapter(current, c.name), dbName: mine[0]?.chapter ?? null,
    };
  });
  const byDesign = DESIGN_ORDER.map((n) => rows.find((r) => r.num === n)!);
  return [...byDesign.filter((r) => r.current), ...byDesign.filter((r) => !r.current)];
}

/** Small decorations (bottom-left, top-right), alternating card to card as in the design. */
export const decoFor = (num: number): [string, string] => (num % 2 ? ["×", "○"] : ["+", "△"]);
