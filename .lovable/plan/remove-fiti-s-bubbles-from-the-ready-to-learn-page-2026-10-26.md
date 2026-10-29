# Remove Fiti's bubbles from the "Ready to learn" page

## Change
- The "Ready to learn" page no longer shows any Fiti bubble: no first-time hello with "Sure!" / "Let's just start", no daily hello and no "Ready to pick up where you stopped?" bubble.
- The page keeps the heading, the ask box and the cards.
- Fiti's messages and their buttons, including Continue learning, still show as soon as the chat opens, when she types or taps a card.

## Technical details
- `src/routes/_authenticated/index.tsx`: stop rendering the `startBubble` block on the start page. Keep the `startBubble` helper and its test.
- Update the AGENTS.md rule that says the start page shows Fiti's latest line in a bubble.
