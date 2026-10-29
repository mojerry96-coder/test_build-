# Bolder writing on Fiti's whiteboard

## What changes
On Fiti's whiteboard, the question at the top and Fiti's numbered lines ("1 So, y = 6.") look thin. Both get a thicker, marker-like stroke so they read clearly from a phone held at arm's length. Colours stay as they are, including the orange numbers.

- Fiti's numbered lines: noticeably bolder, like a fresh marker.
- The question at the top: a little bolder and a touch darker grey, so it still sits behind Fiti's lines but no longer looks faint.
- The "Your turn" task text on the same board gets the same weight, so the board looks consistent.
- The writing-on animation, eraser and line fading keep working as before.

## Technical details
- The handwriting font comes in only one weight, so the weight comes from a thin outline in the text's own colour (the same trick the Learning Hub headings already use).
- `src/styles.css`: new `wb-ink` utility with `-webkit-text-stroke: 0.6px currentColor; paint-order: stroke fill;`, and a lighter `wb-ink-soft` (0.35px) for the question.
- `src/components/lesson/whiteboard/WhiteboardDialog.tsx`: add `wb-ink` to board lines and erasing lines, and `wb-ink-soft` to the heading; `src/components/lesson/QuickFix.tsx`: add `wb-ink` to the `HAND` text.
- Design-only; no content or marking changes.
