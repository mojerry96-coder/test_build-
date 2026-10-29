# Choose page cards + video reaction position

## 1. "Choose learning mode" page (match screenshot 3)
- Heading text becomes "Choose learning mode" (page title and description updated to match).
- Replace the tall round pills with two equal rounded-rectangle cards (about 270 x 165 px on a laptop, ~22px corners). Each card is white with a thin coloured border and a thick coloured base underneath (blue for Solo, orange for Together), and keeps the same press bounce.
- Inside each card: the mode name on one line in the heading font (~30px), with the small line under it in the body font (~16px), centred and wrapping to two short lines. "Together Mode" no longer breaks onto two lines.
- Phones: the cards stack full width (up to 420px). Dark mode keeps the existing card colours so it stays readable.
- The "coming soon" note and the loader stay the same.

## 2. Video step: reaction replaces the side Fiti
- Fiti's reaction no longer plays inside the video frame.
- While a reaction plays, it takes the place of the Fiti who sits beside the video today, at exactly the same size and spot. When it ends, the usual side Fiti comes back.
- Only one Fiti is ever on screen. Reaction timing and voice stay the same.
- Phones and low-data mode follow whatever the side Fiti does there today (same spot, and the still picture where the side Fiti is a still).

## Also included
- The reaction keeps the side Fiti's alignment, so it doesn't jump or shift the page while it swaps in.
- If a reaction is still playing when the next clip starts, the side Fiti comes back cleanly.
- I'll check both pages on a laptop and a phone, in light and dark mode.

## Technical details
- `choose.tsx`: new card classes in place of `PILL`/`SUB`; heading and head() copy.
- `FlowVideoStage.tsx`: remove the in-frame reaction `<video>`; instead send the reaction id with the existing `fiti:hide`/`fiti:show` events (e.g. `fiti:react` with detail).
- `WarmupShell.tsx`: the Fiti slot renders the reaction clip (transparent webm, same box/classes as the side Fiti) while one is active, then goes back to the normal pose.
