# Splash screen: close the gaps with the design

## 1. Fiti's picture (no jacket, like the design)
- Make a new waving-Fiti picture that matches the design: no jacket, round gold glasses, raised left wing, red tail, transparent background. It is made from the existing waving Fiti so the face and feathers stay the same.
- Use it only on the splash. Every other screen keeps its current Fiti.
- Also make a second frame with the eyes closed (same pose) for the blink in point 3.
- If you can send the exact Fiti image from the design file, I'll use that instead of the generated one.

## 2. The name: heavier letters
- Load a heavy rounded-geometric font in weight 800/900 for the splash name only, close to the design's chunky "Fiti" with tight spacing.
- It is preloaded with the page, so the letters never appear in a fallback font first.
- Navy-blue colour as in the design. Size and the underline width follow the word's width.

## 3. Fiti stays alive while loading is slow
- If loading goes past the normal time:
  - Fiti blinks every 3–4 s, by quickly swapping to the eyes-closed frame for about 120 ms.
  - He breathes gently (a 1–2 % scale) and tilts his head a little every few seconds.
- The underline keeps creeping, and "Still loading…" still appears after 8 s.
- Reduced motion: no blinking or breathing.

## 4. Installed phone app
- Add the app's install file (name, short name, icons, start page), with a light-blue background and theme colour matching the splash. The phone's own launch screen then shows the same colour and Fiti icon, with no white flash.
- Add the Fiti app icons in the sizes phones need, from the existing Fiti head picture.
- Add the browser theme-colour tag so the phone's top bar matches.
- Offline use beyond today's event queue stays out of scope. This only adds the install file.

## 5. Parents and teachers
- After the splash, signed-in users go to the home for their role:
  - Student: Home (Ask Fiti).
  - Parent or teacher: a simple placeholder home ("Your parent page is coming soon", or the teacher version) with sign-out. Nothing about any child is shown, so no child data appears before the real pages exist.
- Roles are read from the protected roles table on the server, never from the browser.
- If someone has both a student and a parent role, they go to the student Home.

## 6. Small leftovers
- Bottom arcs: check them against the design, which shows two soft arcs low on the screen, and fix their size and position.
- The zoom-through aims at the real position of the last "i" dot, measured on screen, so it works for any name length and on phones.
- Sound: if the browser blocked the "ta-dum" on open, it plays once on her first tap if that tap comes during the splash. Otherwise the splash stays silent.
- Check it at phone, tablet and desktop sizes and take one screenshot to confirm.

## Technical details
- Image: `imagegen--edit_image` from `src/assets/tutor/wave.png.asset.json` (remove the jacket, transparent) into `src/assets/tutor/splash-wave.png` plus `splash-wave-blink.png`, imported in `Splash.tsx`.
- Font: add a heavy weight (for example Nunito 900 or a similar rounded font) to the existing Google Fonts link in `__root.tsx`, with a `--font-splash` token in `src/styles.css`.
- Idle: `splash-idle` and `splash-blink` keyframes, started only after the plan's minimum show time while not yet loaded; transform/opacity only.
- `public/manifest.webmanifest` with `background_color`/`theme_color` from the splash top colour, icons in `public/icons/*` (real files), and the manifest link plus `theme-color` meta in `__root.tsx` head.
- Role landing: `/` index under `_authenticated` reads role via the existing `me` server function (`has_role`). Parent and teacher go to new `_authenticated/parent.tsx` / `teacher.tsx` placeholder routes with head metadata.
- Targeted test: role → landing page (student, parent, teacher, both).
