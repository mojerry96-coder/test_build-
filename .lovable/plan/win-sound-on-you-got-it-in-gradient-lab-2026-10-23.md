# Win sound on "You got it!" in Gradient Lab

Today the right-answer sound waits for our server to mark her answer, so it can come late or after the box has gone, and it is the small win sound.

## What she will hear
- The moment the lab's "You got it!" box opens, she hears the balafon win (the rising C-E-G-C phrase with the drum), and the music lifts briefly.
- One sound per question: the delayed small win after our marking no longer plays, so there is no double sound.
- "Not quite" stays as it is. It follows the sound button, and stays silent in classroom sessions and low-data mode.

## Technical details
- In `lab-v2-reader.ts`, watch the frame's page for a new `.modal` whose text has the `success` class (the lab's own "You got it!" box), and call back once per box. This is read from outside only; the lab files stay untouched.
- `GradientLabV2Stage.tsx`: on that callback play `big_win` and run `musicLift()`; remove the `small_win` on a "nod" result. Lesson-finished `react.big()` is unchanged.

# Music in Gradient Lab

Taps inside the lab don't reach our page, so the music thinks she has been idle and stops after 2 minutes. It also never starts if her first tap of the visit was inside the lab.

- Taps and key presses inside the lab count as activity, so the music keeps playing in the calmer lesson mood, under the lab's read-aloud.
- Technical: in `dressV2`, pass the frame's `pointerdown`/`keydown` on to our page (a new `noteActivity()` export in `src/lib/music.ts`, which also unlocks audio).
