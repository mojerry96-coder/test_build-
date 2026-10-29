// Readable page addresses: /[subject]/[chapter]/[quest]/[topic], built from slugs.
// The topic id stays the internal key; slugs are only for URLs.

/** Must match public.slugify() in the database. */
export const slugify = (s: string | null | undefined) =>
  (s ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "general";

export const SUBJECT_MATCH: Record<string, RegExp> = {
  mathematics: /math/i, physics: /physics/i, chemistry: /chem/i, english: /english/i,
};

export function subjectKeyFor(subject: string | null | undefined): string {
  for (const [k, re] of Object.entries(SUBJECT_MATCH)) if (re.test(subject ?? "")) return k;
  return slugify(subject);
}

export type TopicPath = { subject: string; chapter: string; quest: string; topic: string };

export const APP_TITLE = "uLesson Tutor";
export const pageTitle = (...parts: string[]) => [...parts.filter(Boolean), APP_TITLE].join(" · ");

/** True for a lesson page: four segments under a subject (not admin). */
export function isLessonPath(path: string): boolean {
  const seg = path.split("?")[0]!.split("/").filter(Boolean);
  return (seg.length === 4 || (seg.length === 5 && seg[4] === "intro")) && seg[0] !== "admin" || seg[0] === "lesson";
}
