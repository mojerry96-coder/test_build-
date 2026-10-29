# Lesson pages: match the new frames (Hook, Video, Simulation)

The three frames set the layout. The rules, marking and hidden answers don't change.

## All lesson steps
- Remove the "Step n of 8" bar and step list from every lesson step. The page shows the breadcrumb, the "Welcome to …" title, one large white card and the tutor panel.
- Use the frame's spacing on the card: question text at the top, a large picture area in the middle and the action row at the bottom. Give the card soft corners and the same height as the tutor panel.
- Visual polish: calmer background, consistent type sizes, and a pale blue panel behind the picture area.

## Hook (layout only)
- The question sits at the top, the large picture area is in the middle and the action row is at the bottom.
- The content stays as in the hook document: Path A and Path B start from the same spot, each with its step triangle ("forward 1, up 2" and "forward 2, up 1"). The paths are labelled Path A and Path B.
- No "two roads", no crossing lines and no Easy/Hard labels, because "easy" is a banned word.
- The action row keeps the three buttons (Path A, Path B, Same steepness), the optional number boxes and the 10-second countdown. There's no typed answer box and no Check Answer, because a prediction is never marked. The deliberate differences from the hook prompt are kept.

## Video
- The look matches the frame: the question at the top, the large poster with a round play button, then the slim timeline with orange check markers that turn green once answered.
- The controls row under the player goes. Play/pause, time and CC move onto the player and show on hover, tap or keyboard focus.
- Captions stay on by default, shown on the player.
- No change to the checks, seek limits, three-try escalation, saved position or end moment.

## Simulation
- The look matches the frame: a bold task title, one instruction line, a centred grid with dotted points and the fixed start dot, and a full-width Check Answer at the bottom.
- Remove the Reset and Hint buttons. Hints still arrive from the tutor in the chat through the existing help timers and after misses. A third miss still gives guided correction. Moving the point again replaces Reset.
- Server marking, hidden targets and task progress don't change.

## Checks
- Screenshots of all three pages on desktop and phone, compared with the frames.
- Run the full Hook → Video → Simulation flow in the admin preview.
- All automatic tests, plus the leak check and the re-import check after reloading the starter pack.
- The banned-word check also scans the new on-screen labels.

## Technical
- Remove the step bar in LessonScreen and keep the step data for events.
- Restyle HookStage, VideoStage (controls overlay) and SimStage/sim-board (remove the Reset and Hint buttons; help stays on the engine's help-prompt trigger).
- Light-only lesson tokens in styles.css; no hard-coded colours.
