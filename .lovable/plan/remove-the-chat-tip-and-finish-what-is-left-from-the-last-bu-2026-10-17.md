# Remove the chat tip, and finish what is left from the last build

## 1. Remove the tip
- Remove "Tip: ask about one part of the question at a time." from the tutor chat, on phone and laptop, in every step.
- The quick-ask buttons ("Give me a hint", "Explain the question", "What is rise?") stay as they are.

## 1b. Remove the "Saved" pop-up
- Remove the "Saved" pop-up in the corner and the small "Saved" tick next to "Step x of 8". Saving still happens quietly in the background.
- Kept: the "Step complete — keep going!" pop-up, the "You're offline" notice, and the guided-step note "Saved. Feedback comes after all 3 questions." That note tells the student why no feedback appears yet. Say if you want it removed too.

## 2. Left over from the last build
1. **Fresh test lesson**: your test lesson has moved past "Do it". Start a new lesson session for the test account and walk it to the simulation step, using the test walkthrough. Your current lesson is not changed.
2. **Screenshots (phone 390 wide and laptop 1440 wide)**:
   - a finished task, showing "You did it. Well done." on the simulation screen and no repeat lines in the chat,
   - the closing feedback ("Look what you discovered").
3. **Save and exit, then reopen**: leave in the middle of task 2, reopen, and confirm it opens on task 2 with task 1 ticked.
4. **Check the chat** shows no tip, and the "Step 4 · Your simulation" divider is still there.
5. Send the screenshots and stop for your OK. The whiteboard work comes after that.

## Technical details
- The tip is one line in `LessonScreen.tsx` (tutor panel).
- The new session is created through the normal start-topic flow (session-start), so it follows the same rules as a real student.
