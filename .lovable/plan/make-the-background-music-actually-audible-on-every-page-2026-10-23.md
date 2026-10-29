# Make the background music actually audible on every page

## What is going wrong
- **Fiti's moving pictures stop the music.** The rule "pause during video" counts every video on the page, including Fiti's small silent looping animations. Wherever one of these is on screen, for example the whiteboard and any page that uses them, the music stays off.
- **It is too quiet to hear.** Each note reaches only about a third of the volume we planned (0.03 × 0.45), so on a laptop it sounds like nothing is playing, especially next to the lab.
- **The lab's read-aloud can hold the music down.** While the lab is "speaking", the music drops to 15%, which is nearly silent at this level.
- **No music button on the lesson pages.** The header in your screenshot (Home / My Learning / Progress) has no music or sound button, so there is no way to check or switch it there.

## Fix
1. Only real lesson videos with sound pause the music; Fiti's silent animations no longer count.
2. Raise the notes so the music peaks at about the planned level (0.03): melody at full voice, pad a bit fuller. It stays clearly below sound effects (0.08) and Fiti's voice.
3. Under the lab's read-aloud or Fiti's voice, the music drops to 30% instead of 15%, so it's still faintly there, and it comes back after 1 s.
4. Add the music-note button and sound button to the lesson page header too, matching Home.
5. Check in a test browser on Home, Learning Hub, the "Let's Begin" map, Ask Fiti, warm-up, hook, the lab and the whiteboard. In each case, confirm notes are being played over 10 seconds after one tap, and that they stop during the video, worksheet, exit ticket and reflection.

## Technical details
- `src/lib/music.ts` `wanted()`: `videoPlaying` = any `video` with `!paused && !muted`. Melody pluck gain 1.0, pad 0.25, drum/shaker scaled to match.
- `src/shared/music-plan.ts`: `DUCK.voice` 0.3; update its test.
- Lesson header component: reuse `MusicButton`/`SoundButton` (export them from `FitilaShell.tsx`).
- Same video rule applied to `playSound` in `src/lib/sound.ts` (muted clips no longer silence effects).
