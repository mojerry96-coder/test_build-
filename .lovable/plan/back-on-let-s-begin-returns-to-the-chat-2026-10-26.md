# Back on "Let's Begin" returns to the chat

## What goes wrong today
- Back only returns to the chat when the map was opened with a hidden "came from chat" note. Some ways in (the topic re-address on open, Learning Hub cards, a reload, Fiti's buttons in some cases) drop that note, so Back sends her to the chapter page instead.
- Even when Back does go to Ask Fiti, the page can open on the "Ready to learn" start page instead of the conversation: if her chat so far is only Fiti's lines plus button taps, the page treats it as "not started yet".
- The "Ready to pick up where you stopped?" line can be lost when the saved conversation finishes loading a moment later and the page redraws.

## What changes
- Back on the map goes back to exactly where she came from: if the previous screen was the Ask Fiti chat, it returns to that chat, scrolled to the newest message (using the new auto-scroll).
- If there is no earlier screen (opened from a link or after reload) and the map was reached from the chat, Back opens Ask Fiti with the conversation showing.
- Coming back from the map always opens the conversation view, never the empty "Ready to learn" page, and shows the "Continue learning" button once (no duplicates).
- Opened from Learning Hub / chapter pages, Back keeps going to that chapter, as now.
- The same Back behaviour on phones and in dark mode; the browser's own back button behaves the same way.

## Technical details
- `src/routes/_authenticated/$subject.$chapter.$quest.$topic_.path.tsx`: keep `search.from` on the redirect at the topic re-address (line ~80). Back button: if `from === "chat"` and the router history has a previous in-app entry, call `router.history.back()`; otherwise Link to `/` with `resume`.
- `src/routes/_authenticated/index.tsx`: when `resume` is present, force the chat view (`started` true) and run the resume line after history has loaded (wait for `hist` before adding, so the `key={conv}` remount does not drop it); dedupe against an existing Continue button via `src/shared/continue-link.ts`.
- Mark Fiti button taps as "started" in `useFitila` so a chat with taps but no typed message still reopens as a conversation; extend `src/test` start-page test with this case.
- Verify in the app: chat -> Continue -> map -> Back lands on the chat at the newest message; Learning Hub -> map -> Back lands on the chapter.
