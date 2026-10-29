# Hook screen: centre the chart and question, remove the step line

## What changes
- Remove the "Gradient of a line · Hook" line and its row of step dots under Back (your second screenshot).
- Keep the chart on the left and the question with its answers on the right, but centre the pair on the page: equal space on both sides, and the pair sits in the middle of the screen from top to bottom instead of hugging the top.
- The question, answers and "Not sure? Watch the video" stay lined up with each other inside the right column.
- Phone and narrow screens keep stacking (chart on top, question below), centred.

## Technical details
- `src/components/lesson/HookStage.tsx`: delete the step-label/dots block (lines ~212-217); make the wrapper `flex min-h-[calc(100dvh-180px)] items-center justify-center`; the grid becomes `mx-auto w-fit max-w-[1180px]` with `@[860px]:grid-cols-[minmax(0,620px)_minmax(0,480px)]` so both columns hug their content and the whole pair is centred.
- Design-only.
