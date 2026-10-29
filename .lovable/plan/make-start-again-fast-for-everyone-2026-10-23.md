# Make "Start again" fast for everyone

## What I found
- Restarts finish correctly (the records show every recent one saved), so the issue is speed, not failure.
- Accounts with the admin role take a slower route. After resetting, it also builds a brand-new preview lesson in the background, which nobody uses at that moment. That's the extra wait those users see.
- For everyone, the reset runs its steps one after another (check the last restart, end open lessons, save the record, new Ask Fiti chat, reset the welcome talk), each waiting on the one before.
- After it finishes, the whole app reloads from scratch, which replays the loading splash and fetches everything again.

## Changes
1. **One shared restart for students and admins**: admins use the same quick reset as students. The unused preview lesson is no longer built during a restart; it's still made when an admin opens a lesson from the admin tools.
2. **Steps run together**: once the one-minute check passes, ending open lessons, the new Ask Fiti chat and the welcome reset run at the same time, and the record is saved last, as now.
3. **No full reload**: after a restart, the app clears its saved data and goes straight to Home without reloading the page or replaying the splash.
4. **Clear feedback**: the Restart button shows "Restarting…" straight away. If it takes over 8 seconds, she gets a "Still working…" note and a Try again button rather than a frozen box.
5. **Timing log**: each restart records how long it took, so slow ones show up in the session debug page.

## Checks
- Time a restart before and after the change for a student account and for an admin account, using the test browser. Target: under 2 seconds to Home.
- Update the existing restart test so it confirms admins and students take the same route and the one-minute wait still applies.

## Technical details
- `src/server/functions/dev-tools.server.ts` `restart_journey`: delegate to `restartMyJourney` and drop `startPreview`.
- `src/server/home/restart.server.ts`: `Promise.all` for the sessions update, `home_conversations` insert and `resetIntro`, then the audit insert. Add `ms` to the audit details.
- `src/components/RestartDialog.tsx`: replace `window.location.assign("/")` with `qc.clear()` + `router.invalidate()` + `navigate({ to: "/" })`, and add the 8 s timeout state.
