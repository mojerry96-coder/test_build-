# Warm-up page: orange numbers, tip pill, Ask Fiti chat on the left

Your three screenshots are the exact design for this page: the colours, sizes, spacing, positions and pictures will match them. I'll only change two things, as you chose: the tip pill shows the approved tip instead of the XP text, and the chat title says "Fiti". The "Jupiter" answers in the screenshots are placeholders, so the real approved answers stay, along with the grid where a question has one.

## 0. Items added after checking the screenshots again
- Answer choices: white pill-shaped rows, about 285 × 56 px, in a 2 by 2 grid. Each has a thin grey outline, a small grey circle with the letter on the left, then the answer text in a small plain font. A picked answer turns solid orange with white text, a white letter circle and a white tick on the right. These replace the coloured block tiles. A right answer still turns green, and a not-quite answer turns amber with its icon, never red.
- Check Answer: a smaller light-blue pill, about 255 × 50 px, with a darker blue bottom edge and white text. It sits centred under the answers, or lines up on the left when the chat is open.
- Question: big handwritten navy text, centred over two lines, with the point in orange.
- Top bar: only the uLesson logo, Dark mode and her name with a round picture. The side menu, stop strip, progress dots and sound button are hidden on this page. Please confirm: should the sound button and progress dots really go?
- Parrot: the thinking parrot with the question mark stands bottom right, with no speech bubble. Fiti's lines appear in the chat and the tip pill instead.
- Hint and Ask Fiti sit bottom left as two outlined buttons: yellow Hint with a bulb, and blue Ask Fiti with the bird icon.
- Background: the soft pale blob shapes from the screenshots.

## 1. Numbers in the question
- Each number or point in the question text, such as "(3, 2)", is shown in the design's orange (about #D9572A). The rest of the question stays navy.
- The colour is a design token, and it has a lighter orange version for dark mode that passes the contrast check.
- Grid labels and answer tiles stay as they are.

## 2. How the tip shows
- When she taps Hint, a soft yellow pill rounds into view just above the Hint and Ask Fiti buttons.
- The pill has an × on the left, then the question's approved tip line. It uses the same font size and rounded shape as the design.
- The × closes the pill. The Hint button then shows "Tip shown", and tapping it opens the same tip again; it never shows a new one.
- The tip still comes only from approved content. There is no XP text, because the app has no XP points.
- The tip no longer shows in the parrot's speech bubble.

## 3. How Ask Fiti opens the chat
- On desktop, Ask Fiti opens a floating chat card on the left, as in the design. It is not a drawer from the right.
  - The card has a white background, rounded corners and the thick navy bottom edge, and it is about 345 px wide.
  - Its header has the tutor's round picture, the name "Fiti" from the protected name setting, the chat-history and sound icons, then minimise and close.
  - Below the header, the parrot asks "What do you need help with?". This is an approved fallback line; if it isn't in the content yet, I'll add it as a draft for Instructional Design to approve.
  - At the bottom: an "Ask about anything…" box with a mic and an orange send button.
- While the chat is open, the question, tiles and Check Answer move right and line up on the left, as in the design. The Hint and Ask Fiti buttons hide, and the parrot stays bottom right.
- Minimise or close brings back the centred layout.
- The chat uses the same lesson chat as now: the same replies, safety checks and history.
- On phones, the chat still opens as a bottom sheet.

## 4. Parrot
- The parrot uses the thinking pose with glasses and the golden question mark you uploaded. I'll add both pictures to the app.
- When she's working on a question, the parrot stands bottom right with the question mark above its head. Its other moods stay as they are.

## Not checked or open
- Questions with a grid keep the grid next to the tiles. The chat-open layout there puts the grid above the tiles, so everything still fits.
- I'll check desktop. Dark mode and phone will be noted as unchecked unless you want them checked.

## Technical details
- `WarmupStage.tsx`: the question text renderer wraps number/point tokens (a regex on digits, commas and brackets) in a `text-q-num` span. New tokens `--q-num`/`--q-num-dark` go in `src/styles.css`, and the contrast check gets updated.
- `mcq/WarmupShell.tsx`: new `TipPill` state (open/closed, tip text from the hint reply already returned by the ask path). The Sheet is replaced on desktop by a left `aside` card that renders the existing `TutorChatPanel` contents. A `chatOpen` class on the stage switches it to `justify-start` with a left margin. The phone Sheet stays.
- Assets: `lovable-assets create` for the parrot and the question mark, saved to `src/assets/tutor/`. The `Parrot` "thinking" pose uses them.
- Update `src/components/lesson/AGENTS.md` (warm-up chat is a left card on desktop) and add a test for number-token wrapping.

## 5. Also added (not shown in the screenshots — confirm or change)
- After Check Answer: there's no speech bubble, so Fiti's reply plays in the same yellow-style pill above Hint (the tip pill). A right answer uses a green pill, and a not-quite answer uses an amber pill with its icon. If the chat is open, the reply plays there instead.
- Phone: the question goes on top, then the answers in one column, then Check Answer fixed at the bottom. The tip pill sits just above Hint and Ask Fiti. The chat opens as a bottom sheet with the same header. The parrot is smaller.
- Dark mode: the answer rows, tip pill and chat card get dark versions that pass the contrast check. The picked answer stays orange.
- Sound button and progress dots: hidden on this page until you confirm.
- Questions 2 and 3 use this same layout.
