# Video lesson: source

From Dave's "Lesson Mascot Media Garden" project (uploaded zip `lesson-mascot-media-garden.zip`, 25 Oct 2026). No git commit was included in the zip.

## Copied into this folder (used)
- `ParallaxBackground.tsx`, `background-layers.tsx`: changed `#ecf3f8` to the `--vl-bg` token.
- `CircledWord.tsx` (the highlighter): stroke `--gold` changed to the `--vl-highlight` token.

## Copied for reference only (`docs/video-lesson-upstream/`, not built)
LessonPlayer, VideoStage, QuestionCard, MascotReaction, IdleMascot, DecisionBar, PillButton, GlassCard, ConfettiLayer, `lesson-machine.ts`, `config/lesson.ts`.
- His QuestionCard is replaced by our check card in `FlowVideoStage.tsx`.
- His lesson machine is replaced by `flow.ts`, which our server results drive.
- His confetti is replaced by our `celebrate.tsx`.
- His question config now lives in the content pack: clip `flow` and items GRAD_VC1/2.

## Media
V01–V11 (VO6–VO9 use the letter O) and three mascot webm clips. They were downloaded from his public `lesson-media` storage and uploaded as Lovable assets (`src/assets/video-lesson/`). Nothing loads from his project.

## Other changes
- "Koko" is shown as the tutor name from our settings.
- Q3 (V11–V16) is not used yet.
- His moving-eyes mascot is off until layered art exists.
- VideoIntro.tsx: rebuilt from his updated `Landing.tsx` (2nd zip `lesson-mascot-media-garden_1.zip`, 26 Oct 2026): UnderlinedWord (copied here, gold -> --vl-highlight), raised pills, inline How it works note, large idle Fiti (`mascot-idle-hd.webm` re-uploaded as our asset `fiti-idle-hd`, first frame as still). Back goes to the map (map handles return-to-chat), not browser history. CircledWord is no longer used.
- Reference copies in `docs/video-lesson-upstream/` refreshed from the 2nd zip (plus Landing, UnderlinedWord).
