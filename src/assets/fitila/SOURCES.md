# Fiti clips and stills — source record

Copied (not hot-linked) from the Gradient Lab simulation:
- Repository: https://github.com/mojerry96-coder/k12
- Commit: 68c929b
- Copied: 2026-10-22, uploaded to Lovable asset storage; pointers in `clips/` and `stills/`.

| Pointer | Original path |
|---|---|
| clips/fitila_{idle,nod,retry,tap,celebrate,greet}_light.mp4 | media/fitila_*_light.mp4 (filmed on #FFFFFF) |
| clips/fitila_{idle,nod,retry,tap,celebrate,greet}_dark.mp4 | media/fitila_*_dark.mp4 (filmed on #162839) |
| stills/fitila_tap_{light,dark}_rest.webp | assets/fitila_tap_*_rest.webp (shared rest frame) |
| stills/fitila_celebrate_{light,dark}_rest.webp | assets/fitila_celebrate_*_rest.webp |
| stills/fitila_greet_{light,dark}_{first,last}.webp | assets/fitila_greet_*_{first,last}.webp |
| stills/fitila_present_interim.png | assets/fitila_present_interim.png |

## Pointer Fiti (whiteboard)
- stills/fitila_pointer.png: cut out of the design screenshot (Fiti with glasses and pointer), transparent.
- clips/fitila_pointer_idle.mp4, clips/fitila_pointer_point.mp4: generated from that still; start and end on the same pose. Light only; shown with multiply blend on the white dialog.

## Sad (wrong answer)
- clips/fitila_sad_{light,dark}.mp4, stills/fitila_sad_{light,dark}.webp: from the team's Sad.mp4 (green screen), keyed with ffmpeg chromakey+despill onto #FFFFFF / #162839, first 3 s, no audio.
- ../video-lesson/mascot-sad.webm: same clip with a transparent background (VP9 alpha) for the video questions.

- `video-lesson/mascot-celebrate.webm`, `celebrate-still.webp`, `fitila/clips/fitila_celebrate2_{light,dark}.mp4` (+ stills): from the team's mascot-celebrate.webm (25 Oct 2026), cut to 3 s, sound removed. `sad-still.webp`: see-through frame of mascot-sad.webm.
- fitila_looking_around.webm/.webp: from Kingsley's Looking_around.mp4 (chromakey, cropped, no audio).
- fitila_wave_loader.webm/.webp: from user upload Wave.mp4 (green screen), chromakey+despill, 6s, no audio, 400px VP9 alpha; used by the page loader (FitiLoader), not the splash.
