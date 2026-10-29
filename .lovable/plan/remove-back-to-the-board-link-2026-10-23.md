# Remove "Back to the board" link

On the warm-up quick-fix screen, remove the orange handwritten "Back to the board" link that shows under the question after Fiti's whiteboard is closed.

## Keep the student from getting stuck
That link was the only way back to the whiteboard after closing it. Without it, closing the whiteboard (X or tapping outside) would leave her with a disabled Check Answer and no way forward. So:
- The whiteboard can no longer be closed by tapping outside or with X during a quick fix; she leaves it only by finishing the fix or tapping "Skip for now".

## Technical details
- `src/components/lesson/WarmupStage.tsx`: delete the `!boardOpen && <button>Back to the board</button>` block; pass a no-op `onClose` to `QuickFix` (board stays open while `inFix`).
- No content, engine or marking changes.
