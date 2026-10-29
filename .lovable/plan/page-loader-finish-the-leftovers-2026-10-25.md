# Page loader: finish the leftovers

## 1. Line runs to 100% before the page appears
- When the page is ready, the line runs smoothly from wherever it is to the end (about 0.25 s). Then Fiti and the line fade out (about 0.2 s) and the page shows.
- Fast pages that never showed the loader (under 0.3 s) still open straight away, with no extra wait.
- The finish adds at most about half a second, and only when the loader was visible.

## 2. Page fade-in
- After the loader, the page fades in softly (about 0.25 s) in the same spot, with no jump in layout.
- Reduced motion: plain quick fade, no movement.

## 3. Dark-mode readability check
- Add the loader's dark colours to the existing readability check: the "Still loading…" text on the dark page, and the line against its track.
- If a pair fails, adjust only that dark colour.

## 4. On-screen check
- Look at it on a laptop (1433×892) and a phone (390×844), in light and dark, on a slowed-down connection so the loader is visible.
- Confirm: Fiti centred, line fills gradually, runs to the end, page fades in, and no white box around Fiti in dark mode.
- Also use the Choose learning path background behind the loader on pages without the side bar, as the earlier plan said.

## 5. Also included
- If loading fails, the line stops and the page's "That didn't load" message fades in instead; the line never reaches 100% for a failure.
- Tapping to another page while the loader shows cancels the finish at once, so it never delays her.
- After Start again, the loader starts fresh from empty, never half-full.
- Screen readers hear "Loading" once and nothing when the line finishes.
- The loader never shows under the opening splash.
- Lesson and quiz pages use the same finish and fade.

## Technical details
- `PageSkeleton` stays the entry point. A small `LoaderGate` wrapper (in `src/components/learn/PageStates.tsx`) keeps the loader mounted for a short finish phase after data is ready: it passes `ready` to `FitiLoader`, which calls `loaderProgress(t, true)` and animates to 1, then unmounts and the page renders with a `page-fade-in` class.
- Finish timings (`LOADER_FINISH_MS`, `LOADER_FADE_MS`) added to `src/shared/loader-timing.ts` with a targeted test: no finish phase when the loader never showed; finish never longer than 500 ms.
- Keyframe `page-fade-in` in `src/styles.css`, with a reduced-motion variant.
- New pairs in `src/test/dark-contrast.test.ts`; run only that test and the loader-timing test.
