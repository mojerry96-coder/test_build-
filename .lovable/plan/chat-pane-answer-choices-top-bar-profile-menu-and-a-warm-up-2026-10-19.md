# Chat pane, answer choices, top bar, profile menu and a warm-up error fix

## 1. Tutor chat stays put while the page scrolls
- On every lesson page that scrolls (intro, warm-up, hook, video, simulation, later steps), the tutor chat panel sticks to the right side below the top bar and keeps its full height; only the messages inside it scroll.
- The question area on the left scrolls under it as normal. Phones keep the bottom strip and sheet.

## 2. Answer choices restyled to the spec (image 85)
- Remove the A/B/C/D letter badges; each choice is a radio circle plus text in a rounded white card with a thin grey border.
- Selected: soft orange fill, orange border, orange filled radio and orange text.
- Smaller, lighter text than now, matching the spec. Applies to every multiple-choice question (warm-up, video checks, later steps). Keyboard and screen-reader labels stay ("Option A: …").

## 3. Top bar menu text (image 86)
- Home / My Learning / Progress text set to 14 px, semibold; active stays blue, others grey. Icons unchanged.

## 4. Profile menu for the demo (image 88)
- Keep Appearance: Light, Dark. Remove "Use device setting" (anyone on device setting moves to Light).
- Remove the whole Text size section and Low data (text stays at Normal; any saved size or low-data choice is cleared).
- Add "Restart lesson" to the menu, on the live app too, using the existing in-app confirmation dialog and the same restart action. Admin and Sign out stay.

## 5. Fix "That is not the current question." (image 87)
- The warm-up question 1 answer was refused after Check Answer. First step: reproduce on the test account and confirm the cause (most likely the page still shows a question the server has already moved past or re-picked, e.g. after the new warm-up re-pick rule).
- Fix: the server refreshes the lesson state and the page shows the real current question instead of an error; a stale answer never marks anything. Add a small test for that rule.

## Technical notes
- Sticky panel: `TutorChatPanel` wrapper `sticky top-[bar height]` with `h-[calc(100dvh-…)]` from tablet up, inside `LessonScreen`.
- Choices: shared option component used by `WarmupStage` and video checks; tokens only.
- Nav: `HomeParts.tsx` TopBar link classes. Menu: `ThemeMenu.tsx`, `HomeParts.tsx`; restart reuses the existing restart dialog/server function, shown to students.
- Error: `currentItem` check in `src/server/lesson/demo-path.server.ts`; respond with a "stale" result so the client reloads state.
- Targeted test only for the stale-answer rule; no full suite.
