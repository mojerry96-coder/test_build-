# Fix the worked example: stuck before "Got it", and Fiti talking too fast

## What is going on
- **Nothing hides the button.** The example never reaches its end, so "Got it" is never shown. Pause and Show all steps are still at the top, which only happens while the example is still playing.
- **Most likely cause (to confirm first):** the board waits a moment before each new line. Small things on the page, like the tip pill or Fiti's moves, refresh the card and restart that wait. The 4th line needs the board wiped first, which takes longer, so the wait keeps restarting and the next line never comes. Fiti stops on line 3 and goes quiet.
- **Voice too fast:** no speed is set for Fiti's voice, so the voice service uses its normal speed. That is quick for teaching.

## Fix
1. **Reproduce:** open the quick fix in the preview and confirm it stops after line 3 with the buttons at the top still showing.
2. **Keep the board moving:** the card's next-line wait only restarts when the steps really change, not on every refresh. Fiti then wipes the board, writes the rest, says his closing line, and shows "Watch again" and "Got it" (or "Your turn").
3. **Slower, teacher-like voice:** add a voice-speed setting (start at 0.85, slower than normal) so you can change it later without code. Leave a little more pause between lines so each step sinks in before the next.
4. **Check again:** play the example from start to end and confirm "Got it" appears and Fiti speaks every line at the slower pace. The same fix applies to the practice, warm-up and video cards, which use the same board.

## Technical details
- `WhiteboardDialog.tsx`: the write effect depends on `lines`, but callers pass a new array each render (`dialog.lines.map(...)`, spread in `QuickFix.tsx`). Change it to depend on a stable key (`lines.join("\u0001")`), keeping the latest lines in a ref. Same for the `n >= lines.length` closing timer.
- Rule `elevenlabs_voice_settings` = `{"speed":0.85,"stability":0.5,"similarity_boost":0.75}`, added through the seed content pack and reloaded with `load-seed.ts`. `elevenlabs.server.ts` already sends it. Check that the voice cache key includes the settings so old fast clips are not replayed.
- Edge TTS fallback: pass a matching slower rate (`-10%`) in `tts.server.ts`.
- Small test: a refresh with the same lines does not restart the line timer.

## Added: the "You got close!" card
- Fiti already reads this card. He will now read it at the slower teaching speed (same voice setting as above).
- After the message, Fiti also says **"Let's fix this."** as an approved line from the content, so it can be reworded without code. It is said once, never repeated when the card refreshes, and stops if she taps a button.
- Technical: `WarmupPopup.tsx` `useSay([title, ...lines, fixLine])`, with `fixLine` from a new fallback line `qf_lets_fix` in the seed pack. It only plays when the card shows the "Let's fix it" button.

## Added: small safeguards
- **Never stuck again:** if a line still hasn't appeared a few seconds after it should, the board moves on by itself, so "Got it" always shows.
- **Words and voice together:** the words in Fiti's bubble light up at the new, slower speaking pace, so the text never runs ahead of his voice.
- **No leftover fast clips:** lines saved at the old speed are not replayed. Every line is made again at the new speed.
- **Pause and Show all steps:** Pause stops Fiti's voice mid-line, and Continue picks up from the next line. Show all steps stops his voice and shows "Got it" straight away.
- **Phone check:** the "Got it" button is fully visible on a small phone screen, not pushed below the card.
