# Video check card: make choices readable in dark mode

In the screenshot the answer pills A–D are readable. What can't be read is everything under them:
- "Think so" and "Guessing" are white text on the white confidence bar.
- "How sure are you?" is dim navy on a dark navy card.
- The "Check Answer" text is pale on light blue while the button is waiting.

## Fix (dark mode only, light mode unchanged)
- Confidence bar: dark navy track (same as the answer pills), with a light outline. Unselected choices use light text and icons. "Sure" stays green when picked, and the others keep their own selected colours with white text.
- "How sure are you?" uses the card's light text colour.
- Check Answer: while waiting it shows a muted navy button with readable light text. When ready it turns full blue with white text.
- Every text must pass the AA contrast rule in `src/components/AGENTS.md`.
- These parts are shared, so the same fix covers the confidence choice everywhere else it appears.

## Also seen in the screenshot
- Answer pills: a bit more contrast on the outline and letter badge, and a clear selected state (orange fill, white text) in dark mode.
- Video under the card: the grey veil looks washed out in dark mode, so use a darker veil.
- Control bar: give it a dark navy fill with light icons and a readable CC icon. The section markers (orange ticks) should stay visible.
- Ask Fiti button overlaps the control bar, and Fiti's feet cover the CC icon. Leave room so neither covers the bar, on desktop and when the window is smaller.
- The question mark next to Fiti stays readable in dark mode.
- Keyboard focus rings stay visible on the dark card.

## Technical details
- `ConfidencePicker` (segmented) in `parts.tsx`: swap fixed light colours for tokens and add dark values in `src/styles.css`.
- `VideoStage.tsx`: the "How sure" label uses `text-fh-sub`/`text-fh-ink`, and the disabled Check Answer uses tokens instead of `opacity-75`.
- Check with one dark-mode element screenshot of the card.
