/**
 * TEMPORARY DISPLAY CONFIG — quest cards on "Choose a quest" (Coordinate Geometry).
 * Names, glyphs and descriptions come from the Figma design and move into the content pack later.
 * A quest is OPEN only when the topics table has an active topic in it.
 */
export type QuestDisplay = { num: number; name: string; glyph: "m" | "d" | "half" | "xy"; description: string };

export const QUESTS_BY_CHAPTER: Record<string, QuestDisplay[]> = {
  "coordinate geometry": [
    { num: 1, name: "Lines and Their Steepness", glyph: "m", description: "Calculate gradient, compare steepness, and understand line direction." },
    { num: 2, name: "Distance Between Points", glyph: "d", description: "Measure the distance between coordinates using the distance formula." },
    { num: 3, name: "Midpoint of a Line", glyph: "half", description: "Find the point exactly halfway between two coordinates." },
    { num: 4, name: "Equations of Straight Lines", glyph: "xy", description: "Build and interpret equations in the form y equals m x plus c." },
  ],
};

const norm = (s: string) => s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, " ").trim();

type TopicLike = { chapter: string | null; quest: string | null; displayName: string; secure?: boolean };
export type QuestRow = QuestDisplay & { open: boolean; dbName: string | null; nextTopic: string | null };

/** Rows in design order; open = an active topic exists in that quest. Unknown DB quests are appended. */
export function questRows(chapter: string, topics: TopicLike[]): QuestRow[] {
  const design = QUESTS_BY_CHAPTER[norm(chapter)] ?? [];
  const rows: QuestRow[] = design.map((q) => {
    const mine = topics.filter((t) => t.quest && norm(t.quest) === norm(q.name));
    return { ...q, open: mine.length > 0, dbName: mine[0]?.quest ?? null, nextTopic: (mine.find((t) => !t.secure) ?? mine[0])?.displayName ?? null };
  });
  const extra = [...new Set(topics.map((t) => t.quest).filter((q): q is string => !!q && !design.some((d) => norm(d.name) === norm(q))))];
  extra.forEach((q, i) => {
    const mine = topics.filter((t) => t.quest === q);
    rows.push({ num: design.length + i + 1, name: q, glyph: "xy", description: "", open: true, dbName: q, nextTopic: mine[0]?.displayName ?? null });
  });
  return rows;
}
