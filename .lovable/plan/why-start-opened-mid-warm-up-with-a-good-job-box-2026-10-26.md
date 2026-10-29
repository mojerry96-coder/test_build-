# Why Start opened mid-warm-up with a "Good job" box

## Cause
This wasn't the app. It was my walk-through test a few minutes earlier: it signed in as your account and answered the first two warm-up questions (11:19 and 11:20). When you then tapped Start, the lesson correctly picked up where "you" had stopped: the answered second question and its waiting "Good job" box. You've since used Start again (11:22), so your lesson is fresh and Start now opens the first question.

## Fix
- No app change is needed. Start already opens the first question on a fresh lesson.
- From now on, walk-through tests use a separate test student account, never yours. So your progress is never touched again.
- Before the next test run, I'll ask you which test account to use (or create one through sign-up if you're happy with that).

## Technical details
- Evidence: in the old lesson's history, `answer_submitted` READY_COORD_01 and READY_CALC_01 at 11:19–11:20 came from the Playwright run. The new lesson started at 11:22 is at readiness index 0 with no answers.
- Save a project memory note: browser tests must never run as the owner's account; use a dedicated test student.
