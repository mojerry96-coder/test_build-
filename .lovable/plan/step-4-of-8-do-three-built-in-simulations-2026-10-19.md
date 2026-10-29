# Step 4 of 8 · Do — three built-in simulations

## Fix first: Home banner gone after Restart
Cause: the banner only shows while a lesson is in progress, and Restart now ends that lesson, so it disappears. Fix: the banner always shows. With no lesson in progress it shows the first open topic at 0% progress with a "Start" button that opens that topic's intro; once she starts, it goes back to "Continue Learning" with her step. Same on Choose a chapter. Checked after a Restart on desktop and phone, light and dark.

Build Ramp Builder (rebuild), Road Inspector (bridge) and Ramp Designer (stretch) inside the lesson page, to the three Figma frames plus the deliberate differences. Light mode only. The Gradient lab copy stays in the project, unused.

The three screenshots are the exact look until the animated simulations arrive; they then sit in the same place on the page by changing only the simulation addresses. Every rule in the spec is built exactly as written (routing, tasks, accepted answers, feedback, hints, help timing, saved data), whatever the look.

## What she sees
- Same lesson shell and tutor panel as warm-up/video. Top of card: "Step 4 of 8 · Do" with the step bar, then "YOUR SIMULATION · TASK n OF total" with small task dots (done ones ticked).
- Intro card: "Your simulation", the goal in one line, Start. Tutor's opening line is picked from her video misconceptions (else the default), shown in chat and spoken.
- Task title + instruction (Mulish 20/16), the 526×354 grid (x 0–6, y 0–4, lines and 9 px dots #DDE2E7, radius 9), fixed start point #081D2D, placed point #C8EAFF with #5CBBF3 ring, blue 4 px ramp line, light blue triangle; "up n" / "across n" labels appear only after a right check.
- Check Answer 864×48, #5CBBF3, radius 16, off until she makes a move. Phone: full-width grid with 44 px tap areas on every point, title 18, Check Answer pinned at the bottom.
- Right: labels show, working appears in chat ("Up 2, across 2: 2 ÷ 2 = 1"), short green confirmation above Check Answer, next task after 2 s.
- Not quite: shape turns amber (never red), task-specific feedback for her mistake, try again. Help any time (guiding question, then hint). Third miss: a correct answer shows faintly and she places it, then moves on.
- Help prompt "Looks like this one's tricky. Want a hint?" after 30 s with no meaningful action or the same wrong answer twice; once per task, never twice within 2 minutes (both values are rules).
- After the last task: closing feedback in chat and a small card (what she did well, one thing to watch, the hook link "Remember the two paths?…"), then "Time to practise…" and Step 5 opens with Teach me / I'll try alone.
- Resume returns to the same task with her last point or numbers.

## The three engines
- Ramp Builder: start (0,0), tap to place the top; tasks gradient 1, 2, ½ with all listed correct points and feedback.
- Road Inspector: roads A, B, C drawn through labelled points; Rise / Run / Gradient boxes under the grid with the on-screen keypad (negatives and fractions; accepts 0.5, 2/4, −0.5 etc.), each box ticks or turns amber; task 4 three buttons Road A/B/C (B correct).
- Ramp Designer: gradient 3/2, downhill −1 from (0,4), steepest allowed under 1-in-3, and task 4 with two placed points (gradient 2; vertical line feedback).
- Band never shown; she only sees "Your simulation".

## Routing
Video first-try score with rule routing_bands: 0 → Ramp Builder, 1 → Road Inspector, 2–3 → Ramp Designer. Video misconceptions (MIS_INVERTED, MIS_SIGN_GRAD) pass into the simulation.

## Super Admin
"Lesson: Do (simulation)" replaced by three entries (Ramp Builder (rebuild), Road Inspector (bridge), Ramp Designer (stretch)), each opening the admin preview at that simulation.

## Checks before stopping
Scores 0, 1, 3 open the three engines; every listed right answer accepted and every listed mistake gets its feedback; help prompt timing; faint answer on third miss; closing → Teach me / try alone → Step 5; targets unreadable from the browser; leak + re-import checks pass after reloading the pack; all tests pass. Desktop and phone screenshots of each engine (intro, in progress, right with labels, not quite), closing feedback and the Practise opening. Then stop.

## Technical details
- Content: seed pack simulations get url "native:ramp_builder" / "native:road_inspector" / "native:ramp_designer", opening lines by misconception, goal, closing lines; sim_tasks hold title, instruction, input kind (point, two_points, rise_run_gradient, choice), start point, road points. Targets, accepted answers, per-mistake feedback and hint rungs live in hidden `scripts` / item_keys; config.status "seed"; true minus signs; banned-words check. Add new columns via migration if sim_tasks lacks them (no browser grants on hidden ones). Leak check extended to the targets.
- Engine contract: one `SimEngine` interface in `src/shared/contracts` (in: init, set, highlight, lock, unlock, reset; out: ready, changed, activity, task_result, help_requested, error). A loader maps `native:*` to the built-in React engine, anything else to the sandboxed iframe — so the real simulations are a URL change only. Rule recorded in src/components/lesson/AGENTS.md.
- Marking: new pure checks in `src/server/maths/sim-checks.ts` (exact fractions: point-gradient, two-point gradient, rise/run/gradient triple, choice, max-gradient rule) classifying mistakes to misconception ids, with unit tests for every listed answer and mistake. Server function `simCheckFn` in lesson.functions.ts returns right / not quite, misconception id, next line, and the faint answer only after the third miss.
- Help timers and cooldown in `src/shared/sim-help.ts` (rules help_sim_idle_s, help_sim_repeats), tested.
- Saved data: task_result events and evidence rows (band, task id, attempts, first-try, hints, misconceptions, final answer, time; skill GRAD-01, GRAD-02 for downhill). Closing card built from them. Position saved per task for resume.
- UI: new `SimStage.tsx` + `sim-board.tsx` (board placeholder style so the illustration kit restyles it), replacing the current simulation-stage use; tokens added to styles.css. Old demo-path walk updated in place (not extended).
- Dev tools: three Go to page entries; restart clears simulation results.
- New wording added to the Instructional Design approval list.

## Design gaps added (not in the spec)
- Chat during a task: "tell me the answer" gets "Have a go first, I'll help you if you need it."; "what's a gradient?" gets the rule line, never the target.
- Keyboard and screen reader: arrow keys move a highlight across grid points, Enter places it; each point is labelled "(2, 4)"; right/not-quite is announced.
- Reduced motion: no line-draw animation or slide-ins.
- Clear point: a small "Reset" link to remove her points (counts as a move, not an attempt).
- Points she taps outside the grid range are ignored; the placed point never sits on the start point.
- If the engine fails to load: one friendly line ("The simulation didn't load. Tap to try again.") and an error event, never a blank stage.
- Instructor Override: when a teacher pauses, the grid locks and the help timer stops; hand-back unlocks it.
- Help timer pauses while she types in the chat or the tab is hidden.
- Tablet: grid scales to card width, tutor panel stays at the side.
- Leftovers still open: phone screenshots of the hook buttons and substitution quick fix; measured dark-mode banner contrast; video extras (tap a green dot to rewatch, part names on hover, dot on chat button, loading spinner).
