# Quick fix board: drop the header, use our buttons

## What changes (quick fix whiteboard only)
- Remove the "Quick fix · about 1 minute" title with the spanner icon at the top of the board.
- "Skip for now" becomes our orange handwritten link with an arrow, styled like "Skip to next lesson →". The words stay "Skip for now". It sits top right next to the close X.
- "Your turn" (and "Got it") becomes our light-blue 3D button from Check Answer: rounded pill, darker blue base, presses down when tapped, and gets the same bounce on hover as the top buttons.
- "Watch again" becomes the matching outline version: white pill with a blue border, the same darker base and the same press and bounce.
- Dark mode uses the same tokens, so the buttons stay readable. Reduced motion turns off the bounce.

## Technical details
- `WarmupStage.tsx` topBar: delete the `<h2>` (Wrench + `fixHeader`); keep a right-aligned skip button with `font-hand text-q-num` + `ArrowRight` icon, min 44px touch target.
- `QuickFix.tsx` `PRIMARY` and the `WhiteboardDialog.tsx` default CTA: switch to the shared CHECK style (`bg-fh-primary`, `shadow-[0_5px_0_var(--fh-primary-edge)]`, active press) plus `hdr-bounce`. Move CHECK into one shared constant so the warm-up and the quick fix use the same one.
- `WhiteboardDialog.tsx` `OUTLINE`: `bg-fh-card` + `border-fh-primary` + `shadow-[0_5px_0_var(--fh-primary-edge)]`, same press and `hdr-bounce`.
- `hdr-bounce` keyframes currently use the dark-button edge colour. Make the shadow colour a variable (`--bounce-edge`) so primary buttons keep their own base colour.

## Warm-up question screen: match the design
- Remove the graph card from the warm-up question screen (see the second screenshot). The question and answer tiles sit centred on their own.
- Layout as in the design: big handwritten question centred at the top, the 2×2 coloured answer tiles (A blue, B orange, C green, D yellow) centred under it, Check Answer centred below, Hint and Ask Fiti bottom left, and the thinking parrot bottom right.
- Numbers in the question stay orange, e.g. (3, 2).
- The graph still appears inside the quick fix whiteboard, where Fiti draws on it to explain.
- Question and answer wording keep coming from the lesson content (the design's shorter wording is Instructional Design's call).

### Technical details
- `WarmupStage.tsx`: stop rendering the item figure (`<figure>` board) on the warm-up question view, and centre the options grid (`max-w-[420px]`, 2 columns from small screens up). Keep `splitNumbers` + `--q-num` for the question.
- Leave the `PointBoard` used by `QuickFix` unchanged.

## Added after review
- Questions that need the picture to be answered (e.g. "read the point from the graph") keep their graph, so no question becomes impossible. Only questions whose text already gives the numbers lose it.
- The quick fix and the video-check questions get the same centred tile layout, so every question screen looks alike.
- Phones: tiles stay 2×2 when the answers are short numbers and stack one per row when they're long. The parrot gets smaller so it never covers the tiles or Check Answer.
- Check Answer stays greyed and says "Choose an answer first" until a tile is picked; Skip for now keeps working while Fiti is still writing.
- Check in light and dark mode, on a laptop and a phone.
