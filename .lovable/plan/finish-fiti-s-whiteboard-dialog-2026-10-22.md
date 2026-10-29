# Finish Fiti's whiteboard dialog

## 1. Voice (setting only)
- Captions only for now. Add a protected setting `fiti_voice_id` (audited, like the tutor name). When it is set and the ElevenLabs key is in Cloud Secrets, the voice switches on through the existing voice switch, and its word timings drive the caption highlight. Empty = captions at reading pace (today's behaviour).

## 2. Pointing clip
- Presenting pose stays in the "point" slot until the clip arrives (no change).

## 3. Nod and retry
- In every "Your turn" step shown on the board (quick fix, video check try 2, any others): Fiti nods on a right step and plays retry on a not-quite step.
- In watch parts: one nod after the final line is written.

## 4. Eraser (fix)
- Fiti says "Let me clear the board." first.
- The eraser lifts from the tray and sweeps line by line in a zig-zag (line 1 left to right, line 2 right to left, ...), about 250 ms per line; each line wipes away under it (mask follows the eraser) and leaves a faint ghost that fades out.
- Runs when the board is full, when a new example begins, and on "Watch again".

## 5. Markers and grid (fix)
- The marker in the line's colour lifts from the tray, rides the writing point, and goes back when the line is done.
- Grids, points, arrows and triangles are drawn on the board surface itself where the board cue places them, in rough marker strokes and marker colours, drawing on in order (not in a box beside the text).

## 6. Roll out (in this order, old cards removed where replaced)
a. Warm-up "Here's how it works" for all three questions (question 1 with grid and arrows).
b. Video check try 2 (similar example P(1, 2) and Q(3, 8) with the triangle) and try 3 (full explanation, then her explain-back question). Demo release criterion.
c. Practise "Teach me" (problem 1) and Ask Fiti homework help.
Each uses the lesson's approved steps as board cues; nothing new is written that is not in the approved worked solution.

## 7. Low-data mode
- "Low-data mode" switch in the profile menu and in the onboarding setting, saved per student.
- Turns on by itself on a slow connection, with a one-line notice ("Low-data mode is on to save your data." draft).
- When on: still frames instead of clips, no voice, no video autoplay, simple fades.

## 8. Resume after reload
- The dialog's position (last completed board cue and what is on the board) is saved on the session.
- After a reload, the dialog reopens with the board redrawn instantly up to that point and continues from the next line.

## 9. Wording (seed lines, for Instructional Design approval)
- Open button "Watch Fiti work it out"; "Watch again"; "Show all steps"; "Pause" / "Continue"; close "Got it", or "Your turn" when a your-turn part follows.
- Fiti: "Let me clear the board." before erasing; last line of a watch part: "There we go! Your turn now."
- These replace my earlier wording ("Watch on the board", "Replay", "Back to the board").

## Technical details
- Whiteboard: `WhiteboardDialog` gains a board-cue renderer (`BoardDrawing.tsx`, SVG with rough-stroke filter and `stroke-dashoffset` draw-on) placed by cue coordinates; tray markers become stateful (lifted marker hidden in tray while riding); eraser = per-line `clip-path` mask animated with the eraser position, zig-zag order; Pause/Continue and Show all controls; `onStep(result)` prop drives nod/retry.
- Shared `useBoardSession(sessionId, key)` reads/writes the saved position through a new lesson server function (`boardProgressFn` in `lesson.functions.ts`, stored in `sessions.state.demo.board[key]`), server-validated against the approved line count.
- Roll-out: replace `WorkingBox` in `WarmupStage.tsx`, the `WorkingPlayer` use in `VideoStage.tsx` (try 2 / try 3), the Teach me path in `stages-b.tsx`, and homework help steps on Home (board opens from the Fiti reply's "Watch Fiti work it out" button; steps come from `homework.ts`).
- Low data: real `useLowData()` in `src/lib/ui-prefs.ts` (localStorage + server pref in `student_prefs.low_data`), auto-on from `useNetwork()` slow guess; consumers: `FitiClips`, voice player, `VideoStage` autoplay, motion classes.
- Voice: rule/setting `fiti_voice_id` via the audited admin setting path; ElevenLabs provider added behind the existing voice provider switch, server-only key `ELEVENLABS_API_KEY`; word timings from the ElevenLabs alignment response feed the caption highlighter.
- Seed: new fallback lines for the wording above; reload with `load-seed.ts` (re-import + leak checks).
- Tests (targeted): eraser zig-zag order and timing; nod/retry mapping from step result; resume position clamped to approved lines; low-data auto-on rule.

## Added details
- Board full rule: when the next line would not fit, erase first, then keep writing (same for drawings).
- "Show all steps" and reduced motion: board fills instantly, no eraser sweep, no marker travel; Fiti still nods once at the end.
- Pause also pauses the marker, eraser, captions and voice; closing mid-way saves the position (resume rule).
- Wrong-path in a "Your turn" step shows the soft amber alert on the board, never red.
- Phone: the board scales to fit the screen width; drawings stay on the board, text never overlaps them.
- Low-data notice shows once per session, with a way to turn it off in the profile menu.
- Dark mode: the board stays a white board (fixed-colour element), the frame around it follows dark mode.

## Open
- ElevenLabs key and voice ID (you will add them).
