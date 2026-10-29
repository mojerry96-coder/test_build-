# "Let's Begin" map: step names on hover, and going back to an earlier step

## 1. Step name on hover
- Hover or keyboard-focus a stop and a small rounded label shows its name above it: Warm-up, Puzzle, Video, Hands-on, Practice, Finish.
- Locked stops add "Locked" under the name, done stops add "Done".
- The label never gets in the way of tapping, and it's readable in light and dark mode. On phones, tapping works the same as today.

## 2. Go back to a finished step (restart from there)
- Tapping a done stop (for example step 1 while she's on step 3) opens a confirmation box in our design (white rounded card, Fiti, blue main button, plain secondary button):
  - Title: "Go back to Warm-up?"
  - Line: "You'll redo Warm-up, and the steps after it will need doing again."
  - Buttons: "Yes, go back" and "Stay here".
- On "Yes, go back", her lesson moves back to that step. The map then shows it as next, with later stops locked, and she lands straight on that step's page. A loader shows while it moves.
- Answers she already gave stay saved for her parent and teacher records. Only her current place in the lesson moves back.
- If the whole topic is finished, tapping a stop starts a fresh run of the lesson from that step.
- The box's words are approved fallback lines (`path_back_*`) added to the starter pack. They are not written in code.

## Technical details
- `PathMap.tsx` `StopBadge`: absolutely positioned label above the button, shown through `group-hover` / `group-focus-within`, `pointer-events-none`, `aria-hidden` (the button already announces the name), using existing tokens.
- New pure helper `rewindTarget(stopIndex)` in `src/shared/path-stops.ts` returns the first step of a stop. Tests cover: step 1 from step 3 gives `readiness`, Practice gives `worksheet`, and the next or locked stops are refused.
- New server function `rewindStepFn` in `src/lib/api/lesson.functions.ts` (auth middleware) calls `src/server/lesson/rewind.server.ts`, which:
  - checks that the session is hers and open,
  - accepts only a step before her current step,
  - sets the session's current step,
  - clears in-step state for that step and every later one,
  - writes a `step_rewound` event.
  When the topic is finished, it opens a new session at that step. Evidence rows are kept.
- Map route `onStop`: a done stop opens the box (shadcn AlertDialog styled like `RestartDialog`). On confirm it calls `rewindStepFn`, invalidates the lesson and path queries, then navigates to the lesson.
- Content: add `path_back_title`, `path_back_line`, `path_back_yes` and `path_back_stay` to `content/packs/*.json` and reload the seed. These lines pass the banned-word check.
- Record the rewind rule in `AGENTS.md`, and add this task to roadmap.md.

## 3. Added after review
- Fiti reads the box line aloud (muting still applies), and the box closes with Escape or a tap outside, which counts as "Stay here".
- Double taps are ignored, and the button shows a loader while she waits. If going back fails (weak network), she stays on the map and sees a friendly "Couldn't go back, try again" message.
- Going back resets that step completely: the video starts from the beginning, the simulation and worksheet open fresh, and old hints are cleared. The Warm-up still runs even if she already showed the skill earlier.
- The Leaderboard tab and Ask Fiti's "Continue learning" follow her new place.
- Stars she already earned stay on her progress record. They aren't counted twice when she redoes a step.
- The current step (the "next" stop) behaves as today. Tapping it just continues.
- Checked on laptop and phone, in light and dark mode.
