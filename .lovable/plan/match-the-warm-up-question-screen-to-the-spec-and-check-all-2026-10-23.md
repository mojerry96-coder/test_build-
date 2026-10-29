# Match the warm-up question screen to the spec and check all screen sizes

The second screenshot is the visual spec. Question wording stays as it comes from the lesson content (numbers stay orange).

## Layout to match the spec
1. **Side rail visible** on tablet/desktop (logo, New Chat, Ask Fiti, Learning Hub, ME), as in the spec.
2. **Header**: small controls top right (music, sound, Dark mode, compact Learning Streak card), sized like the spec, not the current large ones.
3. **Question**: smaller handwritten heading (about 2 lines at laptop width), centred, with a clear gap above the tiles.
4. **Answer tiles**: compact 2x2 block, about 190x75 px each at 1366 wide, small letter badge top-left, answer centred and large; tiles grouped tightly in the middle, not stretched.
5. **Check Answer**: raised blue button centred under the tiles with generous space above. "Back to the board" moves out of this area (shown as a small orange handwritten link only when relevant, below Check Answer).
6. **Hint and Ask Fiti**: small pill buttons bottom-left; the tip bubble opens just above them, compact, never covering tiles.
7. **Parrot**: bottom-right, smaller, never overlapping tiles or buttons; hidden on phone portrait.
8. **Tip mentioning a hidden graph** ("Look at Point Q") when the graph is hidden: keep the graph for that question instead, so the tip always makes sense.

## Phone and tablet
- Phone: side rail becomes the bottom tabs; tiles stack 2x2 at full width, Check Answer full width, Hint/Ask Fiti row above the tabs.
- Tablet: same as desktop, slightly smaller text.

## Extra details
1. **Fits without scrolling on laptops**: on 1366x768 and 1440x900 the top bar, question, 2x2 tiles and Check Answer all fit on screen (about 520px for the question area), so she never scrolls to tap Check.
2. **Check Answer states**: greyed out until she picks an answer; a picked tile turns orange; while checking it can't be tapped twice.
3. **Long answers and questions**: long answer text shrinks or wraps inside the tile, never spills out; long questions wrap to at most 3 lines with smaller text.
4. **Tip bubble**: the tip never covers the tiles or Check Answer; on short screens it sits beside the Hint button instead.
5. **Ask Fiti chat open**: the question block slides right and keeps the 2x2 tiles, never squashed into one column.
6. **Keyboard**: arrow keys move between A-D, Enter or Space picks, and Enter on Check Answer checks.

## Checks
Screenshots at 375x667, 390x844, 768x1024, 1024x700, 1280x720, 1366x768, 1366x852, 1920x1080, 2560x1440 in light and dark mode: no overlap, no clipping, everything visible without scrolling on laptop sizes.

## Technical details
- Warm-up stage/shell components and `src/styles.css` (clamp() sizes, tile tokens).
- Graph-hiding rule extended: hide only when the prompt has coordinates and hints don't name a point; small unit test next to the existing rule.
