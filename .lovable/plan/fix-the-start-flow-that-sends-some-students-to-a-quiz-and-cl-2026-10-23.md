# Fix the "Start" flow that sends some students to a quiz, and clean up the map

## What we found
- Some students say "let's just start" or tap Start in Ask Fiti and land on a **Quick quiz** page instead of the lesson map. The chat records confirm this: Mercy was sent to "5 quick questions on Sign of a gradient" twice today, while Kingsley went to "Gradient of a line" as expected.
- **Cause:** when a student has a review due, tonight's plan lists it first. "Start" opens the first plan item, and a review item always opens as a quiz. So students with past answers skip the lesson flow, while new students like Kingsley don't.

## The fix
- "Start" (button, "let's just start", "yes" to "Shall we begin?", the Continue card) always follows the lesson flow: continue her open lesson, or else open the next topic's **Let's Begin** map. It never opens a quiz.
- A review that's due is still offered, but only as a separate choice ("Quiz me" / review card). The quiz opens only when she picks that choice or asks for a quiz.
- Tonight's plan order: continue lesson, then the next topic, then the review. Teacher and parent items keep their place.
- Fiti's line matches where she goes ("Tonight we'll start with Gradient of a line"), not the review name.

## Map
- Remove the step name that shows under each stop (e.g. "Warm-up" under the Start button). Screen readers still announce the stop name.

## Technical details
- `src/server/home/agent.server.ts` `act` `open_item`: when the action comes from start_plan / pending "item" / Start, a `review` item no longer becomes a quiz; start resolves to the first `continue` or `next` item. Only an explicit quiz intent or review card builds a quiz.
- `loadHome` plan order: `continue`, `next`, then `review`, then plan_items (`plan[0]` drives "Start" and the opening lines in `opening.server.ts`).
- Check `decide.ts` start_plan selection uses the same first lesson item; add a small test to `decide` tests: with a review due and a next topic, Start picks the next topic, not the quiz.
- `src/components/path/PathMap.tsx`: delete the hover/focus name tooltip under each stop; keep `aria-label`.
- Re-run the Mercy case in the browser (a student with a review due): "let's just start" opens the Let's Begin map.

## Old design on the warm-up / question pages
The question screen still uses the older look (first screenshot): no side bar, white pill answers. The updated design (second screenshot) is the target. Same change for every page that uses this question layout: warm-up, hook, quick fix and video checks.
- Show the side bar (logo, New Chat, Ask Fiti, Learning Hub, account), with the pinned Dark mode and Learning Streak at the top right.
- Answers become the coloured tiles from the design: A blue, B orange, C green, D yellow, each with a darker base, a small letter badge in the corner and the answer large and centred. Long answers wrap at a smaller size so they still fit.
- Selected, right and "not quite" states stay as they are now (selection ring, amber with icon, never red), drawn on the new tiles.
- Question wording, answers and the graph stay as they come from the lesson content; only the look changes. (The design's shorter question text is Instructional Design's call, not ours.)
- Check Answer, Hint, Ask Fiti and the thinking parrot keep their place.

### Technical details
- `mcq/WarmupShell.tsx`: render `FitilaShell` without `bare` (keep `hideFab`).
- `WarmupStage.tsx` `WarmupOptions` (and HookStage's `mcq-tile`) switch to one shared tile style in `src/styles.css`: per-position colour tokens (`--tile-a..d`, `--tile-*-edge`) with light and dark values, keyed on the existing `data-pos`.
- Search for any other leftover old question layouts and point them at the shared tile style.

## Added after review
- Students already stuck: anyone with an unfinished quiz from a wrong Start just gets the lesson map next time they tap Start; their quiz answers stay saved as practice and don't count as lesson progress.
- Ask Fiti's opening buttons ("Start", "Full lesson") use the same lesson-first rule, so no other button can lead to a quiz by mistake.
- The quiz page gets the same side bar and "Back to Ask Fiti" as the rest of the app, so it doesn't look like a different, older app.
- Phones: answer tiles stack one per row and keep large touch targets; dark mode gets matching tile colours with readable text.
- Check: one student with a review due and one new student both go Start → map → warm-up in the new design.
