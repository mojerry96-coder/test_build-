# Quick fix screen: new look from the spec, with the lab's motion and hint style

## Also included (gaps the screenshot doesn't show)
- **Header:** the spec shows only the logo, Dark mode and her name. Our music and sound buttons stay too, because she needs them on this screen.
- **Buttons:** "Watch again", "Your turn", "Check" and "Skip for now" have a fixed spot at the bottom of the right column, so they never jump around between steps.
- **Captions:** Fiti's spoken words always show in the bubble (captions always on). The text follows the app's text-size setting.
- **Text runs long:** the right column scrolls inside the card, and Fiti never gets covered.
- **Keyboard and screen readers:** a clear focus ring on every control, the answer box focused when "Your turn" starts, and new lines read out politely.
- **Override:** a teacher pause covers the card, and nothing moves while it's paused.
- **Budget phones:** the motion is light (no heavy blur), and the confetti is a few small pieces.

The quick fix keeps its current behaviour: the worked example ("Watch how it's done"), then "Your turn", then Check and "Skip for now". The fading lines and the tip wording stay the same. Only the look and the motion change.

## Look (from the screenshot)
- **No whiteboard:** the whiteboard picture, marker and eraser images are removed.
- **Card:** a white rounded card fills the screen, with a pale-blue inner panel. Soft background shapes sit behind it, like the lab's: a light-blue swoosh on the left, and a faint pink flower shape on the right.
- **Bottom edge:** an orange-to-yellow gradient strip runs along the card's bottom edge, like the "Good Job!" pop-up and the lab's own cards.
- **Fiti:** our animated Fiti stays, large on the left, pointing with his stick. He changes mood with the lesson as he does today. He is not replaced by a still picture.
- **Text:** Fiti's lines and the question sit on the right in the handwriting font, dark navy, with numbers like (3, 2) in orange. Line numbers are still shown.
- **Your turn:** the grid or answer box and the Check / Skip for now buttons go under the text, inside the same right column, using our raised blue buttons.
- **Phones:** Fiti goes small at the top and the text goes below him.
- **Dark mode:** the card and panel use the dark surfaces. The orange edge and orange numbers stay the same.

## Motion (reused from the simulation)
- **Entrance:** the panel fades up, then Fiti hops in from the left, then the text appears word by word, then the controls spring in.
- **Each new line:** it slides in softly. Older lines fade back, as they do today.
- **Buttons:** they spring when pressed and lift on hover.
- **Right answer:** confetti, plus Fiti's celebrate mood.
- **Not quite:** a small shake, plus Fiti's thinking mood.
- **Background:** the flower shapes turn very slowly.
- **Reduced motion:** all of this is turned off, and the screen simply appears.

## Hints and help (reused from the simulation's style)
Our server still decides when a hint shows and what it says. Today it answers each "not quite" with the step's approved hint, and that stays. Only the way the hint is shown changes, to match the lab:
- **Speech bubble:** Fiti gets a speech bubble beside him that keeps the current question on show, so she never loses it.
- **Hint on not quite:** the step's approved hint pops into the bubble. The wrong box shakes and gets a soft amber outline, never red. Her answer stays in the box so she can fix it.
- **"Tap me for a hint!":** if she sits still for a while (the time is a rule setting, about 3 seconds after a still spell, like the lab), a small "Tap me for a hint!" tag pops up on Fiti for 3 seconds, then the question returns. Tapping Fiti shows the step's approved hint. Showing a hint never counts as a try.
- **Right answer:** "Nice!", confetti and Fiti's celebrate mood. The line writes itself in, then the next step springs in, as today.
- **Step dots:** the "Step 1 of 3" dots become the lab's small round progress dots. A finished dot fills with a pop.
- **Fiti's moods:** these follow the lab's poses with our animated Fiti: pointing while explaining, thinking on not quite, cheering when right.

All words come from the approved lines in the lesson pack. Nothing new is invented, and the lab's own wording is not copied.

## Technical details
- `WhiteboardDialog.tsx`: drop `boardImg`, `markerBlack`, `markerBlue` and `eraserImg`, and their layout. The frame becomes `rounded-[34px] bg-fh-card overlay-edge` with an inner `bg-surface-soft` panel. Use two columns: `LiveTutor` on the left, at about 40% width, and the lines plus footer on the right. Keep the props, the `capacity` rule, the write-on and fade logic, and `footer`.
- Motion is rebuilt in `src/styles.css` as our own keyframes, modelled on the lab's: `panelIn`, `hopIn`, `wordIn` (staggered spans), `springIn`, `softShake`, `confetti` and `flowerSpin`. All go behind the `prefers-reduced-motion` guard. No lab files are touched or imported.
- `QuickFix.tsx`: these are style changes only. The right / not-quite hooks trigger confetti and shake through the existing reaction calls.
- Remove the unused whiteboard asset pointers only once nothing else imports them.
