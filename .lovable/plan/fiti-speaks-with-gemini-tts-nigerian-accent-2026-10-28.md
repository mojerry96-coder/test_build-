# Fiti speaks with Gemini TTS, Nigerian accent

## What changes for the student
- Fiti's spoken lines come from Google's Gemini voice instead of ElevenLabs.
- Every line is asked to be read "in a warm, friendly Nigerian English accent, at a calm teaching pace", so the accent stays.
- Captions, timing, mute and which lines he speaks stay exactly as now.
- If Gemini fails or is slow, the current backup voice plays, as today.
- The mic (listening to her) keeps working as it does now.

## Choices kept as settings, not code
- New setting value: voice provider = `gemini` (ElevenLabs stays available to switch back in one step).
- New settings: Gemini voice name (start with a warm voice, e.g. `Kore` or `Puck`, we pick by ear) and the accent/pace instruction wording.
- Note: Gemini has no built-in "Nigerian" voice; the accent comes from the instruction, so it may vary slightly line to line. We'll listen to a few lines and adjust the wording.

## Added checks
- Maths read aloud properly: "3/4" said as "three over four", "−2" as "minus two", "y = mx + c" spoken clearly (same line, just read correctly).
- Speed: Fiti must start speaking within about 2 seconds; long lines are split into sentences and played in order so he doesn't pause before talking.
- Repeat lines are saved after the first time, so the same line isn't paid for twice and plays instantly.
- The accent instruction is never spoken aloud by mistake (check a few lines).
- The slower teaching pace we set earlier is kept.
- Same voice everywhere: Ask Fiti, map, warm-up, video, hint/got-it cards.
- Cost note: each spoken line uses AI credits; if credits run out, the backup voice plays and lessons continue.
- Budget phones / weak network: audio stays small enough to start quickly; low-data mode still uses text only.

## Technical details
- New `src/server/providers/gemini-tts.server.ts`: calls Lovable AI Gateway `/v1/audio/speech` with `LOVABLE_API_KEY`, model `google/gemini-3.1-flash-tts-preview` (confirmed via model listing first), native `contents` + `generationConfig` (AUDIO, `speechConfig.voiceConfig.prebuiltVoiceConfig.voiceName`), text prefixed with the instruction rule. Non-streamed → WAV bytes returned to the existing player (browser audio plays WAV like mp3; content-type set accordingly).
- `voiceConfigFrom` / `readVoiceConfig` extended with `gemini_voice_name` and `gemini_voice_style` rules; `voice_provider` enum gains `gemini` (migration + content-pack rule list + settings contract).
- Speak path: provider `gemini` → Gemini, else existing ElevenLabs; any error/timeout (~8 s) → current Edge TTS fallback. 429/5xx retried once with backoff; 402/403 not retried, logged, fallback plays.
- Voice ledger (`voice_shown`) check unchanged: only approved lines are spoken; the instruction prefix is never shown or captioned.
- Update `voiceConfigFrom` test for the new provider; update the voice rule in `AGENTS.md`.
- Verify: one live gateway call with a real line, listen to the result, then switch the rule.
