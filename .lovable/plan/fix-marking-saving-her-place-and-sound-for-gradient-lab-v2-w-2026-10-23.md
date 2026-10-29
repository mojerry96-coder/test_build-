# Fix marking, saving her place and sound for Gradient Lab v2, without editing the lab

Yes, all three can be handled on our side. The lab runs from our own web address, so our page is allowed to read what's on the lab's screen. That isn't the same as changing it. The lab's files stay byte-for-byte identical.

## 1. Our engine marks her answers
- **Reading her answer:** each time the lab reports an answer, our page reads it straight off the lab's screen. That means the screen she's on, what she typed in the boxes, where the m and c sliders sit, which option she picked, and where A and B are.
- **Knowing the question:** the lab's question sets (screens 6, 7, 8, 9 and 11) go into our content pack as hidden answer data. The lab always starts with the first question and moves to a fresh one only after a third wrong try, which it announces. We follow those announcements, so we always know which question she's on.
- **Marking:** our maths engine marks her answer with exact fractions. Its verdict is what's saved as evidence, the same as any other step.
- **If the two disagree:** ours wins and the disagreement is logged. We don't change what the lab shows her on screen.
- **Untouched:** the early screens (2–5) only have her explore, with no answers. They're logged as activity, not marked.

## 2. Saving her place
- **What's saved:** the screen she's on, read from the lab's own screen number in its address (`#6` and so on), every time it changes.
- **Coming back:** a reload or a later visit opens the lab straight at that screen, using the lab's built-in jump. The same level stays, because it still comes from her band.
- **Limit:** inside a screen, the lab always shows the first question again and empty boxes. Our question tracking resets with it, so marking stays correct.

## 3. Sound
- **What the lab's button really is:** it reads Fitila's words aloud. The lab has no game sounds of its own.
- **Our sounds:** when our engine marks her answer, she hears our balafon sounds (small win, big win at the end, not quite). They follow our header sound button and stay off in classroom sessions and low-data mode.
- **Read-aloud:** the lab's read-aloud button stays as it is, as the lab's own feature. It's silenced whenever Fiti's own voice speaks or a teacher pauses the lesson.

## Things to know
- If Michael's team later changes a question or the screen layout, the pack's question sets and our reading have to be updated to match. A check comparing the lab's file fingerprint with our notes flags any change.
- Every value read from the lab is checked for its shape and size on the server before it's used.

## Also included
- **If reading fails:** for example, after a lab update moves a box. The lesson keeps going on the lab's own verdict, labelled as the lab's, and the failure is logged so we notice.
- **Screen-by-screen check:** in a test browser, play each answer screen (6, 7, 8, 9, 11) with one right and one not-right answer, and confirm our engine marks both correctly.
- **Debug view:** the admin session-debug page shows the lab's verdict next to ours for each answer.

## Technical details
- `src/components/lesson/lab-v2-reader.ts` (client, pure DOM read of `frame.contentDocument`): `readScreen()` returns `{ screen, fields: {id: value}, sliders: {m, c}, choice, points }`. Sliders by `aria-label` (Gradient / Y-intercept), fields `input[type=text]` ids (`m-answer`, `c-answer`, …), choice `.choice.selected` index, points from chip labels. Screen from `contentWindow.location.hash`.
- Question index: client counter per screen, +1 on `gradientlab:support-offered` with `freshQuestion: true`; sent with every attempt and saved on the session.
- `GradientLabV2Stage.tsx`: on `gradientlab:attempt`, sends `v2_event` with `answer` (the read values) + `q`. Saves the screen on `hashchange` (frame) via `v2_event: "screen"`. Builds the URL with `#<savedScreen>`. Plays `small_win` / `not_quite` / `big_win` from our verdict. Sets `speechSynthesis.cancel()` on the frame window when paused or when our voice starts.
- Server `simLab` v2 branch: zod-checked `answer`; `checkLabV2(screen, q, answer, sets)` in `src/server/maths/gradient-lab-v2-checks.ts` (exact fractions: 6 m and c, 7 gradient through two points, 8 y at x, 9 intercept choice, 11 both targets on the line); inserts evidence (`engine: gradient-lab-v2`, first-try strength rules as elsewhere); logs `sim_result_disagrees` when the lab's `correct` differs; saves `simProgress.v2 = { screen, q }`.
- View: `lab.progress.v2` returns the saved screen (never the answers).
- Content pack: each band's v2 task carries the hidden `question_sets` (copied from the lab's code) under its check. The leak check skips nothing new, because the sets live in hidden scripts.
- `public/sims/gradient-lab-v2.SOURCE.md`: add the sha256 list; `scripts/load-seed.ts` warns if the files' fingerprints differ.
- Tests (targeted): one per screen checker with concrete values from the lab's question sets (for example, screen 7 A(−2, −2) B(2, 2) gives gradient 1), the question-index counter, and the screen-restore URL.
- Update `AGENTS.md` rule: the lab is read from outside, never edited, and our engine marks.
