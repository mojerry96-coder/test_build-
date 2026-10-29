# Remove the old placeholder picture from the video step

## Why it shows
The video player still has the old placeholder picture sitting behind the real clips. Each time one clip ends and the next one loads (for example after the first question), there is a short gap and that old picture shows through before the next clip starts.

## What changes
- The old placeholder picture is removed from the real-clip video player.
- Between clips, the last frame of the clip that just finished stays on screen until the next clip is ready, so the video runs on smoothly with no flash.
- If the next clip is slow to load, the spinner shows over that held frame. Before the very first clip it shows over a plain dark board colour, not the old picture.
- The next clip starts loading during the question, so the gap after answering is shorter.
- Replays, wrong-answer clips, resuming after a reload, low-data mode and dark mode all behave the same way.
- The placeholder is still used only when a topic has no real clips at all (the backup player is unchanged).

## Technical details
- `src/features/video-lesson/FlowVideoStage.tsx`: delete the `poster` import and the `<img src={poster.url}>` layer (line ~216); give the player container a solid token background.
- Swap clips by keeping the current `<video>` frame visible until the new source fires `canplay`/`loadeddata` (no `poster` attribute pointing at the placeholder), then reveal.
- When a question opens, preload the likely next clip (`correct_clip` and the first `wrong_clip`) with `preload="auto"` hidden video elements.
- `VideoStage.tsx` `PlaceholderVideoStage` is untouched.
- Verify in the app: answer the first check and confirm no placeholder frame appears before the next clip.
