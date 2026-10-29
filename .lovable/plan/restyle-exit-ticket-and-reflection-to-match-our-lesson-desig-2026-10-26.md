# Restyle Exit ticket and Reflection to match our lesson design

Both pages still use the plain default cards and wide grey button. They will get the same look as Warm-up, Practise and Prove it.

## Exit ticket (step 7)
- Same page background, fonts and heading style as Warm-up / Prove it.
- Intro "On your own now" becomes the blue-bordered card with the solid blue bottom edge (hook-board style).
- Each question: multiple choice uses the A–D answer tiles from Warm-up; written questions use the Practise worksheet (graph left when the question has points, working + keypad right).
- "Hand in" uses our shorter blue CTA, not the full-width grey bar.
- Still no hints, no Fiti, no alerts, no marks shown until hand-in (rules unchanged).

## Reflection (step 8)
- Question card in the same rounded blue-edge card, handwritten heading font, soft text box styled like the Practise working area.
- Waving Fiti beside the card (animated, still image in low-data / reduced motion).
- "Finish lesson" uses the shorter blue CTA.
- Summary after finishing: "You did well" / "Watch next time" in matching cards; red feather card in our reward colours with celebration Fiti; "Back to subjects" as the blue CTA.
- "This lesson is complete" screen restyled the same way.

## Both
- Dark mode readable (AA), laptop and phone fit.
- No wording or behaviour changes; all words stay from content.

## Technical
- Edit `ExitStage` and `ReflectStage` in `src/components/lesson/stages-b.tsx`, reusing `WarmupOptions`, `TwoPointGraph`, keypad/`QF_OUTLINE` from Prove/Practise, `WavingFiti`, and `fh-*` tokens. No server changes.
