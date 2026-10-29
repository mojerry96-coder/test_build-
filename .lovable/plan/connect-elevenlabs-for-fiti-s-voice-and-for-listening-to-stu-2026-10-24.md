# Connect ElevenLabs for Fiti's voice and for listening to students

## How you connect it (your part)
You'll use your own ElevenLabs key. Once you approve, a secure form opens in this chat. Paste your API key there (from elevenlabs.io: your profile, then API Keys). Please don't paste it in the chat. The form saves it safely on the server, and students' browsers never see it.

**Voice ID:** a voice ID isn't secret, so you can send it in the chat. I'll save it in the `elevenlabs_voice_id` setting, so you can change the voice later without any code change.

## What I'll change
1. **Fiti's voice:** when the `voice_provider` setting is "elevenlabs", Fiti speaks through ElevenLabs using the voice, model and settings saved in the existing settings `elevenlabs_voice_id`, `elevenlabs_model_id` and `elevenlabs_voice_settings`. Today's free Microsoft voice stays as the backup: if ElevenLabs fails or is too slow, she still hears Fiti.
2. **Listening (the mic button):** student recordings are turned into text by ElevenLabs instead of the current service, with the current one as the backup. The same rules still apply: signed-in students only, guardian voice consent first, and recordings are never stored.
3. **Same safety rules:** Fiti still only speaks lines he has already shown on screen, the Fiti mute button still works, and music keeps playing.
4. **Switching back:** setting `voice_provider` to "mock" in Settings returns everything to how it works today, with no code change.

## Costs
ElevenLabs charges your ElevenLabs account for every line Fiti speaks and every recording it listens to. Your plan there sets the monthly limit. When it runs out, Fiti falls back to the backup voice and the mic falls back to the current service.

## Not changing
What Fiti says, when he speaks, how answers are checked, and the lesson screens.

## Technical details
- Link the `elevenlabs` connector (it gives the server `ELEVENLABS_API_KEY`, which is called directly, without the gateway).
- `src/server/providers/tts.server.ts`: add `synthesizeElevenLabs()` (POST `/v1/text-to-speech/{voice}?output_format=mp3_44100_128`, model from the rule, default `eleven_turbo_v2_5`) behind the `voice_provider` switch; Edge TTS as the fallback on error or timeout.
- `src/routes/api/transcribe.ts`: ElevenLabs `scribe_v2` batch (`/v1/speech-to-text`, `language_code: eng`), with the current gateway call as the fallback; the auth and consent checks stay unchanged.
- Log provider, fallback reason and status, never the key. Extend `tts.test.ts` for provider selection and fallback.
- AGENTS.md: replace the voice rule with the provider switch.
