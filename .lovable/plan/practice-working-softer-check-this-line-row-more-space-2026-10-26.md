# Practice working: softer "Check this line" row, more space

1. **Remove the outline.** When a line needs checking, the row keeps its soft amber fill and the "Check this line" icon and words, but loses the brown border and the dark edge under it. The other lines keep their normal light border.
2. **More space.**
   - Between the "Your working" heading row (with Undo / Clear) and the first line.
   - Between the amber row and the message under it ("This doesn't follow from the line above…").
   - Between one line and the next.
   - The message lines up with the line's text and has a little more room inside.
3. Works the same in dark mode. The amber colour plus the warning icon still mark the line, so it's clear without the outline.
4. **Show students how to answer.** Before the first line is written, the empty working area shows a short guide: "Write one step per line, like 7 − 1 = 6, then press Check this line." The example uses the numbers from the current problem's first step, so it never gives away the final answer. The guide disappears once she writes her first line. The wording is a new approved line in the content pack, not built into the screen.

## Technical details (guide)
- New fallback line `practice_how_to` with a `{first_step}` slot, filled on the server from the item's first worked-solution line (left side only, e.g. "7 − 1"). Seeded via the pack, then loaded with the seed loader.
- The lesson view sends it with the practice item. `PractiseStage.tsx` shows it in the empty `ol` when `lines.length === 0`.

## Technical details
- `src/components/lesson/PractiseStage.tsx` line ~338: for `status === "check"` use `border-transparent bg-ans-warn-bg` and drop the `cel-warn` edge (keep `border-2` so rows don't shift). `selected` ring unchanged.
- `ol` `mt-2 space-y-2` becomes `mt-4 space-y-3`. The message `<p>` `mt-1 px-1` becomes `mt-2 px-4 leading-snug`.
