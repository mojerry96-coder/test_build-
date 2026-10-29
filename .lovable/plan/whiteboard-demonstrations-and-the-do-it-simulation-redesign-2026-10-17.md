# Whiteboard demonstrations and the "Do it" simulation redesign

## Files received and decisions
- gradient-lab.html, 04-simulation-phone.png and 14-simulation-desktop.png have all arrived.
- **The stage shows the Gradient lab's own missions**, unchanged: 7 beginner slider tasks, 6 intermediate point-drag tasks, and 4 advanced challenges (one of each type). These match our sim_tasks one to one. The designs set only the layout (label "YOUR SIMULATION · TASK x OF y", the goal as the title, the lab filling the stage, Save and exit, the help button). The road-inspector scene in the drawings is not built.
- **Tutor panel on this step matches design 14**: the tutor's name and "AI tutor · quiet unless needed", the opening line as the first bubble, and "Ask by voice" and "Type" buttons at the bottom. "Type" opens the text box. On phones, the tutor strip sits at the bottom with the mic button, as in design 04.
- The tutor's name is read from the setting, never written into the code. The "[Tutor name]" in the design is a placeholder.
- The design's Help button sends help_requested to the tutor, who replies with that task's hint.

## Your approved additions
**board.plot shapes** (added to the content-pack guide, shared contract and pack check)
- number_line: `{ kind: "number_line", min, max, points?: [{ value, label? }], arrow?: { from, to, label? } }`
- axes: `{ kind: "axes", x: [min,max], y: [min,max], points?: [{ x, y, label? }], lines?: [{ through: [{x,y},{x,y}], label? }] }`
- line and compare: as proposed below.
- triangle: `{ kind: "triangle", from: { x, y }, run, rise, labels?: { run?, rise? } }`, drawn on the current axes.

**Also build from the status table**
- Item 2: the guided theory question uses the same whiteboard, one line per row, each line checked; the marking guide gives a mark per step. Feedback still only after all 3 guided questions.
- Item 3: a graph grid layer the student can switch on in the worksheet board (STU-39).
- Item 9: "What's wrong here?" highlights the tapped line and the tutor replies about that line. Until the AI is connected, it uses the wrong path's note if the line matches one; otherwise a guiding question from the fallback lines.

