# Make the close (X) on Fiti's quick-fix board work

## What is wrong
Tapping the X at the top right of the quick-fix board does nothing. The board is wired to a close action that is empty, so it stays open.

## Fix
- Tapping X (or pressing Esc, or tapping outside the board) closes the board and Fiti stops talking.
- The question page underneath then shows two buttons: **Back to the fix**, which reopens the board where she left it, and **Skip for now**, which works as it does today.
- Her progress on the board is kept. Reopening it does not replay lines she has already watched, and on "Your turn" her steps so far stay done.
- After a reload while the board is closed, it opens again as it does today. Nothing is lost.

## Checks
- Tap X while the example plays and again on Your turn. Each time the board closes, the voice stops, and Back to the fix brings her to the same place.
- Check Esc and tapping outside, in light and dark mode, on laptop and phone.

## Technical details
- `WarmupStage.tsx` line 316: `onClose={() => setBoardOpen(false)}`. When `inFix && !boardOpen`, render a "Back to the fix" button (`setBoardOpen(true)`) beside the existing skip control. The label is the fallback line `qf_reopen`, with a seed entry for it.
- Confirm that the watch "Your turn" button uses its own `cta` and does not call `onClose`, so the new close never ends the example early.
- `WhiteboardDialog` already hushes on `!open`.
