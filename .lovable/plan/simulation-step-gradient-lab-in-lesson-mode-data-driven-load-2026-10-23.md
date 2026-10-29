# Simulation step: Gradient Lab in lesson mode, data-driven loading, safe fallbacks

## 1. How the simulation step decides what to load today
1. **First-try results:** each video check answer is saved in the session's lesson state (`results[itemId] = { correct, firstTry }`), and also as an evidence row.
2. **Routing rule:** when the video step ends, `chooseBand` counts the checks that were right on the first try. `pickBand` then looks that number up in the rule `routing_bands` (keyed by how many checks there were, e.g. 3 checks: 0–1 rebuild, 2 bridge, 3 stretch). If nothing matches, it picks bridge, written in code.
3. **Where the band is saved:** on the session, in both the lesson state (`demo.band`) and the `sessions.band` column, at the moment she moves from the video to the simulation.
4. **What loads:** the lesson screen reads the `simulations` row for her topic and band and loads whatever that row's address says:
   - `native:ramp_builder`, `native:road_inspector` or `native:ramp_designer` load the built-in boards;
   - any other address loads a sandboxed frame.
   - Tasks come from `sim_tasks`; level and challenge counts come from the rules `sim_band_levels` and `sim_advanced_challenges`.

### Gaps found
- A skipped or failed video counts as "0 right", so she lands in **rebuild** instead of the default, and nothing is logged.
- The bridge default is written in code, not a setting.
- The frame does not wait for "ready", has no 5 s timeout, no error handling and no fallback. It also doesn't handle messages.
- Each record holds only an address. The level and missions sit in separate rules, not in the band's own record.
- Saved state is kept only for the built-in boards (`simSaved`). There is no saved mission or position for a frame simulation.

## 2. Each band's record holds the engine and its setup
- Every `simulations` record holds:
  - `engine`: `native:road_inspector` or `gradient-lab`.
  - `config`: for example `{ "stages": [{ "level": "beginner", "missions": [1,2,3] }, { "level": "intermediate", "missions": [1] }] }`.
  - `fallback_engine`: the built-in board for the same band.
- Draft records for Instructional Design approval:
  - rebuild: Beginner 1, 2, 3, then Intermediate 1.
  - bridge: Intermediate 1, 2, 3.
  - stretch: Intermediate 5, 6, then Advanced with 2 "two points" challenges.
- Changing a record in the content pack and re-importing changes what loads, with no code change.

## 3. Band and place survive a reload
- The band stays on the session (already true). In addition, the session saves the current stage, mission, the last "changed" state ({m, c} or {A, B}) and which missions are done.
- After a reload or a later visit she reopens the same band at the same mission. The saved state is sent to the simulation with "set", and the built-in boards use their saved answer as today.

## 4. Skipped or failed video
- If any video check was not answered (skipped, or the video failed), the band comes from the new rule `default_band` (bridge in the content pack). The `band_defaulted` event records the reason.
- The code's own last-resort default also reads `default_band`.

## 5. Fallback if the simulation won't load
- The step waits up to 5 s for "ready" (the time is the rule `sim_ready_timeout_ms`, 5000). If "ready" doesn't arrive, or the simulation reports an error or the frame errors, the step switches to `fallback_engine` for the same band. The `sim_fallback` event records the reason, and she sees no error.
- The fallback is saved on the session, so a reload doesn't retry the broken simulation in the middle of the step.

## 6. Gradient Lab in lesson mode (from the instruction file)
- **Copy:** the source from `mojerry96-coder/k12` at commit 68c929b (src and assets, without media/ and review/) into `public/sims/gradient-lab/`, with `SOURCE.md` listing every change. Our changes are one `lesson-mode.js` plus small hooks marked `// FITILA LESSON MODE` in app.js and state.js. It replaces the temporary stub copy.
- **Lesson mode (`?lesson=1`):**
  - Off: opener, walkthrough, header, Fiti clips and videos, hint bubble, points and streaks, level-complete messages, sound and local saving. Nothing from media/ is loaded.
  - Settings from the address: level, missions, challenges, theme=light, reduced_motion and parent origin.
  - It shows only the chosen missions, in order, and waits for "next_task" between them.
  - Every interaction, illustration, animation and colour of Gradient Lab is kept exactly as it is: the working panel, triangle, sliders, points, "Walk the line", the mission cards, its rise/run/triangle colours and its motion. No restyling.
  - It shows no right/not-quite text, and its Advanced feedback ladder is turned off.
