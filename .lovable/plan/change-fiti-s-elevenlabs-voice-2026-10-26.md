# Change Fiti's ElevenLabs voice

Switch Fiti to the ElevenLabs voice `QQswKXAu7aQVNxKFmOP8`.

## What changes
- Fiti's voice setting is saved to the new voice everywhere: lessons, Ask Fiti and the map.
- Speed and other voice settings stay the same. If the new voice fails, Fiti still falls back to the backup voice.

## Technical details
- New migration: replace the global `elevenlabs_voice_id` row in `rules` with value `"QQswKXAu7aQVNxKFmOP8"`. This uses the same delete-then-insert pattern as `0021_fiti_voice_slower.sql`.
- The voice settings are cached for up to 60 s per server copy, so the new voice starts within a minute.
- Check: run one spoken line through the voice service and confirm it uses ElevenLabs, not the backup voice.