**Drawings in the starter pack, then reload** (only numbers already in the pack's scripts)
- REP_NEG_01: number line −10 to 2, point −3, arrow −3 to −8 "take away 5", then −3 − 5 = −8 and −8 ÷ 4 = −2.
- REP_COORD_01: axes −5 to 5 both ways, P(3, −2), arrows 3 right and 2 down.
- GRAD_VC2 attempt 2: axes 0–10, P(1, 2), Q(3, 8), the line, triangle from (1, 2) run 2 rise 6, then the written lines.
- GRAD_VC2 attempt 3: the same for A(2, 3), B(6, 11), triangle run 4 rise 8.
- GRAD_VC1 attempt 2: triangle run 3 rise 9 on small axes, then 9 ÷ 3 = 3.
- GRAD_VC3 attempts 2 and 3: a rising line (0,0)–(3,3) "rises" beside a falling line (0,3)–(3,0) "falls".
- GRAD_WS1 Teach me model: axes, (1, 2) and (3, 6), the line, triangle run 2 rise 4, then the written lines.

**Order**: first the simulation redesign, with screenshots, then stop. After your OK, the whiteboard work with these additions.

## Part 1: what exists today

| # | Item | Status | Where |
|---|------|--------|-------|
| 1 | Worksheet whiteboard: one line per row, maths keyboard, each line checked on the server, tick or amber "Check this line" | Built | lesson stages file (practise), parts file (maths keyboard), server line check |
| 2 | Guided theory question on the whiteboard | Not built. The guided step uses a plain answer box, so only the final answer is checked, not each line. | lesson stages file (guided) |
| 3 | Graph grid with axes, points, a line through two points | Not built. There are only fixed drawings (the hook's two paths, the placeholder lab). | hook/simulation stages |
| 4 | Number line on the board | Not built | none |
| 5 | Tutor writing on the board from cues (board.write/plot/highlight/clear) | Not built. The cue types exist in the shared contract and the content pack, but nothing on screen reads them. Scripts are shown only as chat text. | script contract |
| 6 | Steps that show the whiteboard | Worksheet only. Not shown in readiness, video, guided or exit ticket. | practise stage |
| 7 | Maths display | Plain text everywhere. No maths renderer is installed, and the LaTeX in cue args is never shown. | none |
| 8 | Pen or finger rough work | Not built | none |
| 9 | Tap a board line, "What's wrong here?" | Partly built. Tapping sends "What's wrong with this line? …" to the tutor chat and gets a general reply. The line is not highlighted and gets no answer of its own. | practise stage |

## Part 2: tutor writes on the board (build exactly as specified)

**When**
- Video checks: escalation attempt 2 (similar worked example) and attempt 3 (full working). Never on attempt 1 or a correct answer.
- Worksheet Teach me: problem 1, the tutor models the whole solution; problem 2, the tutor writes alongside the student.
- Readiness repairs: the short lesson (for example, a number line for −3 − 5 = −8).
- Asking about a line: the tutor highlights the line the student pointed at.
- Never in the exit ticket. There the board is the student's rough paper only.

**How a demonstration plays**
1. The video stays paused. The board opens in the main area beside or over the question card. On phones it takes the stage, and the question card is one tap away.
2. The lesson player plays one segment at a time: it shows the caption and runs that segment's cues at their at_ms delay.
3. Lines appear one by one with a short write-on effect, off when the phone asks for less motion.
4. Reading time per segment is about 15 characters per second, at least 1.5 seconds. Tap to skip ahead. In Phase 4 the voice word timings replace this.
5. Each segment is also added to the chat as a record.
6. After the last segment the board stays until the student answers, then closes and the step continues.

**Cues**
- board.write { latex }: a new line, shown as maths.
- board.plot: proposed shape for your approval:
  - number line: `{ kind: "number_line", min, max, point?, arrow?: { from, to } }`
  - axes and points: `{ kind: "axes", x: [min,max], y: [min,max], points: [{ x, y, label? }] }`
  - line through two points: `{ kind: "line", through: [{x,y},{x,y}], label? }`
  - rising vs falling: `{ kind: "compare", lines: [{ through, label }] }`
  These go into the content-pack guide, the shared contract and the pack check.
- board.highlight { line }: glow a student's or tutor's line.
- board.clear: empty the board before a new demonstration.

**Rules**
- Tutor lines are in the accent colour with a small parrot marker. Student lines are in ink.
- The tutor never writes over the student's work: below it on the worksheet, or on a fresh page the student can swipe back from.
- Cues are sent only when the server decides to play that script.
- Unknown cue types are ignored and logged.
- The maths renderer loads only when the board first opens.
- The board is saved with the session, so it comes back after "Save and exit".
- Board lines carry an author field (student, tutor, later instructor), so a third author can be added for Override.

## Simulation step "Do it" redesign (from your note)
1. Remove every band name (Rebuild/Bridge/Stretch) from the screen, page titles and anything sent to the browser. The student only sees "Your simulation".
2. Real Gradient lab at public/stubs/gradient-lab/index.html, marked in AGENTS.md as a temporary copy. Add embedded mode (?embed=1&level=…&task=…): hide its start screen, level switcher, top bar, own hints/feedback, "Just show me", points/streaks/scores; no local storage. It sends ready / changed / task_result / help_requested to the app and listens for init / highlight / lock / unlock / reset. Band maps to level via rule sim_band_levels; mission n = sim task n; advanced uses 4 challenges, one of each type. A task completes only on task_result success true. "Done with this task" stays only in the test walkthrough bar. If there's no ready message within 5 seconds, show a static graph and the task as text. **Needs the file (blocker 1).**
3. Layout: on desktop, no left step list on this step; the stage takes about two thirds and the tutor panel the rest. The stage shows "YOUR SIMULATION · TASK x OF y", the goal as the title, a row of ticks/dots for finished tasks, and the lab filling the rest (at least 60% of screen height). On phones, full width, with the label and goal above and the tutor strip at the bottom. **Needs designs 04/14 (blocker 2).**
4. Intro card: "Your simulation", the one-line goal and a Start button. The tutor's misconception-chosen opening line plays as the caption. The lab loads on Start.
5. Chat: a divider at every new step ("Step 4 · Your simulation"), scrolled so the step's first message is at the top.
6. End: closing feedback (what she did well, one thing to watch, link back to the two paths), then on to Practise.
7. Phone and desktop screenshots of the intro card, task 1 in progress, a completed task and the closing feedback. Then stop.

## Order of work
1. Simulation redesign (once the file and designs arrive), screenshots, then stop, as your note asks.
2. Whiteboard demonstrations (Part 2), with tests: board cues only on attempts 2 and 3, never in the exit ticket, unknown cues ignored, reading-time formula, board saved and restored.

## Technical details
- KaTeX, loaded the first time the board opens.
- Board state lives in sessions.state (server-written), with lines `{ id, author, latex, status }` and plots.
- Lab messages are accepted only from the lab's own origin and window, and checked against the shared contract.

## Suggested additions (for your OK)
- **Lab safety**: the embedded lab runs in a sandboxed frame. The app accepts its messages only from that frame, and checks each one against the shared contract. A task_result for a task that isn't open is ignored and logged.
- **Lab results as evidence**: each task_result (attempts, misconception) is saved as evidence and events, so the parent summary and routing can use it.
- **Board on phones**: on phones the board takes the stage with pinch-free sizing, and the question card stays one tap away. The board also follows the text-size setting.
- **Low-data mode**: the lab and the maths renderer load only on Start or when the board first opens. In low-data mode the lab offers the text fallback first.

## Last additions
- **The lab's own hint and win texts stay hidden**: in embedded mode the lab shows none of its hint/win lines. Hints come only from our tutor (the sim_tasks hint script, sent when the engine decides). This keeps one voice and the hidden-script rule.
- **Resume inside the lab**: "Save and exit" mid-task reopens the same task number, with completed tasks ticked.
- **Tests**: band name never in the view sent to the browser; a task completes only on task_result success; messages from any other window are ignored; the 5-second fallback appears when the lab is silent.

## Layout sample

Desktop (design 14 layout, lab content)
```text
+----------------------------------------------------------------------------------+
| Gradient of a line     [Ready][Hook][See][DO][Practise][Guided][Exit][Reflect]  [Save and exit] |
| Step 4 of 8 · Do                                                                 |
+-----------------------------------------------------+----------------------------+
| YOUR SIMULATION · TASK 1 OF 7               [Help]  | (parrot) <tutor name>      |
| Make the line climb uphill                          | AI tutor · quiet unless needed |
| (v) ( ) ( ) ( ) ( ) ( ) ( )   <- task dots          |----------------------------|
| +-------------------------------------------------+ | -- Step 4 · Your simulation --|
| |                                                 | | [Before you start, remember: |
| |            GRADIENT LAB (embedded)              | |  change in y goes on top.]   |
| |   graph + sliders / draggable points            | |                            |
| |   at least 60% of screen height                 | |                            |
| |                                                 | |                            |
| +-------------------------------------------------+ | [Ask by voice]  [Type]     |
+-----------------------------------------------------+----------------------------+
   about two thirds                                       about one third
```

Phone (design 04 layout)
```text
+------------------------------+
| <  Gradient of a line   (?)  |
|    Step 4 of 8 · Do          |
| ■■■■ ■■■■ ■■■■ ▬▬▬▬ ---- ... |
+------------------------------+
| YOUR SIMULATION · TASK 1 OF 7|
| Make the line climb uphill   |
| (v)( )( )( )( )( )( )        |
+------------------------------+
|                              |
|   GRADIENT LAB (full width)  |
|                              |
|                              |
+------------------------------+
| (parrot) Before you start,   |
| remember: change in y goes   |
| on top.               (mic)  |
+------------------------------+
```

Intro card (before Start), shown in the stage area
```text
+-----------------------------------------+
|  Your simulation                        |
|  Shape lines and see how the gradient   |
|  changes.   <- goal of the activity     |
|                                         |
|              [ Start ]                  |
+-----------------------------------------+
caption: the tutor's opening line
```

Closing feedback (after the last task)
```text
+-----------------------------------------+
|  Nice work                              |
|  You did well: <from her evidence>      |
|  One thing to watch: <misconception>    |
|  Remember the two paths: <hook link>    |
|              [ Continue to Practise ]   |
+-----------------------------------------+
```
