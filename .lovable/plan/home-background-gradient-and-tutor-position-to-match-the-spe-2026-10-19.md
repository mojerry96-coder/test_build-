# Home background gradient and tutor position to match the spec

## 1. Page background (light mode)
- Use your exact gradient: `radial-gradient(116.47% 138.96% at 85% 5%, rgba(31,151,216,0.07) 0%, rgba(31,151,216,0) 25%), #F5F8FA`.
- It goes into the light-mode tokens, so every navigation page that uses the page background gets it. Dark mode keeps its current glow.

## 2. Tutor position (measured from the spec, 1440 px frame)
- Parrot: about 145 px wide. Its right edge sits about 50 px past the right edge of the cards, and its feet are about 100 px above the bottom of the screen. That puts it level with the 2nd and 3rd card rows on a 1440×975 screen.
- Bubble: about 205 px wide with smaller text (the 13 px name line, 14 px bold message, 12 px tip link), as in the spec. Its top sits just above the parrot's head and its right edge tucks slightly behind the parrot's raised wing, so it overlaps the Economics/Literature column.
- "Ask [tutor]" pill: centred under the parrot's feet, slightly to the right, as in the spec.
- It stays fixed while scrolling (as agreed last time), measured from the bottom of the screen, so on any height it keeps the same spot beside the lower cards.
- On wider screens it follows the content's right edge. On short screens the bubble still hides. Tablet and phone stay pill-only.

## 3. Top bar, matched to your second picture (1440 px frame)
- Logo about 97 px from the left edge and profile about 80 px from the right. Both sit slightly outside the card edges, not flush with them, and the row stays centred on wider screens (about 1265 px wide).
- Active "Home": blue icon and text, with no underline beneath it. The other items stay grey, with the same 24 px gap between items as in the picture.
- Profile: a plain light-grey circle 28 px across, with the full name in dark semibold beside it.
- The bar is white, with no visible bottom line, and the page's soft gradient starts right under it.

## 4. Other differences found in the spec
- Banner: faint maths symbols (π, x², a small triangle) behind the text, as on the chapter banner. The label reads "Step x of 8 completed", and the bar fill is green.
- Profile name: the spec shows first and last name ("Amaka Kingsley"). We show the full name when we have it, cut off with "…" if it's long.
- Conflict to note: the earlier layout rules asked for a 2 px underline under the active menu item, but this picture has none. This plan follows the picture and removes it on every page.
- Dark mode keeps its own glow and colours. Only the positions and the removed underline carry over.

## Check
- A 1440×975 screenshot laid over the spec to compare the parrot, bubble and pill positions, plus a screenshot at 1920.

## Technical notes
- `src/styles.css`: replace the light `page-glow` background with the given gradient (`--page` #F5F8FA). `.tutor-fixed` becomes `bottom: 100px; right: max(16px, calc((100vw - 1130px)/2 - 50px))`, with no `top`/`transform`.
- `TutorHelper` in `HomeParts.tsx`: the bubble becomes `w-[205px]` at `right-[110px] top-[-24px]` with smaller text, and the pill moves under the feet.
