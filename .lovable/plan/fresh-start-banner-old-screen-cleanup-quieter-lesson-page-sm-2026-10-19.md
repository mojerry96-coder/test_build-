# Fresh-start banner, old-screen cleanup, quieter lesson page, smarter tutor chat

## 1. "Start" for new and restarted learners
- Home banner and the Choose a chapter banner show "START LEARNING" with a "Start Lesson" button whenever she hasn't answered anything yet. This covers a new account, an account after Restart, and a lesson that opened but sits on Step 1 with no answers.
- "Continue Learning" and "Continue Lesson" show only once she has made progress: at least one answer, or a step past the warm-up.
- In the "Start" state the progress line and the "Step n of 8" label are hidden.
- An automatic test checks Start vs Continue for: no lesson, a lesson with no answers, and a lesson with one answer.

## 2. Remove leftover old screens
- Find every place the old design still appears: the old step screens (two old files with the earlier versions of the steps), the old simulation screen, the old top bar with the topic name, the old step map, and the old step list.
- Delete them, or replace them with the new screens, so the old look can't show up behind or instead of the new one. Steps 5–8 (practise, guided, exit ticket, reflect) keep working, but take on the new page frame: breadcrumb, title, white card and tutor panel.
- Check every lesson step and the intro page in the preview and confirm each one shows only the new design.

## 3. The lesson page under "Welcome to …"
- Remove the coloured strip under the title (for example the amber "Close the message first.").
  - Wrong-order actions are blocked quietly in the page instead. Example: while a popup is open, the buttons behind it are switched off, so this message can't happen.
  - Messages that matter still show in the page and stay out of the way: "You're offline" and "Your teacher is guiding now" become small pills inside the card.
- Remove "Save and exit" from the lesson page and the intro.
  - Progress is already saved after every answer. It will also be saved quietly when she leaves the page (Home link, back button, closing the tab). Nothing pops up and nothing is said.
  - Returning by "Continue Lesson" opens the same place.

## 4. "Your turn" guided steps (rule file 1)
- **Nothing early:** a step's content is sent only when needed. The hint question comes after her first miss, the "together" text after her second miss, and nothing about the next step until it opens.
  - A test answers step 1 with a wrong answer and checks that "8", "8 + 1 = 9" and "y = 9" don't appear too early. The hidden-answer check also covers guided-step answers.
- **Dialogs after every answer:**
  - First miss: "You got close!" with the hint question and "Try again". The box clears, returns to white and gets focus.
  - Second miss: "Let's do this one together" with "Continue". The step fills in, marked "shown", and the next step opens.
  - Right answer: green box with a tick and "Nice!", then the next step after 1.5 s.
  - Last step: "Good job!" with the summary, then "Try one alone".
- **Page and chat stay together:** after she taps "Your turn", "Watch how it's done" folds to its title. The chat posts only what the page is showing.
- **Her answers stay on the page:** her step answers never appear in the chat.
- **Answer box:** no browser outline, only our 2 px blue ring. Amber shows only after a not-quite check and clears when she types. Placeholder colour #8FA0B1.

## 5. Tutor chat understands her (rule file 2)
- **Sorting her message:**
  - The AI sorts each message into one type: help, ready, about the lesson, maths question, asks for the answer, asks to skip, is this an AI, off topic, upset, or unclear.
  - The AI only sees her message and what kind of step she's on, never answers or hidden content. It never writes the reply.
- **Backup sorting:** if the AI takes over 2 s or fails, a much wider word list is used instead. Anything it can't place is "unclear", never "off topic".
- **Review log:** each sorting result and whether the AI or the word list chose it shows in the admin Session debug page.
- **Replies by where she is (approved lines only):**
  - Warm-up: encouragement only, no hints.
  - Hook: "That's the puzzle!…"
  - Watch how it's done: a watch prompt, then the example replays.
  - Your turn: the hint question, then the bigger hint. Never the answer.
  - Practice: the "same steps" line, then the first-step hint.
  - Video check: help based on how many tries she's had.
  - Simulation: the hint ladder, one rung at a time.
  - Asking for the answer: "Have a go first, I'll help you get there.", then help.
  - Off topic only for clearly non-maths things. Unclear: "Sorry, I didn't catch that…"
- **Never the same reply twice in a row:**
  - The same kind of message on the same step gets the next line.
  - After the last help line comes "Would you like me to show this step?" with a "Show me" button, which opens "Let's do this one together".
- **Content:** a bigger_hint for every guided step in the three quick fixes, using your example lines. These stay hidden until sent. The pack is reloaded and the hidden-answer check must pass.
- **Chat box focus:** a 2 px blue ring that follows the rounded box, with no browser outline.

## 6. Checks
- A screen recording of the substitution quick fix: step 1 not quite (12), then right (8); step 2 not quite twice.
- Chat screenshots on "Your turn" step 1 for: "how do i solve this right now?", "help me solve this", "who won the match?" and "asdfgh".
- Also "help" on a warm-up question and on "Watch how it's done".
- All automatic tests, the hidden-answer check and the repeat-import check.

## Technical
- Banner: use a `hasProgress` flag from the session (answers or steps done), not `step <= 0`, in `HomeParts.tsx` and `ChapterParts.tsx`.
- Cleanup: remove `stages-a.tsx`, `stages-b.tsx`, `simulation-stage.tsx` and the `StepBar`/step-map/old header in `LessonScreen.tsx`. Move any still-used steps into new-frame components. Search for other unused screens.
- Remove the error banner in `LessonScreen`. The server's "Close the message first." stays as a guard but is never shown, because buttons are switched off while a dialog is open.
- Save on leave: `pagehide`/`visibilitychange` + router leave → existing position/save functions.
- Chat sorting: new server-only classifier behind the existing AI provider switch (Lovable AI, short timeout 2 s), keyword fallback in `src/shared/lesson-ask.ts`, reply ladder picked by the engine from seed fallback lines, events `chat_classified`.
- Guided steps: server sends `hint_question`/`together_text`/`bigger_hint` only on demand in `quick-fix.ts`; leak check extended.
