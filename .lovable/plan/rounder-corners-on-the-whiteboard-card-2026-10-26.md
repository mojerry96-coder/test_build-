# Rounder corners on the whiteboard card

## Why the corners look square
The card asks for large rounded corners, but the shared pop-up style adds small corners on tablet and laptop screens and wins, so only phones see the curve.

## What changes
- The whiteboard card (the "Got it / Watch again" one) gets clearly curved corners (about 40px) on tablet and laptop.
- The orange strip along the bottom follows the curve, so its ends are rounded too.
- Phones stay full-screen with square corners, as now.
- Same in dark mode.

## Technical details
- `src/components/lesson/whiteboard/WhiteboardDialog.tsx` `DialogContent`: replace `rounded-[34px]` with `rounded-[40px] sm:rounded-[40px]` (keep `max-md:rounded-none`) so it beats the base `sm:rounded-lg` in `src/components/ui/dialog.tsx`; `overflow-hidden` already clips the `overlay-edge` strip.
- Shared dialog file stays unchanged so other pop-ups are unaffected.
