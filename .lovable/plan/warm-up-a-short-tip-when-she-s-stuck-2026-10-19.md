# Warm-up: a short tip when she's stuck

The "I'm not sure" option and the two display fixes from your earlier message were cut off. Send them and I'll add them here.

## What she'll see
1. **Help or a question about the current warm-up question** gets that question's tip. This covers "how am i supposed to solve this?", "how do I solve this?", "explain this", "further explain", "I'm stuck", "I don't understand", "solve this", "what do I do" and "help".
   - Q1: "Here's a tip: the first number tells you how far across, the second tells you how far up."
   - Q2: "Here's a tip: work out the top and the bottom first, then divide the top by the bottom."
   - Q3: "Here's a tip: replace x with 5 first, then multiply before you subtract."
2. **The tip never gives the answer.** It goes through the same hidden-answer and reply checks as every other line.
3. **If the tutor can't tell what she means** during a warm-up question, she gets that question's tip, never "Sorry, I didn't catch that".
4. **If she asks again**, she gets: "Have a go with that tip, I'll help you after if you need it." The tutor never sends the same line twice in a row. After that line, the next ask alternates back to the tip.
5. These rules still come first: distress, prompt tricks, "tell me the answer", "are you an AI?" and personal requests keep their own lines. After she has answered, warm-up skill questions can still get an explanation.

## Also included (gaps found on review)
6. **The tip follows the question she's on.** Inside a quick fix, the tip is for the question being fixed. After a new question opens, the next help request gets that question's own tip, not "Have a go…".
7. **Off-topic and greetings keep their own lines.** Only unclear messages fall back to the tip, so "hello" or "football" are not answered with a tip.
8. **A missing tip is handled safely.** If a question has no tip in the pack, she gets the approved general line, never "Sorry, I didn't catch that". The pack check flags warm-up questions without a tip.
9. **No early working.** The tip never shows the "Here's how it works" steps or numbers worked out from the question. It may only use numbers already on screen.
10. **After she answers**, a help request gets the follow-up explanation, not the pre-answer tip again.
11. **Logged for review.** Each tip reply is logged with its question, whether the word list or the AI sorted the message, and whether it was the tip or "Have a go…". The Session debug page shows these records.
12. **Phone and keyboard.** The tip appears in the chat strip on phones too, and screen readers announce it.
13. **Repeat check across reloads.** "Never the same line twice" is checked against the saved last tutor line, so it still holds after a page reload.

## Steps
1. **Report:** confirm the AI sorting is switched on (Lovable AI, sorting only), and check the log for "how am i supposed to solve this?": which kind was chosen, by the word list or the AI, and how long it took.
2. Add the help phrases above to the word list, sorted as sure help. In the warm-up, a pasted question with "explain" counts as help, not maths.
3. Store the three tips and the "Have a go…" line in the starter pack, as drafts for Instructional Design. Keep your wording exactly.
4. Reload the starter pack and run the hidden-answer check.
5. Rerun the earlier test set plus the new phrases, with the word list only and with the AI, and send the hit rate for each.

## Technical details
- `src/shared/intro-moves.ts`: add a HELP pattern (`sure: true`) and a `help` WarmupMove, after distress, injection, the answer request, real and boundary.
- `demo-path.server.ts` readiness branch: if the move is `help`, `meaning` or `unclear` (including the AI's `help_request`), send the current item's `warmup_tip` line. If the tutor's last line was that tip, send `warmup_tip_again` instead. Before sending, check the last tutor line so the same text is never sent twice.
- Starter pack: per-item `warmup_tip` lines for the 3 warm-up items, plus a global `warmup_tip_again`.
- Tests: in `src/test/tutor-chat-sorting.test.ts`, help phrases → help; an unclear message → tip; a repeat → the "Have a go" line; and no two identical lines in a row.

# Right answer: tick, then the working, then Good Job

**What the screenshot shows:** Good Job opened while the chat was still typing ("Fantastic! You've got it! You're already |"). The "Here's how it works · 4 steps" block had already collapsed, the chosen option wasn't green, and Continue showed a spinner.

## Order (one after the other, never overlapping)
1. **Tick:** on Check Answer, her chosen option turns green with a tick (fill #E7F5EC, border and text #1E8A4C). Check Answer hides. Hold 0.6 s.
2. **Solve:** "Here's how it works" opens under the options and plays every line at the agreed pace: 55 characters a second, a 1.2 s hold per line, and an extra pause before the result line. The chat block shows the same line at the same moment, driven by one timer. The chat block stays open while it plays.
3. **Celebrate:** Good Job opens 1 s after the last line has finished, never before. The praise line in the chat waits until the popup opens, so the chat never types behind the dialog. Continue is ready at once, with no spinner. The next question loads in the background.
4. **Show all / Skip:** all lines appear at once, then the popup opens 1 s later.
5. **After the popup closes,** the chat working block collapses.
6. **Applies everywhere** Good Job follows working: the warm-up, the quick fix "Your turn", and the guided steps.
7. **Reduced motion:** the tick and the lines appear without typing, but the order and the 1 s gap stay the same.
8. **Reload mid-sequence:** she comes back to the full working shown and the popup open, never a second marking.

**Please confirm:** your point c) says "should full more even the dialog". I read this as "should feel smooth, even with the dialog": the popup fades in gently and doesn't jump. Tell me if you meant something else.

## Technical details
- One sequence controller (tick → solve → celebrate) in the lesson context, shared by WarmupStage, the quick-fix stage and the guided-step stages. The popup opens only when the working timer reports done.
- The tick colours become semantic tokens (success-soft / success). Lesson pages stay light-only.
- The server result arrives once. The sequence is only presentation, so marking doesn't change.
- Targeted test: the popup opens only after the last line plus 1 s, and Skip leads to the popup 1 s later.
