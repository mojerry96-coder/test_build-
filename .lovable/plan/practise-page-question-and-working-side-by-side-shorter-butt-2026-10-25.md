# Practise page: question and working side by side, shorter button, Fiti sits on Ask Fiti

## What changes
1. **Two columns on laptop:** the question card with its grid goes on the left and "Your working" (lines, input, maths keys) on the right. Both start at the same top line, are the same height and have the same rounded corners and edges as today. Teach me / I'll try alone and "Problem 1 of 5" stay in one row above, spanning both.
   - The maths keys wrap into rows that fit the narrower column (about 7 per row).
   - Tablet and phone: stacked as today (question, then working).
2. **Check this line** uses the shorter video-card button: centred light-blue pill, about 340 x 56 px, with the darker bottom edge. It sits under the working column, with "Write the next line first" under it. "Next" uses the same button.
3. **Fiti without the white box:** the pointer video has a white background baked in. On this page Fiti becomes the clean see-through picture (no box), so he blends into the page in light and dark mode. The tap-for-hint, nudges and hint card keep working.
4. **Fiti sits on Ask Fiti, on the left:** he moves from the right side to the bottom left, perched on top of the Ask Fiti button, in place of the flask drawing. His "Tap me for a hint!" pill shows to his right. The right side is freed, so the two columns get more room.

## Also
- Laptop 1377x892: question, working and the button fit without scrolling.
- Phone: Fiti stays small at the top right as today; Ask Fiti stays at the bottom.
- When Ask Fiti chat is open, Fiti hides with the button (as the button does now).
- Dark mode: the new button uses the existing dark button colours (already checked for readability).
- Long working: the right column scrolls inside itself so the question on the left stays in view; the newest line stays visible.
- The question card keeps the graph centred in its column and the question text wraps cleanly.
- "Worked together" lines (Teach me) stay in the left card under the question.
- Fiti still points and reacts (small hop on a right line, nudge after stillness) using the see-through picture, and his chat pill never covers the Ask Fiti button.
- Keyboard order: question, working input, maths keys, Check this line, then Ask Fiti.
- Check: screenshots light and dark on laptop, plus tablet and phone, next to your screenshot.

## Technical details
- `PractiseStage.tsx`: wrap question + working sections in `grid lg:grid-cols-2 lg:items-stretch gap-5` (each section `h-full`); keys grid `lg:grid-cols-7`; CTA → `vl-cta mx-auto flex h-14 w-full max-w-[340px] rounded-full`.
- Fiti: replace `FitiClips variant="pointer"` here with the transparent still `fitila_pointer.png` (confirm it has no white; if it does, use `parrot-think-glasses.png`), keeping the hop/glow/tag classes.
- `WarmupShell.tsx`: add a `fitiLeft` slot rendered above the Ask Fiti buttons (bottom-left), hiding the flask doodle when used; `#practise-fiti` moves into it; drop the right-padding reserve for this page.
- No server or content changes.
