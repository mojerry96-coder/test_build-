# Choose learning path: match the spec exactly

Spec = screenshot 2. Differences from today's page (screenshot 1) and the fix for each:

## Background
- **Remove the planet** at the top centre.
- **Left shape:** today's tall pale-white "B" shape that starts in from the left is replaced by the spec's large soft **light-blue blob** that runs off the left edge, from under the logo down to about 3/4 of the height, with the thin pale **swoosh** cutting across it from the left edge.
- **Flask and starburst:** move to the bottom-left corner, partly cut off by the left edge, in the same soft mint line colour.
- **Right flower:** the big soft-grey flower sits further right and runs off the right and bottom edges, lighter than today.
- **Bottom:** add the large pale dome rising from the bottom centre-right, plus the two small pale pebbles above it (one near the centre, one near the right). Remove today's single white egg at the bottom centre.
- Same shapes as the new loader background, so both pages match.

## Heading
- "Choose learning path" in the spec's rounded heavy font (the same rounded font as the splash name), deep navy, wider letter spacing, about 64px on a laptop.
- Sits a little lower: its centre about 37% down the screen.

## Buttons
- Two white pills side by side, about 280 × 90px with a ~20px gap, centred under the heading (~70px below it).
- Thin coloured outline plus a thicker solid bottom edge (~14px): blue for Auto Pilot, orange for Tutor Mode; deeper, more saturated orange than today.
- Labels in the same rounded heavy font, navy, ~28px.
- Hover lift, tap press-down and tap sound stay. Auto Pilot opens Ask Fiti; Tutor Mode still does nothing.

## Header
- Logo and Dark mode pill stay where they are; Dark mode pill a touch smaller, as in the spec.

## Other sizes and dark mode
- Phones: heading wraps to two lines, buttons stack full width; shapes scale and stay at the edges.
- Short laptops and wide screens: same proportions, nothing overlaps.
- Dark mode: same layout, dark navy page with dim versions of the shapes, readable heading and labels.
- Checked on screen at 1433×892, phone, light and dark.

## Technical details
- `Backdrop` in `FitilaShell.tsx` gets a `variant="open"` (no side rail): no planet, left blob anchored at x=0, flask at bottom-left, dome and pebbles. Used by `choose.tsx` and the page loader; the Ask Fiti backdrop is unchanged.
- `choose.tsx`: heading/pill sizes per above, `font-splash` for heading and labels, layout offset with `pt` instead of `pb-[14vh]`.
- New/updated `--cp-*` tokens in `src/styles.css` (orange edge, shape tints) for light and dark.
