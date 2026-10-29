# Close the gap between the side bar and the left background shape

## What's wrong
On bigger screens, the soft shape on the left of the background drifts away from the side bar and leaves an empty strip between them. The background is stretched to fit the screen, so the wider the screen, the further the shape moves right. The side bar stays the same width.

## Change
- The left shape always starts right against the side bar's edge, on every screen size from laptop up to very wide screens.
- Its size and curve stay the same. Only its position changes.
- The flask drawing below it moves with it, so they stay together.
- Phones are unchanged (the shape is already hidden there). Light and dark mode both get the fix.

## Technical details
- `src/components/home/FitilaShell.tsx` `Backdrop`: move the left shape (and the flask) out of the full-screen scaled SVG into a second SVG pinned with `left: var(side-rail width)`, `top: 0`, using `preserveAspectRatio="xMinYMin meet"`, with the path re-based so its left edge sits at x=0 and its height scales with the screen.
- Use the same side-rail width value the shell already uses, so they can't drift apart.
