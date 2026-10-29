# Remove the blue box around "Skip for now"

## Why it shows
The blue box is the browser's own highlight, which stays on after the button is tapped.

## What changes
- "Skip for now" (both places on the warm-up question, including after closing the fix board) no longer shows the blue box when tapped or clicked.
- Keyboard users still see where they are: an underline under the words instead of a box, so the page stays accessible.
- Same in dark mode; nothing else on the card changes.

## Technical details
- `src/components/lesson/WarmupStage.tsx` lines ~319 and ~326: add `outline-none focus:outline-none focus-visible:underline underline-offset-4` to the two Skip buttons.
