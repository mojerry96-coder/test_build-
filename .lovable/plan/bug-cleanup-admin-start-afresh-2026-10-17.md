# Bug cleanup + admin "start afresh"

## Step 1 — Must fix before the demo
1. **Freeze and sign-out on problem 4, line "6/3".** First recreate it in the browser using the test lesson. Find the cause: likely an endless loop in the line checker or the wrong-path match. Fix it, add a time limit to the line check, and make sure an error never signs the student out. Add a test for "6/3" on problem 4.
2. **Amber alert gives the answer away.** The wrong-path message for 15/5 becomes a guiding question ("Check the sign: what is −10 − 5?"). Amber alerts must not contain the right value. Add this to the leak check and the pack check. Reload the starter pack.
3. **Broken parrot images** in the tutor panel, Meet your tutor and Welcome. Fix the image links and check every place the parrot appears.

## Step 2 — Lesson behaviour
4. Topic card shows "Continue" plus the current step when a lesson is still open, the same as the home page.
5. "I do · We do · You do" shows only in Teach me mode.
6. The Teach me / I'll try alone switch stays visible on every problem.
7. Maths keyboard adds fraction, power, square root, ±, coordinates ( , ) and arrow keys.
8. Board gets Undo, Redo and Clear. Submitted lines can be removed before the final answer.
9. A bare final answer with no working gets "Show me how you got that" rather than "Right". Correct answers get a short, specific comment on her method, chosen from approved lines in the pack.
11. Tapping a line highlights it, and the tutor gives a hint about that line (from the hidden hint lines), never a generic refusal.
10. Two amber alerts on one problem bring up "Want a hint?". This is a simple version that reads the 2-alert rule. The full version comes in Phase 2.

## Step 3 — Sign-in page
12. Add "Your tutor is an AI. No camera is ever used." The test banner was removed at your request earlier. It stays off unless you say to bring it back.

## Step 4 — Admin: restart and start afresh
On the admin page, a new "Test data" card:
- **Restart my lesson**: pick a student and topic. Their open lesson is closed, and the next Start begins at step 1.
- **Start afresh (all test data)**: removes every lesson, answer, event, evidence and summary for test students. The meet-the-tutor intro is shown again. Content, users and admin roles stay. You must type RESET to confirm.
- Each action is saved in the admin audit log. Admins only.

## Step 5 — Check
Run the full lesson on phone and laptop sizes: problems 2 to 4 including 6/3 and 15/5, the mode switch, undo, the parrot showing everywhere, then Start afresh followed by a new lesson. Run all tests.

## Technical notes
- Freeze: reproduce first, then fix in src/server/maths (bounded parsing, no backtracking). The lesson's error screen must not clear the session.
- Reset: an admin-only server function (has_role check, then admin client) deletes runtime rows for the selected sessions/students. It never touches content tables.
- Images: check the asset pointer imports in TutorAvatar against how auth.tsx loads them.
