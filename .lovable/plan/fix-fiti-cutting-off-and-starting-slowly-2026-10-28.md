# Fix Fiti cutting off and starting slowly

## What I found
- **He stops mid-line (confirmed in the code):** long lines are spoken in pieces. The 5-second "too slow" timer keeps running even after Fiti has started talking, and when it fires it cancels the pieces that haven't played yet. For the line in your screenshot, all 3 pieces were made (the AI request records show 3 voice clips at 08:46), but only the first one or two played, so he stopped after "…that can be frustrating".
- **He starts late:** each piece takes about 2–4 seconds for Gemini to make (2.0 s for the first piece, 3.5–3.8 s for the next two). For the feeling reply there is also about 2 seconds of AI writing before the message even appears.

## Fixes
1. **Never cut him off:** once Fiti starts a line, he always finishes every piece of it. The "too slow" rule only applies before he starts.
2. **Smaller first piece:** the first piece is cut at the first comma or full stop (about 3–8 words), so it is ready in about 1.5 seconds. The rest are made while he talks and follow with no gap.
3. **Save made clips for everyone:** each clip is saved once on the server (keyed by the exact words and voice), so lines every student hears (greetings, first-time questions, praise, "let's fix this") play straight away, cost nothing after the first time, and survive server restarts. Only the student's own AI-written lines still need making.
4. **Ready before he's asked:** the fixed first-time questions (like "How do you feel about maths right now?") are made ahead when Ask Fiti opens, so they play the moment they appear.
5. **Faster voice option (needs your OK):** I'll time the other Gemini voice models (e.g. the "flash" and "flash-lite" versions) on the same lines. If one is clearly faster with the same Nigerian accent, I'll send you samples and switch only if you approve.

## Check
- Play the long line from your screenshot: all three pieces should play to the end.
- Time the first sound after the message appears, from the AI request records: target about 1.5 s for new lines and under 0.5 s for saved lines.

## Technical details
- `src/lib/voice.ts`: in `voiceStarted`, the 5 s timer sets `dropped` only when the slot hasn't started (`started` flag on the slot; clear the timer on start). Pieces after the first are never skipped once started.
- `src/shared/spoken-split.ts`: the first piece is cut at the first `, ` / `. ` after 15 characters when the line is over 40 characters; the ledger notes the new pieces (update `spoken-split.test.ts`, including a "first piece is short" case).
- New server-only table `voice_clips (text_hash, voice_key, audio_b64, created_at)` with no browser grants; `speak.server.ts` reads it after the `wasShown` check, writes after a successful make; the per-copy memory cache stays in front of it.
- Prewarm: home load returns the pending onboarding lines; the browser calls `prefetchVoice` for their first pieces (they're already noted as shown in that response).
- Model timing: one-off script over 5 lines × available Gemini TTS models from the model listing; no model change without approval.
- Targeted tests only: spoken-split, a voice-queue test that a started line plays all its pieces after 5 s.
