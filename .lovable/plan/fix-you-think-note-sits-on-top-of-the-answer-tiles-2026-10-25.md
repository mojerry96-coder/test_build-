# Fix: "You think…" note sits on top of the answer tiles

## What happens today
After she picks a prediction on the hook, the yellow "You think… the video will tell us!" note opens above and to the left of Fiti. On a laptop that spot is right on top of the answer tiles, so it hides them.

## Fix
- Move the note so it sits in line with Fiti: directly to his left, level with his body, with its little tail pointing at him.
- It stays in the empty space below the answer tiles and never covers the tiles, the question or Ask Fiti.
- On short laptop screens it shrinks its width slightly rather than climbing back over the tiles.
- Phones keep today's layout (note under the question).
- The same spot is used by the warm-up bubble, so that bubble also moves next to Fiti instead of over the tiles.
- Light and dark mode unchanged.

## Checks
- Hook prediction at 1377x892 and 1280x720, light and dark: note beside Fiti, tiles fully visible.
- Warm-up bubble still readable beside Fiti.

## Technical details
- `WarmupShell.tsx` `#warmup-bubble` slot: change from `bottom-[78%] right-[70%]` to `bottom-[30%] right-[calc(100%+12px)]`, `w-[min(360px,28vw)]`, with a right-pointing tail on the pill.
- `HookStage.tsx` note: drop `mt-4` when portaled.
