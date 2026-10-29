# Picked answer stands out; other answers stay fully visible

## Problem
When she picks an answer, the other three cards fade to 70%. That makes them look switched off, as if they were hidden.

## Change
- **Other cards:** they stay at full colour, full strength, and can still be tapped to change her pick.
- **Picked card:**
  - Lifts higher with a small pop.
  - Gets a thick outline in a darker shade of its own colour, with a soft glow.
  - Shows a round tick badge in its top-right corner.
  - Its letter badge turns solid white with the letter in the card's colour.
- **Reduced motion:** the lift and pop are off, but the outline, glow and tick still show.
- **Dark mode:** works as before.

## Technical details
- `src/styles.css`: delete the `:has(...) > .mcq-tile:not(...) { opacity: .7 }` rule. Strengthen the picked state (`translateY(-6px) scale(1.05)`, 5px outline in `--e`, larger glow).
- Add a `::after` tick badge (filled circle in `--e`, white check drawn with CSS) on `[aria-checked="true"]`, and give the letter badge an inverted style. No component or logic changes.
