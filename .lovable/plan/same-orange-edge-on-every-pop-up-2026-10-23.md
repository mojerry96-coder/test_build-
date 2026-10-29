# Same orange edge on every pop-up

## What changes
The "Good Job!" / "Great Choice!" cards have a warm orange gradient strip along their bottom edge. Every other pop-up card in the app gets the same edge, so they all look like one family:
- The video question card ("Question 1 … How sure are you? … Check Answer", your screenshot)
- The Start again card
- Every other pop-up box (confirmations, sign-in notices, admin boxes) that uses the shared pop-up style
- Fiti's whiteboard is a picture of a board, so it keeps its own frame.

The strip follows each card's rounded corners and sits flush at the bottom, the same height and colours as the spec. The thin grey outline around shared pop-ups is removed so the card reads clean white with the orange edge, as in the spec. In dark mode the strip keeps the same colours.

## Technical details
- `src/styles.css`: one `overlay-edge` utility — `position: relative; overflow: hidden;` plus a `::after` 16 px bar using the same `hub-day-on → path-next-ring → path-star` gradient and the card's radius; content gets bottom padding so nothing sits on the strip.
- Apply `overlay-edge` in `ui/dialog.tsx` and `ui/alert-dialog.tsx` content (dropping `border`), in the video check card in `VideoStage.tsx`/`parts.tsx`, and in `RestartDialog.tsx`.
- `WarmupPopup.tsx` and `GreatChoiceDialog.tsx` swap their hand-made strip for the same utility so all pop-ups share one source.
- Design-only.
