# Finish the quick-fix screen

## 5. Cleanup and checks
- **Old styling removal:** delete the whiteboard-only styling the card no longer uses: the board photo, the dimming, the marker and eraser motion, and the wipe effects.
- **Erasing:** the eraser picture is gone, so clearing old lines becomes a soft fade-out instead.
- **Top controls:** Pause, "Show all steps" and Close are restyled to the card's look, with the lab's springy buttons.
- **Phones:** small Fiti at the top and the text below him, with nothing overlapping on Your turn.
- **Notes:** update the lesson-screen notes so nobody brings the board picture back.
- **Browser check:** look at the screen at 1377×892, 1280×720 and phone size, in light and dark mode, covering:
  - the worked example;
  - a typed answer;
  - a drag-the-point step;
  - a not-quite answer;
  - a right answer.

## 1. "Tap me for a hint!"
- I'll add a draft approved line `qf_tap_hint` ("Tap me for a hint!") to the lesson pack's fallback lines, marked for Instructional Design approval. Until they confirm, it is a placeholder they can change without any code change.
- **When it appears:** if she does nothing on a "Your turn" step for a while, the line pops up on Fiti for 3 seconds, then the question returns. The wait is a new rule, `qf_idle_hint_ms`, set to 8 seconds by default (the lab waits for a still spell, then shows its tag for 3 seconds).
- **Tapping Fiti:** this shows that step's approved hint in his bubble. It never counts as a try. If the step has no hint, the tag never shows.
- **When it stays hidden:** while the tutor is speaking, while a teacher pause is on, and after the step is right.

## 2. Hint in Fiti's bubble
After a not-quite answer, the step's hint (sent by our server, as today) appears in Fiti's speech bubble beside him, with a spring pop. It no longer shows in its old spot. Her answer stays in the box.

## 3. Missing effects
- **Right answer:** a small burst of confetti (about 14 pieces) from the box she got right, plus "Nice!" and Fiti's cheer.
- **Step dots:** "Step 1 of 3" becomes the lab-style round dots. The current dot gets a soft ring, and a finished dot fills with a pop.
- **Not-quite box:** a soft amber outline with an icon plus a shake, never red. The outline clears as soon as she edits the answer.
- **Reduced motion:** confetti, shake and pop are turned off. The outline and the filled dots still show.

## 4. Old board pictures
Delete the whiteboard, marker and eraser pictures as part of this build, after first checking that nothing in the app uses them. Older saved versions of the app will then show those pictures as missing.

## Technical details
- **Pack:** add the `qf_tap_hint` fallback line and the `qf_idle_hint_ms` rule to the seed pack (`content/packs/MTH12_09_02_01.seed.json`), then load it with `bun ./scripts/load-seed.ts`, which also runs the leak and banned-word checks.
- **Server:** the repair view sends `tapHint` (the approved line), `idleHintMs`, and each open step's `hint` only after a not-quite answer. The step's own hint text never reaches the browser early: tapping Fiti calls a new `repairHintFn`, which returns the approved hint and logs `repair_hint_tapped`.
- **`WhiteboardDialog`:** takes a new `bubble` prop (an override line plus a beat) so the hint shows in Fiti's speech bubble. Fiti becomes a button only while a tap-hint is offered.
- **`QuickFix`:** adds an idle timer that resets on input, the confetti burst reusing the existing `confetti-fall` keyframe, `.qf-dot` styles, and `data-mark="warn"` on the input for the amber outline.
- **Test:** a small test for the idle-tag timing rule (it shows after the set wait, hides 3 seconds later, and never shows while paused).
