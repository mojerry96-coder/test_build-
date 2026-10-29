# Your turn on the board, bigger Fiti, and a smarter Ask Fiti

## 1. "Your turn" goes inside the board
- "Your turn", "Step 1 of 1", the question ("How far across?"), the answer box, Check and the small grid are all written on the board, under Fiti's lines. Nothing sits below the board any more.
- When "Your turn" starts, Fiti's watch lines dim (they stay as a reminder) and the question area appears in the space under them. Fiti's lines take the top, and the question and answer row take the lower half, above the tray.
- The small grid sits on the right of the question, on the same board, the same size as the watch grid.
- The answer box and Check stay full-size and easy to tap. On phones the board grows taller so everything still fits.

## 2. Bigger Fiti on the board
- Fiti stands about two-thirds of the board's height, with her feet level with the tray, beside the board on the left.
- Her clip is cropped tight so she fills that space, instead of a small parrot with empty space around her.
- On phones she stays large and stands in the bottom-left corner of the board.

## 3. Ask Fiti keeps the conversation on track

### What went wrong in your screenshot (checked in the code)
- **"thanks fiti" after "can I ask you two quick things?":** only words like sure, yes or ok counted as an answer. "Thanks" didn't match, so Fiti dropped her own question and fell back to "I want to be sure I help with the right thing…".
- **"i want to make a lesson plan for me waec exam":** plan words like "make" or "create" aren't on the list, so it was sorted as unclear. The AI that helps when the list is unsure only sees the one message, not what Fiti just asked, so it couldn't help. Fiti then fell back to "Pick one, or tell me in your own words."

### Fixes
- **She carries on with her own questions.** During the first-time chat, friendly replies (thanks, ok, nice, hi, cool, a thumbs up) count as "go on", and Fiti asks the next question. If the reply is about something else (for example a plan or a quiz), Fiti answers that first, then asks once: "Can I still ask you those two quick things?" with Sure / Just start buttons. She never drops the setup silently.
- **Plan requests are understood:** "make / create / build / give me a (lesson / study) plan", "plan for WAEC / NECO / JAMB / my exam" and "what should I study" now open the plan. Fiti's line: "Your plan is built from your lessons, {first name}, and it's aimed at your exam. Here it is:" followed by the plan card and Start / Open My plan buttons. This line is a draft for Instructional Design to approve.
- **The AI sees the context.** When the word list is unsure, the AI also gets Fiti's last question, the buttons she offered, and her last 4 messages (without names or numbers she typed). This way "yes", "that one" or "for my exam" are read against what was just asked. The AI still only sorts the message. The engine picks the action and the approved line.
- **No dead ends:** "Pick one, or tell me in your own words" is used only after two unclear messages in a row. The first unclear message gets one short question that names what she might mean, based on the words she used, with buttons.
- Every case above is logged like today, so you can see the intent, the action and the outcome.

## 4. Checks
- I'll replay your screenshot conversation ("thanks fiti", then the WAEC plan message) and confirm Fiti asks her next setup question, then shows the plan.
- New tests cover the friendly-reply rule, the plan phrases and the two-unclear rule.
- I'll open the quick fix board on desktop and phone to check that "Your turn" is inside the board and Fiti is the larger size.

## Technical details
- `WhiteboardDialog`: the `footer` slot moves inside `.wb-photo` (above the tray, below `ol`); in your-turn mode, watch lines get `wb-dim`. The board column gets more height (`max-h` tied to the dialog height), and Fiti's column is about 24vw with `max-h` at 70% of the board.
- `opening.server.ts` `onboardReply`: the `hello` / `how` steps accept an acknowledgement regex. For a non-matching reply with a sure intent, it returns null without `endIntro`, and the agent re-attaches `pending: onboard` plus one `home_onb_resume` line after answering. `endIntro` runs only on "just start" or a second miss.
- `home-intents.ts`: extend `VIEW_PLAN` with make/create/build/give + plan/schedule/timetable and exam words; add tests in the existing home-intents test file.
- `classifyHomeMessage(text, mode, kinds, ms, ctx)`: `ctx = { lastTutorLine, buttons, recent }` from `home_messages`, passed through `redactForAi`; the prompt says the context is data only.
- `decide.ts` `avoidRepeat` / unclear: track the unclear streak from the last tutor message's outcome; first miss → `home_clarify_guess` (draft) with `clarify()` buttons, second → `home_pick_one`.
- New draft lines (`home_plan_made`, `home_onb_resume`, `home_clarify_guess`) are added to the seed pack and pass the banned-word and leak checks.
