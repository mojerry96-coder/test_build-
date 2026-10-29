# Batch B: topic intro welcome + Home tutor helper

No screenshots or recordings after the build. Only targeted checks for changed rules run, plus the leak check after the starter pack reload.

## Part 1: Topic intro welcome (from the attached instruction)

1. **Welcome message**: one grouped tutor message with three lines. A short typing indicator shows first, then the lines type in at the current typing speed.
   - Line 1 depends on the student:
     - First lesson ever: "Welcome, {first name}! I'm {tutor name or 'your tutor'}, and I'll be with you every step today."
     - Back after more than 2 days: "Welcome back, {first name}! Good to see you again."
     - Otherwise: "{Good morning/afternoon/evening}, {first name}! I'm {tutor name or 'your tutor'}, and I'll be with you every step today." The time of day uses her device clock: before 12:00, 12:00 to 16:59, and from 17:00.
   - Line 2: "Today's mission: find out how to measure how steep a line is, using just one number."
   - Line 3, if she has warm-up questions: "First, a quick warm-up: {three questions / two quick questions / one quick question}, no marks. Tap I'm Ready when you're set." The count matches the questions she will actually get.
   - Line 3, if no warm-up is needed: "You already know the basics, so we'll start with a puzzle. Tap I'm Ready when you're set."
   - Her first name is used only once. All lines go into the starter pack marked "seed" for Instructional Design to approve.
   - The old line "Great choice, {first name}! Ready…" comes out of the chat. It stays on the page.
2. **Quick-reply buttons** under the welcome: "I'm ready", "What will we learn?", "How long will it take?"
   - Style: white pills, thin #DDE2E7 border, Mulish SemiBold 13, #0A3150, light grey on hover.
   - Tapping one posts it as her message. "I'm ready" does the same as the I'm Ready button. The other two get the existing "about the lesson" reply.
   - The buttons disappear once she taps one, types, or taps I'm Ready.
3. **Voice**: when voice is on, only the welcome is spoken. Voice is not connected yet, so this is wired behind the existing switch and stays silent for now.

## Part 2: Home tutor helper

1. Remove "Tap me for another tip".
2. The greeting "Hello, {first name}! What shall we learn today?" shows first when the page loads.
3. Tapping "Ask your tutor" or the parrot shows the next tip, going in order and looping back to the first:
   - If the bubble is hidden, it opens with the next tip.
   - If the bubble is open, the text cross-fades to the next tip (150 ms) and the parrot nods once.
4. Tips, marked "seed":
   - "Your lesson is waiting. Tap Continue Lesson to pick up where you stopped." (only when she has a lesson in progress)
   - "Start with Mathematics, your first topic is ready."
   - "You can pause any lesson and pick up where you stopped."
   - "Stuck in a lesson? Ask me anything about it, I'm right there with you."
5. "Ask your tutor" no longer opens a lesson or scrolls the page. Only Continue Lesson does that.
6. The bubble label becomes "Hi, I'm {tutor name or 'your tutor'}", with no "· AI tutor".
7. **Placement** (to match your second screenshot):
   - The helper is fixed on the right side, level with the subject cards.
   - The parrot slightly overlaps the right edge of the card grid.
   - The bubble is smaller and sits to the left of the parrot's head, with the close X at its top right.
   - A compact "Ask your tutor" pill overlaps the parrot's feet.
   - The bubble hides by itself after 8 seconds or when the page scrolls. Once hidden it covers nothing, and taps pass through to the cards.
   - Reduced-motion settings turn off the nod and the fade.

## Technical notes
- Part 1: the welcome lines are new `intro_welcome_*` fallback lines in `content/packs/MTH12_09_02_01.seed.json`. They are chosen server-side in `topic-intro.server.ts`, with first-lesson and last-session checks and the warm-up count from the real plan. The browser sends only its local hour. The name is filled in through the existing `{tutor_name}`/first-name interpolation. The chips sit in the intro route, which reuses the existing send path and the I'm Ready action.
- Part 2: the tips are pack fallback lines (`home_tip_*`, seed) read with the topic first, then global. Until those lines load, the existing constants stay as fallback. The changes are all in `HomeParts.tsx` plus a `tutor-nod` keyframe in `styles.css`.
- Afterwards: reload the seed, run the leak check, and run targeted tests for the greeting choice, time-of-day bands, count wording and tip cycling (new small test file).

## Part 3: Loose ends from the last batch
1. Topic intro page: when the tutor is closed, a new message also shows the 4-second preview, the same as in the lesson.
2. Closing the tutor: the widening lesson card no longer briefly stretches its content sideways during the fold.
