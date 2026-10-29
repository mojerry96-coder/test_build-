# Cleaner splash close

## Problem (from the screenshot)
Right now the whole splash grows to 2.6 times its size while it fades. Halfway through, a huge see-through "Fiti", a cut-off parrot and the loading bar hang over the page. The page behind it is also still showing its grey placeholder boxes, so the student sees two half-screens at once.

## New close-out (about 0.9 s, in stages)
```text
0 ms     loading bar fills to the end, then shrinks to its centre (200 ms)
120 ms   "Fiti" letters lift up and fade, one after another (60 ms apart)
200 ms   parrot does a small hop and slides off to the left while fading (450 ms)
450 ms   the light blue background and rings fade away (450 ms, gentle ease)
```
- Nothing grows big or covers the page while see-through. Each piece is gone before the background fades.
- The splash waits until the page has drawn its real content, not its grey placeholders, so the reveal shows the finished page. Wait at most 1.5 s more, then close anyway.
- Under the splash, the page starts slightly smaller and dimmed and settles to full size as the background clears, so it feels like one smooth hand-off.
- Tap to skip: runs the same close-out at double speed.
- Reduced motion: no movement, just one 400 ms fade.
- Total time is the same as now or shorter. The open and wave stay unchanged.

## Technical details
- `src/shared/splash-plan.ts`: replace `zoom` with an `exit` stage timeline (bar, letters, Fiti, backdrop), with skip and reduced-motion variants. Add `pageReady` to `mayZoom` (renamed `mayClose`), plus a 1.5 s cap. Update the existing splash tests for the new timings and the ready/cap rule.
- `src/components/splash/Splash.tsx`: a `closing` phase adds per-part exit classes. Unmount after the backdrop's `animationend`, with a timer fallback.
- Page ready signal: the splash looks for the absence of `[data-skeleton]` (or a `data-page-ready` mark) in the main area. The page's own loading stays untouched.
- `src/styles.css`: remove `splashZoom`. Add `splashBarOut`, `splashLetterOut`, `splashFitiOut`, `splashBackdropOut` and `splashPageIn`. Colours stay as tokens.

## Also covered
- **Budget phones:** only smooth moves (sliding and fading) with no blur. The parrot image is released once the splash is gone, so a 2–3 GB phone doesn't stutter.
- **Sound timing:** the splash sound plays as the close-out starts, never after the page is showing, and never over Fiti's first line.
- **Dark mode:** the background fade uses the dark splash colours, so there's no white flash.
- **Taps during the close:** taps go to the page as soon as the background starts fading, so the student never taps on something invisible.
- **Shows once:** moving between pages never brings the splash back. Only opening the app does.
- **Redirects:** if a sign-in or role check sends her to another page, the splash waits for that page, not the first one.
