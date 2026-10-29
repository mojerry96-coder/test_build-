# Fiti's reactions keep moving, reset on each new question, and the hook note moves beside him

## 1. Reactions keep playing
Today the sad clip (and the new celebration clip) plays once and then freezes on its last frame, so Fiti looks stuck after a moment.
- After a wrong answer, Fiti's sad clip loops gently the whole time it's on screen, beside the question and on the "You got close!" card.
- After a right answer, the celebration loops on the "You got it!" card while it's open. The right-side Fiti cheers once and then goes back to his normal pose.
- Low-data mode and reduced motion still show a still picture.

## 2. Each new question starts with the usual Fiti
- When the next question appears (warm-up, try-one-alone and the hook), the reaction clears and the original thinking Fiti with the question mark comes back.
- The sad clip still holds for as long as she's on the same question, until her next answer.

## 3. Hook: the yellow note sits beside Fiti
- The yellow note after her prediction ("You think Path B is steeper. Keep that in mind…") no longer pushes into the question area above the answer tiles.
- It shows as a speech bubble just beside Fiti, the same spot his warm-up bubble uses. It keeps the same words, typing and voice.
- On phones, where Fiti sits at the top, the note stays under the question as today, so nothing is covered.

## Checks
- Wrong answer, then a new question: sad keeps moving, then the thinking Fiti returns. Right answer: the celebration loops on its card.
- Hook: answer, and the note appears beside Fiti, with the tiles unmoved. Checked in light and dark mode at the laptop size you use.

## Technical details
- `WarmupShell` `Parrot`: add `loop` to the sad video and clear `react` when `itemId` changes (pass `itemId` into `Parrot`, or key the `Parrot` on it). The cheer stays non-looping and clears on end. `WarmupPopup` and `QfCards` videos get `loop`.
- `HookStage.tsx` line 223: on desktop (not phone), render `bubble` through a portal into a new `#warmup-bubble` slot that `WarmupShell` places where its `bubble` prop renders (above and left of the parrot). Keep the inline pill for phones.
