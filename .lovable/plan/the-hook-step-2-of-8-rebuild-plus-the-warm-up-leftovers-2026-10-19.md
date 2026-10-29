# The Hook (Step 2 of 8) rebuild, plus the warm-up leftovers

The screenshot sets the layout, sizes, colours and fonts. Your hook document sets the content and behaviour. Where they differ, we follow the document's listed deliberate differences. Lesson screens stay light mode only.

## 1. Asset
- Download the light blue hill shape from the Figma link into the app's assets now, and never load the link at runtime. If the download fails, say so and draw a matching shape until the file comes.
- The hill is a temporary background. The illustration team's scene replaces it later through the board kit.

## 2. Layout (desktop, matched to the screenshot at 1440)
- **Top:** same top bar, breadcrumb, page title and tutor panel as the warm-up.
- **Card header:** "Step 2 of 8 · Hook" with the 8-part step bar (Ready done, Hook current). There is no warm-up progress bar on this step.
- **Hook text:** Mulish Bold 20, line height 1.24, letter spacing −0.4, navy, 48 px from the left and 830 px wide.
- **Picture area:** 830 × 467, light grey, radius 12, with the hill inside (780 × 409, centred, 26 px from the top).
- **Paths (drawn in code):** both start from the same point at the bottom left.
  - Path A rises exactly 2 for every 1 forward: orange, 8 px wide, rounded ends.
  - Path B rises exactly 1 for every 2 forward: purple.
  - Each path has a label and a small step triangle near the start ("forward 1 / up 2", "forward 2 / up 1"). Both paths are scaled to fit inside the hill with a margin.
- **Number boxes:** one small "How steep?" box near each path label, captioned Path A or Path B. Typing in either pauses the countdown.
- **Action row:** replaces the "e.g (x, y)" box and Check Answer.
  - Three buttons, 12 px apart, filling the width: "Path A", "Path B", "Same steepness".
  - Selected style: soft orange background, orange border, dark orange text. No green or red anywhere.
  - A slim 10-second countdown bar sits under the row.
- **Phone:**
  - Hook text at 18.
  - Picture full width, same proportions.
  - Number boxes side by side under the picture.
  - Buttons stacked, full width, 52 px tall, with the countdown under them.
  - Tutor bottom strip as on the warm-up.

## 3. Content (stored in the starter pack, not in the screens)
- The hook script on the card and in the chat uses the document's Path A / Path B wording.
- The acknowledgement line "Interesting guess! Keep it in mind, the video will tell us." is a placeholder marked for Instructional Design to approve.
- Chat replies during the hook are also placeholders for approval:
  - "which is steeper" or asking for the answer
  - "what does steepness mean"
  - everything else (are you real, off-topic, distress, unclear) uses the warm-up moves.
- The close script stays hidden. At the end of the lesson it fills in her prediction.

## 4. Behaviour
1. The hook starts by itself after the warm-up, or straight after the intro when the warm-up was skipped.
2. The script appears in the chat.
   - Voice on: Path A draws when the tutor mentions it, then Path B.
   - Voice off: Path A then Path B, 1.5 s apart.
3. The buttons and number boxes switch on once the script is shown, and the 10-second countdown starts then.
4. She can choose in two ways: tap a button, or tap a path on the picture (a wide invisible tap area). Both do the same thing.
5. She can change her mind until the countdown ends or the acknowledgement has played.
6. After a choice: her choice stays highlighted, the tutor posts the neutral line, and 2 s later the video step starts by itself.
7. Timeout with no choice: save "no prediction" plus any numbers she typed, then start the video, with no tutor line.
8. Typing in the chat or a number box pauses the countdown.
9. The video start setting is "auto".
10. The prediction (choice plus numbers) is saved on the server and logged as a prediction event. Repeat taps cannot save it twice.

## 5. Leftovers from the warm-up build
- **Chat/voice switch:** the highlight slides between the two options (180 ms; a fade when reduced motion is on).
- **Chat icon:** swap in your messenger image in the tutor panel header and on the phone strip, then remove the flipped stand-in.
- **Repairs:**
  - Run the coordinates quick fix on its grid and take desktop and phone screenshots.
  - Take phone screenshots of the substitution quick fix.
