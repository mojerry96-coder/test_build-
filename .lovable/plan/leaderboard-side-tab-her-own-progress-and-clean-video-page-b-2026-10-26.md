# Leaderboard side tab (her own progress), and clean video page background

## 1. Leaderboard moves to a side tab and shows her own progress
- Remove "Leaderboard" from the left menu; it lives in the side tab instead.
- Add a **Leaderboard** tab on the right edge of the screen, styled exactly like the "Worksheet" tab in the Gradient Lab (vertical blue pill with a small icon).
- It appears on every **lesson step page** (warm-up, hook, video, quick fix, practice and the rest). It does **not** appear on the Ask Fiti page or the "Let's Begin" map page.
- On the simulation step it sits below the lab's own Worksheet tab so the two never overlap.
- Tapping it slides out a panel from the right (bottom sheet on phones) showing only her own progress:
  - **Steps completed** – the 8 lesson steps for the current topic with done / current / not yet ("5 of 8 steps").
  - **Stars** – stars earned, total and for this topic.
  - **Correct answers** – right out of tried (warm-up, video checks, practice, quizzes).
  - One short approved Fiti line on top (from content, never AI-written).
- No classmates, no podium. Counts only what happened after her latest "Start again".
- New student: "No steps yet" with a nudge to start.
- Close with X, tapping outside, or Esc. Works in dark mode.
- The old leaderboard address redirects to Ask Fiti so no link breaks.

## 2. Video page background
- Remove the faint pale shapes behind the video player on the video step; other steps keep theirs.

## 3. Also included
- **Updates live:** steps, stars and correct answers refresh right after each answer or finished step, with no reload.
- **Never in the way:** the tab hides while a question card, whiteboard, hint card or celebration is open. On phones it sits above the bottom buttons and never covers Fiti or Check Answer.
- **Video keeps its place:** opening the panel pauses the video, and closing it carries on from the same spot.
- **Same rule as quizzes:** home quizzes count toward correct answers but never toward lesson steps.
- **Easy to use:** large tap area, works with the keyboard, read correctly by screen readers, and no motion when reduced motion is on.
- **Checks:** small tests for counting steps, stars and correct answers, and for "Start again" resetting them; one look in the app on a laptop and a phone.

## Technical details
- `FitilaShell.tsx`: drop Leaderboard from NAV; new `src/components/leaderboard/LeaderboardTab.tsx` (tab + panel) rendered once from `LessonScreen.tsx` (all steps), never from the Ask page or path route.
- Pure `src/server/home/progress.ts` (tested: steps done, stars total, correct/tried) + `progress.server.ts` (own sessions/evidence, restart cutoff via `restart-cutoff.ts`); thin `src/lib/api/progress.functions.ts`; shape in `src/shared/contracts/progress.ts`.
- Seed `progress_*` fallback lines in the content pack.
- `leaderboard.tsx` becomes redirect-only; leaderboard server code left unused; AGENTS.md rule replaced.
- Video step: pass `hideDecor` to `FitilaShell` from `WarmupShell` on the video step.
