# Warm-up responses: one popup for every answer

The boxes that currently show feedback under the question are replaced by one shared popup. It works like a short back-and-forth with the tutor instead of text added to the page. Everything else in the warm-up stays the same.

## 1. Flow
```text
Answer -> Check Answer
  right      -> "Good job!" popup (confetti) -> Continue / closes itself after 4 s -> next question (or Step 2 after Q3)
  not quite  -> "You got close!" popup -> Let's fix it -> Quick fix screen -> practice question -> its popup -> Continue -> next
                                       -> Skip for now -> tutor line in chat -> next   (skill saved as "not repaired")
```
- One try per question. There is no Try Again anywhere. The "Try Again" button in the Figma frame is replaced by "Let's fix it", following your written spec.
- Practice question: the same two popups. On not quite, the button says "Continue" with no Skip link. There is no second quick fix.
- After Q3 (or its quick fix), the hook opens automatically.

## 2. Popup (shared)
- The whole page is covered by a 20% black overlay, tutor panel included. The card is centred: white, 485 px wide, radius 12, 40 px side padding, height fits the content.
- From top to bottom:
  - tutor image in a 150 px circle
  - title: Afacad Bold 32, letter spacing -1.6 px, colour #0A3150, 16 px gap
  - feedback: Mulish Medium 16/26, colour #404D67, centred, 354 px wide, 12 px gap
  - button: 241 x 40, colour #5CBBF3, radius 16, Mulish Bold 14, 32 px gap
  - optional link: Mulish SemiBold 13, colour #667085
- Behind the popup, her chosen option stays marked: green with a tick for right, amber with an alert icon for not quite. The correct option is never revealed.
- Opens with a 200 ms fade and scale. With reduced motion it appears without movement.
- Focus moves into the popup and stays there, starting on the button. Screen readers announce the title and the feedback. Escape does the same as the button.
- Phone: card full width minus 16 px margins, 110 px circle, title 26, full-width button.

