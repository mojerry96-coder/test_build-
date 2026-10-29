# Centre the quick-fix cards, and make "place the point" obvious

## 1. The "You got close!" card is off-centre and cut off
**Why:** this card is drawn inside the "Your turn" area of the whiteboard. That area clips its edges and shifts it, so it lands too high and too far left, and the board shows around it.

**Fix:** the card moves up to the whole whiteboard screen, like the new hint card and the "You got it!" card. It sits dead centre over a soft dimmed background, at a fixed comfortable width, and never touches the edges. This applies to all three quick-fix cards: "You got close!", "Let's do this one together" and the final "Good job!". On phones it fits the screen with even margins.

## 2. The second screenshot: what the student is meant to do
It's the last step of Your turn, "place the point". She must put a dot on the empty grid at (5, 1), then tap Check. She can:
- tap a crossing on the grid,
- drag the dot there, or
- use the arrow keys.

The dot snaps to the nearest crossing and its label updates as it moves. The (2, 4) in your screenshot is just where the dot landed after a tap, not an answer.

**What's unclear today:**
- Before her first tap there is no dot at all, only a faint "Tap or drag to place the point" line, which disappears after the first tap.
- Nothing shows that the dot can be dragged.
- The Check button sits small and far below the grid.

**Changes:**
- **Ready dot:** the dot is on the grid from the start at (0, 0), with a soft pulse and a small hand that shows a drag, like the simulation's "How to play" hand. The hand disappears once she moves the dot.
- **Clear instruction:** a short line under the grid stays the whole time: "Drag the dot, or tap where it goes". The question above it still gives the target point.
- **Live label:** the dot's label, e.g. (3, 2), follows it in large text, so she can read where it is before checking.
- **Check button:** it's centred under the grid, in our primary blue, raised and bouncing, and full strength once she has moved the dot.
- **Grid size:** the grid is bigger and centred in the panel, matching the new chart size.

Marking, hints and the dashed target ring after a miss are unchanged.

## Technical details
- `WarmupPopup.tsx`: add a `contained` prop that renders `absolute inset-0 z-40 grid place-items-center` (rather than `fixed`) with `w-[min(560px,92%)]` and `max-h-[calc(100%-48px)]`.
- `QuickFix.tsx`:
  - `YouTry` stops rendering the popup itself and hands `{ kind, lines, title, button, onButton }` up through a new `onDialog` callback.
  - The parent renders it in the `WhiteboardDialog` `overlay` slot (priority: hint card, then got-it, then step dialog).
  - The point step's Check button uses the primary raised style, centred.
- `PlacePointBoard.tsx`:
  - The initial dot is drawn at (0, 0) with `path-pulse` and a drag-hand SVG (`qf-hand` keyframe, hidden after the first move, reduced-motion = static).
  - A persistent helper line sits under the grid as figure caption text. Its wording comes from the step's approved prompt and a draft fallback line `qf_place_point_help`, with the default text above until Instructional Design approves it.
  - Label size 30, grid `max-w-[560px]`.
  - "Moved" state: Check is disabled until the dot leaves the start, so a (0, 0) submit is never sent by accident.
- Pack: add the draft fallback line `FB_QF_PLACE_HELP` and reload with the seed loader (leak and banned-word checks).

## 3. Fiti's bubble lost its spaces ("Thefirstnumberis5:5across.")
**Why:** each word pops in on its own, and the space after each word gets dropped once words animate on their own.

**Fix:** every gap between words is kept, so the bubble reads "The first number is 5: 5 across. ✓". This applies in light and dark mode, with or without reduced motion.

## 4. "Tap me for a hint!" belongs on Fiti himself
- The tip no longer replaces the text in his speech bubble. It shows as a small round label pinned on Fiti's body, with a little pointing hand. Meanwhile Fiti hops and gets a soft glowing ring around him, so it's clear he is the thing to tap.
- His speech bubble keeps showing the question the whole time.
- Tapping Fiti (the avatar) opens the hint card. Tapping the bubble no longer does anything.
- On phones the label sits on the small Fiti next to the panel.
- Timing is unchanged: it shows after the wait setting, for 3 seconds, and never while he's talking, a card is open, or the lesson is paused.

### Technical details (3 and 4)
- `WhiteboardDialog.tsx`:
  - Word spans render as `{wd}` followed by a plain `" "` text node outside the inline-block span, or use `margin-right: .28em`.
  - `say` no longer uses `tip`.
  - New `qf-avatar-tip` label positioned over Fiti's chest, in both the desktop column and the phone Fiti, plus a `qf-glow` ring class on the avatar button while `tip` is set.
  - `onClick` is removed from the bubble.
- `styles.css`: `qf-avatar-tip` (pill, pointer hand, qfSpring in) and `qf-glow` (pulsing ring), both behind reduced-motion.

## 5. Earlier lines are too faded
The finished lines above "Your turn" are hard to read. They will be clearer, still a little lighter than the current step so she can see where she is. Technical: raise the `wb-line` non-current opacity / `wb-ink-soft` contrast so it meets the AA 4.5:1 rule in both light and dark mode.
