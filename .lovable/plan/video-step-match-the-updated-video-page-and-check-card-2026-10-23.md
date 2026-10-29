# Video step: match the updated video page and check card

Screenshot 2 is the video page; screenshot 1 is the moment a check question opens over the video.

## Video page (screenshot 2)
- Runs inside the same bare Fiti shell as the warm-up and Hook: logo, Dark mode, name, background shapes, thinking Fiti bottom-right. Ask Fiti button bottom-left as on the other steps.
- No title line and no step label above the player (the screenshot has none).
- Player: large, centred, ~1100 px max, rounded 24 px corners, poster/clip fills it.
- Controls in their own white pill bar under the player (separate from it, small gap), with the light-blue bottom edge used on the Hook card:
  - Play/Pause icon on the left (no square button background).
  - Segment bars: one rounded bar per video section, grey track; watched part fills orange (screenshot 1 shows the first bar orange).
  - CC icon on the right, outlined.
- Captions still on by default, shown at the bottom of the player.

## Check question opens (screenshot 1)
- Video pauses; a white rounded card (24 px) appears centred over the player, covering most of it; the player edges stay visible around it.
- Card header: "Question 1" in light blue on the left, "1/3" on the right.
- Question in the hand-written font, navy, centred, numbers in the orange token.
- Below the question (inside the same card): the answer choices in the coloured tile style, then "How sure are you?" with the confidence choices, then Check Answer, same rules as today (server marks, confidence first-try rules unchanged).
- The pause icon shows in the control bar while the card is open; the first segment stays orange up to the check point.
- Try-again / working / full working still play inside the card as today.

## Kept as is
- Seek limits, segments, captions, the three-try escalation, confidence evidence, lucky-guess working, reload resume.

## Also
- Phone: player full width, control bar under it, card opens below the player (not over it), Check Answer reachable.
- Dark mode: card stays white with navy text; control bar dark navy with light icons.
- Keyboard: Space plays/pauses, focus moves to the question when the card opens.
- Card reveal: soft scale-and-fade in (reduced motion: instant); the question text writes in like the warm-up.
- Fiti reacts: thinking pose while the card is open, small win / not-quite reactions after Check (same celebrations as the warm-up).
- Ask Fiti on a check opens the clean question chat (same as warm-up), never reveals the answer.
- Segment bars: hovering shows the section title; tapping a watched section jumps there (unwatched sections stay locked as today).
- Loading: the poster shimmer stays until the video is ready; the control bar shows but play is disabled.
- End of video: the existing "Nice watching" screen keeps the same shell and parrot.

## Technical details
- `LessonScreen.tsx`: wrap `video` step in `WarmupShell noHint` like the hook.
- `VideoStage.tsx`: remove title `h2`; restyle player wrapper (`rounded-[24px]`, max-w 1100), move controls into a separate pill bar with segmented bars (orange fill = watched), plain play/pause and CC icons; check card header row (Question n / n of total), Patrick Hand prompt with `splitNumbers`, options using `.mcq-tile`.
- No content or marking changes; targeted video tests only.
