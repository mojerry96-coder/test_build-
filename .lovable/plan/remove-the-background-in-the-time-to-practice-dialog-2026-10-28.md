# Remove the background in the "Time to practice" dialog

## What changes
- Remove the pale blue (left) and pale peach (right) shapes behind the content, so the card is plain white (dark card in dark mode).
- Keep everything else as it is: the grey veil around the card, the rounded corners, the red-orange-yellow bottom strip, the close X, the heading, waving Fiti and the "Let's Practice" button.
- Check that the waving Fiti has no faint box around it on the plain card.

## Technical details
- `src/components/lesson/SimStage.tsx`: delete the decorative `<svg>` holding the two `--practice-shape-*` paths in the practice dialog.
- `src/styles.css`: remove the now-unused `--practice-shape-left/right` tokens (light and dark) if nothing else uses them.
