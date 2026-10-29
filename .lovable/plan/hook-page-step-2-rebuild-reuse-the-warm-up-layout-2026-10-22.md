# Hook page (Step 2) rebuild: reuse the warm-up layout

The Hook must look and behave like the warm-up question page (spec screenshot 3): question on top, answers below in a clean 2x2, one action button, Ask Fiti bottom-left, thinking Fiti bottom-right. The hill picture takes the place of the warm-up grid and is the biggest thing on the page.

## What is wrong now (from the screenshots)
- The question is long, gets cut off with "...", and a popup with the full text covers the answers.
- The nudge "Take your best guess..." pops over the answers.
- With chat open, the hill shrinks to a thumbnail and the answers squash to "Path / Path / Same".
- Labels on the hill overlap ("Path B" sits on "up 1, forward 2", "up 2, forward 1" crosses the road).
- The two "How steep is..." boxes, the yellow link and the answers have no clear order.

## New layout (desktop, chat closed)
```text
[ header: logo | sound | Dark mode | name ]
Gradient of a line · Hook  ● ▬ ● ● ● ● ● ●
+---------------------------+   Short question (Patrick Hand, navy,
|                           |   numbers orange), never cut off
|   HILL PICTURE (large,    |
|   ~60% width, same card   |   [ A  Path A ] [ B  Path B ]
|   style as warm-up grid)  |   [ C  Same   ] [ D  Not sure]
|                           |
+---------------------------+   (optional) Your steepness guess:
                                Path A [ __ ]   Path B [ __ ]
[Ask Fiti]                      [ Lock in my guess ]        Fiti ?
```
- Same shell, spacing, answer pills (white, orange when picked with tick), button and parrot as the warm-up. No new styles.
- Hill picture larger than today, labels placed clear of roads: "Path A" at the top of the red road, "Path B" at the end of the purple road, "up 2 / along 1" and "up 1 / along 2" beside their triangles, never touching a road.
- Optional steepness boxes sit in one row under the answers, small and clearly marked optional.
- "Not sure? Watch the video" becomes a quiet text link under the button, not yellow underline.

## Chat open (desktop)
- Reuse the warm-up "Ask Fiti on a question" arrangement exactly: chat card on the left, page content shifts right.
- Hill picture stays large on top of the content column (full column width); question and 2x2 answers sit under it. Answer pills keep full words, never truncated.
- Chat starts clean for this question with the approved Hook opener.

## Nudge and help text
- The nudge plays as Fiti's line (in chat if open, otherwise a small bubble next to Fiti), never as a popup over the answers.
- No full-question popup; the question is short enough to show in full.

## Clearer question (content change, draft for Instructional Design)
Current text is three ideas in one. Proposed hook prompt in the seed pack:
- Question: "Path A goes up 2 for every 1 along. Path B goes up 1 for every 2 along. Which path is steeper?"
- Answers: Path A, Path B, Same, Not sure.
- The "describe steepness with one number" idea moves to the optional boxes label: "Bonus: one number for each path's steepness?"
Lines are drafts until approved; still never marked.

## Phone and tablet
- Same as warm-up: hill full width (max ~240px tall), question, answers single column, button fixed at bottom, chat as bottom sheet.

## Kept as is
- No marking, saved prediction, replay of the cyclist, 20 s nudge/skip timers, sound toggle, dark mode, reduced motion.

## Added gaps
- After "Lock in my guess": Fiti nods, says the approved thanks line, and the button becomes "Watch the video" (no right/wrong shown).
- Tapping a road on the hill also picks that answer; picked road glows to match the pill.
- Reload keeps her pick and bonus numbers.
- Chat-open layout fits at 1280x720 without scrolling; below that, page scrolls, chat stays fixed.
- Keyboard: answers in tab order, Enter locks in; screen reader reads the full question once.
- Dark mode: hill card and pills use the same dark values as the warm-up; road colours stay readable (AA).
- Changing her mind: she can pick again until she locks in; Fiti doesn't comment on each change.
- Big screens (1600px+): content width capped like the warm-up so the picture and answers don't drift apart.
- Teacher takeover pauses the nudge/skip timers and resumes them on hand-back.

## Technical details
- `HookStage.tsx`: replace its own layout with the warm-up grid/options layout used in `WarmupStage.tsx` (picture slot = hill SVG, options = `.ans-pill`), reuse its chat-open class switch and `splitNumbers` for orange numbers.
- Remove the truncation + full-text popover; render nudge through the shared chat/Fiti bubble path.
- Reposition SVG label anchors in the hill drawing; enlarge viewBox use.
- Update hook prompt/options/bonus label in `content/packs/MTH12_09_02_01.seed.json`, reload seed, run leak/banned check and the hook-board targeted test only.
