# Fix: two warm-up answers draw the same route on the grid

## Problem
In warm-up question 1 (point (3, 2)), "3 up and 2 across" and "2 across and 3 up" draw the same route: 2 across, then 3 up. The demo content gives both answers the same route. The second warm-up question (point (4, 1)) has the same mistake: its "up first" answer copies another answer's route.

## Fix
- "3 up and 2 across" will go up first: a green line 3 up the side, then a blue line 2 across, ending at (2, 3).
- "2 across and 3 up" stays as it is: blue line 2 across, then green line 3 up.
- Make the same "up first" change to the matching answer in the second question (1 up, then 4 across).
- The drawing stays the same: blue for across, green for up, one line after the other.
- Only the content changes. The answers, marking and wording all stay the same.

## Check
- Reload the demo content and run the check that no answers reach the screen.
- Add a small test that fails if two answers in the same question draw the same route.

## Technical details
- `content/packs/MTH12_09_02_01.seed.json`: option `c` `board.paths` changes from `[[2,0],[2,3]]` to `[[0,3],[2,3]]`, and in the second item from `[[1,0],[1,4]]` to `[[0,4],[1,4]]` (it starts at the origin, and PointBoard adds [0,0]).
- PointBoard already colours vertical lines as rise and horizontal lines as run, so the component doesn't change.
- New test `src/test/board-paths-distinct.test.ts` reads the pack and checks that every pair of option paths in an item is different.
- Separate open issue: "3 across and 2 down" goes below 0, which the grid doesn't show. No change to it unless you ask.
