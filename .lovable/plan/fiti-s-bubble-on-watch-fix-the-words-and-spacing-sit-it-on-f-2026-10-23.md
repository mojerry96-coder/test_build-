# Fiti's bubble on Watch: fix the words and spacing, sit it on Fiti, add "Tap me for a hint!"

## What's wrong
- The words in the bubble still run together ("Therewego!Yourturnnow."). The gaps between the popping words collapse.
- The bubble floats at the very top of the column, far from Fiti's head, so it reads as loose text over the screen.
- On the Watch part there is no "Tap me for a hint!". It only shows on Your turn.

- Second screenshot ("Let'sslowdownthedividingstep."): same joined words, and the bubble is cut off at the left edge of the card.

## Changes
1. **Spacing that can't collapse:** each word gets its own space on its right, so words never touch, whatever the font or motion setting. This covers every line Fiti says in the bubble, plus every other place where his words appear one at a time (hint card, "You got it!" card, chat lines).
1b. **Bubble never cut off:** the bubble stays inside the card with a small margin on every side and is centred over Fiti. It shrinks to fit narrow screens, so no edge is hidden.
2. **Bubble sits on Fiti:**
   - The bubble is pinned just above Fiti's head, with its tail pointing at him, and moves with his size on every screen.
   - Long lines wrap inside the bubble, up to 3 lines, and never overlap the panel or the top buttons.
   - On phones the caption under the panel stays as it is now.
3. **"Tap me for a hint!" on Watch too, reusing the same tip:**
   - Same label on Fiti's chest, same hop and glow, same wait setting, shown for 3 seconds.
   - On Watch it appears only once the example has finished, or while it's paused. It never shows while Fiti is writing or talking.
   - Tapping Fiti on Watch opens the same hint card. It's titled with the question being explained, and its text is the approved line Fiti is on. Nothing new is written and no answer is shown beyond what the example already showed.
   - On Your turn it works as now, with the step's approved hint.

## Technical details
- `styles.css`: `.qf-word { margin-right: .3em }` (last child 0). Drop the reliance on text-node spaces.
- `WhiteboardDialog.tsx`:
  - Fiti column becomes `relative flex flex-col justify-end`. The bubble renders in normal flow directly above the avatar (`mb-2 max-w-[340px] line-clamp-3`) instead of `absolute top-[2%]`, so it can't overlap the header row.
  - The tip and `onFitiTap` are allowed while `!live || all || paused`.
- `QuickFix.tsx`:
  - The idle timer also runs on the Watch part once it has ended or is paused.
  - The Watch tap opens `HintCard` with `title` = watch heading/question text and `body` = the current or last watch line, read from data already on screen.
  - Your turn keeps `repairHintFn`.
- Run `src/test/idle-hint.test.ts` only.
