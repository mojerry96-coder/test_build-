# Map page "looking around" Fiti + fix cut-off teaching Fiti

## 1. New moving Fiti on the "Let's Begin" map
- Turn the uploaded "Looking around" clip (green screen, 6s) into a see-through moving clip: remove the green, clean green edges on the feathers, drop the sound, keep it small (target about 300 KB).
- Make a matching see-through still picture from the same clip.
- Replace the still Fiti at the bottom-right of the map page with this clip. It loops gently while she is on the page.
- Same size and spot as today; nothing on the map moves.
- When Fiti reacts (finished topic, tapping a stop) the current reactions still play; afterwards he goes back to looking around.
- Low-data mode, reduced motion, or a phone that can't play see-through clips (some iPhones) show the still picture instead.
- Works in light and dark mode with no box behind him.

## 2. Teaching Fiti is cut off
- On the screen where Fiti holds the pointer stick ("Across comes first, up comes second."), his left wing and tail are clipped at the edge and he sits on a white box.
- Fix: give him enough room so the whole bird shows, keep the speech bubble above him, and remove the white box so he sits on the page.
- Check laptop, short laptop, phone, light and dark.

## Also included
- Fiti's clip loads only after the map shows, so the page never waits for him.
- The loop joins smoothly (no visible jump at the restart point).
- The small Fiti in the streak badge at the top stays as it is.
- On phones, where big Fiti is hidden today, nothing new loads.
- If the clip fails to load, today's still Fiti shows.
- Fiti's speech and the chat beside him keep working as now.
- The same cut-off check runs on every other screen showing the pointer Fiti.

## Checks
- Open the map page in light and dark: moving Fiti, no green edge, no box.
- Open the teaching screen: whole bird visible, no white box.

## Technical details
- ffmpeg: chromakey + despill → VP9 alpha webm (`fitila_looking_around.webm`) and transparent webp still; upload via lovable-assets to `src/assets/fitila/`; record in `SOURCES.md`.
- Path route: swap `LiveTutor` for a `<video autoplay muted loop playsInline>` with poster = still; mood reactions overlay as today, then return to the loop.
- Cut-off: locate the pointer-Fiti container (likely the worked-example whiteboard / `FitiClips` pointer clip), remove `overflow-hidden`/object-cover cropping and the white backdrop, use object-contain with transparent still/clip.
