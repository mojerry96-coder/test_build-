# Real game music, a quick start, and a Safari fix

## 1. The slider screen in your screenshot
It's included. This is the lab's screen 2 ("Drag m to tilt the line", with "Walk the line"), copied byte for byte. The lab only shows it in its **Beginner** level, which our Rebuild band opens. A student in the Bridge band opens Intermediate (screens 6, 7, 8 and 13), so she never sees it. You can open any level from the admin "Gradient Lab v2 preview" page. If you want every band to start with this screen, tell me and I'll plan it separately.

## 2. Music that sounds like a real game
The code-made tune is too thin. I'll replace it with two short, produced instrumental loops, made once with AI music generation (Google Lyria) and saved with the app.
- **Explore** (Home, Learning Hub, map, Ask Fiti): bright, playful Afro-pop game loop with balafon, kalimba, soft shaker and light talking drum, about 100 bpm, no vocals.
- **Focus** (warm-up, hook, the hands-on lab, practise, guided): calm, warm loop with the same instruments, sparse, about 75 bpm, no vocals.
- Each loop is about 60 to 90 seconds and repeats without a gap. I'll generate them, listen to the waveforms for clean loop points, and you can approve or ask for another take before it goes live.
- Everything else from the music plan stays the same: one setting, the header and menu buttons, ducking under Fiti and the lab's read-aloud, a lift on big wins, and silence during video, worksheet, exit ticket, reflection, classroom sessions, low-data mode and the background.

## 3. Starting quickly
- The music file starts downloading in the background a moment after the page opens (never in low-data mode), so it's ready before she taps.
- On her first tap, the music fades in over about 0.6 s, instead of waiting through a 3 s fade.
- Each file is kept small (about 1 MB, compressed), and only the loop for her current area loads; the other loads when she first goes there.
- If a file can't download (weak network), music stays quietly off; game sounds still work, and it tries again on the next page.

## 4. Safari, iPhone and iPad
I reproduced it: in a Safari-type browser the app's sound stays asleep after a tap, so no music or game sounds play at all.
- Sound now wakes on every tap release, click, touch or key press, including taps inside the lab, until it's running, not just on the first press.
- Sound is created only inside her first tap, with a tiny silent note at that moment (Safari's standard unlock). It wakes again after the app returns from the background.

## Check
In both Safari-type and Chrome-type test browsers, on Home, Learning Hub, the map and the lab page: sound is running within a second of one tap, the music is playing, and it stops on silent steps.

## Technical details
- One-off generation via `/v1/music` with `google/lyria-3-pro-preview` (instrumental, tempo and length in the prompt), run from the sandbox. MP3s are stored as Lovable assets (`src/assets/music-explore.mp3.asset.json`, `music-focus.mp3.asset.json`); no runtime AI calls or keys in the app.
- `src/lib/music.ts`: fetch and `decodeAudioData` each loop once, play through `AudioBufferSourceNode` with `loop` and trimmed `loopStart`/`loopEnd`, two gain lanes for the 2 s mood crossfade, the existing duck/lift gains, a fade-in of about 0.6 s, and all nodes stopped when off. Prefetch with `requestIdleCallback` after load, skipped in low-data mode. The code-made phrase generator is removed; the rules in `src/shared/music-plan.ts` are kept (mood, should-play, duck) with updated tests.
- `src/lib/sound.ts`: repeat-until-running unlock on `pointerup`/`click`/`touchend`/`keydown` plus a silent buffer; no context is created before a gesture; `dressV2` forwards the same events from the lab frame.
