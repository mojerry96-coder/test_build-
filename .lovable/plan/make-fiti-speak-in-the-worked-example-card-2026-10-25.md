# Make Fiti speak in the worked-example card

## What we know so far
- The card does ask Fiti to say each line as it is written, and the lines match the approved text the server allows him to speak.
- The preview's server log shows no voice requests from this card, so the sound is most likely stopped on the device before it reaches the server, or a voice clip is stuck and blocks every line after it.
- Suspects found in the code (not yet confirmed):
  1. One stuck clip (a slow or failed sound that never reports "ended") holds up the line after it, and "Stop" doesn't clear that hold-up. He goes quiet for the rest of the lesson.
  2. The Ask Fiti panel stops his voice whenever it closes or refreshes, which can cut the card off.
  3. A "voice off" or "low data" setting left on from earlier.

## Steps
1. Reproduce first: open the quick fix in a test browser as a signed-in student, watch the worked example, and record what is asked for, what the server answers and what plays. This tells us which suspect it is.
2. Fix what that run shows:
   - Stop clears the hold-up, so a new line always starts fresh, and no clip can block the next one for more than a few seconds.
   - The Ask Fiti panel only stops voices it started itself, never the card's.
   - If voice is off, the header voice button shows it clearly.
3. Re-run the same test: every line is heard in order, Pause/Show all steps/Watch again/X behave as before, and the Practise page still speaks.
4. Check the live app once it's published, since the live server speaks through a different path.

## Technical section
- `src/lib/voice.ts`: `hush()` resets `queue` to a resolved promise; `playOne` gets a hard ceiling (clip length + 2 s, or 6 s if unknown) so nothing waits forever; log one `voice:` console line per skipped reason (muted, low-data, no audio, blocked).
- `src/components/home/HomeParts.tsx:247`: replace the global `hush()` with a scoped stop for the panel's own lines (generation token per surface).
- Small test for the queue: a stuck clip doesn't block the next line after `hush()`.

## Also included
- Speech bubble and "Tap me for a hint!" pill are read aloud once, never twice.
- Hint card (tapping Fiti) and "Got it!" card speak their line.
- If a line's voice fails, the board keeps writing on time (no freeze) and the next line still speaks.
- Music softens while he talks and comes back after.
- Same check on phone (iPhone-style autoplay rules) and laptop, light and dark.
- Opening the card straight after a reload (no tap yet) still speaks once she taps anywhere.
