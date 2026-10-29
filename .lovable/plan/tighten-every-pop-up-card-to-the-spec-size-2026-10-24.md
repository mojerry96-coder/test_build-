# Tighten every pop-up card to the spec size

The same sizes and corner rounding apply across the board:
- "Great Choice!" (Ask Fiti)
- "Quick Check" (map)
- The warm-up "You got close!" card ("Let's fix it" / "Skip for now"), plus its other moods ("Nice one!" and similar), which use the same pop-up

All of them follow the measurements below. The warm-up card keeps its thinking Fiti (now about 120px tall). "Skip for now" stays a small text link under the button, with a small gap.

## What changes (measured against your screenshot 2)
- **Smaller card:** about 465px wide on a laptop (about a third of the screen), not 650px. Less space above, below and between items, so the card is compact and sits in the middle of the page.
- **Fiti:** about 120px tall, inside the soft round crop at the top centre (now almost 200px).
- **Heading** ("Quick Check" / "Great Choice!"): about 34px in the handwriting font (now about 52px), with a small gap above the line.
- **Line:** about 15px in a softer navy, wrapped onto two centred lines when long, as in the design.
- **Button:** about 185px wide and 46px tall, solid light blue with a deep blue bottom edge and no outline ring. It presses down when tapped.
- **Orange edge:** a thicker curved band that shows below the white card and follows its rounded bottom corners, dark orange on the left to light orange on the right (now a thin flat strip inside the card).
- **Decorations:** smaller and fainter. A soft-petal flower (not a sharp star) left of Fiti, the squiggle along the top-right edge, and a small cloud at bottom right.
- **Corners:** about 28px rounding, matching the design.

## Stays the same
The grey veil behind, the wording, what the buttons do, Fiti's voice, the sounds, Escape and tapping outside, and dark mode colours.

## Sizes
- **Phones:** the card fills the width with a 16px margin, and the button is full width and at least 48px tall.
- **Short screens:** Fiti shrinks first, so the button always shows.

## Technical details
- `WelcomeCard.tsx` only:
  - Card: `max-w-[clamp(340px,34vw,480px)]` with `rounded-[28px]`, wrapped in an outer div that holds the gradient (`wc-edge`, `rounded-[28px] pb-[10px]`) so the band follows the curve.
  - Spacing: padding `pt-[clamp(20px,4vh,36px)] pb-[clamp(20px,4vh,32px)]`. Fiti `h-[clamp(84px,14vh,124px)]`. Heading `text-[clamp(28px,2.5vw,36px)]`. Line `text-[15px] max-w-[330px] text-[var(--wc-ink)]/85`.
  - Button: `h-[46px] w-[185px] max-md:w-full`, with the shadow edge only.
  - New petal path for the flower, and smaller decorations.
- Check with a screenshot of the Quick Check at 1377x892 next to the spec.

## Also included
- **Other pop-ups in the lesson:** the video check pop-up and any other card that shares the warm-up pop-up get the same size and rounding automatically.
- **Long text:** headings and lines wrap neatly inside the smaller card, and nothing is cut off at the larger text-size setting.
- **Dark mode:** the smaller card keeps its dark colours and readable text.
- **Tablet landscape and short laptops (about 700px tall):** the whole card, including Skip for now, fits without scrolling.
- **Pop-in motion** stays the same, and no motion with reduced motion turned on.
- **Before and after:** I'll take screenshots of all three cards next to your specs at 1377x892 and on a phone.
