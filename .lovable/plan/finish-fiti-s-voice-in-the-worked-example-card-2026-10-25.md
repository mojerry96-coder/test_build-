# Finish Fiti's voice in the worked-example card

## What changes for the student
1. **Hint card and "Got it!" card speak.** Right now neither card asks Fiti to talk. When she taps Fiti, he reads the approved hint aloud once. When a step is right, he reads the "Got it!" line once. Closing the card stops him.
2. **Voice button shows clearly when he's off.** When his voice is off, the button turns grey (instead of blue), shows a crossed-out speech icon, and a small "Voice off" label sits next to it on wider screens. The first time she turns it off, a short note says "Fiti's voice is off. Tap to turn it back on." The setting is still remembered on this device.
3. **A stuck line can't block the next one.** A small automatic check makes sure that after Stop, a new line always plays, even if an earlier one never finished.
4. **Checked on real screens.** I'll play a quick fix in a test browser on a laptop and a phone size, in light and dark mode, and confirm each line asks for its voice in order. On the live app, I'll check once it's published, since the live server speaks through a different path.

## Technical section
- `whiteboard/QfCards.tsx`: `HintCard` and `GotItCard` call `useSay([text], "qf-hint:"+text)` / `useSay([title, ...lines], "qf-got:"+stepId)`; `hush()` on close. Bubble/pill dedupe stays in `WhiteboardDialog`.
- `FitilaShell.tsx` `VoiceButton`: off state uses tokens `--fh-btn-off` / `--fh-btn-off-ink` (new, light + dark in `src/styles.css`), `VolumeX`-style crossed icon, `md:` visible "Voice off" text; one-time sonner toast stored in localStorage.
- `src/lib/voice.ts`: export a tiny test hook (`__voiceTest`) so the queue can be exercised with a fake player; `src/test/voice-queue.test.ts`: a never-ending clip + `hush()` → next `say()` starts.
- `src/test/dark-contrast.test.ts`: add the off-button pair.
- Playwright run at 1433×892 and 390×844, light and dark: record speak requests per line, hint tap, Got it.

## Also included
- Hint and "Got it!" lines are never read twice (e.g. if the card re-opens or the screen refreshes).
- Turning voice off mid-line stops him at once; turning it back on speaks the next line, not old ones.
- The voice button looks and works the same on every page that has it (lessons, Ask Fiti, Practise).
- Screen readers hear "Fiti's voice on/off" when it changes.
- Music and button sounds are unaffected by the voice button.
