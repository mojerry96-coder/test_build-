// Topic intro welcome: which approved line to use, filled from the student's situation.
export const greetingFor = (hour: number) => (hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening");

/** Warm-up count words, matching the questions she will actually get. */
export const warmupWords = (n: number) => (n >= 3 ? "three questions" : n === 2 ? "two quick questions" : "one quick question");

const DAY = 86_400_000;
/** Greeting line key: first lesson ever, back after more than 2 days, otherwise time-of-day. */
export function welcomeKey(lastSessionAt: string | null, now = Date.now()): string {
  if (!lastSessionAt) return "intro_welcome_first";
  return now - new Date(lastSessionAt).getTime() > 2 * DAY ? "intro_welcome_back" : "intro_welcome";
}

export const nextKey = (warmups: number) => (warmups > 0 ? "intro_next_warmup" : "intro_next_skip");
