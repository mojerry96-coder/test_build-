// Pure leaderboard maths: scores, tie ranks, name masking and the Lagos week. No database access.
import type { LeaderMetric } from "@/shared/contracts/leaderboard";

export type Weights = { lesson: number; star: number; quiz: number };
export const DEFAULT_WEIGHTS: Weights = { lesson: 100, star: 10, quiz: 10 };

export type StudentFacts = {
  id: string;
  name: string | null;
  /** Latest "Start again"; nothing before it counts. */
  cutoff: string | null;
  sessions: { started_at: string; completed_at: string | null; status: string; quiz: boolean }[];
  evidence: { created_at: string; correct: boolean | null; is_first_try: boolean; quiz: boolean }[];
};

export type Counts = Record<LeaderMetric, number>;

export function weightsFrom(v: unknown): Weights {
  const o = (v && typeof v === "object" ? v : {}) as Record<string, unknown>;
  const n = (k: keyof Weights) => (typeof o[k] === "number" && Number.isFinite(o[k]) ? (o[k] as number) : DEFAULT_WEIGHTS[k]);
  return { lesson: n("lesson"), star: n("star"), quiz: n("quiz") };
}

/** Monday 00:00 Lagos time (UTC+1, no daylight saving) of the week containing `now`, as an ISO string. */
export function lagosWeekStart(now: Date): string {
  const lagos = new Date(now.getTime() + 3_600_000);
  const day = (lagos.getUTCDay() + 6) % 7; // Monday = 0
  const mid = Date.UTC(lagos.getUTCFullYear(), lagos.getUTCMonth(), lagos.getUTCDate() - day);
  return new Date(mid - 3_600_000).toISOString();
}

/** First name + last initial ("Amara Eze" → "Amara E."). */
export function maskName(name: string | null | undefined): string {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "Student";
  if (parts.length === 1) return parts[0]!;
  return `${parts[0]} ${parts[parts.length - 1]![0]!.toUpperCase()}.`;
}

const within = (t: string | null, from: string | null, to: string | null, cutoff: string | null) =>
  !!t && (!cutoff || t > cutoff) && (!from || t >= from) && (!to || t < to);

/** Counts for one student in the window [from, to). Abandoned lessons never count. */
export function countFor(s: StudentFacts, w: Weights, from: string | null, to: string | null): Counts {
  const lessons = s.sessions.filter((x) => !x.quiz && x.status === "completed" && x.started_at > (s.cutoff ?? "") && within(x.completed_at, from, to, s.cutoff)).length;
  const stars = s.evidence.filter((e) => !e.quiz && e.correct === true && e.is_first_try && within(e.created_at, from, to, s.cutoff)).length;
  const quizzes = s.evidence.filter((e) => e.quiz && e.correct === true && within(e.created_at, from, to, s.cutoff)).length;
  return { lessons, stars, quizzes, overall: lessons * w.lesson + stars * w.star + quizzes * w.quiz };
}

/** Standard competition ranking: equal scores share a rank (100, 100, 80 → 1, 1, 3). */
export function rankRows<T extends { score: number }>(rows: T[]): (T & { rank: number })[] {
  const sorted = [...rows].sort((a, b) => b.score - a.score);
  let rank = 0;
  return sorted.map((r, i) => {
    if (i === 0 || r.score !== sorted[i - 1]!.score) rank = i + 1;
    return { ...r, rank };
  });
}

export type SampleRow = { name: string; week: Partial<Record<"lessons" | "quizzes" | "stars", number>>; all: Partial<Record<"lessons" | "quizzes" | "stars", number>> };

/** Sample classmates from rule leaderboard_samples (bad entries dropped). */
export function samplesFrom(v: unknown): SampleRow[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x): x is SampleRow => !!x && typeof x === "object" && typeof (x as SampleRow).name === "string" && !!(x as SampleRow).name.trim())
    .map((x) => ({ name: x.name.trim(), week: x.week ?? {}, all: x.all ?? {} }));
}

/** A sample's score for one tab and period; Overall uses the same weights as real students. */
export function sampleScore(s: SampleRow, m: LeaderMetric, period: "week" | "all", w: Weights): number {
  const c = period === "week" ? s.week : s.all;
  const n = (k: "lessons" | "quizzes" | "stars") => (typeof c[k] === "number" && Number.isFinite(c[k]) ? Math.max(0, c[k]!) : 0);
  return m === "overall" ? n("lessons") * w.lesson + n("stars") * w.star + n("quizzes") * w.quiz : n(m);
}

/** Her real row(s) plus tagged sample rows, ranked together. */
export function withSamples<T extends { score: number; name: string; me: boolean }>(rows: T[], samples: SampleRow[], m: LeaderMetric, period: "week" | "all", w: Weights) {
  const extra = samples.map((s) => ({ name: s.name, score: sampleScore(s, m, period, w), me: false, sample: true as const }));
  return rankRows<{ name: string; score: number; me: boolean; sample?: true }>([...rows.map((r) => ({ name: r.name, score: r.score, me: r.me })), ...extra]);
}
