# Fiti's head no longer cut off in the answer pop-up

## The problem
In the "Good Job!" / "You got close!" pop-up, Fiti sits inside a round frame that is zoomed to fill the circle. The circle's edge cuts across the top of his head and glasses (and his feet).

## The fix
- Drop the round crop: Fiti shows whole, standing on the white card like your design, with his full head, glasses and feet visible.
- Keep him the same visual size (about 150 px tall on laptop, 120 px on phone) with a little breathing room above his head.
- Same for both the celebrating and the thinking Fiti, in light and dark mode.

## Technical details
- `src/components/lesson/WarmupPopup.tsx`: `LiveTutor` gets `fit="contain"` and loses `overflow-hidden rounded-full`; the box becomes `h-[130px] w-[110px] sm:h-[160px] sm:w-[136px]`.
- Design-only.
