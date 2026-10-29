# Simulation finished: "Time to practice" screen (match spec 2)

Replaces the "Your simulation · done" page (screenshot 1) with the spec (screenshot 2).

## What she sees
- Same bare Fiti page as the warm-up, Hook and video: uLesson logo, Dark mode button, her name, soft background shapes. No breadcrumb, no page title, no side chat panel.
- One large white card with rounded corners (about 32 px), the orange-to-yellow bottom edge, soft pale shapes inside, and an X at top right.
- Centred heading in the bold hand-written font, navy, about 56 px on laptop: "Time to practice what you've learnt" (wording read from content, with this as the fallback).
- Fiti thinking pose (hand on chin, glasses) in the middle, about 320 px tall.
- Centred "Let's Practice" pill, light blue with darker blue bottom edge, white text, about 260 x 64 px. Moves on to the worksheet exactly as today.
- X closes back to the topic map, same as the close on other steps.

## What happens to today's summary
- "What you did well", "One thing to watch", the hook reminder and the closing line are no longer on the card. Fiti says them in his chat bubble and voice when the screen opens (approved lines only, same as now), so nothing is lost.

## Also
- Dark mode: card dark navy with the same gradient edge, heading white, button stays blue and readable; readability check added.
- Phone: card full width, heading about 32 px, Fiti about 200 px, button full width, no scrolling.
- Fiti fades/scales in (reduced motion: instant); button tap guarded against double taps, shows loading while moving on.
- Ask Fiti button bottom-left, same as the other bare steps, so she can still ask a question.
- Keyboard: focus lands on "Let's Practice"; Enter starts, Esc works like the X. The heading is read out to screen readers.
- Reload on this screen returns to it, not back into the simulation.
- Fiti's voice says the summary once; it stops if she taps the button or the X.
- Small celebration (the warm-up's) as the card opens, since she just finished the lab.
- Laptop 1377x892: whole card fits without scrolling.
- Check: screenshots light and dark, laptop and phone, next to the spec.

## Technical details
- `SimStage.tsx` `!current` branch: new centred card using `WarmupShell noHint` (like hook/video) and existing `.vl-card`, `font-hand-bold`, `.vl-cta` tokens; thinking still from existing tutor assets.
- Heading label from a `sim_practice_title` fallback line added to the seed pack (falls back to the text above). Closing/did_well/watch/hook_link lines go to the tutor bubble.
- Add dark pair to `src/test/dark-contrast.test.ts`; run that test only.
