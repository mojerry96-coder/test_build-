# Plan: "Your turn" dialogs, cleaner tutor chat, a livelier tutor, and leftovers

## 1. "Your turn" guided steps (quick fix)
- **Right on a step:** the box turns green with a tick, the full step line is written in, "Nice!" appears beside it (green), and after 1.5 s the next step opens with its box focused. No dialog.
- **First not-quite:** the same dialog as the warm-up (overlay, image, motion, focus) with the encouraging tutor on the soft blue circle, "You got close!", the step's hint plus guiding question, and a "Try again" button. Try again, Escape or tapping outside clears and focuses the box. The card stays white with no amber border. The hint stays in the chat.
- **Second not-quite:** "Let's do this one together" with the worked step and a short explanation, and a "Continue" button. The line is filled in grey with a small "shown" label (no tick), the next step opens, and the step is saved as "filled in".
- **Last step done:** "Good job!" with the celebrating tutor on the mint circle and light confetti, the summary, and a "Continue" button that opens "Try one alone". It does not close by itself.
- **Step cards:** white with a thin grey border while waiting. Finished steps stay visible above new ones.
- **Saved for each step:** right first time, right after the hint, or filled in; plus the number of tries and the time taken.
- **Content:** `hint_question`, `together_text` and `done_summary` for all three quick fixes, using your exact wording with true minus signs. They are kept hidden and sent only when a dialog opens. Instructional Design approval list updated, pack reloaded, leak check run.

## 2. Tutor chat display (wording unchanged)
- **Grouping:** lines the tutor posts in a row within 60 s form one group. The avatar shows once, on the first line, and bubbles sit 4 px apart with one tail. A student message, a step divider or more than 60 s of silence starts a new group. Student messages group the same way on the right.
- **Maths stays together:** expressions never break across lines, in the chat, captions, pop-ups, working boxes and question cards. Wrapping happens only between words outside the maths.
- **Worked examples:** shown as one block in the chat, for example "Watch how it's done · 5 steps". Lines fill in as the stage plays, then the block folds to its title; tapping the title reopens it. This applies to "Here's how it works", "Watch how it's done" and the video's try 2 and try 3. Voice (when connected) still reads every line.
- **Hints:** after a miss on a guided step, the chat shows the step's `hint_question` (the same words as the dialog), not the slip line again.
- **Dividers:** "Quick fix · {skill name}" when a quick fix starts, and "Back to the warm-up" when it ends.
- **Noted for Instructional Design (no change):** the question 3 option "3" feedback ends "Let's try that approach next time!" while the quick fix starts straight away.

## 3. A livelier tutor (existing images, no new artwork)
Applies everywhere the tutor appears: response dialogs, topic intro, tutor panel header, chat messages and the "Ask your tutor" pill.
- **Entrance:** pops from 85% size to 104%, then settles at 100% over 400 ms with a springy ease. The circle behind scales in 300 ms earlier.
- **Idle:** gentle breathing (1 to 1.02 scale, 2 px rise, every 3.5 s), a 3° head tilt from the bottom centre every 6 to 9 s at random, and a soft glow ring around the circle that pulses in the circle's colour.
- **Moods:**
  - Encouraging: one kind nod (two cycles over 1.2 s).
  - Celebrating: two happy hops with a small squash, timed with the confetti.
  - Thinking: a slow ±2° sway until the reply arrives.
  - Listening: the glow brightens and pulses faster (1.2 s).
  - Speaking: a bob that follows voice loudness, ready for when voice connects (until then, nothing moves).
- **State changes:** a 200 ms cross-fade between images instead of a sudden swap.
- **Performance:** only size, position and fade change, and never by more than a few pixels. Loops pause when the tutor is off screen or the tab is hidden. With reduced motion or low-data mode on, she gets only a simple fade-in and instant state changes.
- **Ready for animated artwork:** one tutor picture component that takes either a still image per mood (as now) or an animated file (Rive or Lottie) per mood, chosen by a new content setting `tutor_avatar_assets`. Animated files turn off the coded motions. Rive and Lottie players load only when a setting asks for them.

