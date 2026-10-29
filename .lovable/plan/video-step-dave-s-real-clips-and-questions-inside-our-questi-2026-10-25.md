# Video step: Dave's real clips and questions, inside our question card

## What she will see
- Step 3 plays Dave's real teaching clips in his player look: the video centred with a line under it, his moving background, confetti and the highlighter. Our colours are used throughout.
- When a clip ends, the question opens in **our current check card**, the one in your screenshot. It has "Question 1" and "1/2", the hand-written question with orange numbers, the coloured A–D tiles, "How sure are you?" (Sure / Think so / Guessing) and Check Answer. Dave's own question card is not used.
- Two questions for now: Dave's Q1 (a line falling from left to right) and Q2, using clips V01–V10. So the card shows "1/2" and "2/2". Q3 is left for a later topic.
- Right answer: the green tick and "Good job!", then Fiti's clapping or thumbs-up clip, then Dave's "correct" clip, then the next teaching clip.
- Wrong answer: the option she picked locks. Dave's clip for that try plays (1st, 2nd or 3rd).
  - After try 1: his hint shows in the card, with the key word highlighted.
  - After try 3: his full working shows, then our explain-back question, then Continue.
- Fiti appears beside the video in Dave's mascot spot, and his reaction clips become Fiti's reactions. Dave's "Koko" is renamed to the tutor name from our settings. Ask Fiti stays available.
- After the last question and the final teaching clip, Step 4 (simulation) opens. The band comes from her first tries: 0 right = rebuild, 1 = bridge, 2 = stretch.
- Captions and low-data versions show when those files exist. There is a slot for each clip, empty for now.
- If a clip fails to load: its poster and the question still show, and the failure is logged. Our old placeholder video stays as the backup.

## Question card: match the new spec
- A white card with rounded corners and a thin orange-to-yellow border on all sides, plus the thick orange-to-yellow bottom edge.
- Header: "Question n" in light blue on the left, "n/total" in grey on the right.
- Question: centred hand-written navy text, wrapping onto two lines when needed. Numbers in the question stay navy, with no orange colouring.
- Answers: four smaller coloured A–D tiles in a 2x2 grid, centred, with a small letter dot top-left and the hand-written value in the middle.
- Confidence: three separate white pill buttons (Sure / Think so / Guessing), each with a navy outline and a thick navy bottom edge, with icons. The "How sure are you?" label and the grey bar behind them are removed.
- Check Answer: a centred light-blue pill (not full width) with a darker blue bottom edge, off until she picks an answer and a confidence.
- Dark mode: the card stays white, as today. On phones the pills wrap to fit the screen.

## Added safeguards
- Slow phones and data: the next clip starts loading during the question, so there is no wait after Check Answer. On a weak network a loading spinner shows, never a blank stage.
- Clip sizes: Dave's videos are checked for size. Any that are too heavy for budget phones are flagged to you (there are no low-data versions yet).
- Phones need a tap before sound plays: the first clip waits for a "Play" tap if the phone blocks it.
- One voice at a time: Fiti's spoken lines and his reaction clips never talk over a video. Music softens while a clip plays.
- No skipping ahead: she can pause and rewatch the clip she is on, but cannot drag past a question.
- Replay: a "Watch again" button replays the last teaching clip from the question card.
- Coming back: a reload returns her to the same clip or question, at the same try, with locked answers still off.
- Fair marking: the wrong-try clips are picked by try number only, never by which answer she chose, so a clip never gives away the right one.
- Reduced motion: no moving background or confetti when the device asks for less motion.
- Admin preview: "Lesson: Video" opens straight at this step for testing.
- New lines (hint wording, rename to Fiti) go on the Instructional Design approval list.

## Kept as is
- Our server marking. The browser never knows the answer.
- Evidence: first try, tries, confidence, time taken, firm misconceptions and lucky guesses.
- Reload resumes at the same clip or question.
- Our shell, Ask Fiti, voice, music and dark-mode rules.

## Technical details
- Copy Dave's LessonPlayer, VideoStage, DecisionBar, MascotReaction, IdleMascot, ParallaxBackground, background-layers, ConfettiLayer, GlassCard, CircledWord, PillButton and lesson-machine.ts into `src/features/video-lesson/`. Add a `SOURCE.md` that records the source zip ("Lesson Mascot Media Garden", uploaded 25 Oct) and every change made. His QuestionCard is copied for the record only and is not rendered: our check card from `VideoStage.tsx` is pulled out into a shared `VideoCheckCard` and used instead. Not copied: his routes, Landing, CompleteScreen, DebugPanel, Supabase client and `config/lesson.ts`.
- Media: download V01–V10 (VO6–VO9 use the letter O) and the 3 mascot webm files from his public storage. Upload them as Lovable assets. Afterwards nothing loads from his project.
- Content: the pack's clip gains a `flow` list. For each check it holds `after_clip`, `correct_clip`, `wrong_clips[3]`, `next_clip`, a hint (with a highlight word), the reveal working and an empty captions/low-data slot per clip. The hint and reveal go into the hidden `scripts` table, sent only when they play.
- Q1/Q2 become items `GRAD_VC_1/2`, replacing the placeholder video checks. Keys go in `item_keys`, and the items are marked draft for Instructional Design approval. The seed is reloaded with the leak and re-import checks.
- Server (`demo-path.server.ts` video path): returns the next clip id after each check result, never the right option. Rule `routing_bands` is updated for 2 checks.
- His lesson machine is driven by our server results instead of comparing labels in the browser.
- Tests: the flow order (right / wrong once / wrong three times), the band for 0/1/2 first tries, the hint and reveal not readable before they play, and the clip-fail fallback.
- Browser run of all three paths, with screenshots of: the question with the confidence tap, a wrong-try clip with the hint, the reveal, and Fiti's reaction.

## Open question
- His files mention a moving-eyes Fiti that waits on layered art. That stays off until the art exists.
