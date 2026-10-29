# Student Home: close the four open items

## 1. Tutor helper floating beside the cards on very wide screens
- When the space to the right of the subject grid is wide enough for the full helper (parrot, bubble and pill), the helper sits in that empty margin, lined up with the bottom of the grid, and stays there while you scroll.
- It never covers a subject card. If the margin is too narrow, it goes back to its current spot under the cards.
- Laptop, tablet and phone stay as they are now.
- Check: screenshots at 1440, 1680 and 1920 wide, confirming no card is covered at any width.

## 2. Pill text "Ask {name}"
- No code change: the pill already reads the tutor name setting.
- Needed from you: the tutor's final name. Once given, I set it in the teaching rules and the pill shows "Ask {name}" (Figma shows "Ask Kiko").
- Until then it stays "Ask your tutor".

## 3. Banner subject line "SS3 Mathematics"
- Option A: change the subject name in the starter pack to "Mathematics" and reload it the usual way (same checks: leak check, re-import check).
- Option B: leave the content alone and have the Home banner show only the subject name, dropping the class prefix.
- Option A is recommended because the content stays the single source.

## 4. Stand-in icons
- Needed from you: the Mathematics, English and three menu icons exported from Figma (SVG preferred), or connect Figma through the Lovable Desktop app so I can pull them myself.
- Once received: swap them in at the same size and position, then compare against screenshot 1.

## Order
1. Item 1 (can start now).
2. Item 3 (once you choose A or B).
3. Items 2 and 4 (once you send the name and icons).

## Technical details
- Wide placement: a CSS media/container condition on the helper wrapper in `HomeParts.tsx`; sticky positioning inside a right-gutter column, using normal flow below the breakpoint.
- Name: update rule `tutor_display_name` through the seed pack and reload with `bun ./scripts/load-seed.ts`.
- Subject: edit `content/packs/MTH12_09_02_01.seed.json` and reload; Home grid matching in `src/lib/subjects.ts` gets checked so both names still map to Mathematics.
- Icons: upload as asset pointers and replace the stand-in imports.
