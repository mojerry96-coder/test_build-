# Fix: teaching Fiti (pointer stick) cut off on the left

## Cause
The teaching Fiti moving clips (idle and pointing, light and dark) were made with the bird's left wing and tail already cut off at the clip's edge. Widening his space last time couldn't help, because the missing part isn't in the clip at all. The see-through still picture of the same pose is complete (whole wing, red tail, both feet).

## Fix
- Show the complete see-through still of teaching Fiti instead of the cut-off clips, everywhere this pose appears (worked-example board, practise "watch Fiti work it out", the hint Fiti).
- Keep him alive with the gentle sway he already has, plus a small "point" nod when he points at a line, so the board still feels animated.
- No white box behind him in light or dark mode, because the still has no background.
- Sad and celebrate reactions stay as they are.
- Same size and spot; the speech bubble stays above him.

## Later (needs you)
If the animation team can send a green-screen version of the pointing clip with the whole bird in frame, I'll turn it into a see-through moving clip like the looking-around one and switch back to it.

## Checks
- Open a worked example and the practise board on laptop, short laptop and phone, light and dark: whole bird visible, no box, sway and point still play.

## Technical details
- `FitiClips.tsx` `PointerFiti`: render `pStill` (`object-contain object-bottom`) for idle/point instead of the mp4s; "point" adds a short CSS tilt/nudge keyframe and still calls `clipEnded` after its duration so the clip controller timing is unchanged.
- Revert the `aspect-[600/720]` change in `WhiteboardDialog.tsx` to the still's own shape (`aspect-[748/1065]`).
- Leave the mp4 pointer assets in place (unused) until the replacement clip arrives.
