# Finish the Gemini voice: in-step text, accent check, faster start, smaller sound

## Why the words come before the voice today
Fiti's words start typing the moment the message arrives, but his voice has to be made first (about 2–3 seconds with Gemini), so the sound always lags behind the text.

## 1. Words and voice start together (new)
- While his voice is being made, Fiti shows the "…" typing dots instead of words.
- The moment his voice starts, the words begin typing, at a speed matched to how long he talks, so the last word appears as he finishes.
- If the voice doesn't come within about 3 seconds (slow network, muted, low-data mode), the words just type as now, so she is never left waiting.
- Tapping the text still shows it all at once; the answer buttons still appear when the typing finishes.
- Same everywhere Fiti talks with typing: Ask Fiti, the map chat, and lesson bubbles.

## 2. Check the accent and that the instruction is never spoken
- Make 6 real Fiti lines (greeting, praise, "let's fix this", a hint, a maths line with "3/4" and "−2", a long closing line) with Puck, Charon and Kore.
- Write each clip back out as text and confirm only Fiti's line is heard, never the "Say in a warm, friendly Nigerian English accent…" instruction.
- Save the clips to Files so you can listen and pick the most Nigerian-sounding voice; I set that voice in the settings.
- If any clip reads the instruction aloud, change the wording to a form Gemini doesn't read out.

## 3. Long lines split into sentences
- A long line (over ~120 characters) is split at full stops, question and exclamation marks (not inside numbers like "0.5").
- The first sentence is fetched first and starts playing as soon as it arrives; the rest are fetched while it plays and follow with no gap. This also makes item 1 start sooner.
- Captions still show the whole line; only the sound is split.
- Each sentence is still checked against the line she was actually shown.

## 4. Smaller sound files for slow networks
- Gemini's raw sound (~48 KB per second) is turned into a small mp3 on our server (~6 KB per second, about 8× smaller).
- If that conversion fails, the raw sound is sent as now, so Fiti still talks.
- Low-data mode stays text only.

## 5. Also covered
- Make the next line early: while Fiti speaks one line, the next known line (e.g. the follow-up after "Sounds good!") is prepared so it plays with no wait.
- Common lines (greetings, praise, "let's fix this") are saved once and reused across all students, so they start instantly and cost nothing after the first time.
- When she taps a button or types before Fiti finishes, his voice stops and the words finish at once, so two lines never talk over each other.
- First tap rule: phones block sound until the first tap; until then the words type normally (no waiting on a voice that can't play).
- Music and button sounds dip while Fiti speaks and come back after.
- Timing check: measure tap-to-first-sound on laptop and a slow-phone setting; target under 2 seconds.

## Technical details
- Sync: `src/lib/voice.ts` gains `sayWithStart(lines, key)` returning `{ started: Promise<number | null> }` (resolves with clip duration when playback begins, or null on mute/failure/3 s timeout). `useTypeOn` takes an optional `startAt` promise: shows `…` until it resolves, then sets its per-character speed so typing spans the clip duration (clamped to a min/max speed). `ConvTutor`, map chat and lesson bubble components pass it in; history (non-live) messages are unchanged.
- Split: pure `splitSpoken(line)` in `src/shared/spoken-split.ts` (tested: decimals, "e.g.", short lines untouched); the queue speaks parts in order and prefetches part n+1 while n plays; duration for sync = sum reported as each part starts.
- Ledger: `wasShown` accepts a part that is a trimmed substring of a shown line for that student (tested).
- Encoding: strip WAV header, encode 24 kHz mono PCM to 48 kbps mp3 with a pure-JS encoder (`@breezystack/lamejs`, Worker-safe) in `gemini-tts.server.ts`; fall back to WAV on error. Cache stores the mp3.
- Voice check script in `/tmp` calls gateway TTS and `openai/gpt-transcribe`; clips saved to `/mnt/documents/fiti-voice-samples/`.
- Targeted tests only: spoken-split, voice-ledger, type-on timing.
