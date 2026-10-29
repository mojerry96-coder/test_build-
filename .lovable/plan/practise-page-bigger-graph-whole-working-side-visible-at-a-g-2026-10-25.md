# Practise page: bigger graph, whole working side visible at a glance

## What she will see (laptop, e.g. 1377x892)
- Both cards fill the space between the top row (Teach me / I'll try alone) and the bottom of the screen. No page scrolling.
- **Graph**: fills the whole empty space in the question card, both wide and tall, with no big blank margins left or right. Today it is narrow because the grid squares stay square and the picture only runs from 0 to 4 across but 0 to 7 up. The fix adds extra grid columns across, so the squares stay square and the grid reaches both edges of the card. It also adds rows when the card is taller, and the grid runs down to just above the card's orange edge. Axis numbers, point labels, dots and the line all get bigger to match. The two points and the line stay exactly where the question puts them.
- **Working side**, top to bottom, always all on screen:
  1. "Your working" title with Undo / Clear on the same row
  2. Her written lines. Only this list scrolls inside the card, and it always shows the newest line.
  3. The answer box
  4. The maths keys, a little shorter (smaller key height and gaps), so every row is visible, including the delete key
  5. **Check this line** button inside the card at the bottom, using our shorter button (and **Next** in the same spot once the problem is done). "Write the next line first" sits under it.
- "Hide earlier working" becomes a small link beside the title, so it no longer takes a row of its own.

## Phones and small laptops
- Phones keep the stacked layout, with the graph tucked behind "Show graph". Here the page scrolls as today, with the Check button right under the keys.
- On short laptop screens (around 700px tall) the keys shrink a bit more before the list loses space. The Check button never goes off screen.

## Checks
- Laptop screenshots at 1377x892 and 1280x720, light and dark, with 0 lines and with 6 lines written. Confirm no page scroll and that the Check button and every key are visible.
- One phone screenshot, to confirm nothing broke.

## Technical details
- `PractiseStage.tsx`: on `lg`, the two-card grid gets a fixed height, `h-[calc(100dvh-<top offset>)]` with `min-h-0`. The graph wrapper becomes `flex-1 min-h-0` instead of `h-[min(440px,46vh)]`, and `TwoPointGraph` font sizes scale up. The working section becomes a flex column: header `shrink-0`, the `ol` `flex-1 min-h-0 overflow-y-auto`, auto-scrolling to the end; input, keys and CTA `shrink-0`. The bottom CTA block moves into the section on `lg` only. Remove `lg:max-h` and the section's own overflow.
- `KEY` height uses a `clamp(…vh…)` so keys shrink on short screens.
- No change to the marking or hint rules.

## Also included
- Extra grid space never reveals anything: the added columns and rows are blank, with no extra points or answer hints.
- With very long working, the list scrolls inside the card and always jumps to her newest line. The input, keys and Check button never move.
- The hint bubble beside Fiti and the "Tap me for a hint!" pill still never cover the graph or the Ask Fiti button.
- When the Ask Fiti chat is open, both cards shrink to fit beside it, and the graph refits (it never overlaps the chat).
- The graph redraws to its new size when the window is resized or the chat opens or closes.
- Dark mode: the grid lines, axis numbers and point labels stay readable on the dark card.
- Keys keep a 44px minimum touch size even when they shrink on short screens.
