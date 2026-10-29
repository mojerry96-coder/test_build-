# Video step: remove Ask Fiti and show the pause button

## What changes
- **Ask Fiti removed on the video step:** the Ask Fiti button no longer shows at the bottom left while she watches. It stays on every other step.
- **Pause on the progress bar:** the bar already has a pause/play button next to "back 10 seconds", but Ask Fiti was sitting on top of both. With Ask Fiti gone, they show again: pause at the start of the bar, back-10 beside it.
  - The pause button is made easier to see and tap: larger (44 px), filled orange like the progress line, and it switches between pause and play.
  - Tapping the video itself also pauses or plays it.
- Pausing never lets her skip ahead, and Fiti's voice and the question checks behave as today.

## Checks
- On the video step at your laptop size, in light and dark mode: no Ask Fiti, the pause button is visible and works, and tapping the video pauses it.

## Technical details
- `WarmupShell`: add a `noAsk` prop that hides the Ask button (and its phone strip). `LessonScreen` passes `noAsk` on the video step.
- `FlowVideoStage`: enlarge and colour the existing toggle (`bg-q-num`, white icon, h-11 w-11), and add `onClick={toggle}` on the `<video>` while in the clip phase.
