# Gradient Lab v2: one logo, tap outside to close

## What she will see
- The uLesson logo and its divider no longer show inside the lab's top bar (our lesson page already has the logo). "Gradient Lab", How to play, the speaker and the exit button stay where they are.
- When the "Leave Gradient Lab?" box is open, tapping anywhere outside it closes it, the same as the lab's own Escape key. Her place and answers are not touched.
- Our "Need help? / Ask Fiti" parrot is hidden while the lab is on screen, because the lab's own Fitila and "Try together" already give help. It comes back on the next step, and returns at once if the lab fails and the built-in board opens instead.
- Other lab boxes (right/not-quite results, finish) keep working as now, closing only by their button, so no step is skipped by accident.

## How (lab files stay byte-for-byte untouched)
- In `GradientLabV2Stage.tsx` (and the admin preview page), on every frame load add from our side:
  - one style tag: `.header .brand, .header .divider { display: none !important; }`
  - one click listener on the frame's page: a click on `#scrim` while the open `.modal` title is "Leave Gradient Lab?" sends the lab an Escape key press, which runs its own close.
- Fingerprint check stays green; add the "outside-only styling and behaviour" note to `src/components/lesson/AGENTS.md`.
