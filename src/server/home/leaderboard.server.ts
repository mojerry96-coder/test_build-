// Leaderboard for her class: classmates = everyone in any class run by the teacher(s) of her classes.
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import type { LeaderboardData, LeaderMetric, LeaderPeriod, LeaderRow } from "@/shared/contracts/leaderboard";
import { countFor, lagosWeekStart, maskName, rankRows, samplesFrom, weightsFrom, withSamples, type StudentFacts } from "./leaderboard";
import { homeLine } from "./agent.server";

type Db = SupabaseClient<Database>;
const METRICS: LeaderMetric[] = ["overall", "lessons", "quizzes", "stars"];
const quizOf = (state: unknown) => (state as { kind?: string } | null)?.kind === "quiz";

async function classmates(admin: Db, userId: string): Promise<string[]> {
  const { data: mine } = await admin.from("class_members").select("class_session_id").eq("student_id", userId);
  const ids = (mine ?? []).map((r) => r.class_session_id);
  if (!ids.length) return [];
  const { data: cs } = await admin.from("class_sessions").select("instructor_id").in("id", ids);
  const teachers = [...new Set((cs ?? []).map((r) => r.instructor_id))];
  const { data: all } = await admin.from("class_sessions").select("id").in("instructor_id", teachers);
  const { data: mem } = await admin.from("class_members").select("student_id").in("class_session_id", (all ?? []).map((r) => r.id));
  return [...new Set((mem ?? []).map((r) => r.student_id))];
}

export async function loadLeaderboard(admin: Db, userId: string, period: LeaderPeriod, now = new Date()): Promise<LeaderboardData> {
  const mates = await classmates(admin, userId);
  const alone = mates.filter((id) => id !== userId).length === 0;
  const ids = [...new Set([userId, ...mates])];
  const [{ data: profiles }, { data: sessions }, { data: ev }, { data: audits }, { data: w }] = await Promise.all([
    admin.from("profiles").select("id, display_name").in("id", ids),
    admin.from("sessions").select("student_id, started_at, completed_at, status, state").in("student_id", ids),
    admin.from("evidence").select("student_id, created_at, correct, is_first_try, status").in("student_id", ids),
    admin.from("admin_audit").select("actor_id, created_at").eq("action", "dev_tool_used").contains("details", { section: "restart_journey" }).in("actor_id", ids),
    admin.from("rules").select("value").eq("key", "leaderboard_weights").limit(1).maybeSingle(),
  ]);
  // Demo only: sample classmates fill the board while she has no class (rule leaderboard_samples).
  const samples = alone ? samplesFrom((await admin.from("rules").select("value").eq("key", "leaderboard_samples").limit(1).maybeSingle()).data?.value) : [];
  const weights = weightsFrom(w?.value);
  const facts: StudentFacts[] = ids.map((id) => ({
    id,
    name: profiles?.find((p) => p.id === id)?.display_name ?? null,
    cutoff: (audits ?? []).filter((a) => a.actor_id === id).map((a) => a.created_at).sort().pop() ?? null,
    sessions: (sessions ?? []).filter((s) => s.student_id === id).map((s) => ({ started_at: s.started_at, completed_at: s.completed_at, status: s.status, quiz: quizOf(s.state) })),
    evidence: (ev ?? []).filter((e) => e.student_id === id).map((e) => ({ created_at: e.created_at, correct: e.correct, is_first_try: e.is_first_try, quiz: e.status === "quiz" })),
  }));

  const week = lagosWeekStart(now);
  const lastWeek = new Date(new Date(week).getTime() - 7 * 86_400_000).toISOString();
  // Now vs. one week back, for the "moved up" arrow.
  const [nowFrom, nowTo, prevFrom, prevTo] = period === "week" ? [week, null, lastWeek, week] : [null, null, null, week];
  const cur = facts.map((f) => ({ f, c: countFor(f, weights, nowFrom, nowTo) }));
  const prev = facts.map((f) => ({ f, c: countFor(f, weights, prevFrom, prevTo) }));

  const boards = {} as Record<LeaderMetric, LeaderRow[]>;
  const me = {} as LeaderboardData["me"];
  for (const m of METRICS) {
    const ranked = rankRows(cur.map(({ f, c }) => ({ id: f.id, name: f.id === userId ? "You" : maskName(f.name), score: c[m], me: f.id === userId })));
    const before = rankRows(prev.map(({ f, c }) => ({ id: f.id, score: c[m] })));
    const shown = samples.length ? withSamples(ranked, samples, m, period, weights) : ranked;
    boards[m] = shown.map((r) => ({ rank: r.rank, name: r.name, score: r.score, me: r.me, ...("sample" in r && r.sample ? { sample: true } : {}) }));
    const mine = shown.find((r) => r.me)!;
    const was = before.find((r) => r.id === userId)!;
    me[m] = { rank: mine.rank, score: mine.score, delta: alone ? 0 : was.rank - mine.rank };
  }

  const first = maskName(facts.find((f) => f.id === userId)?.name).split(" ")[0]!;
  const o = me.overall;
  const key = alone ? "leaderboard_alone" : o.score === 0 ? "leaderboard_start" : o.rank === 1 ? "leaderboard_top" : "leaderboard_place";
  const fitiLine = (await homeLine(admin, key, { first_name: first, rank: o.rank })).join(" ");
  const sampleNote = samples.length ? (await homeLine(admin, "leaderboard_sample_note", {})).join(" ") : null;
  return { period, alone, boards, me, fitiLine, sampleNote };
}
