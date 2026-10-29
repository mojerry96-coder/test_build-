# New page loader (Fiti with glasses + loading line)

## What changes
Every page that loads (Home, Learning Hub, subject, chapter, quest, map, lesson, quiz, notebook, my plan) shows the new loader from your design in place of the old one:
- Waving Fiti **with glasses**, centred, about 260px tall on a laptop (smaller on phones).
- A thin loading line under him (~340px wide, 4px, rounded): light track filled with the same blue-to-yellow gradient as the splash underline, with a soft shadow under it.
- No "Getting things ready…" text.
- The page keeps its soft background and shapes, uLesson logo top-left and Dark mode pill top-right, as in the design.

## How it behaves
- Loads under 0.3 s still show nothing, so no flash.
- The line fills gradually from left to right like a real loader: it starts empty, moves smoothly with no jumps, is quick at first and slows near the end (stopping at about 90% if loading takes longer). When the page is ready it runs to 100%, then Fiti and the line fade out together.
- The fill follows real loading progress (page data arriving), so a slow network shows a slower fill and it never looks stuck or finished too early.
- Fiti waves gently (small wing tilt); reduced motion shows him still with a plain fade.
- Dark mode: dark navy page, same Fiti and line colours, no white box around Fiti.

## Also included
- Screen readers hear "Loading" once, not every step of the fill.
- No jump when the page appears: the page fades in where Fiti was.
- Fiti's picture is preloaded so he never pops in after the line.
- Slow network: after 8 s a small "Still loading…" line appears; if loading fails, the page's own "That didn't load" message replaces the loader.
- Phones and short screens: Fiti and the line shrink together and stay centred.
- Moving between pages inside the app reuses the same loader, so it never flickers between two looks.
- Dark-mode colours are added to the readability check.
- Checked on screen at laptop and phone size, light and dark.
- Does not show on top of the opening splash.

## Asset
Fiti with glasses waving is cut from your design image (transparent background). If you have a higher-quality file, attach it and I'll swap it in.

## Technical details
- Rewrite `src/components/learn/FitiLoader.tsx`: image + gradient bar (reuse `splash-bar` gradient tokens), creeping progress via a small pure helper added to `src/shared/loader-timing.ts` with a targeted test.
- New asset `src/assets/tutor/wave-glasses.png.asset.json`.
- `PageSkeleton` already renders `FitiLoader`, so no route changes. Loaders inside pages that already have the shell header keep it; standalone ones use the exported `Backdrop` + logo/theme header.