- **Placeholder wording:** list every line written for answered and filled-in steps (for example "The top: 11 − 2 = 9."), plus the new hook lines, as one approval list for Instructional Design.
- **Dark mode:** check the Continue Learning banner on Home and Choose a chapter in dark mode, including its contrast numbers.

## 6. Checks before reporting
- Both paths start from the same point, with gradients of exactly 2 and 1/2 (an automatic test).
- These four cases each save correctly and start the video:
  - pressing a button
  - tapping a path
  - typing numbers, then choosing
  - letting the countdown run out with no choice
- The leak check and the repeat-import check pass, and the close script is never readable before the close.
- The banned-word check passes (no "easy" or "hard road" wording).
- All automatic tests and the type check pass.
- Desktop and phone screenshots of:
  - the hook with both paths drawn
  - a prediction selected, with the tutor's acknowledgement
  - the video step starting
  - the coordinates repair
  - the dark-mode banner
- Then stop.

## Deliberate differences from the screenshot (kept on purpose)
- The hook text is the Path A / Path B script.
- The paths start from one point with exact gradients, labels and step triangles. There are no crossing lines and no "Easy road" or "Hard road" labels.
- Prediction buttons, number boxes and a countdown replace the answer box and Check Answer.
- "Step 2 of 8 · Hook" is added.
- The chat shows the hook script.
- The tutor name comes from the tutor name setting.
- The breadcrumb, page title and ask-box wording stay as agreed in the warm-up build.
- The send button stays blue, not orange.

## Technical notes
- **Stage and board:** a new hook stage component inside the lesson screen. The board is a small SVG drawing with the paths built from exact fractions, behind a board-kit interface that the illustration manifest can replace later.
- **Server:** the session-start and lesson functions return the hook move. A new `recordPrediction` function stores the choice in `sessions.state.prediction` and logs `prediction_made`. Moving on to the video goes through the existing step change.
- **Rules and content:** the rule `video_start_mode` is set to `auto` in the seed pack. The new placeholder fallback lines go into the seed pack, which is reloaded with the leak and repeat-import checks.

## Additions (gaps covered)
- **Coming back to the hook:** if she leaves mid-hook and returns, the hook replays from the start with a fresh countdown. If she had already chosen, she goes straight to the video, so she never predicts twice.
- **Countdown fairness:**
  - The countdown pauses while the tab is hidden, while she types, or while the phone chat sheet is open.
  - It restarts only when the paths have finished drawing.
- **Number boxes:**
  - They accept numbers and simple fractions only (for example 2 or 1/2), opening the number keypad on phones.
  - They are never marked.
  - The tutor never says whether her numbers are close.
- **Slow or lost connection:** her choice is saved on her device first and sent in order once she is back online. The video still starts on time.
- **Video not ready:** if the video can't load, a light message offers "Try again" and the tutor asks her to wait. Her prediction is kept.
- **Screen readers and keyboard:**
  - The picture has a text description: both paths start at the same point; Path A goes up 2 for every 1 forward; Path B goes up 1 for every 2 forward.
  - The three buttons work as one choice group with arrow keys.
  - The countdown announces "5 seconds left" once.
  - Her choice is announced when she makes it.
- **Motion:** with reduced motion on, the paths appear instantly and the countdown shows as a static bar with the seconds counting down in text.
- **Large text:** at the biggest text size, the phone layout still shows the buttons without overlap and the picture shrinks before the text does.
- **Super Admin preview:**
  - "Start again" replays the hook in the preview only, and the real lesson's prediction is untouched.
  - The "Go to page" menu gets a "Hook" entry after "Warm-up".
- **Tap area safety:** the path tap areas never steal taps meant for the number boxes. Where they meet, the number boxes win.
- **Task list:** add "Hook (Step 2) rebuild and warm-up leftovers" to the project's task list when building starts.
