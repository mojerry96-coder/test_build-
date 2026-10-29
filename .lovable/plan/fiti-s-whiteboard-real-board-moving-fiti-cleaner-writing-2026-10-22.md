# Fiti's whiteboard: real board, moving Fiti, cleaner writing

## 1. Use the new board picture
- The board frame becomes the uploaded whiteboard picture (white glass, silver tray, black and blue markers, grey eraser).
- The drawn tray and four markers go. The markers and eraser that move are lined up with the ones in the picture, so a marker lifts from the tray while Fiti writes and goes back after.
- The picture stays white in dark mode, as before. It loads only when the board opens.

## 2. Fiti never stands still
- Today Fiti switches to a still picture whenever she writes. That stops.
- While writing: her idle clip loops, with a small "point at the board" tap at the start of each new line.
- Right step: nod. Not-quite step: retry. Last line: nod, then idle.
- Between clips she keeps a gentle breathing sway, so she is never frozen.
- Low-data or reduced motion: still picture, with only the gentle sway (none for reduced motion).

## 3. Better text layout on the board
```text
+-----------------------------------------------------+
|  Question (small, grey, max 2 lines)                |
|  ------------------------------------------------   |
|  1  The first number, 3, is the x-coordinate...     |  [ small grid ]
|  2  The second number, 2, is the y-coordinate...    |  (only if needed)
|                                                     |
|                     tray: markers + eraser          |
+-----------------------------------------------------+
```
- Question at the top, smaller and lighter, with a thin marker line under it, so the working stands out.
- Each step is numbered, left-aligned, written in one marker colour per step, with even spacing.
- The numbers in each line use the orange number colour, as on the question page.
- The line being written is highlighted; earlier lines fade slightly.
- Text never runs into the tray; when the board fills, Fiti clears it first (existing rule).
- The caption under the board stays, so she can read along.

## 4. Do we show everything? No.
- The board shows only what Fiti is explaining at that moment.
- The grid is drawn only when the step is about the picture (for example, "move 3 across, then 2 up"). For steps that are only words, there is no grid and the text uses the full width.
- When the grid is shown, it is drawn in marker on the board itself (no white card inside the board), smaller, on the right.
- The full question is shown once at the top; we do not repeat the answer options.
- Which steps get the grid is set in the lesson content, not in the app, so Instructional Design can choose. Until they do, warm-up question 1 shows the grid only for the steps that mention moving across or up.

## 5. A clean board, and how Fiti teaches on it
- Clean board: it opens empty. There are no cards, boxes or shadows inside it. Everything on it looks hand-written in marker: the text, the grid and the arrows.
- At most three steps fit on the board at once, plus the question. There is a clear margin at every edge.
- Teaching order for each step:
  1. Fiti taps the board, and her caption line starts.
  2. She picks up the marker. The step's words appear at reading pace, with numbers in orange.
  3. If the step is about the picture, she then draws that part of the grid. The run is drawn in blue, then the rise in green, then the point pops in.
  4. A short pause. The line she just wrote stays highlighted, then dims as the next step begins.
- Show all steps: the steps fill in at once, in the same layout, and Fiti nods.
- Watch again: Fiti says the clear line, wipes the board and starts again.
- End: the last line is written, Fiti nods, and "Got it" (or "Your turn") appears.

## 6. Extra details
- Long steps: words wrap at whole words, never mid-word. If a step still doesn't fit, the text gets a little smaller, but stays readable.
- Pause: the marker, the drawing and the caption all stop together. Continue picks up exactly where she left off.
- The question on the board uses the same numbers and orange colour as the question page, so it is easy to match.
- Screen readers read each step once, when it finishes, not letter by letter.
- The same layout is used everywhere the board appears: warm-up, video tries 2 and 3, and "Teach me".

## Phone
- Fiti sits above the board, smaller, still moving.
- The grid, when shown, goes under the text, not beside it.

## Technical details
- `FitiClips.tsx`: stop forcing the presenting still while writing; request `tap` per new line, loop `idle`; CSS sway class on the wrapper.
- `WhiteboardDialog.tsx`: board picture as a Lovable asset pointer for the frame; new text grid (question header, numbered lines, current-line highlight, `splitNumbers` for numbers); drawing shown only for lines that flag it.
- Content: optional `show_board` flag per working line in the seed pack; reload with `load-seed.ts` (re-import + leak check).
- Targeted test: grid shows only for flagged lines.
