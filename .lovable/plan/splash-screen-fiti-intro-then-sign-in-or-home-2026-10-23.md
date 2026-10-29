# Splash screen: Fiti intro, then sign-in or Home

The screenshot is the visual spec, and the instruction file sets the timing, sound and rules.

## Look (as in the design)
- Soft light-blue gradient background with faint concentric circles and the low arcs at the bottom.
- Waving Fiti on the left, reusing the existing waving Fiti picture already in the app.
- The tutor's name on the right in large heavy navy-blue letters, read from the tutor name setting (shows "Fiti" today), never typed into the code.
- Thin underline below the name: light track, filled with a blue-to-yellow gradient.
- Centred on every screen size. On phones Fiti and the name scale down together and stay side by side.

## Sequence (first open of the day, about 2.5 s)
- 0.0 s: circles ripple out from the centre (grow slightly and fade in).
- 0.2 s: Fiti springs in from the left and waves (two small wing tilts).
- 0.8 s: the letters spring up one by one, 80 ms apart.
- 1.2 s: a soft white light sweeps across the name (500 ms), with the "ta-dum" sound.
- 1.3 s: the underline fills left to right with the app's real loading progress. It takes at least 0.8 s, so it never just flashes.
- When loading is done and at least 2.2 s have passed: the whole splash zooms quickly toward the dot of the last "i" and fades to white (350 ms). The next page then fades in from white (250 ms).

## Later opens the same day (about 1.2 s)
No letter animation. Fiti and the name are already in place, the underline fills, then the zoom-through.

## Where it goes next
- Signed-in student: Home (Ask Fiti).
- Signed-in parent or teacher: their home. There is no parent/teacher home page in the app yet, so for now they go to Home as well. This will switch automatically once those pages exist.
- Not signed in: the sign-in / sign-up page.
- The page loads behind the splash, so the splash never adds waiting time.

## Sound ("ta-dum")
- Made in code with the existing game-sound module: two warm notes (196 Hz, then 293.7 Hz 0.18 s later, held 0.7 s with a soft fade), very quiet, slightly softened.
- Plays only if the browser allows sound, the sound switch is on and low-data mode is off. Otherwise the splash is silent. Most browsers block sound before a tap, so the first web open will usually be silent; that is expected.

## Rules
- Tap anywhere (or press a key) to skip straight to the zoom-through.
- Reduced motion: Fiti and the name fade in (300 ms), the underline fills, then a plain fade to the next page.
- Only movement and fading are animated, to keep it smooth on budget phones.
- Plays once per app open, not on every page change inside the app.
- Dark mode: the splash keeps its light look as designed. The next page uses her chosen theme.
- Screen readers hear "Loading Fiti" once and nothing else.
- Slow network: if loading takes longer than 2.5 s, the underline keeps filling slowly and Fiti blinks or idles. After 8 s a small "Still loading…" line appears. The splash never gets stuck: if loading fails, it moves on to the page, which shows its own error.
- Deep links (for example a lesson link or a sign-in email link) still open the page that was asked for after the splash, never Home.
- Installed app: the phone's own launch screen uses the same light-blue colour and Fiti icon, so there's no white flash before the splash.
- The splash only shows when the app first opens, not when someone signs out and back in or after Restart.
- The words in the splash come from the tutor name setting only. If that setting is empty, it shows "Your tutor" in the same style.
- Fiti's picture and the fonts are preloaded, so the letters never pop in with a different font.

## Not included
- Fly-in video clip: none has been provided, so Fiti's picture is animated in code. A light-background clip can replace it later without other changes.

## Technical details
- New `src/components/splash/Splash.tsx`: an overlay mounted once in `__root.tsx` above `<Outlet />`. It shows on the first client mount, and routing and auth redirects run underneath. Progress comes from router pending state plus fonts/images ready, and it hides after the zoom.
- "First open today" uses a Lagos-date key in localStorage. The tutor name comes from the existing public setting read used by the shell, with the empty-setting fallback.
- `src/lib/sound.ts`: add a `taDum()` effect (oscillators with a low-pass filter and gain ≤ 0.08), gated by the existing sound and low-data checks.
- Keyframes and tokens in `src/styles.css` (splash gradient, circle lines, underline gradient), using the existing `--spring` easing.
- Small pure helper `splashPlan(firstToday, reducedMotion)` for the timings, with a targeted test (2.5 s / 1.2 s / reduced motion, minimum fill 0.8 s, zoom only after 2.2 s).