## 3. "Good job!"
- Celebrating parrot (wings up) on a mint circle (#E7F5EC).
- A CSS-only confetti burst behind the card, about 1.5 s. No confetti with reduced motion or low-data mode.
- Shows the document's feedback for her chosen option, in full.
- The Continue button shows a quiet countdown ring and the popup closes itself after 4 s.
- The avatar in the tutor panel shows "celebrating" briefly.

## 4. "You got close!"
- Encouraging parrot on a blue circle (#DBEDFF). No confetti, and it never closes by itself.
- Shows the document's feedback for her chosen option, in full.
- "Let's fix it" button, with a "Skip for now" link underneath.
- The avatar in the tutor panel shows "encouraging".

## 5. Quick fix screen (interactive, not static)
- It takes over the question area, labelled "Quick fix · about 1 minute". The top still shows Step 1 of 8 · Ready.
- The explanation appears one short line at a time as tutor messages in the chat, mirrored in a card on the stage. A "Got it" tap moves to the next line, so she is doing something rather than just reading.
- On question 1's skill, the coordinate board is reused: the board traces "across first, then up" in time with the explanation lines.
- Then the practice question: shuffled options, Check Answer, and the same popups.
- Fuller board demonstrations and "You try" moves come later with the illustration kit.

## 6. Chat
Each piece of feedback appears once in the tutor panel as a record. It isn't repeated when the popup closes.

## 7. Content (starter pack, all marked seed)
- Titles: "Good job!" and "You got close!".
- Buttons and link: "Continue", "Let's fix it", "Skip for now", and "Continue" for the practice question.
- Skip line: "No problem, you can ask me about this any time."
- Feedback always comes from the stored feedback for the chosen option. Reload the pack and run the leak check and re-import check.

## 8. Saved data
- Evidence per answer, unchanged.
- Warm-up status per skill: shown, repaired or not repaired.
- Events: popup shown, continue, let's fix it, skip for now, quick fix started, quick fix completed.

## 9. Checks and screenshots
- Every option of Q1 to Q3 shows its own full feedback.
- Right: the popup closes on Continue or after 4 s, then the next question.
- Not quite: fix leads to the practice question, then the next question. Skip saves "not repaired" and moves on.
- Step 2 opens after Q3. There is no retry, the correct option is never highlighted, and the leak check passes.
- Screenshots on desktop and phone: Good job (Q2), You got close (Q1), the quick fix screen, and the practice question's popup. Then stop.

## Deliberate differences from the Figma frames
- **Button text:** The button text is dark on the blue, not white, because white on #5CBBF3 fails the readability rule. This is the same choice as before.
- **Feedback wording:** The popup uses the document's full wording, not the shortened text in the frames.
- **Try Again:** The "Try Again" button is replaced by "Let's fix it".
- **Option letters:** The A–D letters in the frames stay off, as agreed. Screen readers still hear them.
- **Ask box wording:** The ask box keeps "Ask your tutor a question...".

## Technical details
- New `WarmupPopup` component in `src/components/lesson/`. It uses the existing tutor celebrate and encouraging images, and adds tokens for the mint and blue circles and the overlay.
- `checkAnswer` already returns the chosen option's feedback. Popup labels come from new fallback-line keys (`warmup_popup_right_title`, etc.) sent with the lesson view.
- Readiness status per skill: saved in `sessions.state.demo.readiness[skill]`, set in `checkAnswer`, `skipRepair` and the end of the practice question. Events go through the existing `logEvent` (types added to `EVENT_TYPES`).
- Remove the inline `Feedback` box and the auto-advance countdown from `WarmupStage`. Advance after the popup closes.
- Tests: popup label and wording lookup per option, the 4 s auto close, a skip saving "not repaired", and the hook opening after the last question.

## Your decisions (added)
- **Selected option text:** new token `option-selected-text` = #A55A10, which gives **4.66:1** on #FAF2EB and passes. #E18C32 stays for the border and radio dot.
- **Letters A to D are back:** 30 px tile, radius 8, #DBEDFF, Mulish SemiBold 14, #081D2D. Letters follow the on-screen order after shuffling. Screen readers hear "Option A, 3 across and 2 up". One problem: a white letter on the #E18C32 selected tile is only **2.63:1**, which fails for 14 px text. I'll use #A55A10 for the selected tile instead (white letter 4.9:1) unless you'd rather keep #E18C32 with the dark #081D2D letter (5.6:1).
- **Placeholders:** kept as marked seed for Instructional Design.
- **Old negatives content:** the REP_NEG_01 quick fix and its practice question are already gone from the pack and the database. The skill NEG-01 itself is still listed, and is used only by later lesson content, so it stays. I'll re-run the leak check and re-import check and report both.
- **Board:** the placeholder grid stays until the illustration kit arrives.

## Popup tutor images (your uploads)
- **"Good job!":** your new wings-up parrot (the one with glasses), on the mint circle.
- **"You got close!":** your new arms-folded parrot in a jacket, on the blue circle.
- Both are added as hosted images with transparent backgrounds. They replace the older celebrate and encouraging pictures in the popups and in the tutor panel's "celebrating" and "encouraging" states.

## Gaps added
- **Coming back mid-popup:** if she leaves while a popup is open, she returns to the same popup with the same feedback, not a blank question. The answer is already saved, so it's never asked twice.
- **Tapping twice:** Continue, Let's fix it and Skip for now each work once. A second tap does nothing.
- **Offline:** if she loses connection after Check Answer, she sees "Will check when you're back online" until the answer is checked. Popups only appear once the result is real.
- **Long feedback:** if the feedback is too long for the screen (phone, large text), only the text area scrolls. The image and title stay at the top and the button stays visible.
- **Tutor panel:** the chat stays readable under the overlay but can't be used while a popup is open. Questions to the tutor wait until it closes.
- **Hidden tab:** the 4-second auto close pauses while the tab is hidden, so she never misses the popup.
- **Voice mode:** when voice is on, the popup feedback is spoken once. The auto close waits for the voice to finish.
- **Admin preview:** popups and quick fixes work the same, but nothing is saved to her real record.
- **Tests added:** coming back mid-popup, double taps, and the phone layout with large text.
