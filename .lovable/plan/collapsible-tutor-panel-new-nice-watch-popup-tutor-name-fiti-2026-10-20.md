# Collapsible tutor panel, new "Nice watch" popup, tutor name "Fitila"

Specs: your written collapse spec, the open/collapsed screenshots, the end-of-video popup screenshot and the simulation start screenshots. Lesson screens are light only.

## Order: two batches, both in this build
- **Batch 1:** section 3 (Fitila name), section 2 (Nice Watch! popup), section 2b (simulation start card), section 4 (extra fixes). Checked before moving on.
- **Batch 2:** sections 1 and 2c (tutor folds into the parrot, exact parrot position, phone version), then the desktop screen recording.

## 1. Close or minimise folds the tutor into the parrot (desktop and tablet)
- Both close (x) and minimise (–) now do the same thing. The old "minimise to header" state and the small pill are removed.
- The panel shrinks towards the parrot's spot at the bottom right of the main card (down to about 0.15 size, fading out, 300 ms). At the same time the main card widens smoothly to fill the freed space (320 ms). The question, the answers and any working or simulation area re-centre, and the answers grid grows to two columns of about 404 px.
- The parrot then appears with a small pop and one wave (0.8 → 1.04 → 1, 400 ms), then breathes and tilts its head now and then.
- **Collapsed avatar:** inside the main card, 16 px from the right and bottom edges; the parrot is about 110 px tall. Under it is an "Ask Fitila" pill (#168DCC, white Mulish Bold 12, fully rounded), which reads "Ask your tutor" only if the name setting is empty. To its left is a "Need help?" bubble (Mulish SemiBold 16, #0A3150, white, 1 px #DDE2E7 border, 16 px radius, tail pointing at the parrot). If the parrot would cover the main button or the answers, the card gets extra space at the bottom.
- **Count badge on the bubble:** a 20 px #EA4B0A circle with a white number counting the tutor messages sent since she closed the panel. It's hidden at 0 and shows "9+" above 9. When a new message arrives, the badge pops and the parrot nods once.
- **Preview:** a new tutor message shows its first line in the bubble (about 60 characters, ending "…") for 4 seconds, then the bubble goes back to "Need help?". With voice on, the tutor keeps talking.
- **Reopen:** tapping the parrot, the bubble or the pill plays the reverse: the panel grows out of the parrot and the card narrows. The messages then fade in and scroll to the newest one, the count goes back to 0, and the cursor goes to the message box.
- **Rules:** the panel stays closed across steps in the same lesson until she reopens it. The exit ticket still hides the tutor completely. Reduced motion uses 150 ms fades only, and the width changes instantly. Only smooth movements are used, so it stays fast on budget phones. The parrot is a button labelled "Open tutor, n new messages", and changes to the count are announced.
- **Phone:** collapsing hides the bottom strip and shows the parrot as a 56 px round button at the bottom right, above the main button, with the same badge and preview. Tapping it opens the chat sheet.

## 2. End of video: "Nice Watch!" popup (last screenshot)
- This replaces the small "Nice watching! Next, you'll try it yourself." card on the video. The new version is the shared popup over a grey veil covering the page: confetti, the celebrating parrot in a pale green circle, the title "Nice Watch!" (display font), the line "Next, you'll try it yourself, let's see you put in practice what you have learnt." and a light-blue Continue button about 270 × 44 px.
- The title and line are new starter-pack wording, marked as drafts for Instructional Design. The starter pack is reloaded and the leak check is run.
- The confetti stops under reduced motion.

## 2b. Simulation start card (today vs. after this ship)
- Today: "4 TASKS" eyebrow, "Your simulation" title, goal line and a short blue Start button.
- After: the "4 TASKS" eyebrow is removed. The card shows the thumbs-up parrot (existing picture) in a 122 px pale-blue circle, then the title "Next Step: Simulation" (Mulish SemiBold 22, #0A3150), then the goal line from the content (Mulish 16, grey, for example "Design ramps that follow a rule"), then a light-blue Start button about 497 × 44 px with 16 px corners. Everything is centred in the card, with the same spacing as the screenshot.
- The words "Next Step: Simulation" come from the starter pack, marked as a draft for Instructional Design. The band is still never shown.

## 2c. Where the parrot sits when the tutor is closed (exact)
- Inside the main white card, at the bottom right: the parrot's right edge is 16 px from the card's right edge and its feet are 16 px from the bottom edge. It never sits outside the card or over the page background.
- The "Ask Fitila" pill overlaps the parrot's feet, centred under it. The "Need help?" bubble sits to the left of the parrot's head, with its tail pointing right at the parrot, level with the parrot's upper half. The count badge sits on the bubble's right end.
- It stays in that corner while the page scrolls inside the card. If the main button or the answers would reach that corner, the card gets extra bottom space so nothing is covered.

## 3. Tutor name "Fitila"
- Set the protected setting tutor_display_name to "Fitila" as an admin settings change, logged in admin_audit (not through the content import).
- Check every place the name shows:
  a) lesson panel header: "Fitila" with a small "AI tutor" label under it;
  b) the collapsed pill: "Ask Fitila";
  c) the floating helper on navigation pages: "Hi, I'm Fitila";
  d) the topic intro and any tutor line that uses the name;
  e) "are you real?" replies: "No, I'm Fitila, an AI tutor. I'm here to help you learn, one step at a time."
- Search the code and starter pack for "Your tutor", "Kiko" and other names. Every one reads the setting, and "Your tutor" stays only as the fallback when the setting is empty.

## 4. Extra fixes found in your screenshots
- **Repeated tutor lines (bug):** "You got it! Let's make sure it wasn't luck. Here's why." and "Here's how it works · 1 step" show twice in the chat. Find the cause (the same check being sent twice, or the chat replaying old lines) and fix it so each line appears once. Add a test for it.
- **Message box text:** "Ask about anything…", as in the designs.
- **End-of-video chat line:** appears once, with the same words as the new popup.

## Checks
- Desktop screen recording: closing the panel, a new tutor message arriving while it is closed (badge and preview), and reopening. Then stop.
- Run only the tests that cover the name and the counter, plus the leak check after the pack reload.

## Technical details
- `TutorChatPanel` gains a collapsed state stored per session (sessionStorage keyed by session id). A new `CollapsedTutor` sits in the main card; the card width animates with a FLIP transform via a `useFlip` hook in `LessonScreen.tsx`. The count and preview logic lives in a small pure helper `src/shared/tutor-collapse.ts` with tests (count since collapse, "9+", 60-character trim). New tokens go in `src/styles.css`.
- The end-of-video popup reuses `WarmupPopup` with a new `celebrate` variant and the existing parrot asset; its labels come from the clip's `labels` (new seed fields `endTitle`, `endBody`).
- The name is set through the existing admin settings server function (writes `rules` + `admin_audit`). One `tutorName()` helper with the "Your tutor" fallback is used everywhere; the is_ai fallback line uses a `{tutor_name}` slot.
