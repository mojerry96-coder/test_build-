# Make the sound effects play the same way every time

## Why they seem inconsistent (found in the sound code)
On purpose, a sound is silently skipped when:
1. Fiti is speaking. Since Fiti now talks on most screens, this is the main cause.
2. A video is playing with sound.
3. It's Fiti's message pluck and another sound played less than 3 seconds ago.
4. She hasn't tapped anything yet. Browsers block sound until the first tap, so the feather tune can be lost if it's the first thing on the map.
5. Low-data mode, Together Mode, sounds turned off, or the tab is hidden.

These cause it too:
- Every note is shifted by up to 2% each time, so the same sound never plays quite the same.
- A new sound cuts off the one already playing, so the feather tune can stop halfway.
- Most correct and wrong answers don't trigger a sound at all. Only a quick-fix right answer does, so the same moment sounds different on different screens.

## Changes
- **Play under Fiti's voice instead of skipping.** Sound effects keep playing while Fiti talks, just quieter. Low-data mode, Together Mode and sounds-off still stay silent.
- **Wait for the first tap, then play.** If a sound is called before audio is allowed, keep it for up to 2 seconds and play it on the first tap. After that, drop it.
- **No pitch wobble.** The same sound is always exactly the same.
- **Let tunes finish.** The feather and stop-done tunes can't be cut off. Short taps play over them.
- **Same moments, same sounds everywhere:**
  - Right answer: small win in warm-up, video questions, quick fix, practice and Prove it.
  - Not quite: the soft low note on all of those screens.
  - Big win: lesson finished.
  - Hint shown: hint note in every step, not just the simulation.
- Keep the 3-second gap for Fiti's message pluck, so chats don't keep pinging.
- **Same tap sound on every button.** Today only a few buttons (mode cards, map stops) make the soft shaker. Every main button and option tile gets it, but not typing keys.
- **One sound per moment.** A right answer plays its chime once, even if both the popup and the reaction try to play it.
- **Video and the Gradient Lab.** Effects stay off while a video plays with sound, as now. Inside the lab, our sounds stay quiet so they don't clash with the lab's own effects.
- **Ask Fiti and the map chat.** Fiti's message pluck plays there too, with the same 3-second gap.
- **Sounds switch.** Turning sounds off in the speaker menu stops effects straight away, including any tune still playing.
- **Slow phones.** No more than one tune plays at a time, so effects never pile up.

## Technical details
- In `src/lib/sound.ts`:
  - Remove `speaking` from `soundAllowed` and duck the effects' volume to 40% while Fiti speaks.
  - Add a one-slot pending queue that is flushed by `unlock` and expires after 2 s.
  - Make `jitter` return the exact pitch.
  - Mark `feather`, `stop_done` and `big_win` as "full" sounds that aren't disconnected by later sounds.
- Add `playSound` calls in the answer handlers of WarmupStage, FlowVideoStage, PractiseStage, ProveStage and stages-b, and in each hint reveal.
- Update `src/test` for `soundAllowed`, no-jitter and the pending-queue expiry.
- Add a shared `useTapSound` helper for buttons. De-duplicate with a short per-name window (300 ms).
- Mute the master gain immediately on `setSoundPref(false)`.
- Add a test for the de-duplication window.

## Not checked
How the sounds feel together on a real phone needs a listening check from you.
