# Loader after tapping Auto Pilot

## What she sees
1. She taps **Auto Pilot**: the button presses down with the tap sound.
2. The heading and buttons fade out and the new loader appears in their place, on the same background, with the uLesson logo and Dark mode pill staying where they are (exactly as your loader design).
3. Waving Fiti with glasses, and the blue-to-yellow line filling gradually under him while Ask Fiti gets ready (her chat, streak and Fiti's opening).
4. When Ask Fiti is ready, the line runs to the end, the loader fades, and Ask Fiti fades in.

## Rules
- The loader always shows after this tap, for at least about 1 s, so it reads as a real step and never blinks.
- The line follows real loading: slow network means a slower fill, stopping at about 90% until ready.
- After 8 s, a small "Still loading…" line appears. If loading fails, she still moves to Ask Fiti, which shows its own "That didn't load" message.
- One tap only: tapping again while it loads does nothing.
- Tutor Mode is unchanged (tap sound only).
- Reduced motion: Fiti stays still and everything uses plain fades.
- Dark mode: dark page, same Fiti and line; text stays readable.
- Phones: Fiti and the line shrink together and stay centred.
- Screen readers hear "Loading" once.

## Also included
- No double loader: Ask Fiti doesn't show its own loader on top after this one.
- The Dark mode pill still works while loading, and Fiti and the line switch colours with it.
- Ask Fiti still opens on the "Ready to learn" page, as before.
- Music keeps playing smoothly through the switch, with no restart.
- If she signed in from a link to a specific page, she still goes there (this page and loader are skipped).
- The browser Back button from Ask Fiti returns to Choose learning path without showing the loader again.

## Technical details
- `choose.tsx`: `loading` state; on Auto Pilot it renders `FitiLoader` (new `minMs` prop) in place of the heading/buttons and runs `router.preloadRoute({ to: "/" })` plus the Ask Fiti query prefetches, then navigates; the existing finish overlay runs the line to 100%.
- Minimum show time `LOADER_MIN_AFTER_TAP_MS` (1000) in `src/shared/loader-timing.ts`, with a targeted test.
- Checked on screen on a slowed connection at laptop and phone size, light and dark.
