# Tutor chat understanding, banner formulas, bigger warm-up grid, screen-size check

## What I found (report)

a) **The AI sorting is built but switched off.** The setting that chooses the AI service (`ai_provider`) has no value saved at all, so the server treats it as off and never calls the AI. Only the word list sorts messages. The admin "AI answers" switch has never been turned on for this topic.

b) **Your message "what are ewe learning today?"** (warm-up question 1, 10:26 today) was logged as category **unclear**, **sorted by the word list**, **AI not used**. That is why the tutor replied "Sorry, I didn't catch that." The AI isn't failing or timing out; it is never asked. "what are we learning tody?" produced no separate log row I could match, but it fails for the same reason.

**Why the word list missed it:** the lesson-question rule only matches the exact word "learn". "learning" doesn't match, and neither does the typo "ewe". That one gap explains both messages.

Also: the warm-up keeps "about the lesson" questions in a different bucket and doesn't send them to the about-the-lesson reply.

## 1. Fix the tutor chat understanding
- **Word list:** "what are we learning / learn / doing today", "what's today's lesson", "what topic is this" and small typos ("ewe", "tody", "lerning", "leson") all count as "about the lesson". It plays the approved about-the-lesson line on the intro, warm-up, hook, video and simulation.
- **AI sorting switched on (Lovable AI), sorting only:**
  - Save the AI setting as Lovable AI for the topic, so the admin "AI answers" switch actually controls it.
  - The AI only sorts. It receives her message (name and contact details removed) plus the current step type, and returns one category. It never writes the reply.
  - Sorting gets its own time limit of **2 seconds** (new setting `ai_classify_timeout_ms` = 2000). When the time runs out or the call fails, the word list decides.
  - The AI is asked whenever the word list isn't sure, including messages it currently marks "unclear".
  - Written answers stay off by default, behind the existing switch.
- **Logging:** every typed message records the category, who sorted it (word list / AI / word list after timeout), and the time taken. The Session debug page shows these.
- **Tests:** "what are we learning today?", "what are ewe learning today?" and "what are we learning tody?" all sort as "about the lesson"; a slow AI reply still falls back to the word list after 2 s.
- **Live check:** send both messages in the preview with the AI on. Confirm the right reply, and that the Lovable AI request log shows a successful sorting call.

## 2. More formulas in the Continue/Start Learning banner (image 89)
- Add about 10–12 faint maths symbols across the dark banner, e.g. \(m = \tfrac{y_2-y_1}{x_2-x_1}\), \(y = mx + c\), \(x^2\), \(\Delta y\), \(\sqrt{x}\), \(\pi\), \(\div\), \(\tfrac{a}{b}\) and small triangles.
- Same faint look as now, kept clear of the title, button and progress bar. Fewer symbols on phones. Decoration only, hidden from screen readers.

## 3. Bigger warm-up grid (images 90, 91)
- Make the grid on the warm-up question larger: about 30% wider on desktop (close to the size in image 90), with larger axis numbers and point label.
- It still fits without scrolling sideways on tablet and phone, and keeps its proportions.

Sample layout (desktop, question card about 1130 px wide, chat panel on the right):

```text
+------------------------------------------------------------+  +------------------+
| Step 1 of 8 · Ready · Question 1 of 3                      |  | Your tutor       |
|                                                            |  |                  |
|      Imagine you see the point (3, 2). Which number        |  |  (chat stays     |
|      tells you how far across ... how far up it is?        |  |   fixed while    |
|                                                            |  |   page scrolls)  |
|   5 +-------+-------+-------+-------+-------+-------+      |  |                  |
|     |       |       |       |       |       |       |      |  |                  |
|   4 +-------+-------+-------+-------+-------+-------+      |  |                  |
|     |       |       |       |       |       |       |      |  |                  |
|   3 +-------+-------+-------+-------+-------+-------+      |  |                  |
|     |       |       |       | (3,2) |       |       |      |  |                  |
|   2 +-------+-------+-------O-------+-------+-------+      |  |                  |
|     |       |       |       |       |       |       |      |  |                  |
|   1 +-------+-------+-------+-------+-------+-------+      |  |                  |
|     |       |       |       |       |       |       |      |  |                  |
|   0 +-------+-------+-------+-------+-------+-------+      |  |                  |
|     0       1       2       3       4       5       6      |  |                  |
|        grid about 780 px wide (now about 390 px)           |  |                  |
|                                                            |  |                  |
|   ( ) 3 up and 2 across          ( ) 3 across and 2 down   |  |                  |
|   ( ) 2 across and 3 up          ( ) 3 across and 2 up     |  | [Ask your tutor] |
+------------------------------------------------------------+  +------------------+
```

Grid width by screen:

```text
Phone 375 px      -> full card width (about 330 px), numbers 12 px
Tablet 768 px     -> about 520 px
Laptop 1024 px    -> about 620 px
Desktop 1440 px+  -> about 780 px (as in image 90), numbers 16 px, point label 15 px bold
```

## 4. Check every screen size
- Screenshots after the changes at phone (375), large phone (430), tablet (768), small laptop (1024), desktop (1440) and wide (1920): Home banner, warm-up question with the grid, and the chat panel staying in place while scrolling.
- Fix any overlap, clipping or sideways scrolling found.

## Added safeguards
- **Same answer every time:** the same message on the same step always gets the same category (no random AI wording). The AI's category is only used if it's allowed on that step; otherwise the word list's choice stands.
- **Credit use:** the AI is asked at most once per message. Clear messages like "ok" or "I'm ready" never reach it. It returns only a category, not text.
- **When the AI service is down or out of credits:** the chat keeps working on the word list with no error shown to her. The admin Settings page shows a short "AI sorting unavailable" note.
- **Grid on short screens:** on laptops with short screens, the bigger grid shrinks so the answer choices and Check Answer button stay visible without much scrolling.
- **Grid in dark mode / reduced motion:** the grid stays light (lesson pages are light only). The banner formulas follow dark mode and never move when reduced motion is on.
- **Banner formulas readable by the tutor's voice later:** they're marked as decoration, so they're never read aloud or announced.
- **New lines for approval:** any new "about the lesson" wording is marked as a draft for Instructional Design.

## Does the plan cover everything?
It covers everything in this message. Still open from earlier, waiting on you or other teams:
- The rest of the cut-off voice instruction.
- The animated simulations.
- Whether "Task n of 3" should be visible.
- Changing "No, I'm an AI tutor" to "Yes, I'm an AI tutor".
- Stopping repeated off-topic messages from looping. I can add this here if you want.

## Technical notes
- Root cause: `src/shared/intro-moves.ts` about-rule `what (will|do|are) we (learn|do|doing)` lacks `learn\w*` and typo tolerance. The `ai_provider` rule row is missing, so `aiProvider()` resolves to off in `tutor-chat.server.ts`.
- `sortMessage` uses `ai_classify_timeout_ms` (default 2000) and passes the step to `classifyMessage`; the "unclear" result is marked not-sure, so the AI is consulted. The warm-up path in `demo-path.server.ts` routes "about" to `intro_about`.
- Rule rows go in the starter pack (`ai_provider: lovable_ai` stays controlled by the admin switch). Reload the seed, then run the leak check.
- Banner symbols: `ContinueBanner` in `HomeParts.tsx`. Grid: `WarmupStage.tsx` board SVG container width.
- Targeted tests only: `src/test/tutor-chat-sorting.test.ts`.
