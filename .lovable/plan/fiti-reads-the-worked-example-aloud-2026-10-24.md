# Fiti reads the worked example aloud

## What's wrong
The "watch Fiti work it out" card writes the steps on the board, but Fiti stays silent. This card never asks for his voice, so it isn't an ElevenLabs problem. The same card is used in the warm-up explanation, the quick fix, the video steps and Practise, so all four are silent today.

## What changes
1. **As each line is written, Fiti reads it aloud** in his ElevenLabs voice ("First, calculate 6 minus 2 equals 4…"). The next line waits until he has finished speaking, so the words on the board and his voice stay together.
2. **Watch again** replays the lines and his voice from the start.
3. **Closing the card (X or Got it) stops him at once**, so he never talks over the next screen.
4. When a reopened card shows all the lines at once (for example after a reload), he stays quiet instead of reading everything again.
5. **Fiti's bubble lines** in this card (the question, and his line after a not-quite answer) are read aloud too.
6. Mute, low-data mode and teacher pause still silence him, and music keeps playing underneath as it does now.
7. Maths symbols are spoken as words ("minus", "divided by", "equals"), so he never says "dash".

## Also included
- **Music:** it keeps playing but drops to about a third of its volume while he speaks, then comes back up.
- **No waiting:** the voice for the next line is fetched while the current one plays, so there are no silent gaps between lines.
- **Saving credits:** each line is made once and reused, so Watch again and other students hearing the same line cost nothing extra.
- **Slow or failed voice:** if a line's voice takes more than a few seconds, the board moves on without it, and his old voice is used as a backup.
- **First tap:** browsers only allow sound after a tap, so if the card opens before she has tapped anything, he starts speaking from her first tap.
- **Captions** stay on, so every word is still on screen.
- **Checking:** laptop and phone, light and dark mode.

## Not changing
What the lines say, how answers are checked, and how the card looks.

## Technical details
- `WhiteboardDialog.tsx`: when a line starts writing (live mode only), call `say([line])` from `src/lib/voice.ts`. The line hold waits for the voice queue (expose `voiceIdle(): Promise<void>`) with a ceiling, so a failed clip never stalls the board. Call `hush()` on close, unmount and Watch again; speak `ask` and `bubble` with `useSay` keyed by the text.
- The lines already come from server results that `lesson.functions.ts` notes in `voice_shown`, so the ledger allows them. Check that the quick-fix step and Practise worked lines pass through `noteShown`; any that don't get noted at their server function.
- Add a server-side `spokenForm()` for maths symbols (−, ÷, ×, =, /, ^) in `speak.server.ts`, applied after the ledger check. Write a small test for it.
- Check it in the preview by opening the warm-up explanation and confirming that a request for his voice goes out for each line.
