# Bring the parrot closer to the ask box on big screens

## Problem
- On wide screens the parrot is pinned to the screen's bottom-right corner, so the wider the screen, the further it drifts from the ask box and cards.
- In your screenshot (1920px) there is about 200px of empty space between the cards and the parrot.

## Change
1. **The parrot moves with the ask box, not the screen edge:**
   - Its left edge sits about 40px to the right of the cards' right edge.
   - Its top sits level with the cards, as in your spec, so it waves "at" the box.
   - It stays the same size: about 28% of screen height, max 340px.
2. **Narrower screens (1100–1440px):** it shrinks a little so it never covers the cards. If there isn't room beside the cards, it hides rather than overlapping. Phones stay unchanged, with the parrot hidden.
3. **Very wide screens (2560px+):** the heading, box, cards and parrot stay together as one group in the centre, so nothing drifts apart.
4. **Text box focus:** the inner blue rectangle that appears around the text area when you click into it (visible in your screenshot) is removed. The whole box shows one soft blue ring instead.

## Check
Screenshots at 1440, 1920 and 2560 wide, comparing the gap with the spec.

## Technical details
- In `_authenticated/index.tsx`, move the parrot `<img>` out of the fixed position. Place it inside the `<main>` content wrapper (`relative`), absolutely positioned at `left: calc(100% + 40px)`, `top` aligned to the cards row, using `min-[1100px]:block`, with a height clamp tied to the available side space.
- In `AskBox`, remove the textarea's own outline/ring and add `focus-within:ring-2 ring-fh-box-edge/40` on the container.
