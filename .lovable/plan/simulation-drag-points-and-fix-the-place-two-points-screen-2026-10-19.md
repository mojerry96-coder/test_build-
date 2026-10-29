# Simulation: drag points, and fix the "place two points" screen

## What's wrong in the last screenshot (two-points task, gradient 2)
1. **Tutor replies from the previous task.** While she's on "Place two points … gradient 2", the chat answers with lines from the previous task ("That ramp is too steep … more than one third", "What's the rule? Up how many for every one across?", "Here's one that works"). So the page and the server disagree about which task she's on.
   - Likely cause (not confirmed yet): the page moves to the next task, but the server still counts the previous one as open. The help and check answers then come from the old task.
   - First step: replay her saved session to confirm.
2. **A stray blue square** around the point at (1, 1). It's the tap area of a grid point showing up as a focus box after a mouse tap.
3. **A leftover dashed triangle** from (0, 0). The "one that works" hint picture belongs to the earlier task, or isn't cleared when the task changes.

## Fixes
- **One task, decided by the server.** The page always shows the task the server says is current, and Check, hints and "Here's one that works" all name that same task. If they ever disagree, the page refreshes to the server's task instead of mixing them. Any hint picture is cleared when the task changes.
- **No focus square on tap.** The keyboard focus ring shows only when she's using the keyboard. It shows as a soft ring on the dot, not a box.
- **Clearer lines.** Her placed line and triangle are drawn solid and stronger. The hint picture stays faint and dashed, so the two never look alike.

## Drag to place (every grid where she places points)
- **Two-points task:** she can drag either point to any grid crossing. It snaps to the nearest crossing as she moves, and the line and triangle follow live.
- **One-point tasks (Ramp Builder, Ramp Designer):** she can drag her end point the same way. The fixed start point can't be moved.
- **Tapping still works:** tap to place, then drag to adjust.
- **Easy to grab on a phone:** the drag area is large, and the page doesn't scroll while she drags.
- **Keyboard:** arrow keys move the focused point, and Enter places it.
- **Marking is unchanged:** a drag only counts as a move. Nothing is marked until she taps Check Answer, and the server still does all the marking. Answers never reach the browser.
- **Reduced motion:** the point jumps between crossings instead of gliding.

## Added safeguards
- **Not too many saves:** dragging records her move only when she lets go, not on every crossing. That keeps the saved history clean and avoids extra server work.
- **Can't drop on the start point or off the grid:** the point stops at the edge, and it can't land on the fixed start point or on her other point.
- **Two points side by side:** if both points sit on one vertical line, the tutor says it can't measure a gradient there (approved line, draft for Instructional Design). It's never marked.
- **Resume:** her last dragged position is saved, so after a reload or coming back she sees the same points.
- **Screen readers:** after each drag or arrow move, the position is announced ("Point at 2, 4").
- **Other grids:** the warm-up point grid is only for reading, so it stays tap-free. The road and choice grids don't move.
- **Other tasks:** the same "one task, decided by the server" fix covers the Ramp Builder, Road Inspector and Ramp Designer tasks, not only this one.
- **Chat clean-up:** when a new task starts, a small "Task n" divider appears in the chat. Old replies are then clearly from the earlier task.

## Checks
- Replay the case from the screenshot: finish the "one third" task, then on the two-points task ask for a hint and answer wrongly once. Each reply must belong to the two-points task.
- A small test that hint and check replies always come from the server's current task.
- Drag test in the preview on desktop and a phone-sized screen.
- Targeted tests only.

## Technical notes
- `simHelp` / sim check in `src/server/lesson/demo-path.server.ts` pick "first task not in simDone". The client `current` in `SimStage.tsx` must come from the same rule; send `taskId` with check/help and reject with the stale-question path (already reloads quietly) when it isn't current.
- `sim-board.tsx`: pointer events (`pointerdown/move/up` with capture, `touch-action: none` on the board) snapping via `px` inverse; `focus-visible` ring on the circle only, tap `rect` keeps `outline: none`.
- `faint` is reset on task id change; verify the server doesn't return a previous task's `faint`.
