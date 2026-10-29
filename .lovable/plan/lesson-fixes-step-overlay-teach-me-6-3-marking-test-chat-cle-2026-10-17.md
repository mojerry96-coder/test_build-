# Lesson fixes: step overlay, Teach me, 6/3 marking, test chat cleanup

## 0. Admin "Start afresh" and "Restart lesson" fail with "Please try again."
Cause: the admin log only accepts three kinds of entry (setting change, role granted, role removed). It refuses the new reset entries, so the whole action is cancelled.
- Allow the reset entries ("test data reset" and "lesson restarted") in the admin log.
- Show a clear message when an action works, for example "Cleared 3 lessons". If it fails, give the real reason instead of "Please try again."
- Test both buttons on the admin page, then reopen the lesson and confirm it starts at step 1 with an empty chat.

## 1. Remove the bottom steps overlay on laptop
On a laptop, the "Your 8 steps" panel slides up over the lesson. The same list already shows on the left, so the panel is not needed there.
- On laptop and tablet, tapping "Step 5 of 8" no longer opens the panel. The steps list on the left stays.
- On phones, where there is no list on the left, the panel stays.
- Note: the small round toolbar at the very bottom (select, text, pen, comment icons) is part of the Lovable editor, not the app. Students never see it.

## 2. Teach me shows nothing
Today, tapping Teach me only plays something on problem 1 ("I do") and on problems that have a Teach me script in the pack. On other problems, such as problem 4, the screen stays the same.
- On every practice problem, tapping Teach me plays the tutor demonstration for that problem:
  - "I do" on problem 1: the tutor works the problem on the board step by step.
  - "We do" on later problems: the tutor does the first step and asks her to do the next one.
- The pack gets Teach me scripts for every practice problem that lacks one. They are hidden, use no banned words, and are written in the same style as the existing ones. I'll list them for you to approve, since they are new content.
- If a problem still has no script, show the approved fallback line ("Let's work through it together, start with the change in y.") and never a blank screen.
- The "I do · We do · You do" label moves with the problem only in Teach me mode (already done) and matches what plays.

## 3. 6/3 on problem 4 is marked correct
Problem 4, points (−4, −1) and (2, 2): the gradient is 3/6 = ½. "6/3" is run over rise, flipped upside down, and wrongly got a green tick.
- Find why the line checker accepts it. A likely cause is that a lone fraction line is accepted when it matches any number in the item. Fix it so a line is right only if it follows the worked solution or an accepted method.
- Add a wrong path for problem 4: "6/3" leads to the upside-down misconception, with a guiding question and no answer.
- Check every gradient item the same way: the flipped fraction must never be accepted.
- Add tests: problem 4 "6/3" gives amber, "3/6" and "1/2" give a tick, and 15/5 on problem 3 still gives amber.

## 4. Clear the leftover test chat
Use the new admin "Start afresh" (or "Restart lesson" for this student) to clear the repeated "Let's stay with the current question" messages from the test lesson. Then confirm the chat opens clean. Also stop the tutor repeating the same reply: if the same question is asked twice in a row, the second answer points to the hint button.

## 5. Check
On laptop and phone sizes:
- The steps panel no longer covers the laptop lesson, and the phone panel still opens.
- Teach me plays on problems 1 to 5.
- 6/3 shows amber.
- The chat is clean after the restart.
- All tests pass.

## Technical notes
- Overlay: gate the step-map sheet by breakpoint (lg and up uses the left rail only).
- Teach me: relax `mayTeach` so every worksheet problem in teach_me mode can open "model" on index 0 and "together" on index 1 and above. Add missing `teach_me` scripts to the seed pack, reload with the seed loader, and run the leak and re-import checks.
- Marking: inspect `src/server/maths` line checking for problem 4, and add `wrong_paths` to item_keys through the pack.
