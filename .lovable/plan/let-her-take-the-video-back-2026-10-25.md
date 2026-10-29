# Let her take the video back

The orange progress bar under the video is display-only today, so she can't rewind a part she missed.

## What changes
- Tap or drag anywhere on the **current clip's** bar to jump back to that point.
- Moving **forward** is allowed only up to the furthest point she has already watched in that clip (no skipping past a question).
- Earlier, finished segments: tapping one replays that clip from the start, then the lesson returns to where she was (questions already answered stay answered).
- Add a small "back 10s" button next to pause.
- Keyboard: left/right arrows move 5s (same forward limit); bar has a slider role and label for screen readers.
- Bar is a bit taller on touch (44px tap area) with a round handle; works in light and dark mode.

## Technical
- `FlowVideoStage.tsx`: track `maxWatched` per clip; pointer handlers on the bar set `video.currentTime = min(target, maxWatched)`; replay of past segment pushes a temporary phase and restores.
- Pure `clampSeek(target, maxWatched, duration)` in `flow.ts`, with a test in `src/test/video-flow.test.ts`.
