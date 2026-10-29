# Finish the Continue Learning button

## What changes for the student
1. **Always points somewhere useful.** If her in-progress topic is finished or locked, the button opens her next open topic's map instead of falling back to the old "Start" chip. If nothing is open, she sees "Quiz me" as today.
2. **Words come from the content.** The label ("Continue Learning") is read from an approved content line, so the team can change it without code. If the line is missing, "Continue Learning" shows.
3. **Readable in dark mode.** The button's text, border and bottom edge are checked against the dark background to pass the readability rule.
4. **Loader after tapping.** Tapping plays the tap sound, then the Fiti loader appears while the map loads (at least about 1 second, like Auto Pilot), then the map shows.

## Technical section
- `src/server/home/opening.server.ts` `startBtns`: pick `allPlan.find(continue && !done && !locked) ?? allPlan.find(!done && !locked)`; label from `homeLine(admin, "home_continue_label")[0] ?? "Continue Learning"` (make `startBtns` async, update callers).
- `content/packs/MTH12_09_02_01.seed.json`: add fallback line `home_continue_label`; reload with `bun ./scripts/load-seed.ts`.
- `src/test/dark-contrast.test.ts`: add pairs `fh-heading` on `fh-card` and `fh-heading` on `fh-page` (dark), 4.5:1; adjust the `.dark` token only if it fails.
- `FitilaAgent.tsx` `ContinueButton`: on tap play `tap` sound, show `<FitiLoader delayMs={0} />` overlay, preload the map route, wait `LOADER_MIN_AFTER_TAP_MS`, then navigate (same pattern as `choose.tsx`).
- Test in `src/test/opening-ack.test.ts`: finished/locked topic falls back to the next open one.
- Verify once in the browser as a returning student: tap Continue, loader shows, map opens.

## Also included
- One tap only: a second tap while loading does nothing, and the loader never shows twice.
- If the map fails to load, the loader goes away and Fiti says the approved "try again" line; the button works again.
- Phones: full-width button above the ask box, loader sized for small screens.
- Back from the map returns to the chat without re-showing the loader.
- Screen readers hear the button label and "Loading" once.
