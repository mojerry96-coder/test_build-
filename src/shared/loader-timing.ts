/** Loads faster than this never show the loader, so nothing flashes. */
export const LOADER_SHOW_DELAY_MS = 300;
export const LOADER_SLOW_MS = 8000;
export const LOADER_CAP = 0.9;
/** Once ready, the line runs to the end, then the loader fades to reveal the page. */
export const LOADER_FINISH_MS = 250;
export const LOADER_FADE_MS = 200;
export const shouldShowLoader = (elapsedMs: number) => elapsedMs >= LOADER_SHOW_DELAY_MS;
/** Fill of the loading line: quick at first, slowing, never past 90% until the page is ready. */
export const loaderProgress = (elapsedMs: number, ready = false) =>
  ready ? 1 : elapsedMs <= 0 ? 0 : LOADER_CAP * (1 - Math.exp(-elapsedMs / 1800));
/** Finish phase only when the loader was visible; never adds more than 0.5 s. */
export const finishPlan = (wasShown: boolean) =>
  wasShown ? { finish: true, totalMs: LOADER_FINISH_MS + LOADER_FADE_MS } : { finish: false, totalMs: 0 };
/** After tapping Solo Mode the loader shows at once and stays at least this long, so it never blinks. */
export const LOADER_MIN_AFTER_TAP_MS = 1000;
