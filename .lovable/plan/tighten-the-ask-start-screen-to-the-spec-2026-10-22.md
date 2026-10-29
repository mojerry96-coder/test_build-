# Tighten the Ask start screen to the spec

## Changes
1. **Streak badge (top right):**
   - Swap the small parrot head for the thumbs-up parrot already used beside chat replies.
   - The flame sits in a soft yellow rounded square, with the "Learning Streak" label above "{n} days in a row", as in your close-up.
   - The dashed gold border and cream fill stay.
2. **Sidebar:**
   - Spacing tightened to the spec: logo, then New Chat about 50px below, Ask about 120px below that, Learning Hub about 45px under Ask.
   - The Ask icon shows as an outline, light blue on the active tile, matching the spec instead of a filled shape.
3. **Ask box:**
   - Spec proportions: 700px wide, about 140px tall with its blue bottom edge.
   - Tutor and Quiz me chips are 24px tall; the class label, mic and orange send button sit at the right.
4. **Three cards:** 222px wide and 60px tall each, 12px apart, with their icons at 34px and the title and line set as in the spec.
5. **Heading and parrot:**
   - The heading sits about 40px above the ask box.
   - The waving parrot sits at the bottom right with its top level with the cards, as in the spec, and doesn't overlap the cards on narrower screens.

## Hover and press effects
- **Practice Maths card:** lifts 2px, with a slightly stronger shadow and a pointer.
- **Science and English cards:** no hover, because they can't be tapped yet.
- **New Chat, Dark mode and send:** brighten slightly on hover, and press down onto their darker bottom edge.
- **Sidebar items:** the light blue tile fades in on hover for the item you're not on.
- **Tutor and Quiz me chips, the + button and the mic:** a light tint on hover.
- **Everything tappable:** a visible focus ring for keyboard users.
- All effects pause for people who turn off motion.

## Flags
- **English "Aa":** the spec uses a 3D "Aa" icon I don't have, so it stays drawn as text. Send the icon and I'll use it.
- **Ask icon:** if the existing Ask icon file can't show as an outline, I'll keep the current one and tell you.
- **Unchanged as agreed:** SS3, "days in a row", and the tutor name Fitila.

## Technical details
- Edit `FitilaShell` (badge, nav spacing, hover classes), `AskBox` (sizes, hover states) and `StartCards` in the Ask route.
- Hover colours come from existing `fh-*` and `hub-*` tokens; add new tokens only if one is missing.
- Check at 1920, 1440 and 1280 wide and on a phone afterwards.
