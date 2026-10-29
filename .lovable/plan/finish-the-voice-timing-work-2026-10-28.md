# Finish the voice timing work

## 1. Start the voice the moment Fiti's reply arrives
- As soon as Fiti's reply comes back (Ask Fiti, map chat, lesson steps), start making the voice for the first short piece of each new line, before the message is drawn.
- Only new lines are started; old chat history is never voiced.

## 2. Time it in the app with a test student
- Use a separate test student account (never yours). Before the run I'll ask which account to use, or create a new test student if you prefer.
- Tap once to unlock sound, then measure for 5 lines on each surface: time from "message appears" to "first sound", and whether the words start within half a second of the sound.
- Target: first sound under 2.5 seconds; words and voice start together; no line spoken late.
- Report the numbers back to you in plain words.

## 3. Check the map chat, lesson bubbles and dark mode
- Map chat ("Let's Begin"): Fiti's opening lines and the Start reply.
- Lesson bubbles: warm-up feedback, hint card, "let's fix this", got-it card.
- Each in light and dark mode on laptop and phone size: the "…" dots show while waiting, then words type with the voice, buttons appear after typing ends, and tapping the text still shows it all at once.
- Screenshots only where the timing can't be confirmed another way.

## Technical details
- Prefetch: in `FitilaAgent.tsx` (home reply handler), the map chat handler in `$subject.$chapter.$quest.$topic_.path.tsx`, and the lesson context reply handler, call `prefetchVoice(splitSpoken(line)[0])` for each new live tutor line; `fetchClip` already dedupes so `say()` reuses the same request.
- Timing: read the existing `voice: start after Xms` / `voice: too slow` console lines from a Playwright run signed in as the test student (`lovable auth-session --user <test uuid>`), plus a small page hook that records when each bubble's first word appears.
- Fix anything the run finds before reporting.
