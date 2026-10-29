# Whiteboard: pointer Fiti, clean "Your turn"

## 1. New Fiti on the board (animated)
- The board uses Fiti with glasses and a pointer stick (screenshot 1), standing to the left with the pointer touching the board edge.
- The picture is cut out of your screenshot onto a clear background, at full sharpness.
- From it we make two short animated clips, both starting and ending on the same pose so they join smoothly:
  - Idle: breathing, a small head tilt, blinks. Loops.
  - Point: she lifts the pointer and taps the board, then returns. Plays at the start of each new line.
- Nod and retry stay as reactions; until pointer versions exist, they play as a quick head bob or shake on the same picture.
- Low-data and reduced motion: the still picture.
- This Fiti is used only on the whiteboard. Other pages keep their current Fiti.

## 2. The line at the top (screenshot 2)
- "2x means 2 times x. Let's see it." is Fiti's lead-in to the solving. It moves to the solving part: she says it as the first caption while the question is written.
- It is removed from the "Your turn" board.

## 3. "Your turn" page, improved
```text
+---------------------------------------------------+
|  Your turn                       Step 1 of 2  o o |
|  Now y = 2x + 1, and x = 4.      (marker, large)  |
|                                                   |
|  1  Multiply first: 2 x 4 = ?   [ answer ] Check  |
|                                                   |
|              tray: markers + eraser               |
+---------------------------------------------------+
```
- No white card on top of the board. Everything is written on the board in marker, like the solving.
- At the top: "Your turn" in small marker letters, the problem written large, and step dots on the right.
- Each step is a numbered line, with numbers in orange. Her answer box sits on the same line, looking like a dashed marker box.
- Check is a clear navy button. It is disabled until she types, and the enter key works too.
- Right: a green tick is drawn beside the step, Fiti nods, and the next step writes itself in. Not quite: a soft amber note with an icon under the step, Fiti plays retry, and her answer stays so she can fix it.
- Finished steps stay on the board, dimmed, so she sees her working build up.
- "Skip for now" and the close button sit above the board, clear of it (they are cut off today).
- Phone: Fiti small above the board; the answer box and Check go under the step, full width.

## Technical details
- Image: `imagegen--edit_image` on the screenshot with a transparent background, giving a pointer-Fiti still (asset pointer under `src/assets/fitila/stills`). Then two `videogen` clips from that still (idle loop, point tap), uploaded as light assets; dark mode uses the same picture. Recorded in `SOURCES.md`.
- `FitiClips.tsx`: an optional `variant="pointer"` with its own clip set; `WhiteboardDialog` uses it.
- `QuickFix.tsx`: during "try" no `heading` from `repair.slip`; the slip text becomes the first caption of the watch part.
- `YouTry` restyled to marker-on-board (font-hand, ink tokens, `splitNumbers`); amber not-quite note uses the existing alert tokens. Marking stays on the server.
