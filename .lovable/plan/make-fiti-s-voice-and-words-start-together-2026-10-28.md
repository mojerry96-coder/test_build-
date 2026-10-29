# Make Fiti's voice and words start together

## What's going wrong (likely, to confirm first)
- The words wait at most 3 seconds for the voice, then type on their own.
- Making a Gemini clip takes about 3 seconds for a short line, plus the line check and the sound shrinking, so most lines miss the 3-second wait: the words type first and the voice follows a few seconds later.
- After a page reload, phones and browsers block sound until her first tap; the words type, and the voice then plays late when she taps.

## Fixes
1. **Confirm the cause first**: time each voice clip from "message appears" to "sound starts" in the app (test student, not your account), and log it in the browser so we can see each line's delay.
2. **Shorter first piece**: split lines into smaller pieces (any line over ~60 characters, at full stops, question marks, colons and long commas), so the first piece is short and is ready in about 1–1.5 seconds. Later pieces are made while the first plays.
3. **Start making the voice sooner**: the moment Fiti's reply comes back from the server, start making its voice, before the message is even drawn on screen.
4. **Wait a little longer, with dots**: show the "…" typing dots for up to 5 seconds while the voice is made, then words and voice start together and finish together.
5. **No late voice**: if the voice misses the wait (very slow network), the words type alone and that line is not spoken late, so voice and text never drift apart. The next line tries again.
6. **Sound locked after reload**: until her first tap, words type normally and lines are not spoken late; from the first tap on, they move together.
7. **Faster repeats**: lines already made once (greetings, praise) play instantly from the saved copy, for every student.

## Check
- Measure again after the fix: target under 2 seconds from message to first sound, with words starting at the same moment, on Ask Fiti, the map chat and lesson bubbles, in light and dark mode.

## Technical details
- `src/lib/voice.ts`: `VOICE_START_WAIT_MS` 3000 → 5000; when `voiceStarted` resolves null for a line (timeout/locked), mark the line as dropped so `playOne` skips its parts instead of playing late; `console.info("voice: start after Xms")` per line.
- `src/shared/spoken-split.ts`: `SPLIT_OVER` 120 → 60, also split at ": " and at ", " when a part exceeds ~90 chars; keep the "0.5"/"e.g." rules; the voice ledger already notes each part (update `spoken-split.test.ts`).
- Prefetch: in the home agent/map chat/lesson response handlers, call `prefetchVoice` on the first piece of each new tutor line as the response lands.
- Server `speak.server.ts`: run the ledger check and cache lookup in parallel with nothing blocking; the per-copy cache already shares made clips across students.
- Targeted tests only: spoken-split.
