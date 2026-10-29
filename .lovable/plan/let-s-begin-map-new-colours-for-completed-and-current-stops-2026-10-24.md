# Let's Begin map: new colours for completed and current stops

## What the new design shows
- **Completed stops:** green, not blue. A soft green outer ring, a white gap, a green centre with a darker green star and a white tick.
- **Current stop:** a blue centre with an orange star, an orange outer ring, and the blue "Start" pill under it (as now).
- **Locked stops:** grey with a lock (unchanged).
- **Path between stops:** stays grey everywhere, including between completed stops (today it turns blue).

## Changes
1. Completed stops switch to green: ring around `#7CC4A0`, centre `#7FC6A4`, darker star `#4E9A72` inside, white tick on top.
2. Completed path segments stay grey like the rest; the "filling" animation when she taps Let's go uses green instead of blue.
3. Current stop keeps blue centre + orange ring + orange star; the Start pill's lower edge uses a darker blue instead of the old done-blue.
4. Last stop's feather (when secure) stays as it is, on the green badge.
5. Dark mode: deeper greens that still pass our dark-mode readability check (added to the contrast test).

6. Completed stops keep a clear outline in the same green as the ring, so they read as "done" by colour and by the tick (not colour alone).
7. Check on screen afterwards at laptop and phone size, light and dark, with done, current and locked stops all showing.

## Not changing
Which stops are open, locked or done, the layout, sounds, Fiti, or anything else on the page. The header, side bar, Back and Ask Fiti already match the design.

## Technical details
- `src/styles.css`: `--path-done: #7FC6A4`, `--path-done-ring: #7CC4A0`, new `--path-done-star: #4E9A72` (+ `@theme` mapping), new `--path-next-edge` for the Start pill; dark values in `.dark`.
- `src/components/path/PathMap.tsx`: segment class always `text-path-line`; done Pebble draws the darker STAR under the tick; Start pill shadow uses `--path-next-edge`.
- Add dark pairs to `src/test/dark-contrast.test.ts`; run only that test.
