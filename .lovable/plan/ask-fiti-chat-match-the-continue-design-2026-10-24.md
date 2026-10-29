# Ask Fiti chat: match the "continue" design

This applies as soon as the chat opens: once she types, taps a card, or picks a quest. It covers every Fiti message that sends her somewhere: Continue learning after Back from the map, a picked quest or topic, and "Ready to pick up where you stopped?".

## What changes
1. **Fiti's words** are written in the same handwriting style as her own messages, in navy at the design's size, instead of the current bold plain font.
2. **"Continue Learning" button:** a large white pill with a thin navy border and a deeper navy bottom edge. It sits on its own row, lined up with the right edge of the ask box, just above it, as in the design. It lifts slightly when she points at it, presses down when tapped, and still opens the topic's map.
3. Only Fiti's **latest** message shows this button, so older messages don't keep extra buttons.
4. **Other choice buttons** (Sure!, I enjoy it, Let's just start…) stay as small blue pills under Fiti's message. Only the buttons that send her somewhere get the new style.
5. The **numbered quest list**, her bubbles with initials, the ask box, the header and the side bar already match the design and stay as they are.

## Sizes and modes
- **Phones:** the button spans the full width above the ask box, at least 48px tall, and stays in reach above the keyboard.
- **Tablet and laptop:** right-aligned, as in the design.
- **Dark mode:** a light outline on the dark background, with readable text that passes our dark-mode readability check.
- Keyboard focus ring, plus a screen-reader label naming where it goes.

## Also included
- **The button appears only after Fiti finishes writing,** never halfway through his sentence.
- **One tap only:** after she taps it, the button is locked, so a double tap can't open two maps or send a message twice.
- **Locked quests:** the button shows only for topics the server says are open. It never appears for a locked quest.
- **Scrolling:** the chat scrolls so the button and ask box are both visible when it appears.
- **Text size setting** works on Fiti's handwriting and the button label, and long labels wrap instead of being cut off.
- **After Start again or New Chat,** no old Continue button is carried over.
- **Same look in a quiz chat** and in a plan chat whenever a button sends her somewhere.
- **Sound and bounce:** the existing tap sound and bounce, with no bounce when reduced motion is on.

## Not changing
What Fiti says, which topic the button opens, the chat logic, or the voice.

## Technical details
- `FitilaAgent.tsx` `ConvTutor`: change the message `p` to `font-hand text-[clamp(19px,1.5vw,22px)] font-normal leading-snug text-fh-heading`.
- Split `m.buttons` into link buttons (`b.link`) and plain buttons. Plain ones keep the current pills. Link buttons render through a new `ContinueButton`, placed in `Conversation` after the list (`flex justify-end`, full width below md), for the last tutor message only.
- New tokens `--fh-continue-line` / `--fh-continue-edge` in `src/styles.css` (root and `.dark`), plus the pair added to `dark-contrast.test.ts`.
- Same treatment in `TutorLine` for consistency.
- Headless screenshots of the chat with a Continue button at 1377x892, 1024 and 390, light and dark.
