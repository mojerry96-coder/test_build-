# Practise page: bigger graph and working area, number keys, simulation-style hints

## 1. Bigger graph and working area
- **Wider page:** the two cards use more of the screen, about 1400 px in total on big screens instead of 1100 px. The left side stays clear for Fiti and Ask Fiti.
- **Bigger graph:** the graph fills about 90% of the question card's width, roughly 2.5 times its current size.
  - The point labels like (1, 2) and the grid numbers get bigger, about 16 px.
  - The dots and the line get thicker.
- **Bigger working area:**
  - The working card is as tall as the question card.
  - The line box is taller, about 64 px, with bigger text.
  - The keys are bigger, about 56 px.

## 2. Missing keys in "Your working"
- Today the keys only have symbols (see screenshot). She can't tap any numbers.
- Add the number keys 0-9, a decimal point and the letters **x**, **y**, **m** and **c**, so she can write lines like y = 2x + 0 and m = (6 − 2)/(3 − 1).
- Layout, in groups:
  - number pad first (7 8 9 / 4 5 6 / 1 2 3 / 0 .)
  - then letters
  - then symbols and delete
- Phones: the keys wrap so every one stays at least 44 px.
- The key list is still one shared list, so the marking stays the same.

## 3. Hints drop in like the simulation
- Today, asking for a hint opens the empty Ask Fiti chat (screenshot).
- Instead, a hint works like the simulation does. The approved hint drops in as Fiti's tip pill or small hint card next to him, with no chat opening.
- It is read aloud once.
- After the first hint, tapping again shows the same hint.
- This applies to tapping Fiti, the "Tap me for a hint!" pill and any Hint button on this page.
- The Ask Fiti button still opens the chat for her own questions.

## 4. Fiti disappearing when tapped
- **Likely cause (not yet confirmed):** Fiti and the Ask Fiti button sit in one corner group. The page hides that whole group whenever the chat opens on a laptop. So a hint tap that opens the chat takes Fiti away with it (screenshot).
- **First step:** confirm this cause by tapping Fiti on the page.
- **Fix:**
  - Hints no longer open the chat (point 3), so Fiti stays put.
  - When she opens Ask Fiti herself, Fiti stays visible beside the chat or comes back the moment it closes. He never vanishes with nothing in his place.
- The blue ring that shows around him all the time goes too. It now shows only when she moves to him with the keyboard.

## Checks
- Laptop 1377x892: everything still fits without scrolling. If it gets tight, the graph shrinks first.
- Tablet and phone: the cards stack, and the graph uses the full card width.
- Dark mode: the graph labels and the new keys stay readable, with a readability check for the label colour.
- Screenshots on a laptop and a phone, in light and dark. Tap Fiti and confirm the hint drops in and Fiti stays.

## Technical details
- `WarmupShell.tsx`:
  - Content width `max-w-[1400px]` when `fitiLeft` is set.
  - Render the `fitiLeft` Fiti outside the `!side` block, so it isn't removed when the chat opens.
  - Add `hintInline`, so the Hint button calls the stage's `showHint` instead of opening the chat.
- `PractiseStage.tsx`:
  - The keys become `PRACTISE_KEYS` = digits, `.`, `x y m c`, then the existing symbols, grouped with grid separators.
  - The `showHint` path shows the existing `HintCard`/tip pill only (as in the simulation), with no `setChatOpen`.
  - Graph wrapper `w-full`, keys `min-h-14`, input `h-16 text-[22px]`.
- The two-point graph component scales to its container. Its label and tick font sizes, dot size and line width go up.
- Small test: the practise keys include 0-9 and x/y, and keep one key per job.

## Also included
- **Layout:** the agreed sample is the guide, with numbers on the left, letters and symbols on the right, and the hint card beside Fiti.
- **Phone typing:** tapping the line box on a phone does not open the phone's own keyboard on top of ours. Ours stays the main one, but she can still type if she wants.
- **Typed keys:** typing on a laptop keyboard still works. Letters other than x, y, m and c are allowed too.
- **Hint card:**
  - Closes when she taps outside it, starts typing, or taps "Check this line".
  - Never covers the working card or the Check button.
  - On phones it shows as a small card above the keys.
- **One voice at a time:** a new hint stops the old line playing. Closing the card stops his voice.
- **Hint record:** the hint is still saved the same way, as hint used, so her score and the parent summary stay correct.
- **Graph accuracy:** the axis numbers come from the question's own points. The graph never shows the answer or the rise/run lines.
- **Reload:** her written lines and the hint she has already seen stay after a reload.
- **Easy reading:** every key has a spoken label, like "seven" or "x". The hint card is announced to screen readers.
