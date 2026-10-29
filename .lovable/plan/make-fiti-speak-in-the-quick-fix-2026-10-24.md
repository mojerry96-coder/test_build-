# Make Fiti speak in the quick fix

## What I found so far
- The quick fix asks Fiti to say each line as it is written, so the code does try to speak.
- But the preview's server log shows no voice requests at all for these lines, so the voice is stopped before it reaches the server (or fails without a trace). The exact cause isn't confirmed yet.
- Each line is also asked to play twice (once by the card, once by the lesson), which can tangle the queue.

## Steps
1. **Reproduce first.** Sign in as the test account, open the quick fix, and record every voice request, its answer, and whether audio plays. This names the real cause before any change.
2. **Fix the cause found.** Likely suspects, checked in this order:
   - Browser blocking sound until a tap: the clip waits for a tap that never counts, and the next lines then wait behind it. Fix: unlock sound on her first tap anywhere in the lesson, and never let one blocked clip hold up the rest.
   - Lines not noted as "shown" (the server refuses to voice lines it didn't send), e.g. the slip line "Across comes first…". Fix: note every quick-fix line when it is sent.
   - Voice turned off by a saved mute or low-data setting. Fix: make the voice button state match.
3. **Speak each line once.** Remove the second request so each line plays once, in order.
4. **Check again** in the same flow: Watch plays every line aloud, Pause and X stop him, Watch again replays.
5. **Also covered:**
   - "Show all steps" stays quiet and goes straight to the end; "Skip for now" stops him at once.
   - Fiti's bubble and his written line aren't read twice.
   - The "Tap me for a hint!" pill and hint card are read aloud once.
   - If a line's voice fails or is slow, the next line is written anyway after a short wait (no frozen board).
   - Music softens while he speaks and comes back after.
   - Same fix for the Practise page's "Watch Fiti work it out", which uses the same card.
   - The live app is checked as well, since it runs on different servers than the preview.

## Technical details
- Files: `src/lib/voice.ts` (queue, autoplay unlock, failed clips skip), `src/components/lesson/QuickFix.tsx` (drop duplicate `say` in `onLine`), possibly `src/lib/api/lesson.functions.ts` / quick-fix view for ledger coverage.
- Verification: Playwright run capturing `speakFn` responses (audio present vs `null`) plus server log lines "voice skipped".
