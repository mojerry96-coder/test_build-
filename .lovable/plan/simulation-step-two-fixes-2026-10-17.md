# Simulation step: two fixes

## 1. "You did it. Well done." stays on the main screen
- When a task is finished, the tutor's completion line shows once in the simulation panel, under the task ticks, in place of "Task complete — ready for the next discovery."
- It is no longer added to the tutor chat after each task, so the chat stays quiet ("quiet unless needed").
- The line changes when the next task finishes and clears when the closing feedback shows.
- Help lines (the student taps Help) still go into the chat, because the student asked for them.
- This applies to both the real lab and the test walkthrough button.

## 2. The two missing tests
- **Level names never reach the browser**: build the lesson view for the simulation step and check that it does not contain "Rebuild", "Bridge", "Stretch" or the band value anywhere. Task ids are checked too.
- **A task finishes only on a success**: a failed result is saved as evidence but does not tick the task; a success ticks it and returns the completion line; a result for a task that isn't open is ignored.
- Run all tests, then take a laptop screenshot of a finished task to show the line on the main screen and the quieter chat.

## Technical details
- `simulation-stage.tsx`: keep the completion lines in local state (`doneLines`) and stop calling `say()` for `task_result` and the walkthrough button.
- Tests in `src/server/lesson/` with a small fake database client for `getLessonView` and `simTaskDone`. If task ids contain band words (e.g. `SIM_REBUILD_T1`), the plan is to send neutral ids to the browser and map them back on the server. This changes the shared simulation contract only in how ids are mapped, not in its shape.
