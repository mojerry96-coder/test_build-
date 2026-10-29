# Whiteboard "Your turn" layout clean-up

## What is wrong (from the screenshot)
- Fiti's line sits at the top, then a big empty gap, and everything for "Your turn" is squeezed at the bottom near the tray.
- "Your turn" and "Step 1 of 1" sit far apart on opposite edges.
- The answer box and Check are pushed to the far right, away from the step they answer.
- The fraction floats between the heading and the step with no clear link.

## New arrangement (one top-to-bottom column, left aligned like the board lines)
```text
1  A fraction bar means divide, not add.        (faded)

Your turn · Step 1 of 1 ○                       (one row, small)

        11 - 2
        ------                                   (the question, centred in the column)
         5 - 2

1  Work out the top: 11 - 2 = ?
   [ Type your answer ] [ Check ]                (directly under the step)

                 (free space above the tray)
```
- "Your turn" block starts right after Fiti's last line (normal line gap), not pinned to the bottom.
- Heading and step counter in one row: "Your turn · Step 1 of 1" with the dots.
- Answer box and Check sit directly under the step text, starting at the step's indent; same size as today.
- Not-quite message appears under the answer row; finished steps stay above it.
- Nothing ever overlaps the tray or markers; if steps run long, the block scrolls inside the board.
- Phones: same column; answer box full width with Check beside it.

## Extra clean-up
- One step number style: Fiti's lines and her steps both use the same small grey number and indent (no "1" twice looking like the same step); her steps restart as "Step 1" label instead of a bare number.
- Question fraction slightly smaller and closer to the step, so it reads as part of "Your turn".
- Fiti's earlier line fades more (lighter grey) so attention goes to the question.
- Answer box: solid soft border (not heavy dashed blue); blue glow only when focused. Check stays greyed until she types, then turns blue.
- Equal left margin for every line on the board; nothing hugs the board edge.
- The step-progress circle becomes the same dots used in the lesson header, filled as steps are done.
- Consistent gaps: same space between heading, question, step and answer row.
- Enter key submits; focus goes to the answer box when "Your turn" opens.
- Dark mode keeps the white board; reduced motion skips the fade.

## Technical details
- `WhiteboardDialog.tsx`: `wb-turn` drops `mt-auto` so it follows the lines; keep bottom inset above the tray.
- `QuickFix.tsx` "Your turn" block: merge title + step counter into one row; render each step as text row then input/Check row (flex-col) instead of side-by-side `justify-between`.
- No content, marking or behaviour changes.
