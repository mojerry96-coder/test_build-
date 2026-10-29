# Fiti's whiteboard dialog (screenshot is the spec)

## When it shows
Whenever Fiti solves something on the board: the quick fix "Watch how it's done" part (today a plain card), and any worked example played by the lesson's working player. It opens as a large white dialog over the page with a close X and the orange-to-yellow bottom edge, as in the screenshot. Closing it returns to the question; "Your turn" still continues the quick fix.

## Layout (as in the screenshot)
- White dialog surface exactly #FFFFFF (dark mode #162839) so Fiti's clips blend in with no edge.
- Fiti on the left, the board in the centre, Fiti's spoken line in the chat strip under the board.
- Question written large in the hand-written font, numbers in orange, centred.

## 1. Fiti, animated (copied from the simulation, not hot-linked)
- Copy from github.com/mojerry96-coder/k12 at commit 68c929b into our storage (fitila/clips and fitila/stills), light and dark versions, with a source record (repo, commit, original path) for each file: idle, nod, retry, tap, celebrate, greet clips; tap rest, celebrate rest, greet first/last frames; present pose.
- One clip controller, same rules as the simulation:
  - greet when the dialog opens, idle while writing or waiting, nod when she gets a step right, retry when not quite, celebrate when a demonstration ends, tap when she taps Fiti.
  - tap outranks nod; a clip never restarts if repeated; always back to idle; all clips meet on the shared rest frame so there is no jump.
  - muted, inline, loaded only when the dialog opens.
  - reduced motion or low data: the still rest frame only.
- While Fiti explains a specific part, show the "presenting" still; a "point" slot is kept for the pointing clip when it arrives.

## 2. The board, realistic
- Off-white surface with a faint diagonal sheen and light texture, brushed aluminium frame, tray with navy, red, blue and green markers and an eraser (drawn in code, so it stays crisp).
- Writing in the marker font (Patrick Hand, already in the app): navy by default, red for emphasis, green for rise, blue for run. Each line tilted a tiny random amount (−0.5° to 0.5°) and a few pixels off a perfect left edge; written left to right at the agreed writing pace, ink slightly darker at first and settling within 300 ms.
- The matching marker lifts from the tray, follows the writing point, then goes back.
- Erasing: the eraser lifts and sweeps in a zig-zag; writing wipes away under it, leaving a faint 10% ghost that fades over 1 second.
- Grids, points, arrows and the rise-and-run triangle use the shared board drawing (same as the simulation and warm-up grid) in marker colours with draw-on animation.

## 3. Spoken words and focus
- Fiti's line appears in the chat strip under the board. Voice on: words light up one by one with the audio. Voice off: at the agreed reading pace.
- Spotlight: the line or drawing being explained lifts slightly (1.02) while the rest of the board softens (55%), springing to the next target as Fiti moves on.

## 4. Voice
- Same Fiti voice as the simulation (ElevenLabs "Fitila (Gradient Lab)"). I need the voice ID and an ElevenLabs key from you; until then, captions only, at reading pace.

## 5. Motion
- The existing spring curves and draw-on timings. Reduced motion: each line appears at once, the eraser simply fades the board, no spotlight motion.

## What stays the same
- What Fiti writes still comes only from the approved worked solution, sent one step at a time; marking stays on the server.

## Technical details
- New `src/components/lesson/whiteboard/`: `WhiteboardDialog.tsx`, `Board.tsx` (surface, frame, tray), `MarkerLine.tsx` (tilt, offset, reveal, ink settle, marker follow), `Eraser.tsx`, `useFitiClips.ts` (clip controller, priorities, rest-frame handover, point slot), `Spotlight.tsx`.
- Assets: download the 25 files to /tmp, upload with lovable-assets, pointers in `src/assets/fitila/clips` and `src/assets/fitila/stills`; `src/assets/fitila/SOURCES.md` records repo, commit and path. Clip set chosen by theme (light/dark).
- Board drawings reuse the existing board component (`sim-board` / warm-up grid) with marker-colour tokens; new colour tokens for board, frame and markers in `src/styles.css`.
- Timings from `src/shared/working-pace.ts` and the motion timings file; reduced motion via `prefers-reduced-motion`; low data via the existing low-data setting.
- Word highlighting uses voice word timings when present, else the reading pace; the voice provider stays behind the existing provider switch (server-side key only).
- Tests: clip controller rules (tap outranks nod, no restart on repeat, return to idle, reduced motion = still) and line tilt range.

## Also included
- **Phone and tablet:** the dialog fills the screen; Fiti sits small above the board; the spoken line stays under the board; the board scales to fit without sideways scrolling.
- **Replay and skip:** a "Replay" button after the last line, and tapping the board finishes the current line at once.
- **Hand-back:** when the demonstration ends, Fiti celebrates, then a "Your turn" button appears at the bottom of the dialog; tapping it closes the dialog and starts the quick fix "your turn" part. X closes back to the question as before.
- **Access:** focus moves into the dialog and back on close; Esc closes; written lines are readable by screen readers; captions always on.
- **Sound:** background music lowers while voice plays; the existing sound switch also mutes soft marker and eraser sounds.
- **Reload:** if the page reloads mid-demonstration, the dialog reopens with the lines already written shown at once.

## Open
- ElevenLabs voice ID and key (captions only until then).
- Marker and eraser pictures: drawn in code unless you have image files from the design.
