# Topic intro and warm-up: finishing the complete build

Most of the document is already in place: the flow, the three questions with the document's options (true minus on "−2"), shuffled letters A–D, one try per question, both popups, the quick fix with practice questions, the skip path, and the automatic move to the hook. This plan covers what is still missing or differs from the document.

## 1. Content (starter pack)
- **Right answers:** each right option is split into its working lines and its praise, using the document's exact words. The full original feedback is kept too. The split is marked seed for Instructional Design.
- **Tutor lines:** each question's "Tutor says" line is checked word for word against the document, and so is the card wording. That includes the reminder lines for questions 2 and 3, and the question 1 grid switch (show_grid, on).
- **Intro:** the intro's closing line "Ready, {first name}? Let's see what you've got!" and the opening chat line are checked against the document.
- **Typed replies:** the ten typed-reply lines are checked against section 9, including "about the lesson", "asks for the answer" and "asks what the question means". The same replies then work on the warm-up and the quick fix, not only on the intro.
- **Reload and checks:** the pack is reloaded, then the leak check and re-import check are run. The leak check now covers the working lines, which are sent only after a right answer.

## 2. Right answer: "HERE'S HOW IT WORKS"
- **Option colours:** her option turns green with a tick.
- **Working box:** a white box opens under the options and shows the working one line at a time, 1.5 s apart. Each line is also posted in the chat. A "Skip" link shows every line at once.
- **Good Job popup:** it opens one second after the last line, with the praise only.
- **Not quite:** this path stays as it is. Her option turns amber, the correct option is never highlighted, and the "You got close!" popup opens with her option's full feedback.

## 3. Sizes from the document (desktop at 1440)
- **Page layout:** the content area is 1277 px wide. It holds a 690 px tall row: the main card (925 px) and, 12 px to its right, the tutor panel (340 px). On tablet the panel is 300 px.
- **Progress bar:** 8 px tall, with radius 24, a #F0F2F4 track and a #EA4B0A fill. It fills by questions answered out of questions asked, and it does not show on the intro.
- **Question text:** 650 px wide, 130 px from the top of the card, in Afacad SemiBold 32. Question 2's fraction is stacked.
- **Grid (question 1):** sized to fit between the question and the options. It runs 0 to 6 across and 0 to 5 up, with the point (3, 2) shown.
- **Answers:** 334 × 54 cards with 16 px and 20 px gaps, radius 20, a 22 px radio and a 30 px letter tile. Text is Mulish SemiBold 16. This replaces the larger answers from the last build.
- **Check Answer:** 446 × 40, radius 16, at 60% while nothing is selected.
- **Phone:** the question is 24 px, answers sit in one column at 56 px tall, the button is fixed at the bottom above the tutor strip, and the tutor strip opens the chat sheet.
- **Saved tick:** a small "Saved" tick appears after every answer.

## 4. Tutor panel details
- **Icons:** the Figma icons are downloaded once and stored with the app. They cover chat mode, voice mode, minimise, close, microphone, send arrow and the bubble tail. No Figma links stay in the code.
- **Header:** 40 px avatar on #FCA964, with the two-button switch on #F8F9FA.
- **Bubbles:** 247 px wide, Mulish Medium 12, with the tail. Student messages show in #E8F3F1.
- **Input bar:** 82 px tall, with a 308 × 40 pill, a 28 px microphone and a 28 px #EA4B0A send button. Send stays disabled while the box is empty.
- **Close:** closing the panel shows the "Ask your tutor" pill at the bottom right of the main card. Tapping it brings the panel back.
- **Voice:** the speaker shows "Voice is coming soon".

## 5. Deliberate differences kept (as listed in the document)
These stay different from the design on purpose:
- The tutor name is read from the name setting.
- The breadcrumb shows the quest and topic names.
- "Ask your tutor a question..." stays as the ask box wording.
- The document's full wording is used.
- Letters A–D show on all questions.
- Selected text is #A55A10.
- The grid shows the point (3, 2).
- "Let's fix it" and "Skip for now" replace Try Again.
- "Here's how it works" shows before Good Job.
- The progress bar fills by real progress.
- "−2" uses a true minus sign.
- The "I'm Ready" and "Check Answer" text stays dark, as agreed earlier for contrast. White text on #5CBBF3 fails the readability rules.

## 6. Checks and report
- **Tests:**
  - a student with no skills shown gets all three questions;
  - one with all three shown goes straight to the hook;
  - each question answered right and not quite;
  - a quick fix completed and one skipped;
  - the automatic move to the hook;
  - a right answer sends its working lines only after checking.
- **Screenshots:** desktop and phone, of the intro, question 1 selected, question 2 right (working box, then Good Job), question 3 not quite, the quick fix, and the hook opening. Then stop.

## Technical details
- **Pack and server:** `feedback` rows for correct options gain `working: string[]` and `praise`, both held in the hidden feedback table. `demo-path.server` returns `working` only in the `checkAnswer` result when the answer is right. The contract `lesson.ts` gains `working?: ScriptLine[]` on the popup state, so it survives a resume.
- **Working box:** `WarmupStage` gets a `WorkingBox` that reveals one line every 1.5 s (all at once with reduced motion or Skip). After the last line it waits 1 s, then shows the right popup. The popup timer starts only after that.
- **Layout:** `LessonScreen` readiness grid is set to `max-w-[1277px]`, `lg:grid-cols-[925px_340px]`, `md:grid-cols-[1fr_300px]`, with a 690 px row height on desktop. `WarmupOptions` drops to the 334 × 54 cards.
- **Assets:** downloaded with curl into /tmp, then hosted with lovable-assets; PNGs are converted to WebP first. `TutorChatPanel` icons use the new pointers.
- **Typed replies:** the intro keyword matcher (`src/shared/intro-moves.ts`) is reused for the lesson ask during the readiness step, through the existing lesson ask function.

## 7. Gaps found on a second read of the document (added)
- **Intro shown again:** if she left after the intro without answering, Enter Quest opens the intro again. This was not finished last time.
- **Intro layout:** the intro's own sizes are matched too: 110 px tutor circle, 24 px heading, 512 px paragraphs, 241 × 48 skill chips with coloured number tiles, the closing line above the button, and a 446 × 40 "I'm Ready" button.
- **Skill chips:** only the skills she will actually be asked show as chips, and "three/two/one question(s)" matches them.
- **Distress messages:** a distress message typed during the warm-up flags the lesson itself, not only the intro.
- **Typed messages:** her typed messages are saved as events.
- **Saved events:** every event in section 10 is saved, adding the ones not yet logged: option changed, working shown, working skipped, and quick fix started and completed.
- **Readiness status:** each skill's readiness status (shown, repaired, not repaired) is saved, and the evidence for each answer records first try, option, misconception and strength.
- **Misconception wording:** the parents' plain words for all eight misconceptions are checked against the document.
- **Skip for now:** "Skip for now" posts "No problem, you can ask me about this any time." in the chat.
- **Popups on phones:** popups use the phone sizes (110 px image, 26 px title, full-width button).
- **Typed minus sign:** a typed hyphen is still accepted as a minus sign.
- **Banned words:** the banned-word check runs on every new line, including the working lines.
