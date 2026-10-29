# Fix overlapping text on Fiti's whiteboard ("Your turn")

## What this page is
It's the **quick fix** whiteboard. When a student misses a warm-up question, Fiti opens the whiteboard, shows a worked example ("Watch how it's done"), then gives her a short "Your turn" practice. In the screenshot she is on a Your turn step: Fiti's faded tip lines ("1. Across comes first, up comes second." / "2. Now the point (5, 1).") sit at the top, and her task ("…grid: drag it into place, then tap Check.") with the grid and Check button sits below.

## The problem
On the Your turn step, the task, grid and Check button need more height than the board has left. Fiti's tip lines get squeezed to almost nothing, and the task text is drawn on top of them, so two lines of text overlap.

## The fix
- Fiti's tip lines keep their full height and never get squeezed under her task.
- Only the latest 3 tip lines show during Your turn (not up to 6), which frees room for the task and grid.
- If the board still runs out of room (short laptop screens), the whole writing area scrolls as one block inside the board instead of stacking text.
- Give a clear small gap between Fiti's tip lines and her task.

Check at 1377x892, 1280x720 and phone size, in light and dark mode, with the grid ("drag the point") step and a typed-answer step.

## Technical details
- `src/components/lesson/whiteboard/WhiteboardDialog.tsx`: when `footer` is set, make the lines row `flex-none` (not `flex-1 min-h-0`), move `overflow-y-auto` to the inner `absolute inset` column, and drop `min-h-0 overflow-y-auto` from the `wb-turn` footer so it flows below the lines.
- `src/components/lesson/QuickFix.tsx`: `capacity={trying ? 3 : 3}` (i.e. 3).
- Design-only; no content, engine or marking changes.

# Check Answer: default (nothing picked) look

## The problem
Before she picks an answer, Check Answer shows as faint grey text with no button behind it. The spec shows it as the full blue raised button with white text and its darker blue bottom edge.

## The fix
- Before a pick, Check Answer looks like the spec: blue pill, white text, darker blue edge. It stays untappable (tapping before choosing still says "Choose an answer first" where it does today), only slightly softer, never grey or invisible.
- Once she picks, it lifts to full strength and bounces on hover as now.
- Same look on the warm-up, practice "Your turn" question and quiz, in light and dark mode.

## Technical details
- `src/components/lesson/WarmupStage.tsx` `CHECK`: replace `disabled:opacity-50 disabled:shadow-none` with `disabled:opacity-80 disabled:bg-fh-primary disabled:text-fh-primary-ink disabled:shadow-[0_5px_0_var(--fh-primary-edge)]`, and stop the hover bounce while disabled; check whether the shared Button base adds its own disabled grey and override it here only.
