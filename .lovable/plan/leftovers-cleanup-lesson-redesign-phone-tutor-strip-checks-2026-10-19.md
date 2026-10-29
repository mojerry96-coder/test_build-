# Leftovers cleanup: lesson redesign, phone tutor strip, checks

## 1. Lesson screen redesign (all 8 steps)
- Remove the left step list beside the lesson. Step progress stays as the thin 8-segment bar at the top; tapping it still opens the step list in a sheet on every screen size, so the student can still see their place.
- Replace the old lesson top bar with the same top bar the intro uses (logo, topic name, step "x of 8", Display settings, Save and exit). Teacher, offline and weak-network notices stay right below it, unchanged.
- Replace the old tutor panel with the new tutor panel used on the intro (header with avatar and name, text/voice switch, minimise, close, message bubbles, rounded ask box with mic and send).
  - Same behaviour as today: suggested questions, "Thinking…", "Will send when online", locked on the exit ticket ("On your own now") and when the teacher pauses.
  - Close hides the panel; a small "Ask the tutor" button brings it back. Minimise folds it to its header.
  - Simulation step keeps the wider stage with the panel on the right.
- Lesson stays light-only; tutor name still comes from the setting only.

## 2. Phone tutor strip (intro and lesson)
- Under tablet width the tutor panel becomes a strip fixed to the bottom: avatar, name, the tutor's latest line (2 lines max), mic button.
- Tapping the strip opens the full tutor panel as a bottom sheet (80% height); closing returns to the strip.
- Page content gets bottom space so the strip never covers the I'm Ready button or lesson buttons; respects the phone's safe area.
- Replaces the current intro layout where the panel sits below the card, and the lesson's old simulation-only strip.

## 2b. Topic intro page fixes (the page after Choose a quest, from your screenshot)
- The tutor panel is cut off at the right edge of the screen: keep it fully inside the page, lined up with the page's right margin, same height as the welcome card.
- Skill chips cut their names short ("Reading coordinates includi..."): let the names wrap to two lines so each skill reads in full.
- Keep the page's order: Choose a quest, then this intro, then the lesson. Continue Lesson still skips it.

## 3. Checks with screenshots
- Tablet (768 and 1024 wide), phone (390) and desktop (1440): intro, each lesson step reached via the admin panel, Home, Choose a chapter, Choose a quest; light and dark where the screen supports dark.
- Chat box tap/keyboard focus: screenshot proving no square inner outline, only the rounded ring, on intro and lesson ask boxes.
- Quest cards: measure contrast of every small text and label in light and dark against AA (4.5:1 small, 3:1 large); fix any failing token to the nearest passing value and report it.
- Quest and chapter card sizes and text sizes: compare against the spec screenshots and correct any mismatch.

## Technical details
- `TutorChatPanel` gains a `strip` mode (below `md`): fixed bottom strip + `Sheet` with the full panel; props for `locked`, `placeholder`, `suggestions`, `footerNote`.
- `LessonScreen.tsx`: delete `StepList` aside and old `TutorPanel`; map `chat` entries to `PanelMsg` (question headers become dividers, tutor lines joined, chat-safety still applied); `AskBox` send logic moves into the `onSend` handler; step list stays in a `Sheet`.
- Intro route: drop the stacked panel below `md`, use strip mode, add bottom padding.
- Existing tests must still pass; add one test that the exit ticket locks the ask box. Playwright scripts under /tmp/browser for all screenshots and a contrast-ratio script for quest cards.
