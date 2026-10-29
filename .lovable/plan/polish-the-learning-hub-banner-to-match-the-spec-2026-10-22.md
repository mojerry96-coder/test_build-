# Polish the Learning Hub banner to match the spec

## Gaps against your spec
- **Parrot:** in the spec it sits inside a soft lighter-blue circle, with a thin ring arc behind its head, and is fully framed. Ours is pushed to the far right edge, the circle is cut off, and the ring is barely visible.
- **Background:** in the spec the banner goes from deep navy on the left to brighter blue on the right, with a gentle sheen. Ours is a flatter mid-blue.
- **Maths symbols:** in the spec the small x², π and triangle are faint but visible, and the glass X has a crisp, glassy "2". Ours are very faint, and the "2" looks like plain text.
- **Text block:** the spec heading is slightly larger, with tighter line spacing. The line under it is brighter, and the button sits closer to that line.
- **Button:** in the spec the Continue Learning button is white with a navy edge underneath. Ours has a weak edge and no hover lift.

## Changes
1. **Parrot:**
   - Move it in from the edge so its whole wing shows, about 6% of the banner width from the right.
   - Place it on a full soft circle (lighter blue, faint inner glow) with one thin ring arc behind it, as in the spec.
   - Its height stays tied to the banner height, so it never crops.
2. **Background:** a deeper navy-to-bright-blue gradient with a soft diagonal sheen, all as theme colours.
3. **Symbols:**
   - The small x², π and triangle are made a little more visible, at about 20%.
   - The glass X is sharpened, with its "2" in the same glassy light blue, tucked against the top-right of the X.
4. **Text:**
   - Heading about 8% larger, with tighter line spacing.
   - The subtitle at 90% white.
   - Even spacing between heading, subtitle and button.
5. **Button:** a solid navy edge underneath. On hover it lifts by 2px; when pressed it presses down. Reduced-motion users see no lift.
6. **Fit:** the banner keeps its current height, so the whole Hub page still fits without scrolling at 1280×720 and up. On phones the parrot is hidden and the text is full width.

## Check
One screenshot of the banner at 1377 and 1920 wide, compared with your spec.

## Technical details
- In `learning-hub.tsx` `Banner`: replace the decorative circle with a positioned wrapper (`right-[6%]`, `aspect-square`, `h-[118%]`) holding a radial-gradient circle plus a ring `border`, with the parrot inside, bottom-aligned.
- Add tokens `--hub-banner-sheen` and `--hub-banner-circle` in `src/styles.css` (light and dark).
- Raise symbol opacity from 15% to 20%; render the X superscript as a text-gradient span.
- Use the `hub-cta-edge` shadow at 5px, with `hover:-translate-y-0.5` and `motion-reduce:transform-none`.
