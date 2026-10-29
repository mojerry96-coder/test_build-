# Celebrations and gentle feedback, everywhere answers are checked

Applies to: warm-up questions, quick fix steps and practice, video checks, simulation tasks, practise lines, guided questions. The exit ticket shows nothing until the end, because she does it on her own.

## 1. One shared reaction, three levels
- **Small win (step or item right):** the card or tile pops; a tick draws itself (250 ms); 6 to 8 tiny stars in orange, yellow and blue burst 30 to 50 px from the tick and fade (600 ms); the praise word bounces in; Fiti nods; small chime.
- **Big win (whole question, quick fix or task done):** light confetti from the top for about 2 s (60 to 80 pieces in our colours); the Good job popup springs in; Fiti plays her celebrate clip; flourish sound.
- **Not quite:** gentle shake; amber outline; Fiti plays her retry clip; soft low tone. Never red, never a buzzer.
- Fiti reacts wherever she is visible: the whiteboard, question screens and the path map.
- Built once and reused on every screen, so all screens react the same way.

## 2. Praise words (draft lines for Instructional Design approval)
- They rotate and never repeat twice in a row: "Nice!", "That's it!", "Spot on!", "Great step!", "You got it!".
- Now and then, when a step has a named strategy, she hears it: "Nice! You multiplied first."
- These words live in the lesson content, not in the app.

## 3. Sounds (made in code, no files)
- Small chime: 659.3 Hz then 880 Hz, 0.12 s apart, quick rise to 0.07, fading over 0.4 s.
- Flourish: 523.3, 659.3, 880 Hz, 0.1 s apart, last note held 0.6 s.
- Not quite: one soft 392 Hz note, gain 0.05, 0.3 s.
- Tap tick when she picks an option: 1200 Hz blip, gain 0.03, 60 ms.
- Rules: the header sound button controls them (on by default, remembered). There are no sounds while Fiti's voice plays, in classroom (Override) sessions, or in low-data mode. Sound starts only after her first tap.

## 4. Quick fix on the whiteboard (fixes the screenshot)
- The "Your turn" white card and step boxes go.
- The header line ("2x means 2 times x. Let's see it.") is written larger, in marker, as the first line.
- When a step is right, the marker lifts from the tray and writes her step onto the board ("2 × 4 = 8 ✓"), so her working builds up.
- The answer box and Check button sit under the board, not on top of it.
- The screenshot you shared still shows the old card. Part of the last build may not have reached the preview, so I'll check it in the browser after building.

## 5. Reduced motion
- No sparkles or confetti; just the tick and the praise word. Sounds still follow the sound button.

## Technical details
- `src/lib/sound.ts`: add `chime`, `flourish`, `softLow`, `tapTick` with the exact notes above. Add a gate that blocks sound when voice is speaking, the session is Override, or low-data is on. Covered by a targeted test.
- New `src/components/lesson/celebrate.tsx`: `useReaction()` returns `small(anchor, praise)`, `big()` and `notQuite(el)`; Sparkles and Confetti (transform/opacity only, honours reduced motion); it drives the lesson mood so Fiti clips follow.
- `src/shared/praise.ts`: `nextPraise(last, list, strategy?)` makes sure the same word never comes twice in a row (tested). The list comes from rule/fallback lines `praise_*`, added to the seed as drafts and reloaded with `load-seed.ts`.
- Wire into WarmupStage, QuickFix (StepRow and finish), VideoStage checks, SimStage settle, practise/guided stages; the exit ticket fires only at its end.
- QuickFix try part: board lines = slip line + her right steps (from server step `line`); input row moves under the board (WhiteboardDialog `footer` slot).
- Marking stays on the server; reactions only follow the right/not-quite result.
