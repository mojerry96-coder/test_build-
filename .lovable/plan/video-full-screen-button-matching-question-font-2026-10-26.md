# Video: full-screen button + matching question font

## 1. Full-screen button on the video
- Add a full-screen button at the right end of the video control bar (after the progress bars), same size and style as the 10-second back button.
- Tap: the video area (video, its questions and Fiti reactions) fills the whole screen. Tap again or press Esc: back to normal. Icon swaps between "expand" and "shrink".
- Questions keep popping up inside full screen, so she never misses one; rewind-only seeking still applies.
- On iPhone (no full-screen for page areas) the button uses the phone's own video full-screen; questions show once she exits. If neither is available the button is hidden.
- Leaving the video step or the page exits full screen automatically.
- Works in light and dark mode; keyboard and screen-reader label "Full screen" / "Exit full screen".

## 2. Font check (finding)
- Body text in the video question card ("Question 1", "1/2", "Good Job!", "Well done…", Continue) already uses our app font (Mulish). OK.
- The question line uses Gochi Hand, while the warm-up and hook questions use Patrick Hand (with a slight outline). Both fonts load, but the video question looks different from the other questions.
- Fix: switch the video question line and its "full working" lines to the same Patrick Hand style used by the warm-up question, keeping the current smaller size from the spec.

## 3. Practice grid card uses our card design
- The practice step's graph card now has two bottoms: a red-orange-yellow strip on top of an orange edge (your screenshot). No other lesson board looks like that.
- Fix: remove the strip and give the card the same look as the hook's graph board: rounded white card with a thin blue border and a solid blue edge below. The grid size and layout stay the same.
- Dark mode uses the hook board's dark blue edge.

## Technical details
- `src/components/lesson/PractiseStage.tsx` line ~296: drop `overlay-edge` and the `--hub-flame` shadow; use `border-2 border-[var(--hook-board-edge)] shadow-[0_8px_0_var(--hook-board-edge)]`, matching `HookStage.tsx`.
- `src/features/video-lesson/FlowVideoStage.tsx`: wrap stage in a ref'd container; `requestFullscreen()` on it with `webkitEnterFullscreen()` on the `<video>` fallback; track `fullscreenchange`; exit on unmount. Lucide `Maximize2`/`Minimize2`.
- Replace `font-hand-bold` on the question `h3` and working `ol` with `font-hand` + the warm-up stroke treatment.
- No server or content changes.
