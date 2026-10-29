# Make the warm-up question screen match the spec (screenshot 2)

Screenshot 1 is the screen after a not-quite answer (the quick-fix state). Screenshot 2 is the spec. Every state of this question uses the spec's layout.

## Layout sample (laptop, about 1377 x 892)
```text
+--------+----------------------------------------------------------------+
| [logo] |                         (music)(sound)(Dark mode)[Streak card]  |
|        |  <- Back                                                       |
|[+ New  |                                                                |
|  Chat] |        Imagine you see the point (3, 2). Which number          |
|        |        tells you how far across and how far up?                |
| Ask    |                                                                |
| Fiti   |                  +-----------+  +-----------+                  |
|        |                  | A    3    |  | B    6    |                  |
|Learning|                  +-----------+  +-----------+                  |
|  Hub   |                  +-----------+  +-----------+                  |
|        |                  | C    4    |  | D    2    |                  |
|        |                  +-----------+  +-----------+                  |
|        |                                                                |
|        |                     [   Check Answer   ]                       |
|        |                     Back to the board  (only after not-quite)  |
|        |  +- tip bubble (when open) -+                          parrot  |
|        |  [Hint] [Ask Fiti]                                     (o>     |
|  (ME)  |                                                                |
+--------+----------------------------------------------------------------+
```

Phone:
```text
+------------------------------+
| <- Back      (Dark)(streak)  |
|  Question, centred, 2-3 lines|
|  +--------+  +--------+      |
|  | A   3  |  | B   6  |      |
|  +--------+  +--------+      |
|  | C   4  |  | D   2  |      |
|  +--------+  +--------+      |
|  [     Check Answer     ]    |
|  [Hint]  [Ask Fiti]          |
|  Home | Ask | Hub | Me (tabs)|
+------------------------------+
```

## What changes
1. **Side menu**: always shown on the left (logo, New Chat, Ask Fiti, Learning Hub, ME), including after a not-quite answer. In screenshot 1 it is missing. I'll find out why first, then fix it.
2. **Top right**: music, sound, Dark mode and the Learning Streak card stay, all at the spec's small size (Dark mode pill about 44 px tall, compact streak card), in one tidy row with even gaps, lined up with the spec's top-right spacing.
2b. **Back link**: a "← Back" link at the top-left of the content, below the top bar, as in the third screenshot. It takes her back to the topic's Let's Begin map, which is the page she came from.
3. **Question**: smaller and lower, with clear space under the top bar, centred over two lines. Numbers stay orange.
4. **Answer tiles**: a compact 2x2 block, about 270x110 px at this width, centred under the question. Short answers like "3" show big and handwritten. Longer answers like "3 across and 2 up" use a smaller font and still fit in the same tile size.
5. **Check Answer**: always shown under the tiles, centred, raised blue, at the spec's size. After a not-quite answer it stays in place, and "Back to the board" sits under it as the small orange link.
6. **Hint and Ask Fiti**: the spec's smaller outlined buttons, bottom-left beside the side menu.
7. **Tip bubble**: narrower (about 420 px), smaller text, sitting just above Hint, never under the tiles.
8. **Parrot**: bottom-right at the spec's size, with no question mark unless she's thinking.
9. **Background**: the planet and flask decorations from the spec are shown on this screen.

## Checks
- Open the lesson as a signed-in student at 1377x892 (your screen), plus 1280x720, 1920x1080 and phone. Compare each state (answering, after a not-quite answer, with the tip open) against screenshot 2.

## Technical details
- Diagnose the missing rail: check whether the quick-fix state renders through `WarmupShell`/`FitilaShell` or another wrapper, and pass the same shell props in every state.
- `WarmupShell.tsx`: drop `hideDecor`, resize the buttons and tip pill, and adjust the parrot's position.
- `WarmupStage.tsx`: tiles are a fixed `grid-cols-2` with max-w ~560 px and min-h ~110 px. Check Answer renders in quick-fix too (disabled), and the board link sits below it. Question gets a top margin.
- `FitilaShell.tsx`: add a `compactHeader` prop for this screen.
