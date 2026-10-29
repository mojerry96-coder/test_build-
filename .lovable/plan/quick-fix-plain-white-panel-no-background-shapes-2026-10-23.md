# Quick fix: plain white panel, no background shapes

## Changes
- Remove the big pale blue circle behind the steps.
- Remove the pink flower dots in the top right.
- The panel becomes plain white instead of pale blue, in both light and dark mode. In dark mode it keeps its thin soft border and shadow so it still stands out on the dark card.
- Everything else stays as it is: Fiti, the steps, the chart card, the orange bottom edge, the caption and the buttons.
- The chart card gets a light border, so it doesn't vanish on the now-white panel.

## Technical details
- `WhiteboardDialog.tsx`: delete the `qf-swoosh` and `qf-flower` spans.
- `src/styles.css`:
  - Remove the `.qf-swoosh` and `.qf-flower` rules, their animation and pause lines, the dark overrides and the `--qf-swoosh`/`--qf-flower` tokens.
  - Set `--wb-surface-soft` to `#FFFFFF` (root and `.dark`).
  - Simplify `.qf-panel > :not(...)`.
- Point board card: add `border border-fh-box-line/40` if it has none.
- Update the quick-fix line in `src/components/lesson/AGENTS.md` ("a white card with a white panel and orange edge").

## Also in this plan
- **No faded text:**
  - Earlier lines above "Your turn" show at full strength, not dimmed.
  - Step numbers are full strength too, in a softer colour that still meets the AA readability level.
  - The phone caption's words are no longer faded before they are spoken.
  - Lines still clear with their short fade-out when the board resets. Say if you want that gone too.
- **Bigger chart, centred:**
  - The chart grows from about half the panel to about 60% of its width on desktop and tablet, and to full width on phones.
  - The steps and the chart sit as one block, centred in the panel both ways, with even space on both sides.
- **Screen sizes checked:**
  - Phone (390 px), tablet (820 px), laptop (1280 px) and wide (1440 px+), in light and dark mode.
  - On each, nothing is cut off, overlapping, or off-centre, and Check and the answer box stay usable.

### Technical details (additions)
- `styles.css`: delete `.wb-has-turn .wb-line { opacity: .82 }`.
- `WhiteboardDialog.tsx`:
  - Step number spans: `opacity-60` becomes `color: var(--wb-muted)`.
  - Caption units: drop the `opacity-30` state.
  - Row wrapper: `justify-center`, `ol` becomes `flex-none max-w-[min(640px,48%)]`.
  - Drawing becomes `w-[min(720px,60%)] max-md:w-full`.
- After building, run a Playwright pass at the four widths, with a signed-in minted session and a missed warm-up to open the quick fix, in both themes. Screenshots are taken only to confirm the layout.

## "Tap me for a hint!" not showing on Your turn
Why: the tip only appears once, for 3 seconds, after 14 seconds without any tap or typing, and never while Fiti's voice is playing. It also never comes back. In practice it is easy to miss completely. The wording and wait setting are saved correctly.

Fix, matching the simulation:
- While a Your-turn step is open, Fiti always wears the "Tap me for a hint!" pill (with the pointing hand) and stays tappable.
- After the wait time (14 s) without input, he hops and glows to draw attention. This repeats every wait period until she acts or taps him.
- Tapping Fiti opens the hint card with the step's approved hint (unchanged). After she has seen the hint, the pill hides for that step.
- His speech bubble keeps showing the step question ("How far up?") on desktop. I'll confirm in the browser check why the bubble was empty in the screenshot, and fix it there.
- On phones the same pill sits on the small Fiti in the corner.

### Technical details (tip)
- `src/shared/idle-hint.ts`: replace `tapHintVisible` with:
  - `tapHintPill(s)` (step open + hint available + not yet seen + no card open)
  - `tapHintNudge(stillMs, idleMs)`: true for `TAP_HINT_SHOW_MS` in every `idleMs` cycle, never while paused or speaking.
- Update `src/test/idle-hint.test.ts`: the pill shows from the start of a step, the nudge repeats at 14 s and 28 s, there is no nudge while paused, and the pill hides once the hint is seen. Run only that test.
- `QuickFix.tsx`:
  - The `tip` prop is passed whenever the pill applies. A new `nudge` prop drives the `qf-hey qf-glow` classes.
  - Track a hint-seen set per step id.
- `WhiteboardDialog.tsx`: separate `tip` (pill text) from `nudge` (animation). The `say` bubble falls back to `ask` when there is no caption.

## Check button while empty
- In light mode, the empty Check button is faded grey with almost invisible text (see the screenshot).
- It becomes the raised button with a readable label at slightly lower strength (AA readable). It turns full strength as soon as she types.
- Technical: in `QuickFix.tsx` the Check button uses `disabled:opacity-80` (already set for dark). Check the light `--qf-check-bg`/ink pair in `dark-contrast.test.ts`'s quick-fix block.
