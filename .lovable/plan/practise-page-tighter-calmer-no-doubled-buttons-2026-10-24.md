# Practise page: tighter, calmer, no doubled buttons

## What's crowding it (from the screenshot)
- "Teach me / I'll try alone" and "Problem 2 of 5" sit on two separate rows.
- The graph is very tall, so the working area gets pushed below the screen.
- The maths keys repeat themselves: "÷" and "/" do the same thing, and the arrow keys repeat what the cursor already does.
- Undo, Redo and Clear are three pills for one job.
- Fiti stands in a dark box that covers the edge of the card and the Clear button.
- The question words are still dark navy on the dark card.

## Changes
1. **One top row:** Teach me / I'll try alone on the left, "Problem 2 of 5" and the dots on the right, on the same line. On phones they stack.
2. **Smaller graph:** about two-thirds of its current height, centred under the question, so the question, graph and working all fit on a laptop screen without scrolling.
3. **Fewer keys:** remove "÷" (keep "/" for fractions), and remove the "←" and "→" keys. The row gets wider, easier-to-tap keys.
4. **One undo:** keep Undo and Clear. Remove Redo.
5. **Fiti:** no box behind him, and he sits beside the card instead of on top of it, so he never covers Clear or the input.
6. **Question text:** near-white in dark mode, so the whole question can be read.
7. **Labels:** the working label shortens to "Your working". The "tap a line to ask about it" tip shows only once she has written a line.

## Also included
- **Phones and tablets:** on phones the top row stacks, the graph stays behind "Show graph", and small Fiti stays in the corner. On tablets, Fiti moves below the card if there isn't room beside it.
- **Typing still works:** she can still type ÷ or use the arrow keys on a real keyboard. Earlier lines that use ÷ still show and are checked as before.
- **Hint pill:** "Tap me for a hint!" stays next to Fiti and never covers the input or the Check button.
- **Check this line:** stays in reach right under the input on every screen size.
- **Check on screen:** I'll check the page in a signed-in lesson at phone, tablet and laptop sizes, in both themes, after the change.

## Not changing
How lines are checked, the hint, Teach me, Ask Fiti, the sounds and confetti, or light mode colours.

## Technical details
- `src/components/lesson/PractiseStage.tsx`: merge the mode tabs and the problem row into one `flex` row (stack below `sm`); graph wrapper to `md:w-[min(420px,50%)]`; drop the `÷`, `←` and `→` entries from the key list; remove the Redo button and its state; show the tip suffix only when `lines.length > 0`.
- `mcq/WarmupShell.tsx` `#practise-fiti` slot: transparent background, and the content column gets right padding equal to Fiti's width so they don't overlap.
- Check why `.dark .pr-scope` isn't reaching the question heading (the screenshot may be from before that change); fix it if it's still navy.
