# Hook step (Step 2): real, alive, and the same Fiti shell as the warm-up

## 1. Layout (follows your second screenshot)
- The same bare Fiti shell as the warm-up: logo, sound and Dark mode, her name, the soft background shapes. There is no top menu or breadcrumb.
- Top: "Gradient of a line · Hook" with the 8-stop strip (stop 2 current).
- Left: the board, in the Gradient Lab look (white card, blue border, thick 3D bottom edge).
- Right: the hook question in the Patrick Hand heading font (at most 3 lines, numbers in orange), with the prediction tiles under it.
- Bottom left: only Ask Fiti. Hint and "Skip to next lesson" go.
- Bottom right: the thinking Fiti with the question mark, in the same place and size as the warm-up.
- Ask Fiti opens the same clean chat as the warm-up: a left card on desktop and a bottom sheet on phones. It opens on the approved opener for this question only. The leftover quick fix messages in your first screenshot will not show.
- Phone: board on top, question and tiles below, Fiti small.

## 2. The picture
- A soft hill shape. Both roads start from the same point at the foot of the hill, and the steep road no longer runs past the hill.
- Steep road (orange): up 2 for every 1 forward. Gentle road (purple): up 1 for every 2 forward.
- Labels: "Path A" and "Path B" for now. They switch to "Hard road" and "Easy road" only once Instructional Design approves; the labels come from the lesson content.
- Step triangles on each road: rise in green, run in blue, yellow fill. They are labelled "up 2, forward 1" and "up 1, forward 2".
- How it appears: the hill fades in, the steep road draws itself, then the gentle road (400 ms each), then the triangles draw in (run, then rise, then fill).
- Cyclist: a small cyclist rides up the gentle road steadily (about 3 s), then up the steep road, slowing and wobbling near the top (about 3 s), then waits at the start. A ↻ button on the board replays it.
- Reduced motion: no cyclist, and everything appears at once.

## 3. Fiti
- Greet clip, then thinking idle with the question mark.
- The hook line plays in a speech bubble beside her, with words lighting up as she speaks (when voice is on).

## 4. Her prediction (replaces the text box and Check Answer)
- Three tiles in the warm-up answer-pill style: "Path A", "Path B", "Same steepness".
- Under them are two optional number boxes: "How steep is A?" and "How steep is B?".
- When she picks: her tile lifts with a navy outline, a soft tap blip plays, and Fiti nods to show she heard (not to mark it right). Fiti says "Interesting guess! Keep it in mind. The video will tell us." Two seconds later, the video starts.
- No confetti, and no right or not-quite sounds: this is a guess, not a test.
- After 20 s with no pick: one nudge, "Take your best guess. There's no wrong answer here!"
- After another 20 s: a link "Not sure? Watch the video" appears. Using it saves "no prediction".
- Her pick and numbers are saved for the close step.
- The new Fiti lines go into the lesson content as drafts for Instructional Design approval.

## 5. Leftovers
- **Dark mode Fiti:** dark versions of the pointer Fiti clips (made from the same picture on the dark board colour), so there's no white box. Until they exist, Fiti uses a still picture in dark mode.
- **"Not quite" line:** "Not quite. Check your working and try again." moves into the lesson content as a draft line for Instructional Design approval, instead of being built into the app.

- **Map page reactions:** Fiti on the "Let's Begin" map reacts too. She nods when a stop is finished, celebrates when the whole topic is done, and taps when she taps a stop.
- **Steps with a strategy:** each quick fix and practise step can carry a short strategy line in the lesson content (for example "You multiplied first."). The first one is added for warm-up question 1's quick fix as a draft for Instructional Design approval, so "Nice! You multiplied first." can show now and then.
- **Writing her steps:** when a "Your turn" step is right, the marker visibly lifts from the tray and writes her step onto the board at reading pace ("2 × 4 = 8 ✓"), instead of it appearing straight away.

## 5b. Extra details
- **Reload:** if she reloads after picking, her pick stays and the video carries on. She is not asked again.
- **Change of mind:** she can switch tiles before the video starts, but only her last pick is saved.
- **Number boxes:** numbers only (fractions allowed, like 1/2). They never block going on, and they are not marked.
- **Keyboard and screen readers:** the arrow keys move between tiles and Enter picks one. The cyclist and the replay button have a text description ("A cyclist rides up Path B, then Path A").
- **Low-data mode:** no cyclist video or Fiti clips. The board drawing still shows, because it is made in code and light.
- **Dark mode:** the board stays white with its blue edge; the question and tiles use the dark colours already set.
- **Sound:** the tap blip follows the sound button, with no other sounds on this step.
- **Override (teacher):** the timers pause while a teacher has taken over.

## 5c. Making it feel alive and interactive
- Pointing at or focusing a tile lights up its road on the board: the road thickens and glows, and its triangle pulses once. "Same steepness" lights both roads.
- Tapping a road on the board picks that tile too, so she can answer by touching the picture.
- When she picks, the cyclist rides her chosen road once more as Fiti nods.
- The board is never fully still: clouds drift slowly, and the hill has a soft shine.
- Tiles lift on hover and squish on press, like the warm-up. The number boxes glow softly when focused.
- The question words appear in order with a gentle rise (same as the warm-up), and the tiles spring in one by one.
- Fiti's bubble pops in, and her head turns toward the board while the roads draw.

## 6. Name
- Everywhere it says "Ask Fiti", the name comes from the tutor name setting.

## Technical details
- `HookStage.tsx` rewritten inside `mcq/WarmupShell.tsx`; reuse `WarmupOptions`-style `.ans-pill` tiles and `splitNumbers`; the Ask Fiti card/sheet is reused from the warm-up (clean thread per question, approved opener `hook_ask_open`).
- New `hook-hill.tsx` SVG: hill, two roads from one origin, triangles; CSS draw-on (`board-draw`), cyclist via `offset-path` on each road, replay button; reduced-motion fallback.
- Prediction saved via the existing hook server function (choice + optional numbers + `none`); timers from rules `hook_nudge_s` (20) and `hook_skip_s` (20); no marking calls.
- Seed: draft lines `hook_ack`, `hook_nudge`, `hook_skip_link`, `hook_ask_open`, `fix_not_quite`; road labels as content; reloaded with `load-seed.ts` (re-import + leak check).
- Dark clips: two `videogen` clips on the dark surface colour, stored as `*_dark` assets; `FitiClips` pointer variant picks them by theme.
- Targeted test: nudge/skip timings and "no prediction" save.
