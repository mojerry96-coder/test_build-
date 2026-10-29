# Make Back work on the video step

## What she'll see
Tapping **Back** on the video step takes her straight to the "Let's Begin" map for this topic, same as on the other steps. The video pauses as she leaves, and coming back later carries on where she left off (the frozen-video fix from earlier still applies).

## Steps
1. **Find the cause.** The button is on the page and is set up to open the map. The likeliest cause is that something on the video step sits on top of it and catches the tap: the video area, its moving background, or the leftover "Watch, Choose, Learn" overlay. I'll confirm this in the app by checking what actually gets the tap at the Back button's position.
2. **Fix it.** Keep Back above everything on the video step, and make sure nothing see-through on top of it catches taps. If the cause turns out to be the map link itself, fix the link.
3. **Check.** On laptop, short laptop and phone, in light and dark mode: tap Back while the clip plays, while a question is open and on the opening screen. Each time the map should open in one tap, with no double navigation.

## Technical details
- Back is in `src/components/lesson/mcq/WarmupShell.tsx` (`relative z-10`, `router.navigate({ href: mapHref() })`).
- The video step renders `FlowVideoStage` (`relative` stage, `-z-10` parallax layer, fixed `VideoIntro` overlay). Use Playwright `document.elementFromPoint` at the button's centre to find what covers it.
- Likely fix: raise Back to `z-40`, and/or add `pointer-events-none` to the non-interactive stage wrapper, keeping the player controls clickable.
