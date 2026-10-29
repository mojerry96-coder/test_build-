# Warm-up: lead-ins that match her progress, honest skipping, step label, clean Restart

## What I found on your test account (point 2d)
- Questions 1 and 2 were skipped because of right answers from your **earlier, abandoned attempts**: for example "Working with a fraction" was answered right in attempt 5, which was later abandoned by a Restart. These weren't preview sessions; they were your own earlier tries that Restart closed.
- Today any right answer counts, from any session, even abandoned ones and even weak or "none" strength evidence. That's the bug.
- The intro page counts skills the same loose way, so its count can disagree with the warm-up.

## 1. Lead-ins that match her real position
- Each warm-up question is split into a lead-in plus the body. The body is exactly Instructional Design's wording:
  - Q1: "Imagine you see the point (3, 2). Which number tells you how far across the point is, and which tells you how far up it is?"
  - Q2: "Suppose you need to work out this expression: (6 − 2) ÷ (5 − 3). What answer do you get? Take your time. Remember to work out the subtraction at the top and bottom before dividing."
  - Q3: "Here's an equation: y = 2x − 4. If x = 5, what is the value of y? Remember, wherever you see x, replace it with 5 and follow the order of operations."
  - The fraction still shows as a stacked fraction on screen.
- The lead-in is picked when she reaches the question, from the questions she actually gets:
  - **All three, in order:** the document's own lines: "Let's start with a point on a graph." / "Nice start! Now, let's warm up those number skills." / "You're doing great! One last warm-up."
  - **First of several:** "Let's start with this one."
  - **Middle:** "Nice start! Next one."
  - **Last of several:** "You're doing great! One last warm-up."
  - **Only one question:** "Just one quick question for you."
- These four position lines are new drafts for Instructional Design approval. "Nice start", "doing great" and "last" never appear unless they match where she really is.

## 2. Honest skipping, with reasons
- A question is skipped only when she has real evidence of that skill:
  - an earlier row marked "shown", or
  - a right answer of strong or moderate strength,
  - and in both cases only from a real session that wasn't abandoned or restarted.
- Admin preview sessions and abandoned or restarted attempts never count.
- The intro page uses the same rule, so its skill list and the warm-up always agree.
- For every skipped question, the reason and the exact earlier answer it relied on are saved. The admin Session debug page shows them as "Skipped: Reading coordinates. Shown on 19 Oct in a lesson on Gradient of a line, strong."

## 3. Step label
- At the top of the main card on every warm-up question: "Step 1 of 8 · Ready · Question {n} of {total}". The total is the number of questions she actually gets. The thin bar stays.

## 4. Admin Restart
- After Restart, your account counts as a new student for the warm-up. All your earlier answers are ignored, so you get all three questions with the document's lead-ins. Students' records are not touched.

## Checks and screenshots
- Tests for: the skip rule (abandoned/preview/weak evidence never counts), the lead-in picked for each position, and the step label total.
- Starter pack reload with the hidden-answer check.
- Screenshots:
  - the warm-up after a Restart (Question 1 of 3, with the document's lead-in);
  - a test student with two skills already shown (Question 1 of 1, "Just one quick question for you.");
  - the debug page's skip reasons.
- Then I stop.

## Technical notes
- Content pack: items get `prompt` parts with `role: "body"` per the wording above. New fallback keys `warmup_lead_doc_1..3` and `warmup_lead_first|middle|last|only`. The lead-in is chosen in `demo-path.server.ts` from `demo.warmupIds` position and whether `warmupIds` equals the full ordered list.
- Skip rule in one shared helper (`src/server/lesson/warmup.ts`), used by both the warm-up and `topic-intro.server.ts`. It joins `evidence` to `sessions`, requires `sessions.status <> 'abandoned'`, `consent_basis <> 'admin_preview'`, `session.started_at >= restart marker`, and `status = 'shown' or (correct and strength in ('strong','moderate'))`.
- Restart writes a per-user `warmup_reset_at` marker (rule-free; stored in the admin's profile state via server code). `demo.skipReasons` is saved and logged as a `warmup_skipped` event, which the debug view lists.
- Step label in the warm-up card header (`LessonScreen`/warm-up stage), reading `warmupIds` length from lesson state.
