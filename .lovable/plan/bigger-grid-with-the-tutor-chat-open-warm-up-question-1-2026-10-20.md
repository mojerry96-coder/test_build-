# Bigger grid with the tutor chat open (warm-up question 1)

## What changes
- When the tutor chat is open, the lesson card is narrower. The grid still gets most of the space and the choices stay in a slim column.
- The choices column stays between about 260 and 360 px wide whether the chat is open or closed. The grid takes all the remaining width.
- "Check Answer" stays under the choices and matches their width.
- The grid can still be up to about 460 px tall, so everything fits on one screen.
- Phones are unchanged.

```text
chat open:
+-------------------------------------------+  +---------+
| Question text                             |  | Fitila  |
| +-------------------------+  +----------+ |  | chat    |
| |          grid           |  | choices  | |  |         |
| |      (most of width)    |  | 260-360px| |  |         |
| +-------------------------+  | [Check]  | |  |         |
|                              +----------+ |  |         |
+-------------------------------------------+  +---------+
```

## Technical details
- `src/components/lesson/WarmupStage.tsx`, `QuestionBody` board layout: change the columns to `lg:grid-cols-[minmax(0,1fr)_clamp(260px,32%,360px)]`, so the choices width no longer depends on whether the chat is open.
- No changes to how answers are marked, the chat logic or the content. No screenshots.
