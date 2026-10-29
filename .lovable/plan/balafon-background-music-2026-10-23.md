# Balafon background music

Today there is already a simple music loop (marimba-style, lesson and map only, tied to the sound button). It will be replaced by your balafon design, in one music module.

## What I think
Your plan is good: same instrument as the sound effects, very quiet, two moods, ducks under Fiti. I'd add these changes:
1. **Silence while she is answering.** In Focus mood, fade the melody out (keep only the soft pad) while a question is on screen, and bring it back after she checks. Melody notes can sound like a tap or a "right" sound, which is confusing while she thinks.
2. **Gradient Lab.** The lab reads Fitila's words aloud itself; the music ducks to 15% then too, the same as for Fiti's voice.
3. **Worksheet, exit ticket and reflection stay silent**, like the exit ticket in your list, since they are test-like and need concentration.
4. **Same session, same tune feel.** The random melody uses one seed per day, so it changes, but not wildly between pages.
5. **Phone battery.** Music stops fully (not just muted) after 2 minutes with no taps and returns on the next tap.

## What she will see and hear
- A music-note button beside the sound button in the header, on by default and remembered; also "Music on/off" in the profile menu. Separate from sound effects.
- Explore mood (Home, Learning Hub, map, Ask Fiti): 88 bpm, livelier, shaker on.
- Focus mood (warm-up, hook, hands-on step, practise, guided): 72 bpm, sparser, softer, no shaker. Moving between them crossfades over 2 s.
- 16-bar phrases that vary each time, a talking-drum tap every 4 bars, 3 s fade-in.
- Ducks to 15% under Fiti's voice (300 ms down, 1 s up), to 50% briefly under sound effects; a small rising lift for 4 s on big wins (lesson done, red feather).
- Stops during video (resumes after), exit ticket, worksheet, reflection; off in classroom sessions and low-data mode; paused when the app is in the background; starts only after her first tap.

## Technical details
- New `src/lib/music.ts`: look-ahead scheduler on the audio clock (25 ms timer, 0.2 s ahead), shared AudioContext and balafon voice from `src/lib/sound.ts`, master gain 0.03, all nodes stopped when off. Old loop removed from `sound.ts`.
- Pure rules in `src/shared/music-plan.ts` (mood per page/step, should-play, duck levels, phrase generator with seed) with targeted tests.
- Mood set via a small hook in `__root.tsx` from the current page and lesson step; ducking hooks into the existing speaking state, `playSound`, the lab's read-aloud and the big-win reaction.
- Music preference stored next to the sound preference; header button in the shared header, item in the profile menu.
