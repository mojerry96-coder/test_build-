# Make the "You got close!" card and the quick-fix board say the same thing

## What is wrong
For warm-up question 3 ("If y = 2x − 4 and x = 5…"), picking 10 shows a card that:
- explains the whole answer ("y = 10 − 4 = 6"), so the fix has nothing left to teach, and
- talks about **subtracting** 4,

then "Let's fix it" opens a board that teaches a different sum with **adding** (y = 3x + 2, then y = 2x + 1). The card and board disagree, and the card gives the answer away.

The same pattern applies to every warm-up question that leads into a quick fix.

## Fix
1. **Card = the board's opening line.** When a wrong warm-up answer leads to a quick fix, the card shows only the short slip line that Fiti then writes first on the board (for 10: "You multiplied correctly. The last step is the one to watch."). The long explanation with the answer is not shown on the card. Questions with no quick fix keep their normal feedback.
2. **Board teaches the same kind of step as the question.** The SUB-01 fix uses subtraction like the question:
   - Fiti's example: "y = 3x − 2, and x = 4." → "Replace x with 4: y = 3(4) − 2." → "Multiply first: 3 × 4 = 12." → "Then take away 2: 12 − 2 = 10." → "So, y = 10."
   - Your turn: "Now y = 2x − 1, and x = 4." Step 1 "Multiply first: 2 × 4 = ?" (8), step 2 "Now take away 1: 8 − 1 = ?" (7), done: "You worked it out: y = 7."
   - Hints and filled lines updated to match ("Take away the last number.").
   - Numbers stay different from the question, so the answer 6 is never shown.
3. **Same check for the other two quick fixes** (points, fraction bar): card line = board's first line, and the board's example uses the same operation as the question. Only fix any that disagree.
4. **Guard against this happening again:** a test that, for each warm-up question with a quick fix, the card text is the board's slip line and the card never contains the question's answer.

## Notes
- New/changed lines are drafts for Instructional Design approval; the original long feedback stays in the content for questions without a fix.
- Marking stays on the server; nothing about answers reaches the browser early.

## Technical details
- `demo-path.server.ts` (readiness wrong + repair found): set `demo.popup.lines` to `slipFor(content.slip, fb.misconceptionId)` instead of `fb.script`.
- `content/packs/MTH12_09_02_01.seed.json` `REP_SUB_01`: rewrite worked `lines`, `you.intro`, step 2 prompt/hint/full_line/filled_line/hint_question/together_text, `done_summary`; reload seed, run leak/banned check.
- New targeted test next to `src/server/lesson/quick-fix.pack.test.ts`.
