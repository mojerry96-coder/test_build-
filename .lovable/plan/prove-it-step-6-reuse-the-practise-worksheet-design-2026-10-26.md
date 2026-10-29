# Prove it (step 6): reuse the Practise worksheet design

The step stays: it's the check that shows she can do it without help. Its look and controls now come from Practise and the warm-up, so it no longer feels like a separate, plainer page.

## What she sees
1. **Same layout as Practise.** Question card on the left, "Your working" card on the right, the same keypad and the short blue main button. It stacks on phones.
2. **Top of the question card.** "Prove it", then "Question 1 of 3" and small progress dots (now / saved / next). These replace today's "Q1 · now" chips. The question is in our handwriting font.
3. **Picked-answer questions (Q1, Q2).** Shown with the warm-up's A–D tiles in a 2-by-2 grid. The working card stays open as scrap space, with a "Your working (optional)" note.
4. **Written question (Theory).** She writes her steps line by line in the working card, as in Practise, using the same keypad, Undo and Clear. For a question like the rise-or-fall one, the last line is her sentence ("falls").
5. **The test difference.** Lines are not ticked or flagged as she writes. The main button reads "Save answer", not "Check this line". After saving, a small "Saved" tick shows, then "Next question".
6. **Help.** "Explain the question" and "Hint" are the same small pills as in Practise. Hints drop in beside Fiti, as in the simulation, with "Hint 1 of 5". Fiti reads them aloud, respecting mute. The guide line ("Write one step per line…") shows before her first line on the written question.
7. **End review.** After the last question, a warm-up-style pop-up lists each question with a green tick (right) or an amber "not quite" mark with an icon, never red. Fiti cheers or gives a gentle look. The button reads "Next: exit ticket".
8. Dark mode, short laptop screens, Leaderboard tab and Ask Fiti behave as on Practise.
9. **Graph only when the question has one.** The small graph is drawn only when the question gives two points. Its view comes from those points, so it never shows anything new such as the line's slope or the answer.
10. **Working survives a reload.** Lines she wrote on the written question are saved on the server as she types, as in Practise, so going back to the map or refreshing doesn't lose them.
11. **Empty and half-done answers.** "Save answer" stays greyed out until she picks a tile or writes at least one line. If she taps it with only one line, Fiti asks "Save it as it is?" with Yes / Keep working, using a new approved line.
12. **Fiti stays quiet about marks.** While she works, Fiti doesn't react right or wrong and Ask Fiti doesn't check her lines. It only explains the question and gives hints. Voice and mute work as on other steps.
13. **Going back.** Tapping Prove it on the map after it's finished opens the go-back dialog. A new attempt starts fresh, and the earlier saved answers stay in her record.
14. **Leaderboard.** Prove it questions count once they're saved, showing "saved" and then right / not quite after the review.

## Unchanged
- Marking is still done only on the server by the maths engine, after each save. Results stay hidden until the end, and mastery, Fiti's closing and the parent summary use them as today.
- Hint and explain limits, saving after a reload, Together Mode.

## Technical details
- Extract the layout pieces of `PractiseStage.tsx` (two-column frame, working list, keypad, guide) into a shared `WorkPad` with a `mode: "practise" | "prove"` prop. In `prove` mode lines aren't sent to `checkLinesFn`; they're kept locally and saved with the answer.
- Rewrite `GuidedStage` in `stages-b.tsx` on top of `WorkPad`. MCQ uses the warm-up tile component; theory sends `response.text = lines.join("\n")` to the existing `checkAnswerFn`.
- Review uses `WarmupPopup` (`autoClose={false}`) and reactions only at review time.
- Keep the guide wording as the content line `practice_how_to`, sent for guided items too. No other content or contract changes.

## Also: the exit ticket error pop-up
**What happens.** On the exit ticket, a long written answer (her full working) shows a grey box with computer text ("Too big: expected string to have <=100 characters"). The answer box only accepts 100 characters, but a full working answer is about 130.

**Fix.**
- Written answers can be up to 1,000 characters, the same as other written answers. Nothing she types normally will hit the limit.
- The answer box stops accepting typing at that limit, so she never gets as far as an error.
- Across every lesson step, any computer-style error turns into a friendly line ("Something went wrong. Please try again."). Raw error text is never shown to a student.
- Same check for Prove it's written answers.

**Technical.** `checkAnswerFn` in `src/lib/api/lesson.functions.ts`: `value` max 100 → 1000 (the server re-validates). `maxLength` on the text inputs. In `src/components/lesson/context.tsx` `run()`, show only `LessonError` messages, or messages that pass a plain-words check (no `{`, `[` or quotes); everything else gets the friendly fallback line. Targeted test for that filter.
