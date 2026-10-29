# Batch 1 finish: "nothing early" checks, guided-step leak check, walkthrough recording

## 1. "Nothing early" test on the real starter pack
- Add a test that loads the real starter pack (content/packs/MTH12_09_02_01.seed.json) and, for each quick fix REP_COORD_01, REP_CALC_01 and REP_SUB_01, walks every "Your turn" step through the server functions.
- At each step: answer wrongly once, then capture everything the student could see at that moment: chat messages, the page data sent for the screen, and every server response body.
- Assert that none of these appear yet: this step's answer, its together text, and the next step's prompt/content. Assert they do appear only at the right moment (answer and together text after the second miss or when solved; next step only after this one is done).
- Keep the existing sample-line test unchanged and running.

## 2. Leak check extended to guided steps
- Add guided-step fields to the hidden-answer check: step answers, hint_question, bigger_hint, together_text, done_summary.
- The check confirms none of them can be read from the browser (signed-out and signed-in student reads of every readable table and every student-facing response) before the server sends them.
- Make the check part of the starter-pack reload so it runs automatically every time; a failure stops the reload with a clear report.
- Run a reload and report the result (pass/fail per field, per quick fix).

## 3. Walkthrough in the preview, desktop and phone
Recorded as video on desktop (1377x892) and phone (390x844), signed in as a test student:
1. Warm-up question 3, answer not quite, "You got close!" then Let's fix it.
2. Substitution quick fix: Watch how it's done at the new pace.
3. Your turn step 1: wrong (the "You got close!" dialog visible), then right.
4. Step 2: wrong twice ("Let's do this one together" dialog visible), Good job!, Try one alone.
5. Mid-quick-fix: leave the page, return, confirm she lands on the same step, same try, same dialog state.
- Save recordings and key screenshots to Files and attach them in chat. Any mismatch found is fixed and re-recorded.

## Technical details
- Test sits beside the existing quick-fix/dialog tests; it calls the lesson server functions with the admin-loaded seed, serialising responses to scan for forbidden strings (normalised for spacing and maths symbols).
- Leak check extension reuses the existing leak-check module and its skip rules for the student's own input.
- Recording via Playwright video capture; session minted for the test student.

## Report
Test results, leak check output, recordings, and any issues found, plus remaining open items (voice sync, animated avatar, wording approval).
