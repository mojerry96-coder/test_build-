# Start again gives a clean slate without refreshing

## Why it happens
Start again resets everything on the server, but some screens keep what they already showed:
- The Ask Fiti chat holds its messages on screen, and it isn't rebuilt when you are sent to Home (you are often already there).
- The map chat on the Let's Begin page does the same.
- A few one-visit settings stay as they were until a refresh: the welcome bubble ("closed this visit") and the tutor voice queue.

## Fix
1. **Rebuild the app after Start again:** once the restart succeeds, the whole app screen is rebuilt from scratch, as a refresh would do, but instantly and without reloading the page. Every chat, map and lesson screen then starts empty and loads fresh.
2. **Clear the one-visit settings too:** the welcome bubble shows again, and any speech still playing stops.
3. **Order:** the saved data is cleared first, then you land on Home and see the fresh opening from Fiti (the intro after a restart), with no old messages.
4. Sound and music settings and your sign-in stay unchanged.

## Technical details
- New `src/lib/restart-epoch.ts`: a tiny store (`useRestartEpoch`, `bumpRestartEpoch`) plus a `onRestart(fn)` registry for module-level resets.
- `__root.tsx`: wrap `<Outlet />` in `<Fragment key={epoch}>` so all routes remount.
- `HomeParts.tsx` registers a reset for `bubbleClosedThisVisit`. `voice.ts` gets `stopAll()` registered.
- `RestartDialog.run`, after `mine()`:
  - `resetSeenFlags()`
  - `qc.cancelQueries()`, then `qc.clear()`
  - `bumpRestartEpoch()` (this runs the registered resets)
  - `await navigate({ to: "/", replace: true })`, then `router.invalidate()`
- Small test `src/test/restart-epoch.test.ts`: bump increments the epoch and runs every registered reset once. Run only that test.
