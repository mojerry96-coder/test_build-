# Warm-up question: no graph, centred, one Check Answer. Map taps respond instantly.

## What I found
- **Old layout is still showing.** The question already gives the point (3, 2), so the graph should be hidden. But the hide rule also looks at any hint she has already opened. If that hint names a point (like "point P"), the graph comes back and the page switches to the old side-by-side layout.
- **Two Check Answer buttons.** In the quick fix, the page behind the whiteboard draws its own greyed-out Check Answer. The normal button area can also appear under the answers, so two buttons show up.
- **Slow map tap.** On the Let's Begin map, tapping Start waits until Fiti has finished typing her chat lines. Only then does the path start filling and the sound play, so the tap feels dead for a second or more.

## Changes
1. **No graph on this page.** Warm-up questions no longer show the graph card. The question sits at the top, centred, with the four answer cards in a centred 2x2 below it, as on questions that have no picture. The graph still appears where it teaches something: in Fiti's "Here's how it works" and on the quick-fix whiteboard.
2. **One Check Answer.** There is exactly one Check Answer, centred under the answers. On phones it stays in the bottom bar. The extra greyed-out copy behind the quick fix is removed.
3. **Instant map response.** Tapping a stop plays its sound, bounces the stop and starts the path filling straight away. Fiti's chat lines carry on alongside it. Opening the lesson still waits for the fill animation, the same as now. Locked stops show their message and play the soft "not yet" sound at once.

## Technical details
- `WarmupStage.tsx` `QuestionBody`: drop the `board` branch (side-by-side grid + `PointBoard` + inner actions) for warm-up/quick-fix question bodies. Always use the centred layout. Keep `PointBoard` only inside `WorkingBox` and the whiteboard. Remove the line-319 disabled button. Show the shared `actions` wrapper (line 352) on md+ with no `hideGraph` condition, so there is one desktop button and one mobile bar.
- `$topic_.path.tsx` `go()`: call `setFilling` + `playSound("stop_done")` synchronously before chaining onto `queue.current`. Navigation stays behind the fill wait plus the prefetch race. `onStop` locked: play the existing soft sound immediately.
- `PathMap.tsx` `tap`: bounce every tapped stop (not only done ones) right away.
- Run the existing path/warm-up tests that cover these files only.
