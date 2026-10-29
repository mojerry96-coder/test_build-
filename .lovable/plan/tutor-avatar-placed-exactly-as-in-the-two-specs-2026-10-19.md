# Tutor avatar placed exactly as in the two specs

## What the specs show (measured, scaled to the 1130 px card grid)
- The parrot is attached to the **card grid**, not to the screen. On Home it sits beside the Economics/Literature/Physics column. On Choose a chapter it sits beside the last card in the second row (Calculus).
- Parrot: about 120 px wide, 180 px tall. About 70 px of it overlaps the last card column, and its right edge sits about 50 px past the cards' right edge.
- Parrot feet: about 80 px above the bottom edge of the card grid.
- Bubble: about 206 px wide. Its top sits about 19 px above the parrot's head, and its right edge tucks about 19 px behind the parrot's raised wing, so the parrot is drawn in front of it.
- Bubble text: "Hi, I'm [tutor]" small blue line, bold two-line message, "Tap me for another tip" small grey line, X at top right.
- "Ask [tutor]" pill: at the parrot's right foot, its right edge about 43 px past the cards, level with the feet.
- Choose a quest uses the same rule (beside its last card row).

## Change
- The helper moves from "fixed to the bottom of the screen" to "attached to the bottom-right of the card grid", so it lands in the same spot as the spec on every screen height and width. **This means it scrolls with the cards instead of staying fixed**, which replaces the earlier "fixed while scrolling" rule, because a fixed position can't match the spec on screens of different heights.
- When a search leaves only one row, the helper stays at the grid's bottom-right and never covers the search box.
- Tablet and phone stay pill-only above the bottom tabs. Lesson pages still don't show it. The name still comes from the setting.

## Checks
- Screenshots of Home and Choose a chapter at 1440 and 1920, laid over the two specs, in light and dark mode.

## Technical notes
- `TutorHelper` gets rendered inside a `relative` wrapper around each grid (Home, ChapterParts, QuestParts) at `absolute right-[-50px] bottom-[80px]`, hidden below xl; `.tutor-fixed` removed from `src/styles.css`.
- Parrot `w-[120px] h-[180px] z-10`; bubble `absolute right-[101px] top-[-19px] w-[206px] z-0`; pill `absolute bottom-0 right-[7px] z-20`.

## Note on the earlier answer
My last reply said this chat runs on "Claude 3.7 Sonnet". I can't actually confirm that. Lovable picks the model.
