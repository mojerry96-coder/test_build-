# Slower splash close, fix its crash, and the balafon sound set

## 1. Splash close-out
- Right now the zoom-out takes 0.35 s and the fade-in of the page 0.25 s. That's too abrupt.
- New timings: zoom-out 0.7 s with an ease-out curve, then the page fades in over 0.45 s. Reduced motion: a gentle 0.5 s fade. Later opens that day use the same close-out (only the time before it is shorter).
- Update the splash timings test to the new values.

## 2. Fix the crash
- No error was captured in the preview logs, so I haven't confirmed the cause yet. The first step is to open the app in a test browser, record the splash frame by frame and read the console to find it.
- Likely places to check: the moment the splash unmounts while the page underneath is still redirecting, the zoom origin when the dot hasn't been measured yet (it jumps from the corner), and the blink timer that can keep running after the splash closes.
- Fix whatever the recording shows, then run the same check again to confirm it's gone.

## 3. One balafon sound module (all in code, no files)
Rewrite the shared sound module with three building blocks:
- **Balafon note:** a sine tone plus an octave above at gain 0.3, a 2 ms noise click at the start, 5 ms attack, exponential decay (250–600 ms), 3 kHz low-pass. Every repeat varies pitch randomly by ±2%. Notes come from C major pentatonic (C5 523.3, D5 587.3, E5 659.3, G5 784, A5 880, C6 1046.5, plus E6, G6, C7 for the feather and G4 392 for the "tok").
- **Talking drum:** a sine gliding from 140 Hz down to 90 Hz over 200 ms, with a soft noise thump.
- **Shaker:** a 50 ms band-passed noise burst around 6 kHz.

Sounds, by name:

| Name | What it plays |
|---|---|
| splash | drum low (110 Hz glide), then drum high (150 Hz glide) 0.18 s later, with C6 on the second |
| tap | shaker tick, gain 0.03 |
| small_win | E5 then A5, 0.11 s apart |
| big_win | C5, E5, G5, C6 (held), 0.09 s apart, soft drum on the last |
| not_quite | one wooden "tok": G4, 180 ms decay, gain 0.05 |
| hint | A5, gain 0.04 |
| snap | C6 click, 50 ms decay, gain 0.03 |
| stop_done | G5 then C6 with a shaker swish |
| feather | big_win, then E6, G6, C7 very softly |
| streak | two drum taps |
| fiti_message | very soft D5 pluck, only after 3 s of silence |

## 4. Levels and rules
- Master gain 0.08, so every sound stays well under Fiti's voice.
- Controlled by the header sound button: on by default, remembered.
- No sounds in classroom (Override) sessions or low-data mode.
- While Fiti's voice is playing, sounds are skipped.
- Audio starts only after her first tap. Until then, sounds are quietly dropped.
- Reduced motion doesn't affect sounds.
- The old sound names are removed so nothing can use the old sounds.

## 5. Hook it up everywhere
- Splash → splash (replaces the old ta-dum)
- Option taps (warm-up, hook tiles, video checks, quick choices) → tap
- Every answer check: right → small_win, finished/mastered → big_win, not right → not_quite
- Hints (lesson help, lab help) → hint
- Grid point snaps (place-point board, whiteboard) → snap
- Let's Begin map stop filling → stop_done
- Red feather award → feather
- Streak on Home → streak
- Fiti's chat messages (lesson and Ask Fiti) → fiti_message
- Sound button turned on → tap

Background music stays as it is (not part of this request).

## Technical details
- `src/lib/sound.ts`: new `SoundName` union, recipe table (pure data), `voices` (balafon/drum/shaker) built on one master GainNode at 0.08. Pitch jitter uses an injectable random. `fiti_message` gating: a `lastSoundAt` timestamp. Unlock on first `pointerdown`. `soundAllowed` keeps its rules.
- `src/shared/splash-plan.ts` zoom/fadeIn values; CSS durations for `splash-zoom-out` / `splash-fade-out` in styles.css to match.
- Tests: update `sound-pref.test.ts` and `celebrate-rules.test.ts` for the new names, with one test each for the rules: master gain 0.08, ±2% jitter range, fiti_message needs 3 s of silence, blocked in override/low-data/while speaking, and the new splash timings. Run only those files.
- Find and wire the feather, streak and chat-message call sites (no sound plays there today).
- Update the AGENTS.md "Game sounds" rule to name the balafon set.
