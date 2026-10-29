# Make the lesson Back button work

## What's wrong
Back on the lesson steps (warm-up, hook, Practise and others) only goes "one page back" in the browser. If she opened the lesson from a link, refreshed, or moved between steps (which all happen on one page), there's nothing to go back to, so tapping Back does nothing.

## Change
- Back always takes her to this topic's "Let's Begin" map, where she can see her stops and pick up again.
- Her progress is kept. The lesson resumes where she left off when she taps the stop again.
- It works the same after a refresh, from a shared link, and on phones.
- Back becomes a real link, so the map starts loading as soon as she hovers or presses it.

## Technical details
- `src/components/lesson/mcq/WarmupShell.tsx`: replace `router.history.back()` with a navigation to the current topic address + `/path` (built from the current pathname, same as the other map links), with a `<Link>`-style preload.
- Check other lesson-step Back buttons (`rg "history.back"` in `src/components/lesson`) and point them the same way.
