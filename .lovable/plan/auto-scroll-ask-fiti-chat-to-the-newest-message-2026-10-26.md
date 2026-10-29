# Auto-scroll Ask Fiti chat to the newest message

## Why it happens
The chat jumps down only once, when a new message is added. Fiti's reply then types itself out and its buttons appear afterward, so the conversation grows below the screen and the latest lines and buttons sit behind the typing box.

## What changes
- The chat keeps following the newest message while Fiti types, and again when his buttons or options appear.
- Opening a saved conversation (or coming back from the map) lands on the latest message, not the top.
- If the student scrolls up to read earlier messages, the page stops pulling her down until she scrolls back near the bottom or sends a new message.
- The last message always clears the typing box (enough space below it).
- Reduced-motion users get an instant jump instead of smooth scrolling.
- Applies to both places this chat appears: Ask Fiti and the "Let's Begin" map chat.

## Technical details
- `src/components/home/FitilaAgent.tsx` `Conversation`: replace the single `scrollIntoView` effect with a `ResizeObserver` on the list that scrolls to `end` while a "stuck to bottom" flag is true; flag is updated from window scroll (within ~120px of bottom) and forced true when a student message is added or on first mount with history (instant scroll).
- Add `scroll-margin-bottom` / bottom padding on the end marker equal to the composer height so content is not hidden behind the sticky AskBox.
- Respect `prefers-reduced-motion`.
- Check at 1377x892 and phone width in the app after building.
