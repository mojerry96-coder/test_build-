# Hook adjustments (everything else stays)

The Hook becomes: hill picture, short question, four coloured tiles. Tapping a tile is her guess. No number boxes, no Lock in button.

## 1. Number boxes removed
- The two "Bonus (optional)" boxes are removed from the page.
- Content turns them off for this hook (`number_boxes: false`), so they stay off when content is re-imported.

## 2. Tiles
- Coloured warm-up tile style: A lavender, B peach, C mint, D yellow.
- Picked tile: navy 3 px outline and 2 px lift only. No tick, no colour fill (there's no right answer).

## 3. Tapping a tile is the guess
- Tap -> soft tap sound, tile shows picked, the cyclist rides that path (A or B).
- After a short 1 s pause the guess saves (she can tap a different tile inside that pause; the pause restarts). Then all tiles lock.
- Fiti plays her nod and repeats the guess back (draft seed lines):
  - A / B / Same: "You think {choice} is steeper. Keep that in mind: the video will tell us!"
  - Not sure: "No problem. Watch closely: the video will help you decide."
- Two seconds after her line finishes, the video starts. "Watch the video" stays as a backup only if auto start is off.

## 4. Not sure
- Counts as a choice; saved as "no prediction".

## 5. Saved for the close
- Her choice (or no prediction) is saved on the lesson for the close step. Reload keeps it and skips ahead as today.

## 6. Nudge becomes the yellow tip pill
- "Take your best guess. Any answer is fine here!" shows in the same yellow-line tip pill used on the warm-up. No speech bubble over Fiti; nothing covers Fiti, the question mark or the tiles.
- Fiti's reply after her guess also plays in the tip pill (and in chat when chat is open). The floating bubble is removed.

## 7. Chat-open cleanup
- Same as the warm-up with chat open: picture slightly shorter so picture, question and all four tiles fit at 1280x720 and up.
- Equal gaps between picture, question and tiles.

## 8. Added gaps
- Tapping a road on the hill picks that tile (A or B), same as tapping the tile.
- Keyboard: arrow keys move between tiles, Enter/Space picks; screen reader hears "You chose Path A" and Fiti's reply.
- Phone: picture on top (max ~240 px tall), question, tiles in one column; tip pill above the tiles.
- Dark mode: tiles use the warm-up's dark tile colours; navy outline swaps to the light outline used there.
- Reduced motion: no lift, no cyclist ride; reply and auto-start still happen.
- Teacher takeover pauses the nudge and auto-start timers; hand-back resumes them.
- Once saved, a tap on another tile does nothing (no second save).

## Then
- Send two screenshots: a picked tile, and Fiti's reply after the guess. Then stop.

## Technical details
- `HookStage.tsx`: drop boxes UI and Lock in; tiles use `.mcq-tile` + `data-pos`, no `Check`; pick -> 1 s debounce -> `finish(id)`; nod via mood + `playSound("tapTick")`; after reply typing time + 2000 ms call `next()`; nudge/reply through the WarmupShell tip pill; remove floating `Bubble`; chat-open picture max-height.
- `demo-path.server.ts` `savePrediction`: option "d" saves choice null; choose `hook_ack_choice` (fill `{choice}` with the option label) or `hook_ack_unsure` fallback line.
- Seed: `number_boxes: false`, add draft `FB_HOOK_ACK_CHOICE` and `FB_HOOK_ACK_UNSURE`; reload, leak/banned check; targeted test for the reply line and Not-sure saving.
