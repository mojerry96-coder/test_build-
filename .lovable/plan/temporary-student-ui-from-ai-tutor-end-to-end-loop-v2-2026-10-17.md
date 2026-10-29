# Temporary student UI from "AI Tutor End-to-End Loop v2"

A working stand-in for the student journey until the full Figma design arrives. It covers phone layout first, plus a desktop layout with the tutor panel on the right, as in the design. Teacher, parent, Override and team-tool screens are not part of this build.

## Design direction (consolidated)
- **Look:** calm off-white page, deep navy buttons, one blue for progress and selection, soft amber for "not quite" and wrong-path alerts (never red), green for correct. Rounded white cards with thin borders, as in the design.
- **Font:** Manrope (used in the design), one family, 3 weights. It replaces the current two fonts, so first load gets smaller.
- **Tutor:** the African Grey from your pictures. The standing pose is the main avatar. The six-pose sheet is cut into states:
  - Idle: wing out, waving.
  - Speaking: finger raised.
  - Thinking: hand on chin.
  - Encouraging: arms crossed, confident.
  - Close: the red-feather moment.
  The avatar is small on phones, hidden in low-data mode, and always labelled "AI tutor". Its name always comes from the tutor name setting.
- **Alerts:** always colour plus an icon. Captions are always on. Text size is adjustable. All buttons are large enough for thumbs.

## Screens and flow
```text
Sign in -> Pick a subject -> Meet your tutor (first time only) -> Welcome to Mathematics
  -> Chapters -> Quest -> Topics -> Lesson (8 steps on one screen) -> Reflect and close -> back to Topics
```
1. **Sign in:** design look, Google button, the existing test-build banner.
2. **Pick a subject:** greeting with first name. Mathematics is open; Physics, Chemistry and English show "Coming later". The "Continue where you stopped" card appears when a lesson is in progress.
3. **Meet your tutor:** "AI tutor, not a real person" and how the tutor teaches. Voice choice shows Nigerian English only; the other languages show "Coming later". Shown once.
4. **Welcome to Mathematics:** short "why maths matters" card and a question the student can answer by typing. Skip is available. It has no video yet, so it shows a poster image.
5. **Chapters, Quest, Topics:** built from the topic's subject, chapter and quest in the database. Only Coordinate Geometry, "Lines and Their Steepness" and "Gradient of a line" open; the rest are locked and marked "Coming later". Topic cards show status (Not started, In progress, Secure).
6. **Lesson screen:** an 8-segment progress bar (Ready, Hook, See, Do, Practise, Guided, Exit ticket, Reflect), "Save and exit", the main stage, and a tutor strip at the bottom on phones (side panel on desktop) with "Ask by voice" and "Type".
   - **Ready:** warm-up questions; a "Not quite" answer opens the matching quick fix with one practice question.
   - **Hook:** two-roads picture, the quick guess, then "Let's find out".
   - **See:** video area (poster until the video arrives). It pauses at each check, asks "How sure are you?" first, then shows options. Up to 3 tries.
   - **Do:** simulation area loading the placeholder lab, with the task goal and rise/run inputs until the real lab arrives.
   - **Practise:** "Teach me / I'll try alone", "I do, We do, You do" tracker, whiteboard with one line per row, each line checked (tick or amber "Check this line"), and the maths keyboard.
   - **Guided:** questions, "Explain the question", the hint ladder (4 rungs, opened one at a time), and "Feedback comes after all 3 questions."
   - **Exit ticket:** "On your own now"; the tutor, hints and alerts are hidden.
   - **Reflect and close:** looks back at the hook, a reflection the student types, did well / watch next time, red feather when secure, review reminder, Next topic. If not secure, it shows the practice that comes first.
7. **Lesson states:**
   - Text mode with the weak-network notice ("Your place is saved").
   - Tap a whiteboard line to ask about it.
   - Idle "Want a hint?" after the help-prompt time.
   - The amber wrong-path alert.
   - Off-topic and "are you a real person?" replies.
   - The voice button shows a "Voice is coming soon" note until voice is connected.

## How it behaves before the lesson engine exists
- Every question, option, prompt and label comes from the starter pack in the database. The sample numbers in the design (4 − (−3), C(1, −2) …) are illustrations only, so the pack's own items are used.
- Answers are really checked on the server against the hidden answer keys. The browser is only told right or not quite.
- The tutor's words come from approved script lines, sent by the server only at the step that needs them. No AI is called yet.
- The order follows a fixed demo path: routing picks the Bridge simulation unless video results say otherwise, and escalation uses the pack's tries. In Phase 2 the real lesson engine replaces this path without changing the screens.
- Progress is saved, so "Save and exit" and "Continue" pick up at the same step.

