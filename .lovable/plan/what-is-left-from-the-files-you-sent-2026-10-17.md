# What is left from the files you sent

## Already done (simulation step "Do it")
- The Gradient lab you sent now runs inside the lesson. Its tasks are used unchanged: 7, 6 and 4.
- Inside the lesson the lab hides its own start screen, level switcher, hints, win lines and scores.
- The layout follows your phone and laptop designs (04 and 14).
- Level names (Rebuild, Bridge, Stretch) never show to the student.
- If the lab doesn't load, the student sees a simple text version.
- Screenshots of the intro and task 1, on phone and laptop.
- The crash on older saved lessons is fixed.

## Left: finish the simulation step (do this first)
1. Phone and laptop screenshots of a finished task and of the closing feedback. Use the test walkthrough to get there.
2. Check these against the designs: the step divider in the chat ("Step 4 · Your simulation"), and Save and exit then reopening on the same task with finished tasks ticked.
3. Save each lab result as evidence (number of tries, misconception) for the parent summary.
4. Run the planned tests: level names never sent to the browser; a task finishes only on a success result; messages from other windows are ignored; the text version appears after 5 seconds without the lab.
5. Send the screenshots and stop for your OK.

## Left: tutor writes on the board (after your OK)
- Board drawings: number line, axes with points, a line, a triangle, and rising vs falling lines. Added to the content guide and the pack check.
- The guided theory question uses the whiteboard, with each line checked and marked per step.
- A graph grid the student can switch on in the worksheet board.
- "What's wrong here?" highlights the tapped line, and the tutor replies about that line.
- The tutor writes line by line during demos: video checks on attempts 2 and 3, Teach me, and readiness repairs. Never in the exit ticket.
- Maths shown properly. The maths display loads only when the board first opens.
- The board is saved and comes back after Save and exit.
- The 7 starter-pack drawings (REP_NEG_01, REP_COORD_01, GRAD_VC2 attempts 2 and 3, GRAD_VC1 attempt 2, GRAD_VC3, GRAD_WS1), then reload the pack.
- Tests: board only on attempts 2 and 3, never in the exit ticket, unknown cues ignored, reading time, board saved and restored.

## Technical details
- Evidence and events come from `simTaskDone` in the server demo path.
- Board state goes in sessions.state as lines `{ id, author, latex, status }` plus plots. Maths display uses KaTeX, lazy-loaded.
