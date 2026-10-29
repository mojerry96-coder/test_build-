# Topic intro page: tighten to the spec

Target: your latest screenshot of the "Welcome to …" page. Applies to light mode only (intro stays light-only).

## 1. Page width and fit
- Widen the page so the welcome card and tutor panel use the same outer margins as the top bar (about 1690 px at full width, scaling down).
- Tutor panel wider (about 450 px on large screens, 340 px on laptops, 300 px on tablet).
- Welcome card and tutor panel are exactly the same height and end together; on a laptop screen (about 900 px tall) the whole page fits without scrolling.
- Tighter gaps: breadcrumb to title, title to cards, as in the spec.

## 2. Welcome card
- Hero parrot circle slightly larger (about 145 px), more space above it.
- Heading and both paragraphs at the spec size and line height, centred, max width about 660 px.
- Skill chips: three in one row on laptop and up, each name on one line with no cut-off; chips wider with the number tile on the left. On tablet they stack one per row so names stay whole.
- I'm Ready button wider (about 590 px) and taller (about 52 px). Kept dark text on the blue, because white text on that blue fails readability.

## 3. Tutor panel
- Header on one line: avatar, tutor name (from the setting, "Your tutor" until set), mode switch, minimise, close. The small "AI tutor" line under the name goes; the "AI" label stays on the avatar for screen readers, so the tutor is still labelled as AI.
- Mode switch uses your two new icons: the messenger icon for text mode (selected, white tile) and the speaker icon for voice mode.
- Opening bubble and parrot sized and spaced as in the spec.
- Ask box: taller pill (about 52 px) with more side space, mic and round send button as shown.
- Same panel is used in the lesson, so the lesson picks up these changes too.

## 4. Checks
- Screenshots at 1440x900, 1920x1080, 1024 and 768 wide, and phone (bottom strip unchanged).
- Confirm no page scroll at 1440x900, card and panel bottoms line up, skill names are whole.

## Open point
- The spec's ask box says "Ask about anything....". The wording agreed earlier is "Ask your tutor a question...". I'll keep the agreed wording unless you tell me to switch.

## Technical details
- Upload `SpeakerHigh_1.png` and `messenger.png` with lovable-assets to `src/assets/tutor/` and use them in `TutorChatPanel` mode buttons (masked with a token colour so they follow the theme).
- Intro route: `max-w` change, grid columns `md:300px / lg:340px / 2xl:450px`, card/panel height `calc(100dvh - top offset)` with a minimum, chip grid `lg:grid-cols-3` with `whitespace-nowrap` at `xl`.
- No changes to data, routes or server code.