- **Messages, checked against our origin only:**
  - From the simulation: ready, changed, activity, task_result, help_requested, resize.
  - To the simulation: next_task, highlight, set, lock, unlock, reset.
  - Every message is logged.
- **Immersive, Fiti-led step:**
  - The step uses the same shell as the warm-up, with Ask Fiti, Fiti bottom-right and a soft illustrated background around the lab.
  - The frame grows to the height the lab reports.
  - Fiti introduces the activity in the chat ("I've picked a hands-on activity…") and reads each mission aloud in captions.
  - **When a mission passes:** Fiti nods, there is a small celebration and chime, and he praises what she did. Then the next mission opens.
  - **When she needs help** (she asks, 30 s idle, or repeated failed moves): Fiti's hint ladder points at the triangle, rise, run or a point, or demonstrates with "set". The lab is locked while he shows her and unlocked with "Your turn".
  - **After the last mission:** a closing line (what she did well, one thing to watch, a link back to her Hook guess), then "Time to practise".
- **Marking stays ours:** the server re-checks each task_result against the hidden target with the maths engine. The lab's "passed" alone never counts.
- **Evidence:** each mission saves first try or not, hints used and time, like other items.
- **Loading:** the lab is preloaded quietly during the video step.

## 7. Also covered
- **Phone and tablet:** the lab fills the width and grows to its reported height. The chat opens as a sheet, and Fiti gets smaller so he never covers the sliders.
- **Dark mode:** the lab stays in its own light theme, framed by a dark card, so its colours stay exactly as designed.
- **Low-data mode:** the built-in board for the band loads instead of the lab (logged as `sim_low_data`), so nothing heavy downloads.
- **Restart:** clears the saved mission, state and fallback, so the lab opens fresh at its first mission.
- **Instructor Override:** taking over sends "lock" and pauses the idle timer. Handing back sends "unlock".
- **Sound:** only our chime plays, and it follows the sound switch. The lab's own sound stays off.
- **Ask Fiti during the lab:** the chat stays open beside the lab and pauses the idle timer. Questions get hints, never the answer.
- **Keyboard and screen readers:** the lab keeps its own controls. Fiti's lines are read out through the captions.

## Not included
- New Fiti video clips inside the lab (its own clips stay off). Fiti reacts through the lesson's existing avatar and chat.
- Changes to Michael's team's repository. Our changes are recorded in SOURCE.md for hand-back.

## Technical details
- Content: add `engine`, `config` and `fallback_engine` to the simulations rows (content-pack schema, validation and `apply_content_pack`, plus a migration adding the columns). Add rules `default_band` and `sim_ready_timeout_ms`, and draft mission lines and hint rungs as hidden scripts.
- Server (`demo-path.server.ts`, `policy.ts`):
  - `chooseBand` uses `default_band` when any check is unanswered and logs `band_defaulted`.
  - New `simProgress` in the lesson state (stage, mission, state, done, fallback).
  - New server functions via `lesson.functions.ts`: `simMessage` (changed, activity, task_result, help) and `simFallback`. task_result is checked by `src/server/maths/sim-checks.ts` against the hidden targets.
- Client:
  - New `GradientLabHost` in `simulation-stage.tsx`: same-origin frame with `sandbox="allow-scripts allow-same-origin"`, origin and source checks, the ready timer, resize, and highlight/set/lock calls.
  - `SimStage` picks the host from `engine` and switches to `fallback_engine` on timeout or error.
  - Preload link during the video step.
- Tests (targeted): band from first-try counts and the `default_band` path; fallback after the timeout or an error; resume at the saved mission; and that a "passed" message never settles a task without the server check.
- Update `src/components/lesson/AGENTS.md` (simulation rule) and `public/stubs/AGENTS.md` (the stub is replaced).
