# Current-card motion and tutor helper on the right

## 1. Gentle motion on the current card
- Choose a chapter: the card marked "Current" gets a slow, continuous motion. Its picture panel has a soft light sweep across it, about every 6 s. The ring behind the symbol "breathes" slightly (scale 1 to 1.04, opacity 0.6 to 1). The card itself floats about 2 px up and down over 4 s.
- Choose a quest: the open quest card gets the same motion on its picture panel and ring.
- Locked cards stay completely still.
- Only transform, opacity and background-position change, so nothing on the page moves out of place. Hover, press and keyboard focus still work, and the float pauses while the card is hovered or pressed.
- With "reduce motion" switched on in the device settings, all of this motion is off.
- Works in light and dark mode: the sweep uses a token (`--card-sheen`), so its colour has a light value and a dark value.

## 2. Tutor helper on the right side (matches your second picture)
- On Home, Choose a chapter and Choose a quest, the parrot and its speech bubble sit fixed on the right edge of the screen, level with the cards and vertically centred in the visible area. They stay in place while you scroll.
- The parrot overlaps the edge of the right-hand card column slightly, as in the picture. The bubble sits to its left, and the "Ask [tutor]" pill sits at the parrot's feet.
- The bubble keeps working as it does now: close (X), "Tap me for another tip", and closing stays remembered for the visit.
- Tablet and phone: only the "Ask" pill shows, fixed at the right edge above the bottom tabs, so it never covers a card's button.
- Lesson pages don't show it (they already have the tutor panel). The tutor's name still comes from the setting, never typed into the page.
- The old in-page and gutter placements are removed, so the helper has one position rule.

## 3. Top bar on wide screens
- From 1440 px up, the logo and profile line up with the page content edges, so they no longer drift out to the screen edges. At 2560 px they sit above the edges of the centred content.
- The profile looks as it does in your picture: a round grey circle with the initial, then the first name beside it, sitting at the right end of the row and centred top to bottom in the bar.
- Below 1440 px nothing changes. The menu stays centred, and height, underline, shadow and focus rules stay as they are.

## 4. Gaps added
- Motion stops when the tab is hidden, and plays at most once per screen for the sweep, so it stays calm and saves battery on budget phones.
- When a search filters the current card out, nothing else starts moving.
- Keyboard order: the tutor helper comes after the cards, so Tab never jumps to it first. Screen readers read the bubble once, not on every tip.
- Short screens (under 700 px tall): the bubble is hidden and only the parrot and pill show, so it never covers cards. The bubble also hides when it would overlap the search box.
- 200% text zoom: the bubble wraps its text and never hides behind the parrot.
- Dark mode: the bubble keeps its always-white look, and its edge and shadow stay visible on navy.
- Top bar at in-between widths (1440 to 2560): logo and profile stay level with the content at every width, with no jump at a breakpoint.
- Long first names are cut off with "…" after about 12 letters, so the profile never pushes into the menu.

## Checks
- Screenshots at 1280, 1440 and 1920 wide plus phone, in light and dark mode, while scrolled, to confirm the helper stays put and covers no "Enter Quest"/open-card button.
- Confirm locked cards don't move, and nothing moves with reduced motion on.
- All existing tests still pass.

## Technical notes
- `ChapterParts.tsx` (`ch-card-current`) and `QuestParts.tsx` (`q-card-open`): add the keyframes `card-float`, `card-sheen` and `ring-breathe` in `src/styles.css`, all under `@media (prefers-reduced-motion: no-preference)`.
- `TutorHelper` in `HomeParts.tsx`: `position: fixed; right; top: 50%; translateY(-50%)` from xl up, with the right offset computed from the `nav-container` edge (`max(16px, (100vw - container)/2 - overlap)`); remove the `gutter` prop and its call sites; below xl, fixed pill above `BottomTabs`.
- Add both tasks to roadmap.md.

## Your question
The model behind this chat isn't something I can confirm from here. Lovable picks and routes it.
