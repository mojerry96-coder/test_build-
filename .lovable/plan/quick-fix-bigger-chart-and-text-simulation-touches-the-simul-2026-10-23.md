# Quick fix: bigger chart and text, simulation touches, the simulation's tip and its right-answer reaction

## What's off now
- The chart is small, and Watch draws it in the top-right corner. The working text is small too. Most of the panel is empty.
- On Your turn, Fiti's speech bubble is missing. The question "How far across?" sits in the panel instead of with Fiti.
- The large pale circle behind the text looks like an empty shape, not the soft swoosh from the simulation.
- The chart has none of the simulation's labels. The run and rise lines draw on, but nothing says "2 across" or "4 up".
- The tip doesn't work the way it does in the simulation:
  - It shows as a separate tag after 8 seconds.
  - Tapping Fiti drops the hint into the caption line.

## Changes
### 1. Bigger content, centred
- The chart takes about half the panel, up to around 560px wide.
- The working lines and the "Your turn" question get about 40% bigger.
- The lines and chart sit side by side, centred in the panel's height.
- On phones they stack, with the chart full width.

### 2. Simulation details on the chart
- The point pops in with a soft pulsing glow.
- The blue run line draws first, with an "N across" tag; then the green rise line, with an "N up" tag.
- The tags use the numbers from the board line being explained, so nothing new is made up.
- The axes get bigger numbers.

### 3. Fiti's bubble, as in the simulation
- A speech bubble with a tail sits above Fiti on the left.
- Words pop in one by one.
- On Your turn, it holds the current question, e.g. "How far across?".
- It stays while the Watch again and Your turn buttons show under the panel.

### 4. Tip behaviour, copied from the simulation
- **Idle tip:** if she hasn't touched anything for a while, Fiti's bubble itself changes to "Tap me for a hint!" and Fiti gives a little "hey" hop. After 3 seconds the question comes back into the bubble. Any tap, key or typing restarts the wait.
- **Tapping Fiti or the bubble:** a small hint card pops up. Its title is the question, its text is the step's approved hint, and it shows the thinking Fiti picture with a "Got it" button. The question stays in the bubble. The tip and the hint never appear while Fiti is talking, a card is open, the lesson is paused, or the tab is hidden.
- **Wait time:** it stays a setting, not code. The simulation waits 14 seconds; ours is 8 seconds now. I'll set ours to 14 seconds to match. Instructional Design can still change it.
- The separate "Tap me" tag above Fiti is removed.

### 5. Right answer: the simulation's "You got it!" reaction
- A confetti burst fires from the middle of the screen in the simulation's five colours.
- A small card pops in:
  - Fiti's celebrating picture, with sparkle marks above it.
  - The title "You got it!".
  - The approved praise line for that step.
  - One "Continue" button that moves to the next step or the end.
- Fiti on the left also plays his celebrate move.
- This replaces today's small "Nice!" and the light confetti.
- A not-quite answer keeps the soft amber shake and the hint in his bubble. It never turns red.
- With reduced motion there's no burst, but the card still shows.
- "You got it!" is a new draft line, waiting for Instructional Design approval, so they can change it without code.

### 6. Background
- The big circle is replaced by the simulation's soft corner swoosh and small flower dots, kept faint.

Motion stays off for reduced-motion users. Dark mode keeps its current colours.

## Technical details
- **`WhiteboardDialog.tsx`**
  - Drawing wrapper becomes `w-[min(560px,50%)]`, stacked on phones.
  - Line font becomes `clamp(18px,2.1vw,36px)`.
  - Content row is vertically centred.
  - The `qf-bubble` moves into the Fiti column, with a tail and word pop (`qf-word` stagger). It shows `current`, or the Your-turn question passed in from `QuickFix`.
  - New `tipMode` swaps the bubble text to the `qf_tap_hint` line for 3 s plus a `qf-hey` hop.
  - `onFitiTap` and a bubble click open a `HintCard` (Dialog: title = question, body = hint, think clip, "Got it").
  - The `fitiTag` pill is removed.
- **`QuickFix.tsx`**
  - Pass the question to the bubble.
  - Drive `tipMode` from `src/shared/idle-hint.ts`: add a 3 s `TIP_MS` show window; the existing hidden-while-paused/speaking checks stay.
  - The hint comes from the existing `repairHintFn` (still logged as `repair_hint_tapped`, never a try) and shows in the card instead of the bubble.
- **`QuickFix.tsx` / new `whiteboard/GotItCard.tsx`**
  - On a correct step: fire `qfBurst` (36 pieces from the centre, 1.1 s), play `small_win`, set the clip to `celebrate`, and open `GotItCard` (celebrate-wings art, sparkle SVG, title, approved praise, Continue).
  - Continue advances exactly as today's right-answer flow does.
  - The "Nice!" tag and the old `confettiAt` are removed.
  - New draft fallback line `FB_QF_GOT_IT` ("You got it!", decision_key `qf_got_it`) goes in the pack.
- **`PointBoard` (WarmupStage)**
  - Larger axis labels.
  - Run/rise tag pills at the segment midpoints, taken from the `tri` prop.
- **`styles.css`**
  - Corner-wave `.qf-swoosh`.
  - `qf-word`, `qf-hey` and bubble tail styles behind reduced-motion.
- **Content**
  - Rule `qf_idle_hint_ms` becomes 14000 in the starter pack, reloaded with the seed loader (leak and banned-word checks run).
  - Update `src/test/idle-hint.test.ts` for the 3 s window and run only that file.
- Update `src/components/lesson/AGENTS.md`: the quick-fix tip follows the simulation's bubble/hint-card behaviour.
