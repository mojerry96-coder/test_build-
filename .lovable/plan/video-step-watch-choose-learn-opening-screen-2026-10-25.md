# Video step: "Watch, Choose, Learn" opening screen

## What she will see
- When she reaches Step 3 (the video), this screen opens first, matching the picture: blue sky background, "Watch, Choose, Learn" heading with "Learn" circled in yellow, a short line about the lesson, and **Begin** and **How it works** buttons.
- Two small cards sit underneath: "Watch & choose: It asks before it tells" and "3 checkpoints" with the topic words (gradient highlighted).
- Big Fiti with glasses sits on the right and gently looks around.
- A sound button in the top-right corner turns the video sound on or off.
- **Begin** starts the video (this tap also lets the sound play on phones). **How it works** opens a short card explaining: watch, answer the questions when it pauses, and Fiti helps if you get one wrong.
- She only sees it once per lesson. If she reloads or comes back partway through, the video carries on where she left off.
- Phones: Fiti moves above the heading and gets smaller, and the cards stack.
- Dark mode: the screen keeps its blue look so it matches the video.

## Content
- The heading, line, card text and checkpoint count come from the lesson content, not the code. The checkpoint count matches the real number of video questions.
- New wording goes on the Instructional Design approval list.

## Also included
- Only one Fiti on screen: the page's corner Fiti and Ask Fiti hide while the opening screen shows.
- Fiti says the welcome line out loud once she taps (one voice at a time; muting him keeps him quiet). Music fades down when the video starts.
- The video loads quietly while she reads, so Begin starts it straight away. The Begin button shows a loader at once and can't be tapped twice.
- The two cards' arrow buttons open the same "How it works" card. It closes with a tap outside, the Esc key or a close button.
- Low-data mode or reduced motion: still Fiti, no moving background.
- If the video can't load, Begin still opens the step with the usual "Video unavailable" line, so she's never stuck.
- Keyboard: Tab reaches Begin first, and Enter starts. Buttons are at least 44px on phones.
- Admin "Lesson: Video" shortcut opens on this screen.
- Restart shows the screen again.
- Short laptop (1280x720): everything fits without scrolling.

## Checks
- Laptop 1377x892, short laptop, phone, light and dark: Begin starts the video with sound, How it works opens and closes, and a reload skips the screen.

## Technical details
- New `VideoIntro.tsx` in `src/features/video-lesson/`, rebuilt from Dave's upstream files (`ParallaxBackground`, `CircledWord`, `GlassCard`, `PillButton`, `IdleMascot`), and recorded in `SOURCE.md`.
- `FlowVideoStage` shows the intro while no video position has been saved; Begin logs the `video_position` event at 0 and calls play.
- Copy comes from new `video_intro_*` fallback lines in the seed pack, and the count comes from the flow's checks.
