# Practise page: clearer lines and question text in dark mode

## What's wrong (from the screenshot)
- The graph's grid lines and axes are dark blue on dark blue, so they barely show.
- The question words ("Find the gradient of the line through ... and ...") are navy on a navy card, so they're almost invisible. Only the orange numbers show.
- The "Problem 2 of 5" step dots are dim.

## Change (dark mode only; light mode stays exactly as it is)
- Grid lines: a soft light blue-grey, clearly visible but quieter than the line.
- Axes: brighter and a little thicker than the grid lines, so 0 stands out.
- The blue line and orange points stay the same.
- Question text, "Worked together" lines and Fiti's bubble text: near-white on the dark card.
- Step dots: brighter outline.
- Every colour pair is checked against the readability rule we use for dark mode (AA contrast).

## Technical details
- `src/styles.css`: in `.dark`, raise `--board-line` (around `#4A6488`) and `--board-axis` (around `#9FB4D0`); add a dark value for `--wb-navy` scoped to the Practise card (not the quick-fix white panel, which keeps navy text), and brighten `.dark .qf-dot` borders.
- Add the new pairs to `src/test/dark-contrast.test.ts` and run only that test.
