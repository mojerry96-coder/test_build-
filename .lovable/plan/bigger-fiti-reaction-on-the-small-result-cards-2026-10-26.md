# Bigger Fiti reaction on the small result cards

## What changes
- On the small "You got close!" and "You got it!" cards, Fiti's sad and cheering reactions become about 1.6x bigger, so he's clearly visible. Right now he looks tiny because the clip has empty space around him.
- The quick-fix "You got close" / "You got it" cards get the same bigger Fiti, so all of them match.
- The card grows only a little. The title, the line, "Let's fix it" and "Skip for now" stay fully visible on laptops and phones, with no scrolling inside the card.
- Same on short laptop screens and in dark mode. The still picture used in low-data / reduced-motion mode gets the same size.
- The "Let's Begin" Quick Check card is not changed.

## Technical details
- `src/components/lesson/WarmupPopup.tsx`: stop using the shared `SPEC.fiti` height for the reaction. Use its own height `h-[clamp(120px,20vh,180px)]` and `scale-[1.25] origin-bottom` to trim the clip's empty space, with a small negative top margin so the gap above the title stays the same.
- `src/components/lesson/whiteboard/QfCards.tsx`: raise the reaction from 150px to `h-[clamp(150px,22vh,200px)]` with the same trim.
- `SPEC.fiti` in `WelcomeCard.tsx` stays unchanged so the Quick Check card keeps its look.
- Check at 1377x892, a short laptop and phone width that the card fits without scrolling.
