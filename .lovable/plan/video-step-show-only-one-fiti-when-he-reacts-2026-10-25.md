# Video step: show only one Fiti when he reacts

## The problem
After an answer on a video question, two Fitis show side by side: the page's Fiti plays the sad clip, while the video's own Fiti plays his reaction in the same corner.

## The fix
- On the video step, only the video's own Fiti reacts to answers (cheer, surprised, sad), the way the video team built it.
- While that reaction plays, the page's Fiti hides, then comes back in his usual thinking pose when it ends.
- Every other step stays as it is: the page's Fiti plays sad and celebration there.

## Check
- On a video question, a wrong then a right answer each show a single Fiti, in light and dark mode at your laptop size.

## Technical details
- `WarmupShell`: add a `noReact` prop to `Parrot` so it ignores `fiti:sad` / `fiti:cheer`. `LessonScreen` passes it on the video step.
- `FlowVideoStage`: while `reaction` is set, dispatch `fiti:hide` (and `fiti:show` when it clears); the shell parrot sets `opacity-0` meanwhile.