## Design improvements (added)
- **One-thumb lesson layout:** on phones the main action (Check, Next, Hand in) is fixed at the bottom within thumb reach, and the tutor's latest line sits just above it. The student never scrolls to continue. The maths keyboard opens above that bar.
- **Calm feedback moments:**
  - Correct answer: a short green tick pulse.
  - Not quite: a soft amber nudge with an icon (never a shake or red).
  - Closing: a red-feather celebration when the topic is secure.
  All motion is short and turns off when the phone asks for less motion.
- **Step map and resume:** tapping the progress bar opens the 8 steps, marked done, current or still to come. Students can look but not skip ahead. Coming back shows "You were here" and goes straight to the saved step.
- **Low-data and loading states:**
  - Grey placeholder shapes instead of spinners.
  - A small "Saved" tick after each answer.
  - An offline notice when the connection drops; answers wait and send later.
  - A low-data switch that hides the avatar and pictures.
  - A text-size control (A−, A, A+) in the lesson menu, remembered on that phone.

## Enhancements to the shared design
- **Warmer identity:** the parrot's red tail becomes the single accent for rewards (the red feather, "secure" badges, streaks). It is never used for errors, so red always means "earned". Navy and blue stay for actions and progress.
- **Stronger hierarchy:**
  - One clear title per screen.
  - Supporting text in a muted tone.
  - Maths set larger with even spacing, so (−2, 5) and fractions are easy to read on small screens.
  - Numbers line up in the same column on the whiteboard.
- **Tutor presence:** a speech-bubble style for the tutor (tail pointing to the avatar) and a plain style for the student, so who said what is clear at a glance. The avatar pose changes with the moment (thinking while it prepares, encouraging after effort).
- **Cards with purpose:** subject, chapter and topic cards show a small illustration or icon, progress ring and one status chip. Locked items are faded with a lock icon and "Coming later", never hidden.
- **Clearer choices:** answer options are full-width tap rows with a letter badge (A–D). The selected state uses blue plus a tick, and the confidence buttons (Sure / Think so / Guessing) use simple icons.
- **Video and simulation frames:** a consistent frame with the step's goal on top and controls at the bottom, so the stage feels the same whatever is loaded.
- **Desktop polish:** a three-column lesson layout: steps on the left, stage in the centre, tutor panel on the right. On a laptop the tutor panel is always visible.
- **Accessibility:**
  - Contrast meets reading standards.
  - Every icon has a label.
  - Focus outlines are visible for keyboard users.
  - Captions sit in a fixed bar that never covers the board.

## Final gaps closed
- **Error and empty states:** a friendly message with the tutor and a "Try again" button when something fails to load, plus a clear empty state when no lessons are loaded. These never show a blank screen or technical text.
- **Leaving safely:** "Save and exit" asks once ("Your place is saved. Leave now?"). The phone's back button inside a lesson does the same instead of dropping progress.
- **Small phones and tablets:** checked at 360 px wide (budget Android), 390 px, tablet and laptop. Nothing is cut off, and the maths keyboard never covers the line being typed.

## Copy fixes needed (banned words)
Some design lines use words the tutor must not say. I will reword them:
- "Just a warm-up, not a test." becomes "A warm-up, not a test."
- The hook labels "Road 1: easy" / "Road 2: very hard" become "Road 1: gentle" / "Road 2: very steep".

The starter pack's own lines take priority wherever they exist.

## Technical details
- New student pages under the signed-in area: subject home (index), tutor intro, subject welcome, chapters, quest, topics, plus a restyled lesson page. All of the lesson's 8 steps stay on the single lesson page; the stage swaps by step.
- Design tokens: replace the font stacks and colours in the global styles; one Manrope link with display=swap. Components use tokens only, so the Figma restyle stays a token swap.
- Avatar: upload both pictures as hosted assets; crop the pose sheet into separate state images (tools in /tmp), which then become hosted assets. Each lesson loads only the images it needs.
- Server: thin functions in the API folder, delegating to new server-only modules:
  - lesson-view: readable step content.
  - demo-path: the next step and the approved script for that step.
  - check-answer: compares an answer with the hidden keys and returns right or not-quite, plus the misconception id for the amber alert.
  The demo-path module is clearly marked as temporary until the Phase 2 engine.
- "Meet your tutor" seen-flag in browser storage (no new personal data). Weak network detection uses the browser's connection info plus request timeouts.
- Head titles and descriptions for each new page; check bundle size stays under the first-load budget.
- Verification: a phone-size browser run through all 8 steps as a test student, then the leak check again to confirm no hidden lines reach the browser before their step.
- Record decisions in the project rules file; add the design direction and copy fixes to memory.
