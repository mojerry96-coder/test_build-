/** Splash timings (ms). Pure so it can be tested. */
export type SplashExit = { bar: number; letters: number; letterGap: number; fiti: number; fitiDur: number; backdrop: number; backdropDur: number; total: number };
export type SplashPlan = { letters: boolean; minShow: number; fillStart: number; minFill: number; slowNote: number; readyCap: number; exit: SplashExit; reduce: boolean };

/** Staged close: bar shrinks, letters lift away, Fiti hops off, then the backdrop fades. Skip runs it at double speed. */
export function exitPlan(reducedMotion: boolean, skipped: boolean): SplashExit {
  if (reducedMotion) return { bar: 0, letters: 0, letterGap: 0, fiti: 0, fitiDur: 0, backdrop: 0, backdropDur: 400, total: 400 };
  const k = skipped ? 0.5 : 1;
  const e = { bar: 0, letters: 120 * k, letterGap: 60 * k, fiti: 200 * k, fitiDur: 450 * k, backdrop: 450 * k, backdropDur: 450 * k, total: 0 };
  e.total = e.backdrop + e.backdropDur;
  return e;
}

export function splashPlan(firstToday: boolean, reducedMotion: boolean): SplashPlan {
  const base = { slowNote: 8000, readyCap: 1500, exit: exitPlan(reducedMotion, false), reduce: reducedMotion };
  if (reducedMotion) return { ...base, letters: false, minShow: 1100, fillStart: 300, minFill: 800 };
  if (!firstToday) return { ...base, letters: false, minShow: 1200, fillStart: 0, minFill: 800 };
  return { ...base, letters: true, minShow: 2200, fillStart: 1300, minFill: 800 };
}

/**
 * The close may start once loading is done and the minimum show time and fill have passed,
 * and the page has drawn real content — or `readyCap` ms after that if it still shows placeholders.
 */
export function mayClose(p: SplashPlan, elapsed: number, loaded: boolean, skipped: boolean, pageReady = true, waitedForPage = 0): boolean {
  if (skipped) return true;
  if (!loaded || elapsed < Math.max(p.minShow, p.fillStart + p.minFill)) return false;
  return pageReady || waitedForPage >= p.readyCap;
}
export function lagosDay(now: Date): string { return new Date(now.getTime() + 3600_000).toISOString().slice(0, 10); }
