# Page loader: waving Fiti clip (splash unchanged)

## What she will see
- When a page is loading, the still waving Fiti above the loading line is replaced by your new waving clip, looping. The line, "Still loading…" and the fade-out at the end all stay the same.
- It shows the same size and in the same spot, with no green and no box behind him in light or dark mode.
- The app-open splash stays exactly as it is.
- Low-data mode, reduced motion, or a phone that can't play see-through clips (some iPhones): today's still waving picture shows instead.
- If the clip is slow to arrive, the still shows first so the loader never sits empty.
- The same applies everywhere this loader shows: pages, the "choose" page and the Ask Fiti loading screen.

## Technical details
- ffmpeg: chromakey + despill on `Wave.mp4`, trim to a clean loop, drop audio, scale to about 480px, VP9 alpha webm (target ≤300 KB), plus a transparent webp still. Upload via lovable-assets to `src/assets/fitila/` and record in `SOURCES.md`.
- `FitiLoader.tsx`: `<video autoplay muted loop playsInline poster={still}>` in place of the `<img>`, falling back to `splash-wave.png` under low-data/reduced motion/no-alpha support. `playFinish` uses the same clip.
- `Splash.tsx` is not touched.

# Video opening screen: text hidden under the left menu
## What she will see
- On the "Watch, Choose, Learn" screen, the heading, the line under it, Begin, the first card and the "Interactive Learning for Grade 12" line start to the right of the left menu, so nothing is cut off.
- The sky background still fills the whole page behind the menu.
- Fiti stays on the right; on short laptops everything still fits without scrolling. Phones (no side menu) are unchanged.

## Technical details
- `VideoIntro.tsx` is a `fixed inset-0` overlay, so its content starts under the sidebar. Keep the background full-bleed, but pad the content column left by the sidebar width at `md:`/`lg:` (same width the shell uses), and keep it below the top button row. Check 1377x892, 1280x720 and phone, light and dark.
