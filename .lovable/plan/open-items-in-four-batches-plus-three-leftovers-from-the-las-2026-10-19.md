# Open items in four batches, plus three leftovers from the last frame work

We work one batch at a time. After each batch I send you a report and a short screen recording, then wait for your OK before starting the next.

## Batch 1 (now): "Your turn" guided steps
1. **Never reveal ahead.**
   - A step's hint comes only after her first miss.
   - The "together" text, which contains the answer, comes only after her second miss.
   - Nothing about the next step is sent until it opens.
   - The hidden-answer check covers guided-step answers.
   - A new test answers step 1 once with a wrong answer. It confirms "8", "8 + 1 = 9" and "y = 9" appear nowhere (chat, page or any reply from the server) until the right moment.
2. **One clear action after every answer.**
   - First miss: "You got close!" with Try again. The box clears, returns to white and gets focus.
   - Second miss: "Let's do this one together" with Continue. The step fills in, marked "shown", and the next step opens.
   - Right answer: a tick in the box and "Nice!", then the next step after 1.5 s.
   - Last step: "Good job!", then "Try one alone".
3. **Page and chat stay together.** "Watch how it's done" folds to its title when she taps "Your turn". The chat posts only what the page is showing.
4. **Her answers stay on the page.** Her step answers are never posted in the chat.
5. **Answer box.** Only our blue focus ring. Amber shows only after a not-quite check and clears when she types again.
6. **Recording.** The substitution quick fix: step 1 not quite, then right; step 2 not quite twice; "Good job!"; "Try one alone". Then I stop.

## Batch 2 (after your OK): tutor chat rules
- The AI only sorts her message into a type. If it takes over 2 s or fails, a wider word list is used instead.
- Help replies depend on the step, get stronger each time she asks, and end with a "Show me" button.
- Bigger hints for each guided step go into the starter pack.
- The message type is shown in the admin Session debug page.
- The chat box keeps the blue focus ring.
- Chat screenshots for each case in your prompt.

## Batch 3 (after your OK): remove the old design, plus the leftovers
- Remove the old lesson step screens, the old top bar and the step map.
- Hook: Path A / Path B and the three prediction buttons, in the new frame layout.
- Video: the checks and the escalation as today.
  - **Leftover:** play/pause, time and CC move onto the player itself (bottom of the picture). They show on hover, tap or keyboard focus, and always show on phones. Captions stay on by default.
- Simulation: the three built-in engines.
  - **Leftover:** "Task n of 3" is now hidden from view (screen readers still read it), which wasn't in the plan. Tell me if you want it back; until you decide, it stays as it is.
- **Leftover, frame polish on all three:**
  - The frame's spacing on the card: question at the top, picture area in the middle, action row at the bottom.
  - The pale blue picture panel behind the board or player.
  - The card height matches the tutor panel.

## Batch 4 (after your OK): steps 5–8
- Practise, Guided, Exit ticket and Reflect keep how they work today.
- They take on the new colours and the new lesson page frame until their Figma frames arrive.

## Technical
- Batch 1:
  - Server: `src/server/lesson/quick-fix.ts` and `demo-path.server.ts` send `hint_question` / `together_text` only through `fix.dialogs` at the right miss.
  - Chat history: per-step lines only on open; student step answers are no longer added to the chat history.
  - Leak check: guided-step answers are included.
  - Tests: new test in `quick-fix.test.ts`.
  - UI: `QuickFix.tsx` YouTry dialogs and the folding watch card.
- Batch 3: delete `stages-a.tsx`, `stages-b.tsx`, `simulation-stage.tsx`, `StepBar`/step map; move the VideoStage controls into an overlay inside the player box; shared lesson card frame component for spacing/height.

## Gaps added (not in your prompts)
- **Batch 1:**
  - Coming back mid-step: if she leaves on a "Your turn" step and returns, the same step and the same try reopen, with any open dialog still there.
  - Phone: the dialogs sit above the keyboard, and the answer box stays visible when the keyboard opens.
  - The coordinates and calculation quick fixes get the same dialogs. The recording covers substitution only, but the test covers all three.
  - Screen readers announce each dialog, and focus returns to the answer box after Try again.
- **Batch 2:**
  - The AI never sees her name or account details. If AI credits run out, the word list takes over without a message to her.
  - A test checks that no AI reply text ever reaches the chat; only approved lines do.
- **Batch 3:**
  - Old lesson addresses keep working by redirecting to the new screens, so saved links and "Continue Lesson" never break.
  - Removing the old screens must not change how Instructor Override pauses a step.
- **Batch 4:**
  - The step map is gone, so the Super Admin "Go to page" menu gets a "Lesson:" entry for each of steps 5–8.
- **Every batch:**
  - Before/after screenshots on desktop and phone.
  - The hidden-answer and repeat-import checks after reloading the starter pack.
  - New tutor wording goes on the Instructional Design approval list.
