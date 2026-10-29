# Warm-up question screen in the new design

Rebuild the warm-up question screen to match your screenshot. It becomes the multiple-choice template (warm-up and quick-fix practice now, video checks later). Behaviour stays the same: shuffled options, one try, the server checks the answer, working then Good job, the You got close popup, and the quick fix.

## 1. Layout (desktop)
- **Shell:** the same Fiti layout as Ask Fiti, Learning Hub and the map:
  - left sidebar (logo, New Chat, Ask Fiti, Learning Hub, her real initials);
  - soft background shapes, planet and flask;
  - Dark mode button and streak badge ("days in a row") at the top right.
  - Removed: the old top menu, breadcrumb, "Welcome to…" title and white lesson card.
- **Top left:** a small line "Gradient of a line · Warm-up · Question {n} of {total}", with a compact stop strip under it (current stop highlighted). Tapping the strip opens the map.
- **Centre:**
  - the question in Patrick Hand, navy, centred, at most 2 lines on desktop (it shrinks automatically if longer);
  - Question 1 only: the grid with the point (3, 2), compact, about 360 × 220 (shown only when the question's show_grid setting is on);
  - the four option tiles in a 2 × 2 grid;
  - the Check Answer button (blue, pressed edge).
- **Bottom left:** Hint (yellow outline, bulb) and Ask Fiti (blue outline, bird icon), exactly as drawn.
- **Bottom right:** the thinking parrot, with Fiti's speech bubble beside it.

## 2. Content (from the Instructional Design readiness document, already in the starter pack)
- **Question text:** "Imagine you see the point (3, 2). Which number tells you how far across the point is, and which tells you how far up it is?"
- **Options:** "3 across and 2 up", "2 across and 3 up", "3 up and 2 across", "3 across and 2 down". They are shuffled, with letters A–D given by position. The design's sample numbers (3, 6, 4, 2) are not used.
- **Questions 2 and 3:** no grid.

## 3. Option tiles (the design's style)
- **Colours by position:**
  - A: lavender #C3CDF8, edge #5D6BB0
  - B: peach #F6C0A8, edge #C2562E
  - C: mint #D4FBE6, edge #5AA27A
  - D: yellow #F8E5A8, edge #C79A2E
- **Look:** a darker bottom edge for the 3D effect, the letter badge top left, and centred Mulish Bold text that is sized to fit and wraps to 2 lines when long.
- **Hover:** a slight lift. **Press:** pushes down onto its edge.
- **Selected:** lifts 2 px, a 3 px navy outline (#0A3150) and a tick in the badge.
- **After checking:**
  - right: green tile with a tick;
  - not quite: amber tile with an alert icon, never red.
- **Contrast:** text on every tile reaches at least 4.5:1. A test checks all of them, including green and amber.

## 4. Fiti speaks first (speech bubble)
- Lines stream into the bubble one after another: the question's "Tutor says" lead-in (for example "Let's start with a point on a graph."), then "Your turn: pick the answer you think is right."
- The parrot changes pose with its state:
  - thinking while she answers;
  - encouraging after "not quite" or a hint;
  - celebrating after a right answer.
- If voice is on, Fiti also speaks the lines, using the existing voice hook.

## 5. Hint and Ask Fiti
- **Hint:** shows the question's own approved tip in Fiti's bubble, for example "Here's a tip: the first number tells you how far across, the second tells you how far up." It never gives the answer. One tip per question; the button then reads "Tip shown" and can't be tapped again.
- **Ask Fiti:** opens the existing lesson chat as a right-side drawer (desktop) or bottom sheet (phone), with this question as context. The current warm-up chat rules apply: tips, "I'm not sure" and grounded answers only.

## 6. After Check Answer (same rules, new look)
- **Right:** the tile turns green, "Here's how it works" plays in Fiti's bubble at the agreed pace, then the Good job popup.
- **Not quite:** amber tile, the You got close popup with that option's feedback, then Let's fix it, which opens the quick fix (restyled with the same tiles).

## 7. Phone
- The sidebar becomes the bottom bar.
- A smaller question, and the tiles in one full-width column, 60 px tall.
- The parrot is small at the top right, with its bubble under the progress line.
- Hint and Ask Fiti sit in a row above a fixed Check Answer button.

## To confirm
- **Stop strip:** your instructions say a compact 8-stop strip, but the map you approved has 6 stops. I'll use the map's 6 stops so the two match. Tell me if you want 8.
- **Dark mode:** lesson pages are currently light-only. The Dark mode button will switch these screens too, using the dark colours already used on the Fiti pages. The tiles keep their colours in dark mode.
- **Other steps:** only the warm-up (and the quick-fix practice questions) move to this layout now. The puzzle, video, hands-on and later steps keep their current screens until their designs arrive.
- **Streak badge:** it says "days in a row", per your instruction, not the "in a roll" in the screenshot.

## Technical details
- New `src/components/lesson/mcq/` holds `McqTiles` (tiles, states, letters), `TutorBubble` (streamed lines, pose) and `StopStrip`. `WarmupStage` and `QuickFix` render through them. Checking, the popups and `WorkingPlayer` logic are unchanged.
- `LessonScreen` uses `FitilaShell` when the step is readiness. `TutorChatPanel` moves into a drawer/sheet opened by Ask Fiti, and the tutor's turn lines are shown in `TutorBubble` instead of the side panel.
- Tile colours are new tokens (`--mcq-a…d`, `--mcq-*-edge`, `--mcq-right`, `--mcq-amber`) in `src/styles.css`, with entries in `dark-contrast.test.ts` for the 4.5:1 check.
- The hint reads the existing warm-up tip line for the item (server-side, approved line only). The "Tip shown" state is per item in the session.
- Lesson pages stop being forced light only for the readiness step (`isLightOnlyPath` gets a step check). The `src/components/AGENTS.md` dark-mode rule is updated.
- Targeted tests: tile contrast, the hint shown once per item, and options never single numbers for this item (pack check). After that, the seed is reloaded and the leak check is run.
