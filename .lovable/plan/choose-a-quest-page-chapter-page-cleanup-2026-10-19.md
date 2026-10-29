# Choose a quest page + chapter page cleanup

Specs: quest screenshot (Coordinate Geometry → Choose a quest) and the chapter screenshot (last image). Same skills/workflow as Home and Choose a chapter: tokens only, light + dark, helper never covers a card, lock only (no "Coming later").

## Part A — Choose a quest (new design for /mathematics/coordinate-geometry)

Layout (desktop 1440):
```text
[top bar: logo | Home  My Learning  Progress | avatar name]
Home > Mathematics > Coordinate Geometry
Choose a quest
Each quest is a short learning journey made of connected topics.

[ 01° | m tile  | QUEST 01  Lines and Their Steepness   ] [ 02° lock | d tile | QUEST 02 Distance Between Points ]
[     |         | description          [ Enter Quest ] ] [          |        | description        [ LOCKED ]    ]
[ 03° lock | ½ tile | QUEST 03 Midpoint of a Line ...  ] [ 04° lock | xy tile | QUEST 04 Equations of Straight Lines ]
                                                    (tutor helper beside/below, never over a card)
```
- Two-column grid of wide cards (~578 x 196 px, 16 px radius, 16 px gap). Left art panel (~148 px) in the quest's pastel tint with "0N°" number, faint ring, dotted path, coloured rounded tile (72 px, 16 px radius) holding the white glyph; right side: "QUEST 0N" eyebrow in the quest colour, Afacad title 18 px, description 13 px, full-width button.
- Open quest: blue outline, filled light-blue "Enter Quest" button (with hover/press/focus states). Locked quests: lock icon top-right of art panel, outline "LOCKED" bar (not clickable, lock only).
- Colours per quest: 01 blue, 02 purple, 03 orange, 04 green, with dark-mode values following the chapter-card rules.
- Assets: uploaded m, d, ½ glyphs hosted as assets; "xy" drawn as text (no asset supplied).
- Open/locked comes from the database (Quest 01 "Lines and Their Steepness" is the only live one). Names and descriptions for the four quests live in a temporary display file like the chapter cards, until they move into the content pack.
- Helper with "Our next adventure is {next topic}." uses the shared helper; tutor name stays rule-driven.
- Phone: one column, art panel on the left stays; tablet: one column wide cards.

## Part B — Chapter page leftovers (match last screenshot)
1. **Banner bug on tablet/phone** (screenshot 2): the parrot covers "Let's continue…" because the left space is cancelled. Fix the spacing so text always starts right of the parrot at every width.
2. **Banner details:** title Afacad 26 px, subtitle 14 px, banner ~152 px tall, parrot ~125 px wide bottom-cropped; button ~204 x 54 px.
3. **Spacing:** breadcrumb → title → intro as spec; 48 px banner → "Explore the maths universe"; 48 px header → cards; 36 px between rows; 18 px between columns.
4. **Search bar:** borderless white field with soft shadow, ~446 x 66 px, 12 px radius, 18 px search icon, 16 px placeholder; vertically centred with the section heading; no square inner outline, rounded focus ring only.
5. **Cards:** ~378 x 280 px, art area ~157 px, "CHAPTER 0N" 13 px, quest line 13 px, name Afacad 19 px, description 13 px; current card 2 px blue outline.
6. **Quest counts:** shown on every card where the real count is known. Locked chapters with no content show no count (no invented numbers) — the spec's 9/6/8/7 are placeholder numbers.
7. **Lock icons:** kept on locked cards (your earlier rule), though the spec image hides them.
8. **Helper on wide screens:** at ≥1440 the full helper sits in the right gutter beside the bottom row, as close to the spec as possible without covering a card; narrower it sits under the cards.

## Part C — Checks (both pages)
- Screenshots at 1440, tablet (820) and phone (390), light and dark, side by side with the specs.
- Contrast check for all the smaller text (AA 4.5:1); darken any failing colour rather than enlarging text.
- Keyboard focus, 44 px tap targets, long-name truncation, reduced motion.
- All automated tests pass; add a test that only database-open quests are enterable.

## Technical details
- New `src/components/quests/QuestParts.tsx`, rewrite `src/routes/_authenticated/$subject.$chapter.index.tsx`; temporary `src/shared/quests-display.ts`; assets in `src/assets/quests/*.asset.json`; tokens `--q-0N`, `--q-0N-ink` light/dark in `src/styles.css`.
- Chapter fixes in `ChapterParts.tsx`, `$subject.index.tsx`, shared `SearchBox.tsx`, `TutorHelper` gutter placement.
- No server or data changes.
