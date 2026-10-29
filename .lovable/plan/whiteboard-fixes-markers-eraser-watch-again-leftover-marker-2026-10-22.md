# Whiteboard fixes: markers, eraser, Watch again, leftover marker

## 1. Marker and eraser show a box around them
- **What's wrong:** the black and blue markers and the eraser were cut from the board picture as rectangles. Each one carries a patch of board behind it, so you see a grey box around the marker in the tray and in Fiti's hand. When one is in use, a faint box is left in the tray.
- **Fix:** cut them out again with real see-through edges. Each piece is compared with the clean board, and only what differs (the marker or eraser itself) is kept. They then sit on the board with no box, whether resting in the tray or moving.
- The marker in use sits fully in the tray when it rests. It lifts from its own spot and returns there, and isn't cut off halfway.

## 2. The eraser appears twice
- **What's wrong:** each line being cleared draws its own eraser, so two or three erasers show at once, plus the one in the tray.
- **Fix:** one eraser only. It lifts from the tray, wipes line 1 left to right, then line 2 right to left, and so on (zig-zag), then returns to the tray. The tray spot is empty while it is in her hand.

## 3. "Watch again" jumps to the next screen
- **What's wrong:** when the replay finishes, the board tells the lesson "watching is done" a second time. The lesson then moves on to the "Good Job" pop-up instead of staying on the board.
- **Fix:** a replay never moves the lesson on. After Watch again, the board ends exactly where it was before: the same "Watch again" and "Your turn" buttons, and nothing else happens until she taps one.
- If she had already done "Your turn", Watch again replays the solving and then shows "Your turn" again, never "Got it".

## 4. The marker stays on the last line after solving
- **What's wrong:** after the last line, Fiti says her closing line, and the "still writing" state never switches off, so the marker stays stuck on the last line.
- **Fix:** as soon as each line finishes, the marker goes back to the tray. When solving is done, nothing is left on the writing, and the board shows only the lines.

## 5. Checks
- I'll play a quick fix in the browser end to end: watch, clear, Watch again, then Your turn. I'll screenshot the moving marker, the single eraser, the end of solving, and the state after Watch again.
- A test covers the rule that a replay never moves the lesson on.

## Technical details
- Cut-outs: alpha = per-pixel difference between `whiteboard.png` and `whiteboard_clean.png` inside each tray box, closed/feathered with PIL, then re-uploaded as new asset pointers (old pointers deleted). Drop `mix-blend-multiply` on the pieces.
- `WhiteboardDialog`: erasing renders a single `Eraser` whose position steps through lines on `eraseOrder` timings, instead of one per `<li>`. The tray eraser stays hidden for the whole clear.
- `watchAgain` sets a `replaying` ref; the end-of-lines effect skips `onDone` and `followTurn` side effects when replaying, then restores `all` state and buttons.
- Marker visibility is tied to `anim && !lineDone`; on reaching the end, `setWriting(false)` runs before the closing caption; `writingInk` is null when not writing, so the tray marker reappears.
