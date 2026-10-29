# Finish the motion pieces and add game sounds

## 1. Warm-up: "Here's how it works" (all three questions + video lucky-guess working)
- When the working reaches the "rise" and "run" lines, a yellow right-angle triangle draws itself on the grid between the two points: the run side first (blue, matching the route colour), then the rise side (green), then the sloping side fills in pale yellow.
- Small labels "run = 3" and "rise = 2" (numbers taken from the approved working lines, never made up) pop in beside each side in white-halo tags.
- Questions with no grid: no triangle, only the line effects below.

## 2. Working lines (warm-up, quick fix watch card, video demos, worksheet)
- When a line changes a number from the line before (e.g. `2/3` becomes `0.67`), only that number gives a quick bounce (scale up 12 %, settle, ~360 ms) and glows soft blue for a moment.
- Lines still appear at the shared reading pace; nothing else changes.

## 3. Quick fix grid (warm-up quick fix and any "place the point" task)
- She drags the point; it snaps to the nearest grid crossing with a small pop and a soft "tick" sound.
- A dashed target ring pulses gently where the point belongs only when the approved hint says to show it (never as the answer otherwise).
- Correct placement: ring turns green and fills; not quite: soft amber shake, point stays where she put it. Marking stays on the server.
- Works with mouse, touch and arrow keys (one square per press).

## 4. Progress dots under "Warm-up · Question 1 of 3"
- Finished questions show a small tick that draws in (green) with a pop; the current dot gently glows; upcoming dots stay grey.
- Same dots and ticks reused on the lesson stop strip for later steps.

## 5. Squish and hover lift everywhere else
- Buttons: squish on press (scale 0.96) on Ask Fiti, Learning Hub, chapters, quests, Great Choice popup, chat chips and option buttons, video, simulation, worksheet and close screens.
- Cards: lift 4 px with a softer shadow on hover (desktop only) on chapter cards, quest cards, Learning Hub banner, plan card in chat and conversation list.
- Locked items do not lift; reduced motion turns all of this off.

## 6. Game sounds (new)
Short, friendly, cartoon-style sounds, made in the browser (no downloads, almost no data):
- Tap/select an answer: soft pop
- Right answer: bright two-note "ding-ding" chime
- Not quite: gentle low "boop" (never a buzzer)
- Point snaps on grid: tiny tick
- Stop unlocked on the map / path fills: rising sparkle
- Streak or lesson finished: short happy jingle
- Hint or Fiti's bubble appears: soft whoosh

Controls:
- A speaker button in the top bar (next to Dark mode) turns sounds on or off; her choice is remembered.
- Sounds are ON by default for the demo; quiet volume; never play while the tab is hidden; no sound during video playback.
- No sound replaces captions or visual feedback.

## 7. Timings
The design team has not sent their own timings, so these are used and kept in one place so they can be swapped in one go:
- Bounce 360 ms, tick draw 280 ms, triangle sides 400 ms each, snap pop 180 ms, squish 120 ms, lift 200 ms.

## To confirm
- Sounds on by default (planned) or off by default?
- Should the target ring on the quick fix grid always show, or only after a hint (planned)?

## 9. "Let's Begin" map: chat closed by default
- The map page opens with Fiti's chat closed; the map takes the freed space, as in your design.
- An "Ask Fiti" button (bottom-left, as in the design) opens the chat; a close button in the chat header closes it.
- Fiti's opening lines play when she opens the chat; a small dot on the button shows there's a new message.
- The "Start" button under the next stop starts the lesson directly, so she never needs the chat to begin.
- Closed again on every new visit. The warm-up's Ask Fiti panel already stays closed until tapped.
- Also add this to the project task list.

## 10. Gaps added
- Dark mode: the triangle, labels, ticks, target ring and number glow get dark versions that stay easy to read.
- Phone: the same effects at about 70 % of the time; the drag point is bigger for fingers; no sparkles.
- Sound limits: sounds never overlap (a new one stops the old one), a max of one sound per tap, and nothing plays while Fiti's voice speaks.
- Sound button: a clear label ("Sounds on" / "Sounds off") for screen readers; it also shows on phones in the top bar.
- Unread dot on Ask Fiti: also used on phones, and it clears once she opens the chat.
- Map with chat closed: Fiti's "Move it to tomorrow" and other choices are still reachable in the chat once opened; nothing is lost.
- Checks: one desktop and one phone look at the warm-up and the map after building, plus targeted tests for the sound setting and the changed-number rule.

## Technical details
- Triangle: new layer in `PointBoard` driven by `WorkingPlayer` onLine events; values parsed from line text by `src/server/maths`-approved lines sent to the client (no client maths).
- Number bounce: token diff between consecutive lines in `WorkingPlayer`, wrapping changed tokens in a `term-bounce` span.
- Quick fix grid: pointer + keyboard drag in `QuickFix.tsx`, snapping reuses sim-board snapping; ring visibility from the item's hint flag.
- Progress dots: `WarmupShell` StopStrip/dots with `anim-tick`.
- Squish/lift: existing `squish` / `lift` utilities applied to shared Button and card classes.
- Sound: `src/lib/sound.ts` using Web Audio oscillators (lazy, created on first tap), setting saved in localStorage, read after hydration.
- All timings as CSS variables in `src/styles.css`; targeted tests: number-diff and sound-setting rules.
