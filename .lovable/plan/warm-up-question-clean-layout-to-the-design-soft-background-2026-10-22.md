# Warm-up question: clean layout to the design + soft background music

## 1. Question text (match the design)
- Same handwritten font (Patrick Hand), but bolder and larger like the design: about 52 px on desktop, thicker outline (1.5 px), navy, centred.
- Wider text area (up to ~1080 px) so the question sits on 2 lines, not 3 squeezed lines.
- Every number stays the same navy as the text.

## 2. Layout when the question has a grid (desktop and tablet, 1024 px and wider)
```text
            Question (2 lines, centred)

   +-----------------+    +--------+ +--------+
   |                 |    |   A    | |   B    |
   |      Grid       |    +--------+ +--------+
   |                 |    +--------+ +--------+
   +-----------------+    |   C    | |   D    |
                          +--------+ +--------+
                [      Check Answer      ]
 Hint  Ask Fiti                              parrot + bubble
```
- Grid on the left, about the same height as the 2 x 2 answer block (both ~260 px tall), equal gap between them, the whole group centred.
- Answer tiles keep the design style (coloured, letter badge, darker bottom edge), with text on one line where possible.
- Check Answer centred under both, ~280 px wide, same as the design.
- The progress line ("Warm-up · Question 1 of 3") and dots move higher and smaller so they don't crowd the question.
- Fiti's speech bubble moves up next to the parrot so it never touches Check Answer.
- Without a grid: unchanged design layout (question, 2 x 2 tiles centred, Check Answer).
- Phones: question, then grid (full width, short), then tiles in one column, Check Answer fixed at the bottom (as now).

## 3. Background music (new)
- A very soft, looping game tune (light marimba-style notes over a calm pad), made in the browser, no downloads.
- Plays quietly in the background on the map and the warm-up (and later lesson steps); never louder than the tap and answer sounds.
- Starts after her first tap (browsers don't allow sound before that).
- Pauses automatically during videos, while Fiti speaks, and when the tab is hidden; fades back in afterwards.
- The speaker button in the top bar controls everything: one tap turns music and sounds off, a second tap turns them back on. Her choice is remembered.

## 4. Quick fix: "place the point" question (new question type)
- New kind of question in the content pack: "Put the point at (3, 2)". She drags the point (or taps a crossing); it snaps to the nearest grid crossing with a pop and a tick sound. Arrow keys move it one square.
- A dashed target ring pulses only after she asks for a hint (approved hint line says where to look), never before.
- Check Answer sends only her point to the server; the maths engine marks it against the hidden answer. Right: ring turns green, success pop, ding. Not quite: soft amber shake, point stays, then the normal help steps.
- The answer position lives only in hidden content, never in what the browser receives.
- Starter pack: one draft "place the point" step added to the quick fix for the reading-points skill (needs Instructional Design approval), loaded with the usual seed load and leak check.

## 5. Timings in one place
- All motion timings (bounce, tick, triangle sides, snap pop, squish, lift, card entry, music fade) move into one list of settings, so the design team's numbers can replace mine in one go without touching screens.
- I keep my current values until they send theirs; a short note lists each timing and where it shows, for them to fill in.

## 6. Gaps added
- Questions 2 and 3 and the quick fix use the same cleaned-up layout and question font.
- Long answers (e.g. "3 across and 2 up") fit on one line in the tiles; text shrinks a little before wrapping.
- Chat opened beside the warm-up: grid and tiles stack (grid on top) so nothing gets squeezed.
- The point-and-label on the grid stays clear of the answer tiles.
- Dark mode: question, tiles, grid and drag ring keep enough contrast.
- Music volume stays low on phones too; music never plays on weak-network/low-data use (when added) and stops on the lesson close screen.
- Checks after building: one desktop look against the design, one phone look, plus the targeted tests below.

## To confirm
- Music on the Ask Fiti and Learning Hub pages too, or only inside the lesson (planned: map + lesson only)?

## Technical details
- `WarmupStage.tsx`: question class (size/stroke/max-width); with-board layout becomes `lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]` with board left and `WarmupOptions` 2 x 2 right, matched heights; Check Answer row spans both.
- `WarmupShell.tsx`: smaller header line, bubble anchored above the parrot.
- `src/lib/sound.ts`: add `startMusic()/stopMusic()` (scheduled oscillator loop, low-pass, master gain ~0.03, fade in/out), paused by video `play` events, `visibilitychange` and the voice player; same on/off setting.
- Map and lesson screens call `startMusic` on mount and `stopMusic` on leave.
- Place-the-point: new item response `{ point: [x, y] }` in `src/shared/contracts`; content-pack schema + validation for `kind: "place_point"` (board size, hidden target in scripts/item_keys); marking in `src/server/maths` (exact integer match); `QuickFix.tsx` gets a draggable `PointBoard` mode (pointer + keyboard, snap); ring shown only when the server returns the hint flag.
- Timings: CSS variables `--t-*` in `src/styles.css` plus `src/shared/motion-timings.ts` for JS delays; `docs/motion-timings.md` lists them for the design team.
- Targeted tests: music stays off when sounds are off; point marking (right, off by one, outside the grid); pack validation for the new type.
- One desktop screenshot to compare against the design.
