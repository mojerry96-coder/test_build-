# Fiti loader instead of grey loading blocks

## What changes
Every page that shows the grey placeholder bars while it loads (Home, Learning Hub, subject, chapter, quest, topic, map, lesson, quiz, notebook, my plan) gets a **Fiti loader** in their place: the waving Fiti from your picture, animated, centered on the page background with a small "Getting things ready…" line under him.

## Clean transition
- Fast loads stay clean: if the page is ready in under 0.3 s, no loader shows, so nothing flashes.
- Once the loader shows, it stays at least 0.5 s, so it never blinks in and out.
- Fiti fades and scales in softly. When the page is ready he fades out while the page fades in, with no jump in layout.
- Light and dark mode each use their own Fiti clip, so there's no white box around him.
- If the clip is slow to arrive, the still waving picture shows first, then the clip takes over on the same frame.
- With reduced motion on, the still picture shows with a simple fade.
- The loader doesn't run on top of the opening splash; the splash still covers the first app open.

## Technical details
- New `src/components/learn/FitiLoader.tsx`: reuses the existing `fitila_greet_{light,dark}.mp4` clips (muted, looped, playsInline), with `src/assets/tutor/wave.png` as the poster; `aria-busy`/`role="status"`.
- `PageSkeleton` in `src/components/learn/PageStates.tsx` renders `FitiLoader`, so all current call sites switch with no route edits. The 300 ms delay and 500 ms minimum live in a small tested helper (`src/shared/loader-timing.ts` + test).
- Fade-in/out keyframes in `src/styles.css` using existing tokens; page content gets a matching short fade-in on mount.
- Lesson/quiz in-page skeletons inside components (FitilaAgent, GradientLabStage) stay as they are.
