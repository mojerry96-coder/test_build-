# Full splash every time the link is opened

## What happens today
The splash already shows each time the app is opened, but the full version (Fiti waving, the tutor's name springing in, the "ta-dum" sound) plays only on the first open of the day. Later opens that day get a short version without the name.

## Change
- Every time someone opens the link (clicks it, types it, refreshes, or opens a shared page link), the full splash plays.
- Moving between pages inside the app still never shows it.
- Reduced-motion users still get the calm short version.
- Skip still works.

## Technical details
- `src/components/splash/Splash.tsx`: stop using the `ul.splashDay` once-per-day check; always pass `firstToday = true` to `splashPlan`.
- `src/shared/splash-plan.ts` unchanged; update its test only if it relies on the day check.
- Update the splash rule in `AGENTS.md`.
