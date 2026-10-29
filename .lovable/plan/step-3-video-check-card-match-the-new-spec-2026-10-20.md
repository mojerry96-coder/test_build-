# Step 3 · Video check card — match the new spec

Two specs: the video paused for a check, and the video before playing (play control and loading bar). Same lesson shell, top bar, breadcrumb, title and tutor chat panel as now; only the player, its control row and the check card change. Light mode only (lesson screens).

## Play control and loader row (second spec)
- The big round play button in the middle of the video goes. The picture shows with a light grey veil while not playing.
- Under the video, one row: on the left a small rounded-square light-grey play button (about 36 px) with a dark-blue play triangle (becomes pause while playing); in the middle the clip parts as separate grey rounded bars with small gaps, filling blue as it plays; on the right a light-grey rounded pill (about 50 × 36 px) for the time / captions control.
- While the video loads, the bars and the right pill show as plain grey placeholders exactly like the spec (no spinner), then fill with real progress once ready.
- Check markers and green "answered" dots stay on the bars; tapping the picture still plays/pauses; keyboard Space still works.

## What changes
1. **Video dims behind the card.** When a check opens, the paused video gets a soft grey veil and the card sits centred over it (about 756 px wide on desktop, 16 px radius, 32 px inner space), instead of sliding over the bottom edge.
2. **Card order (top to bottom):**
   - "Question 1 of 3" — small blue text, normal case (not capitals).
   - The question in dark blue, Mulish semibold 20 px.
   - The four answers in a 2 × 2 grid of rounded white cards with a round button (the warm-up answer style already in use).
   - "How sure are you?" (replaces "First, how sure are you?") and below it one grey pill-shaped bar with three parts: Sure (tick icon), Think so (thumbs-up), Guessing (dice/question icon). The chosen part fills green with white text; the others stay plain.
   - Full-width light-blue "Check Answer" (about 692 × 64 px, 16 px radius), off until an answer and a confidence are both chosen.
3. **Timeline under the video** shows the parts of the clip as separate grey bars with small gaps (one bar per part from the clip's parts list), the played part filling in blue; check markers and the green "answered" dots stay.
4. **Working, Try again, follow-up box and Continue** keep their current behaviour, restyled inside the new centred card.
5. **Phone:** no veil; the card sits under the video at full width, answers in one column, the confidence bar stays one row (44 px tall), Check Answer full width. **Tablet:** centred card as on desktop, scaled to the video.

## Kept as is (not taken from the spec image)
- The words come from the starter pack, not the picture: the spec's question, answers and chat line are sample text (its answers don't fit its question, and its chat line is a warm-up line).
- Page title stays the topic's name from the database; tutor name stays from the rule; no Step bar removal beyond what is already agreed.
- Marking, confidence rules, routing and hidden answers are unchanged.

## Checks
- Screenshots at 1440, 820 and 390 next to the spec: question open, Sure chosen, right answer with working, not quite.
- Contrast check on the small blue "Question 1 of 3", the grey confidence labels and white text on green (AA 4.5:1); darken a colour rather than enlarging text.
- Keyboard: the confidence bar works as a radio group with arrow keys; focus rings visible; reduced motion turns off the veil fade.
- Run only the video tests.

## Technical details
- Edit `src/components/lesson/VideoStage.tsx` (card position, scrim, order, segmented timeline from `v.segments`) and the existing `ConfidencePicker` (segmented style with icons, `role="radiogroup"`).
- New tokens in `src/styles.css`: `--video-scrim-check`, `--confidence-track`, `--confidence-on`, `--confidence-on-ink`, `--video-eyebrow` adjusted if contrast fails. No hard-coded colours.
- No server, pack or data changes.
