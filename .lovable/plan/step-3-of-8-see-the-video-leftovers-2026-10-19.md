# Step 3 of 8 · See (the video) + leftovers

## What she will see
- Same lesson page as the warm-up and hook: header, breadcrumb, page title, tutor panel on the right. Step bar "Step 3 of 8 · See" with Ready and Hook marked done. Light mode only.
- Inside the main card: the clip title from content ("Watch: what makes a line steep?"), then the 830 x 467 player. The parrot-at-chalkboard poster fills it, with a dark layer and a round play button in the middle. The "Video coming soon · checks run as planned" label shows while the placeholder plays.
- Under the player: the light timeline with a blue played part and three orange markers at 1:00, 2:00 and 3:00. A marker turns into a small green dot once its check is answered. Below that is a small controls row: play/pause, time "0:00 / 4:00", CC (on by default), and "Watch that part again" (only after a not-quite answer). Captions sit at the bottom of the player.
- The video starts by itself after the hook, because the start mode is set to auto. If the browser blocks it, the play button shows and she taps to start. The tutor opens with "Watch closely, I'll pause the video to check in with you."
- At each check the video pauses and the check card slides up over the bottom of the player (on phones, below it). The card shows "QUESTION n OF 3", the question, "First, how sure are you?" with Sure / Think so / Guessing, then the 2x2 shuffled option cards with A–D tiles, then Check Answer. Check Answer stays off until she picks both a confidence and an option.
- Right answer: the option turns green with a tick, and "Good job!" shows the option's reason. Continue (or after 4 s) closes the card and the video resumes.
- Not quite:
  - Try 1: amber option, "You got close" with the option's feedback, plus "Try again" and "Watch that part again". That button jumps to the start of the segment, then pauses at the check again.
  - Try 2: a "Let's look at a similar one" panel plays the similar worked example line by line, 1.5 s apart, also in the chat. Then "Try again".
  - Try 3: the full working for this question, then a follow-up question with a small answer box. Whatever she types, the tutor confirms, and Continue resumes the video.
  - Options she already tried stay off. The right one is never shown on tries 1 and 2.
- She can't drag past an unanswered check. Leaving and coming back returns her to the same second.
- Typing in the chat pauses the video. "Tell me the answer" gets "Have a go first, I'll help you if you need it." "What did the video say?" gets the current segment's summary.
- When the video ends, Step 4 (simulation) opens. The band is chosen behind the scenes and never shown.

## Leftovers folded in
- Super Admin "Lesson: Hook" already opens at Step 2. I'll add "Lesson: Video" the same way and confirm both.
- Phone screenshots: the hook choice buttons scrolled into view, and the substitution quick fix.
- Measured contrast numbers for the dark-mode Continue Learning banner (not by eye only).
- The old top bar and step list on the video step are removed by this rebuild.
- New video lines added to the Instructional Design approval list.

## Technical details
- Assets: the poster is your attached image (1920x1080), converted to WebP at 1x and 2x and uploaded as an asset. It already has the dark layer baked in, so no second 38% layer goes on top. The play icon is drawn in code at 24 px unless the Figma link still downloads. The manifest `poster_url` points at the poster. `url_low`/`url_standard`/`captions_url` stay null.
- The pack's CLIP_GRAD_MAIN gains `title` and `segments` (four segments with summaries) and caption lines. When the real files arrive, only the pack changes. A timer-driven player runs while the URLs are null; a real `<video>` (url_low on a weak connection or in low-data mode) runs when they are set.
- Seed adds: the intro line, a video-specific answer-request line and the escalation scripts already on the items (`escalation`). I'll check that every item has its attempt 2 and 3 scripts and follow-up line, and fill in any gaps as placeholders for approval. Scripts stay hidden and are sent only when played.
- Server: the existing check path records try number, first try, option, confidence, misconception, time taken and evidence strength. "Sure" + wrong flags a firm misconception. The play position is saved through a new `video_position` event. At the end, count first-try correct answers through rule `routing_bands`, save the band and misconceptions, and advance to the simulation.
- New `VideoStage` in its own file, using the shared popups, option cards, confidence pills, step bar and TutorChatPanel. Tokens are added to styles.css.
- Tests: seek clamp, evidence strength, routing band (0→rebuild, 1→bridge, 2–3→stretch, first tries only), and a check that the escalation scripts aren't readable before they play. Leak and re-import checks rerun.
- Browser checks on desktop at 1440 and on phone in my admin preview: before playing, check 2 ready, try 1, try 2 demonstration, then Step 4 opening.

## Super Admin changes (added)
- The purple "ADMIN" tab moves from the right edge to the bottom-left corner of the page, and the panel opens from there.
- Restart becomes a true fresh start for your admin account. It also ends your real lesson, so Home shows no "Continue Learning" banner and progress goes back to 0. Hook choices, warm-up answers and "seen" flags (Meet your tutor) are cleared too. The confirm text says this. It never touches students' lessons or your sign-in, and it is still logged.
- Both items are added to the task list once building starts.

## Design gaps added (not in the spec)
- Loading and slow network: a soft shimmer on the poster while it loads, and a "Loading…" spinner if playback stalls. If the video fails, she sees one friendly line, "Video unavailable, the questions still work", rather than a broken player.
- Tutor panel closed: tutor lines (intro, the try 2/3 demonstrations) still show as captions on the player. She never misses them, and a dot appears on the chat button.
- Check card vs captions: captions lift above the check card so they never hide behind it. CC off hides them fully.
- Timeline hover/tap: segment names ("Rise over run" and the rest) show as a tooltip. Markers can be tapped to rewatch answered parts only.
- Keyboard and screen reader: Space plays/pauses, arrow keys move 5 s within the allowed range, and the timeline is a labelled slider. When a check card opens, focus moves to its question. Pausing at a check is announced.
- Reduced motion: no slide-up or confetti animation when the device asks for less motion.
- Coming back mid-check: if she left with a check open, it reopens at the same try, with tried options still off.
- Tablet: the player and check card scale to the card width. The tutor panel stays at the side, as in the warm-up.
- End of video: a short "Nice watching! Next, you'll try it yourself." moment (seed placeholder line) with a Continue button, instead of jumping straight to Step 4.
- Touch targets: the confidence pills and controls are at least 44 px on phones.
- New placeholder lines go on the Instructional Design approval list.
