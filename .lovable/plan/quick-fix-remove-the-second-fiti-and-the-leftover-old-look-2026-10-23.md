# Quick fix: remove the second Fiti and the leftover old look

## What I found
- **Two Fitis:** the small Fiti meant only for phones also shows on laptops. A style rule that lines Fiti up overrides the "hide on bigger screens" setting, so both Fitis appear side by side.
- **Old design (pale blue panel, pink flower dots, blue swoosh):** these are already gone from the current version. Your screenshot shows an older copy of the page. I'll reload the preview and confirm that only the plain white panel shows.

## The fix
- The small Fiti shows only on phones. Laptops and tablets show just the large Fiti on the left, with his speech bubble and the "Tap me for a hint!" pill.
- Confirm the panel is plain white, with no flower dots or swoosh, in light and dark mode.
- Check at 1377x892, 820 px and phone size on a "Your turn" step.

## Technical details
- `src/styles.css`: `.qf-stage` sets `display: flex` unlayered, which beats Tailwind's layered `md:hidden`. Move the flex layout into Tailwind classes on the two wrappers (`flex items-end justify-center`) and drop `display` from `.qf-stage`. Alternatively, add `@media (min-width:768px){ .qf-stage.md\:hidden{display:none} }`. I'll go with the first option.
- Run a Playwright check with a signed-in session at the three widths to confirm one Fiti and the white panel.
