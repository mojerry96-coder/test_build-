# Warm-up: design font, motion and board effects

## Font and colour (from the design)
- **Question:** heavier handwritten heading (Patrick Hand, navy #024064, 1px stroke, as in the design), at most 2 lines on desktop.
- **Numbers:** every number in the question, the answer tiles and the grid labels uses the same navy as the text. Numbers are not coloured differently.
- **Answer tiles:** use the same handwritten font as the question, as the design shows (3, 6, 4, 2). Long answers shrink to fit and wrap to 2 lines at most.
- **Check Answer:** keeps its full blue look before an answer is picked, as in the design, instead of fading. It shows a short "Choose an answer" note if tapped too early.

## Motion (shared, all switched off with reduced motion, transform/opacity only)
- **Motion tokens:** `--spring` and `--spring-soft`, with the exact curves from your instruction.
- **Staged entry (springIn, 640 ms):** the question, then the grid, then the tiles 60 ms apart, then Check Answer.
- **Answer feedback:**
  - Right answer: success pop.
  - Not quite: gentle shake.
- **Fiti's speech bubble and hints:** note pop.
- **Buttons:**
  - Every button squishes on press (scale .97, springs back in 460 ms).
  - Cards lift 4 px on hover.
- **Question strip and map stops:** a done tick (the badge scales up and its ✓ pops).
- **Learning Hub cards and map stops:** cardIn entry, 60 ms apart.
- **Parrot:** keeps its mood motion (thinking sway, encouraging nod, celebrating hop). It also gives one short bounce each time a new line appears in the bubble.

## Board (shared grid component)
- **Draw-on arrows in "Here's how it works":** "3 across" (blue #0870B0), then "2 up" (green #0A8754).
  - Each draws in 300 ms, the second starting 300 ms after the first.
  - The soft yellow #FFF1B8 triangle fades in last.
  - Labels are Mulish ExtraBold 17 px with a white halo.
- **Changed numbers:** in the working lines, the changed number bounces with a highlight (termBounce).
- **Quick fix grid:**
  - Draggable point that follows the finger accurately and snaps to grid crossings.
  - It squashes on release and announces "Point moved to (x, y)" for screen readers.
  - Arrow keys move it one unit.
  - The target ring turns green, bounces and draws a tick.
- **Colours everywhere:** our orange for points and lines, green for rise, blue for run, yellow for the triangle.

## Grid illustration style and motion
- **Board look:**
  - a rounded white board with a soft shadow, sitting on the page like a card;
  - light pastel grid lines and slightly stronger axes;
  - axis numbers in the handwritten font, in navy.
- **Entry:** the board springs in; the grid lines fade in left to right; then the point (3, 2) pops in with a small bounce.
- **The point:** a soft orange glow ring pulses gently while she reads. Its label "(3, 2)" sits in a small white tag with the same white halo, so it stays readable.
- **Picking an answer:** the option's route draws on along the grid (the run first, then the rise) in the rise and run colours, ending at the point. Changing the answer redraws it.
- **After checking:**
  - right: the point does a success pop and a tick draws;
  - not quite: the board gives a gentle shake.

## Avatar (parrot) motion
- **Rest:** soft breathing, plus a small head tilt every few seconds.
- **Pose changes:** thinking, encouraging and celebrating cross-fade (200 ms) instead of jumping.
- **Fiti speaking:** a short bounce each time a new line appears in the bubble, and a gentle bob while the line is typing.
- **Moods:**
  - not quite: an encouraging nod;
  - right answer: a celebrating hop, with a few small sparkles that pop and fade around the parrot;
  - hint: a nod.
- **The bubble:** it pops in from the parrot (note pop) and keeps a small tail pointing at the parrot.
- **Settings:** all of this stops with reduced motion or when the tab is hidden, and a future animated parrot file can replace it.

## Not now
The "Walk the line" hiker for the hook is noted for later.

## Technical details
- Tokens and keyframes live in `src/styles.css`:
  - curves: `--spring`, `--spring-soft`;
  - utilities: `anim-spring-in`, `anim-card-in`, `anim-note-pop`, `anim-success`, `anim-shake`, `anim-term`, `anim-tick`, `squish`.
- **Staging:** `--d` delay variables.
- **Feedback animations:** applied in `WarmupOptions` through `data-mark`.
- **Bubble:** `TutorBubble` replays `anim-note-pop` keyed by message.
- **Board:**
  - `PointBoard` gains optional `riseRun` drawing (stroke-dasharray using `getTotalLength`).
  - Drag uses `getScreenCTM().inverse()`, with an `aria-live` announcement on release.
  - Board answer checks stay on the server.
- **Fonts:**
  - Tile labels use `font-hand` with a 1px stroke.
  - `Q` uses the `spec-heading` stroke at the warm-up size.
- **Hub and path:** stops and cards get `anim-card-in` with index delays.
- **Test:** a targeted test checks that the tokens exist and that rise and run use the specified colours.

## To confirm (suggested additions)
- **Dark mode:** a dark board (deep navy card), with the rise and run colours brightened so they still reach 4.5:1. The tile colours stay as they are.
- **Phone:** the same animations, but shorter (about 70%) and with no sparkles, so budget phones stay smooth.
- **Sound:** a short soft sound on a right answer and on placing a point, if you want it. Off by default and never on in low-data mode. Not in the plan unless you say yes.
- **Questions 2 and 3 (no grid):** they get the staged entry and tile effects only.
- **Exact timings:** the board fade-in, point pop and sparkle timings are my choices, because your instruction doesn't give them. Tell me if the design team has values.
