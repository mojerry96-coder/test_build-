// Navigation catalogue for the subject picker. Lesson content still comes only from the database;
// a subject opens when an active topic's subject matches it.
import type { MeTopic } from "@/lib/api/me.functions";

export type SubjectKey = "mathematics" | "physics" | "chemistry" | "english";
export const SUBJECTS: { key: SubjectKey; label: string; match: RegExp }[] = [
  { key: "mathematics", label: "Mathematics", match: /math/i },
  { key: "physics", label: "Physics", match: /physics/i },
  { key: "chemistry", label: "Chemistry", match: /chem/i },
  { key: "english", label: "English", match: /english/i },
];

/** Live subjects on the Home page: they open a real flow built from the topics table. */
export const LIVE_HOME_SUBJECTS = ["mathematics"] as const;

/**
 * PLACEHOLDER SUBJECTS — design-only cards shown as "Coming later" on Home.
 * Not clickable, no content. Remove entries here when a subject goes live.
 */
export const PLACEHOLDER_SUBJECTS = [
  "english", "economics", "accounting", "chemistry", "literature", "biology", "government", "physics",
] as const;

/** Home grid order, exactly as the design. */
export const HOME_SUBJECT_ORDER = [
  "mathematics", "english", "economics", "accounting", "chemistry", "literature", "biology", "government", "physics",
] as const;
export type HomeSubjectKey = (typeof HOME_SUBJECT_ORDER)[number];
export const HOME_SUBJECT_LABELS: Record<HomeSubjectKey, string> = {
  mathematics: "Mathematics", english: "English Language", economics: "Economics", accounting: "Accounting",
  chemistry: "Chemistry", literature: "Literature In English", biology: "Biology", government: "Government", physics: "Physics",
};

export { slugify as slug } from "@/shared/routes";

export function topicsFor(topics: MeTopic[], subject: string) {
  const def = SUBJECTS.find((s) => s.key === subject);
  return def ? topics.filter((t) => def.match.test(t.subject ?? "")) : [];
}

/** Number of distinct chapters that have an active topic. */
export const chapterCount = (topics: MeTopic[]) => new Set(topics.map((t) => t.chapter ?? "General")).size;

export function groupBy<T>(rows: T[], key: (r: T) => string) {
  const out = new Map<string, T[]>();
  for (const r of rows) out.set(key(r), [...(out.get(key(r)) ?? []), r]);
  return out;
}

export type TopicStatus = "secure" | "in_progress" | "not_started";
export const topicStatus = (t: MeTopic): TopicStatus => (t.secure ? "secure" : t.activeSessionId || t.completed ? "in_progress" : "not_started");
