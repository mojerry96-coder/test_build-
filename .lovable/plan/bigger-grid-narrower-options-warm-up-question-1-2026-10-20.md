# Bigger grid, narrower options (warm-up question 1)

## What changes
- The grid fills its side of the card. Right now a width limit keeps it small no matter how wide its space is, which is why the last change had little effect.
- The grid gets about 60% of the card's width and the answer choices about 40%. The choices stay single-column, up to about 420 px wide.
- "Check Answer" stays under the choices and matches their width.
- On a computer the grid can be up to about 460 px tall, so everything still fits at 1280 × 720.
- Phones stay as they are: grid on top, choices below.

## Technical details
- `src/components/lesson/WarmupStage.tsx`, `PointBoard`: remove the `lg:max-w-[360px]` limit on the figure (use `lg:max-w-none`). Raise the svg limit to `lg:max-h-[460px]`.
- `QuestionBody` with a board: set the columns to `lg:grid-cols-[minmax(0,1.6fr)_minmax(0,420px)]`.
- No changes to how answers are marked or to the lesson content. No screenshots.
