# Ask Fiti: first-time conversation and smarter return greetings

## What she will see

### 1. First conversation (once, the first time she opens Ask Fiti)
Up to 4 short exchanges. Each one has buttons she can tap, she can also type, and every step has a "Let's just start" button that jumps straight to the plan.

1. **Introduction:** "Hi {first name}! I'm {tutor name}, your maths tutor. Before we start, can I ask you two quick things?"
   - Buttons: [Sure!] [Let's just start]
   - The sentence about her goal grade and exam is left out until the app collects those details.
2. **Feeling:** "How do you feel about maths right now?"
   - Buttons: [I enjoy it] [It's OK] [It's hard for me]
3. **Reaction, then the hardest part:** a warm, specific reaction to her answer, written by the AI (see the rules below). Then: "Which part feels hardest?"
   - Buttons: [Graphs] [Algebra] [Word problems] [Not sure yet]
4. **How Fiti teaches, linked to her answer:** asks before telling, gives hints not answers, and she always does the last step.
   - Button: [Sounds good!]
5. **Tonight's plan, mentioning her answer where it fits:** for example, "Good news: our first topic is all about graphs" when she picked Graphs and tonight is Gradient of a line.
   - Buttons: [Start] [See my plan] [Not tonight]

Her two answers are saved to her profile: how she feels (enjoy / ok / hard) and the area she finds hardest. They are used to word the plan and Fiti's later replies. Nothing else personal is asked.

### 2. Returning visits: the opening depends on her situation
- **Struggled in her last lesson** (not secure, or 2 or more misconceptions): an encouraging opener, then the plan.
- **Away more than 3 days:** "Hey {first name}, good to see you again! How have you been?"
  - Buttons: [Good!] [Busy week] [Struggling a bit]
  - **Busy week:** Fiti suggests a shorter session, a quick 5-question quiz.
  - **Struggling a bit:** reassurance, and a review comes first.
- **Next day:** a short welcome using her streak and last lesson, then the plan.
- **Otherwise:** today's normal greeting.
- **No repeats:** the same opening line is never used two visits in a row, because each kind of opening has 2 or 3 approved versions to rotate through.

When more than one situation applies, they are checked in the order above.

### 3. Talk to me again
A "Talk to me again" option in the profile menu restarts the first conversation.

### 4. Rules
- Lines are short (1 to 3 sentences), ask one question at a time, and always give a next step.
- The AI writes only the reaction in step 3. That reaction must pass the existing reply checks: no banned words, no numbers or facts that aren't already in the lesson, and within the length limit. If it fails, or the AI is too slow (3 seconds), an approved reaction line for that answer plays instead.
- All other lines are approved lines from the content pack. They are new draft lines and need Instructional Design approval.
- Typed answers ("I hate maths", "algebra", "skip") are matched to the buttons first. The AI sorts them only when the word list is unsure, the same as today.

## Test
- A brand-new student through every branch: each feeling, each hardest area, and "Let's just start" at each step.
- A returning student the next day.
- One returning after 5 days away, with each of the three replies.
- One after a hard lesson.
- Screenshots of the first conversation and two returning openings, then stop.

## Technical details
- **Migration:** `student_prefs` table: student_id (primary key), maths_feeling, hardest_area, intro_done_at, last_opening_line_id, updated_at.
  - It is server-only (no browser grants, the same pattern as home_messages) and written by the home agent.
  - The admin "Talk to me again" action clears `intro_done_at`.
- **New pure module `src/server/home/opening.ts`** (with tests):
  - `pickOpening(prefs, lastSession, streak, lastVisit, now)` returns `intro | struggled | away | next_day | normal`. Away is more than 3 days, measured in Africa/Lagos days.
  - `rotateLine` skips `last_opening_line_id`.
- **Onboarding steps** run as pending actions (`meta.pending.kind = 'onboard'` with the step and the options), reusing `matchPendingReply`. "Let's just start" maps to the existing plan proposal. Each step is logged in home_messages.
- **Reaction:** `reactToFeeling` in `ai.server.ts` uses a strict JSON schema with a 3-second limit and the `src/server/checks/ai-answer.ts` checks. The fallback is `home_onb_react_<feeling>`.
- **Seed lines** in the starter pack: `home_onb_*`, `home_ret_away*`, `home_ret_next*`, `home_ret_struggle*`, `home_ret_busy`, `home_ret_low`. After loading them, reload the pack and run the leak check.
- **Plan proposal:** gets an optional `hint` (the hardest area) and adds the "about graphs" clause only when tonight's topic carries the matching tag. The planner order is unchanged.
- **Tests:** targeted tests in `src/test/home-agent.test.ts` and the new `opening.test.ts`.