## 4. Dialog button fix
- Main buttons (Try again, Continue, Let's fix it) use the primary shape: Mulish Bold 14, white text, radius 16. The browser's double outline is removed in favour of our ring: 2 px, colour #2CA1DA, with a 2 px gap, following the rounded corners.
- Secondary links ("Watch that part again", "Skip for now"): Mulish SemiBold 13, #667085, underlined on hover.
- **Colour conflict:** white text on #5CBBF3 is only about 2.2:1, below the AA rule you set. That is why the main buttons are the deeper blue #1F78BE now (4.68:1). The plan keeps #1F78BE unless you tell me to use #5CBBF3 anyway.

## 5. Leftovers
- Ramp Designer phone check and the rest of the simulation screenshot set (intro, progress, right, not-quite, closing, Practise for each of the three engines, on desktop and phone).
- Check the new working pace and answer box in the preview on desktop and phone.
- Add Pause, Next step and Show all to the video's try 2 and try 3 worked examples, using the same player as the warm-up.
- Voice sync stays blocked until the voice service is connected. Lines are written so they follow the voice once it is.

## 6. Gaps added (not in the instructions)
- **Choice steps:** some guided steps are tap-a-choice, not typed. The same dialogs apply, and an option she already tried stays off on her second go.
- **Leaving mid-step:** if she leaves and comes back, the same step reopens with the same number of tries. A dialog that was open shows again, and nothing is counted twice.
- **Offline:** "Check" keeps her answer and says "Will check when you're back online". No dialog opens until the server has marked it.
- **Screen readers and keyboard:** dialogs move focus to their button and announce the title. Focus returns to the box after Try again. A folded worked example in the chat says "expand, 5 steps". Grouped bubbles are still read one line at a time.
- **Folding and scrolling:** when a worked example folds, the chat doesn't jump. If she has scrolled up to read, new lines don't pull her down; a "New message" chip appears instead.
- **Phones:** dialogs sit above the keypad and the bottom bar, and the tutor strip shows only the latest group.
- **Tutor in Instructor Override:** when a teacher takes over, the avatar stays still with a "paused" look, so it never seems to react while the teacher talks.
- **Hint shown once:** the hint appears in the dialog and once in the chat, never twice in the chat on a re-render.
- **Approval list:** the new dialog texts, "Nice!", "shown", the divider labels and the block titles go on the Instructional Design list.

## Evidence (then stop)
- Recording: substitution quick fix "Your turn". Step 1 is missed once (dialog, Try again, then right), step 2 is missed twice ("Let's do this one together"), then "Good job!" leads to "Try one alone".
- Screenshot: the chat after a not-quite on warm-up question 3, through the slip line, the folded worked example and a step hint.
- Recording: the "You got close!" dialog (entrance and nod), the "Good job!" dialog (hop and confetti), and the panel tutor idling and thinking.
- Saved to Files with the simulation screenshots.

## Technical details
- Content: new optional fields on repair `you_try.steps[]` (`hint_question`, `together_text`) and on the repair (`done_summary`), stored in hidden `scripts`. They are validated, run through the banned-word check, and covered by the leak check. Rule `tutor_avatar_assets` holds a `{ mood: { type: "image"|"rive"|"lottie", url } }` map, defaulting to the current images.
- Server: `repairStep` returns `result: right|hint|filled` plus the dialog script for that result only. Per-step evidence (outcome, tries, ms) is saved in the session state and in the events.
- UI: `QuickFix.tsx` reuses `WarmupPopup` for the three dialogs. `TutorAvatar.tsx` becomes the single animated avatar, with CSS keyframes, an IntersectionObserver plus visibilitychange pause, and a low-data/reduced-motion switch. The chat grouping and worked-example blocks go in the chat message model in `context.tsx` and `TutorChatPanel.tsx`. A shared `keepMathsTogether()` text helper adds non-breaking spaces around operators. `WorkingPlayer` is reused in `VideoStage`.
- Tests: grouping (60 s / divider / student message), maths non-breaking helper, step outcome classification, and the hint/together/done scripts never present in readable tables (leak check).
