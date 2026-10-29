# Remove the round blue chat-bubble button from the top bar

The button in the screenshot is Fiti's voice on/off button in the top bar (next to the sound button).

## What changes
- Remove that button from the top bar on every page that shows it.
- The sound (speaker) button stays.

## Side effect
- Students lose the only way to mute just Fiti's voice. Fiti will speak again for anyone who had turned the voice off. The speaker button still turns music and button sounds on/off.

## Technical details
- `src/components/home/FitilaShell.tsx`: drop `<VoiceButton />` (line 92) and the unused `VoiceButton` function and icon imports.
- Clear the saved voice-off setting on load (`setVoiceMuted(false)` once) so nobody is stuck muted with no way back.
- Update the voice rule line in `AGENTS.md` (no header mute button any more).
