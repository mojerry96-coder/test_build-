// Leaderboard shapes shared by the server and the Leaderboard page.
export type LeaderMetric = "overall" | "lessons" | "quizzes" | "stars";
export type LeaderPeriod = "week" | "all";

export type LeaderRow = { rank: number; name: string; score: number; me: boolean; /** Demo classmate from rule leaderboard_samples, shown only while she has no class. */ sample?: boolean };
export type LeaderMe = { rank: number; score: number; /** Places moved up since last week (negative = down). */ delta: number };

export type LeaderboardData = {
  period: LeaderPeriod;
  /** True when she is not in any class yet (only her own row is shown). */
  alone: boolean;
  boards: Record<LeaderMetric, LeaderRow[]>;
  me: Record<LeaderMetric, LeaderMe>;
  /** Approved note shown under the board when sample classmates fill it. */
  sampleNote?: string | null;
  /** Fiti's approved line about her place. */
  fitiLine: string;
};
