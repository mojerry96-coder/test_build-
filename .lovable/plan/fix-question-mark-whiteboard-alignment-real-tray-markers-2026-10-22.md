# Fix: question mark, whiteboard alignment, real tray markers

## 1. Question mark closer to Fiti's head (warm-up, hook)
- Move the gold question mark down and in, so it sits just above and beside her head instead of floating near the top. This applies in light and dark mode, and on the warm-up and the hook.
- It keeps its small pop-in.

## 2. Whiteboard misalignment (what is wrong today)
- **Grey box around the board:** the board picture has clear edges, and a grey fill shows through them on the left, right and bottom. The fill goes, so only the board picture shows.
- **Fiti is tiny and floats mid-height:** her clip has a lot of empty space around her. She is cropped tighter and made larger, and stands with her feet level with the bottom of the board, with the pointer reaching toward the board edge.
- **Board and buttons don't line up:** the caption and the "Watch again" / "Your turn" row are centred under the board, the same width as the board. "Your turn" stops stretching full width and becomes a normal button.
- **Text and grid sit too high and too tight to the top:** the board's inside margins are matched to the white writing area in the picture (top, left, right, and above the tray). Lines start below the top edge, and the grid sits on the same top line as the text.
- **A lone step number after clearing ("4 So (2, 4)...")**: after Fiti clears the board, numbering restarts at 1 for the new board, so it never shows a lonely "4".
- **The close button and "Skip for now"** sit in one row above the board, lined up with its right edge.

## 3. Use the board's own markers and eraser
- The black marker, blue marker and eraser in the tray become separate pieces cut from the same picture. The tray picture itself is left empty underneath them.
- When Fiti writes a line, the matching marker lifts out of the tray, moves along the line as it is written, then goes back to its spot. The drawn marker is no longer used.
- When she clears the board, the real eraser lifts out and wipes.
- **Ink colours:** the tray has only black and blue markers, so the writing uses navy (black marker) and blue (blue marker). Numbers keep their orange highlight, and the grid keeps its green rise and blue run. The red and green writing colours go, so the ink always matches the marker in her hand.

## 4. Clean, one-thing-at-a-time board
- **Bigger Fiti:** the board uses the large pointer Fiti, about as tall as half the board. The small idle clip is not used here. On phones she shrinks but stays the large artwork.
- **One action at a time,** in a fixed order: Fiti points, then the marker lifts, the line is written, and the marker goes back. Only after that do the grid or arrows draw, then the spotlight moves to the next line. Nothing starts while something else is still moving.
- **Short pauses between steps** (about half a second) so each one can be read.
- **Calm layout:** the text sits in a left column and the grid in a right column, both on the same top line. There is no more than three lines on the board, and lines that are done are dimmed, not moved.
- **The caption stays hidden until a line finishes,** then shows that line only, so it doesn't change at the same moment the marker writes.
- **The buttons only appear at the end,** after the last line, and replace the caption row instead of stacking under it.

## 5. Also covered
- **Opening:** the board fades in empty and Fiti appears with it. Writing starts after about half a second, never while the board is still opening.
- **Watch again** wipes the board with the real eraser and replays in the same order. **Show all** puts the markers back in the tray and fills every line at once.
- **Pause** freezes the marker, the eraser, Fiti and the caption together, and resume carries on from the same spot.
- **"Your turn"** uses the same board picture, margins and large Fiti, so the screen doesn't jump when she moves from watching to answering.
- **Reduced motion:** the markers stay in the tray and lines fade in one at a time.
- **Low-data:** a still Fiti and no moving pieces, with the same layout.

## 6. Checks
- I'll open the quick fix board in the browser on desktop and phone sizes, in light and dark mode, and compare it against your screenshot.

## Technical details
- `WarmupShell.tsx` `Parrot`: question mark `top` / `right` moved down to head height (about 22% / 10%).
- `.wb-photo`: drop `background-color`; `background-size: contain`; inner padding in % taken from the picture's writing area.
- Pointer Fiti: cropped still and clips shown with `object-fit: cover` and a fixed aspect, so she is anchored to the bottom of the board row.
- Board image: `imagegen--edit_image` (inpaint with mask) to remove the tray markers and eraser, plus three PNG cut-outs from the original; all as asset pointers. Their positions are set in % of the board, so they scale with it.
- `inkFor` returns `navy` or `blue` only; the moving marker is the matching cut-out (`black` or `blue`) animated with the existing `wb-marker` timing; the eraser cut-out replaces the drawn `Eraser`.
- Step numbers restart from `base` after clearing; footer/CTA width tied to the board column.
