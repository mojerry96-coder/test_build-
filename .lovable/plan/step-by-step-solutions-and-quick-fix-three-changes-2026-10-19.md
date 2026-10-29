# Step-by-step solutions and quick fix: three changes

Applies everywhere working is shown line by line: "Here's how it works" after a right warm-up answer, the quick fix ("Watch how it's done" and its guided steps), the video's try 2 and try 3 demonstrations, and later the board demonstrations. Light lesson screens only.

The simulation step is built and checked. Ramp Builder and Road Inspector ran from start to finish with wrong answers, right answers, hints, a third-miss faint answer, the closing card and the move to Practise. Ramp Designer, the phone checks and the screenshot set still need doing. I'll finish those first, then start on these changes.

## 1. Slower solving pace (timings are rules)
- New rules in the starter pack: working_line_base_ms 2500, working_line_per_char_ms 60, working_line_max_ms 6000, working_result_pause_ms 1000.
- Each line stays alone for 2.5 s plus 0.06 s per character, up to 6 s. There is 1 s extra before the final result line (e.g. "So, y = 14.").
- When voice is on, each line appears as the tutor starts saying it, and the next line waits until the tutor finishes it.
- Each line writes on from left to right (400 ms). Then the part that changed from the line before is highlighted in #DBEDFF for 1 s (e.g. "3(4)" becomes "12"). The current line is #0A3150 and earlier lines soften to #667085. With reduced motion there is no write-on or highlight, but the timing stays the same.
- Controls under the working (Mulish SemiBold 13, #404D67): Pause / Play, Next step, Show all. If she taps Next step twice in a row, step-by-step mode turns on for the rest of the session ("Tap Next step to continue"), and each line waits for her tap.
- The button after the working appears only once the last line has been shown. It uses the primary style (#5CBBF3, radius 16, Mulish Bold 14, white).

## 2. "You try" becomes "Your turn"
- Section label "YOUR TURN" (Mulish Bold 12, #667085, capitals). The button "Now you try" becomes "Your turn". Tutor lines and board prompts that say "You try" change too.
- Wording is changed in the starter pack and the screen labels, then the pack is reloaded (leak and re-import checks must pass).

## 3. Answer box and Check button in our colours
- Box: 120 × 48, white, 1 px #DDE2E7 border, radius 12, 0 12 px padding, Mulish SemiBold 18 #0A3150, centred, "?" placeholder in #8FA0B1. The maths keypad opens on phones.
- The browser's blue focus outline is removed. On focus there is a 2 px #2CA1DA ring that follows the rounded corners, with a #2CA1DA border, 150 ms, and no size change.
- Right: #E7F5EC background, #1E8A4C border and text, with a small tick inside on the right. The step's full line is then written in.
- Not quite: #FDF1DC background, #B86E00 border, #7A4800 text, with an alert icon (never red). The hint shows under the step, and the box clears when she starts typing again.
- Check button: 48 px tall, radius 12, Mulish Bold 14. Off (empty box): #F0F2F4 with #8394A0 text. On: #5CBBF3 with white text. Enter does the same as Check.
- The YOUR TURN section stays #F8F9FA with radius 16. Step cards stay white with a 1 px #DDE2E7 border and radius 16.
- The box is labelled with the step prompt (e.g. "Multiply first: 2 × 4 equals"). Results are announced: "Correct" or "Not quite, here's a hint".

## Checks before stopping
- Tests for the line timing: base, per-character, the 6 s cap and the result pause.
- Tests for the switch to step-by-step mode after two Next step taps.
- The wording check finds no "You try" left in the pack or on screen.
- Leak and re-import checks pass.
- Desktop and phone screenshots of the warm-up working, the quick fix (watch, your turn: right and not quite) and the video try 2 demonstration.

## Technical details
- One shared `WorkingPlayer` component plus a pure timing module `src/shared/working-pace.ts`, tested. The timing values come from the rules in the lesson view. WarmupStage's WorkingBox, QuickFix's watch section and VideoStage's line player switch to it, replacing their fixed 1.5 s timers. Voice-driven timing hooks into the existing speech playback when voice is connected; until then it uses the rule timing.
- Step-by-step mode is kept in session storage for the session.
- The changed part is found with a simple word-level comparison between consecutive lines.
- A shared `AnswerBox` and `CheckButton` are used by the QuickFix guided steps, with new tokens in styles.css (no hard-coded colours in components).
- The new rules and the renamed wording go in the seed pack. The new lines are added to the Instructional Design approval list.
