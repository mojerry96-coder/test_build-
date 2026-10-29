# Fiti's new "sad" reaction for a wrong answer, everywhere

## What she will see
Whenever she picks or writes a wrong answer, Fiti plays the new sad clip (the droopy-wings shrug), then settles back to his normal pose. This applies in:
- Warm-up questions (and the quick fix's multiple choice, which uses the same card)
- Video questions (replaces the current "almost" reaction on a wrong pick)
- Quick fix steps and practise lines ("Check this line" that comes back not quite)
- Anywhere else the "not quite" reaction plays (hook, simulation checks)

The gentle tone stays: the soft amber "not quite" note, the sound and Fiti's words don't change. Only his movement changes.

## Preparing the clip
- Remove the green background so Fiti sits cleanly on our cards. Make two versions, like his other clips: one on white for light mode and one on the dark card colour for dark mode.
- Remove the sound (his voice and the game sounds already play) and shorten it to about 2.5 to 3 seconds, so he's back in his normal pose before the next try.
- Shrink it for budget phones (aim for under 300 KB each).
- Make a still frame for low-data mode and reduced motion. Fiti shows the sad pose briefly with no video.

## Safeguards
- It plays once per wrong answer and never loops. A quick second wrong answer restarts it rather than stacking.
- A right answer straight after it switches him to his happy clip at once.
- If the clip can't load, he falls back to today's "retry" move, so he never disappears.
- Low-data mode: still frame only.

## Checks
- See it in light and dark mode on a warm-up question, a video question and a practise line, and confirm the green edge is gone.
- Run the existing test for which clip plays when, plus a new case: a wrong answer gives "sad".

## Technical details
- Use ffmpeg `chromakey` + `despill` over `#FFFFFF` and `#162839`, H.264 with no audio. Upload with `lovable-assets` as `clips/fitila_sad_{light,dark}.mp4`, plus stills `stills/fitila_sad_{light,dark}.webp`. Record the clip in `src/assets/fitila/SOURCES.md`.
- `clip-controller.ts`: add `"sad"` to `Clip` (one-shot, falls back to `retry`). `FitiClips.tsx`: add it to the LIGHT/DARK sets. Pointer Fiti plays it as a short cutaway, then returns to his pointer pose.
- Swap the wrong-answer `want("retry")` calls for `want("sad")` in WarmupShell/MCQ, WhiteboardDialog (`result.ok === false`), PractiseStage, and the quick fix. `celebrate.tsx` `notQuite` sets the shared mood so the right-side parrot plays it too. In `FlowVideoStage`, the wrong-answer mascot uses the sad clip.
- Update `src/test/whiteboard-clips.test.ts`.
