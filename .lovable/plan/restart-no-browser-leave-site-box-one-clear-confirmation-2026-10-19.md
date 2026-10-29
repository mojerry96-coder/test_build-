# Restart: no browser "Leave site?" box, one clear confirmation

## What changes
1. **Browser box gone.** Restarting will no longer show Chrome's grey "Leave site? Changes may not be saved" box. Her place is always saved in the background, so the warning isn't needed anywhere in the lesson. Closing the tab will no longer show it either.
2. **Better confirmation.** The small text box in the admin panel is replaced by a centred dialog that matches the app:
   - Title: "Start again from the beginning?"
   - Short list of what is reset: your lessons and progress (back to 0), warm-up answers and hook choices, "seen" screens like Meet your tutor.
   - Reassurance line: "Students' lessons and your sign-in are not touched."
   - Buttons: "Restart" (purple admin colour) and "Cancel". Escape or clicking outside cancels. Focus starts on Cancel.
   - While it runs: "Restarting…" with a spinner, buttons off. On success it closes and Home opens with "Started again". On failure it stays open with a short error and lets you try again.
3. The restart itself works exactly as before (true fresh start, logged).

## Technical notes
- Cause: `useBlocker` in `LessonScreen.tsx` registers a `beforeunload` handler by default (`enableBeforeUnload` is true); the restart's `window.location.assign("/")` triggers it. Set `enableBeforeUnload: false` (the blocker already never blocks in-app navigation).
- `DevToolsPanel.tsx` restart section: replace inline text/buttons with shadcn `AlertDialog`, admin tokens only, no hard-coded colours.
- Check in the browser from a lesson step: Restart → no browser box → Home shows Start learning.
