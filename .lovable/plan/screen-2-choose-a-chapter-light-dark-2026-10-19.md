# Screen 2: Choose a chapter (light + dark)

Rebuild the existing Choose a chapter page to match the attached screenshot, reusing the Home top bar, tokens, dark-mode setup, SearchBox, Continue Lesson button and tutor helper. Routes, server functions and rules stay unchanged.

## Earlier decisions that override parts of the brief
- **No test banner.** You asked for clean screens earlier, so it stays removed.
- **No "Coming later" text.** Placeholder chapters show only the lock, at 80% opacity, and can't be tapped. The quests line is left blank. Fake quest counts like "9 quests" are not shown.
- **Chapter symbols use your uploaded images** for ∫, sin, ∞, △, πr² and (x,y), which are hosted as assets. "x²" and "P(A)" have no image, so they are drawn as text in Afacad Bold 28. The brief says "no images", but you uploaded these, so the images win.
- **Helper parrot** uses the uploaded waving parrot image. It sits in the right margin when the screen is wide enough, and shows only the pill otherwise. It never covers a card.
- **Breadcrumb chevron:** the Figma link can't be opened from here. It is drawn as a 16 px right-pointing chevron icon, in the design's colour.

## Layout (desktop 1440)
Content column 1130 px, centred, 60 px below the top bar. Page background and top-right glow are the same as Home.
1. Breadcrumb: Home (link) > Mathematics (bold, nav-active colour).
2. "Choose a chapter" (Afacad 40/41.4, -1.6 px letter spacing) and the subtitle.
3. Banner (shown only with an active Maths session): 111 px tall, radius 17, gradient at 168° plus radial glow, shadow. On the left, the parrot overflows the top edge, with a glow and the online dot. Text starts at 145 px: "Let's continue {chapter}" / "You're on step {x} of 8 in {topic}." Faint rotated x², π and ∠ sit in the middle at 10% white. The Continue Lesson button is on the right.
4. 59 px gap. Section heading and subtitle on the left, "Find a chapter" search on the right.
5. 13 px gap. Grid of 4 columns, 277x204 cards, 12/25 px gaps. Order: the current chapter first, then the rest by number.

## Chapter card
White card, 1 px border, radius 15, soft shadow. The 114 px art area has the chapter colour at 9.4%, a white radial highlight, a 94 px dashed circle at 16%, a centred symbol rotated -4°, and two decorations at 18% (×/△ or +/○, rotated -17° and 14°). "CHAPTER 0N" is in Mulish ExtraBold 11 at 80%. Below, with 14 px padding: the quests count (real number), the name (Afacad 18) and a one-line description (13).
- Current chapter: 1.5 px #2CA1DA border, 3 px #E8F6FC ring, stronger shadow, name in #2D4A60, and a CURRENT pill.
- CURRENT rule: the chapter of the active session, otherwise the last chapter worked in, otherwise none.
- Open cards reuse the existing hover lift and press behaviour (2 px lift, stronger shadow, #2CA1DA focus ring).
- Search filters the cards by name and shows "No chapters match" when nothing matches.

## Tokens (light / dark)
Light values are taken exactly from the brief. Dark values follow the existing dark palette and must pass the contrast test:
- heading-dark #1A3850 / #FFFFFF; section-heading #29475D / #E6EEF5; card-meta #8798A5 / #9FB0BE; card-desc #8899A5 / #9FB0BE; current-title #2D4A60 / #FFFFFF
- current border #2CA1DA / #2CA1DA; ring #E8F6FC / #0B3A55; badge background #E7F5FC / #0B3A55; badge text #147DB7 / #7DCFFF
- banner gradient #123E5D→#0877A8 in both modes; banner subtitle #BAD8E6
- chapter colours 01–08 as given. In dark mode the art tint goes up to about 18% on the dark card, and the symbol/label colours are lightened only if they fail 3:1 (failures are reported with the nearest passing value).
- Card surface, border and shadow reuse the existing dark card tokens (with the #16364D edge).

## Responsive
- Tablet (768–1199): 2 columns, smaller banner parrot.
- Phone (under 768): 1 column, 16 px side padding, 30 px heading. The banner stacks with the button full width. Search goes full width under the section heading. Bottom tabs and helper pill stay. Touch targets are at least 44 px.

## Technical
- New `src/shared/chapters-display.ts` holds the display config (number, symbol, asset, colour, description), marked as temporary until it moves into the content pack.
- Upload the symbol PNGs and the helper parrot to `src/assets/chapters/` through lovable-assets.
- New `ChapterCard` and `ChapterBanner` components in `src/components/chapters/`. Rewrite `chapters.$subject.tsx` to use them along with the existing loader and server function. Extend the server function only if it lacks the quest counts per chapter or the last-worked chapter.
- Add the tokens to `src/styles.css` (`:root` and `.dark`) and add the new pairs to `dark-contrast.test.ts`. Add a test for the CURRENT selection rule and the card order.
- Checks: Playwright screenshots at 1440 with and without an active session, plus tablet and phone, in light and dark. Confirm no Figma URLs remain in the code. Then stop.

## Spec coverage additions
- Exact fonts and colours left out above: breadcrumb Home is Mulish 14 #404D67 and the chevron is 16 px. Banner heading is Afacad Bold 24 white, subtitle Mulish 12 #BAD8E6. Section subtitle is Mulish 14 #667085. Card name is #0A3150, quests line Mulish Bold 12 #8798A5, CURRENT pill Mulish Bold 10 with letter spacing, fully rounded.
- Exact gaps: 7 px from breadcrumb to heading, 5 px from heading to subtitle, 24 px to the banner, 59 px to the section, 13 px to the grid.
- Without an active session the banner is hidden and the section moves up. Continue Lesson opens the lesson at the saved step. Its hover and press states are reused from Home.
- Banner subtitle uses real data only. The "42% / unlocks your next quest" line in the screenshot is not shown unless real data supports it.
- Placeholder cards keep their full art (symbol, decorations, dashed circle) and get a small lock at the top right of the art area.
- Top bar is reused as is: logo (dark version in dark mode), Home, My Learning and Progress icons with Home active, avatar and name, and the theme menu.
- Helper bubble reuses Home: "Hi, I'm your tutor", the tip line, "Tap me for another tip", the close button, and the "Ask your tutor" pill. No hard-coded name, so the "Kiko" in the screenshot is replaced.
- Dark mode check: the banner gradient, white Continue Lesson button, white bubble and the parrot stay the same in both modes.
- Known differences from the screenshot (on purpose): larger small labels, lock-only placeholders without quest counts, no tutor name, and the helper never overlaps a card.

## Your answers to the three open points (included in this build)

### 1. Dark mode colours (updates every navigation screen, including Home)
- Page #081D2D with a #1F97D8 glow at 16% opacity near the top right. Top bar #0A3150. Continue banner #035788 (Home). Search box #0A3150. Cards #04131F with a 1 px #1E3A52 border.
- Text: main #FFFFFF, secondary #C2CDD8, tertiary #8FA0B1. Border #1E3A52. The tip bubble stays #FFFFFF with a #DDE2E7 border.
- These replace the earlier sampled values (#071D2D, #0A3051, #04141E, #025888, #16364D edge). The chapter-page dark tokens above reuse them: card-meta and card-desc use tertiary #8FA0B1, section heading and current title use #FFFFFF.
- The contrast test is updated with every pair. The report lists each text token's ratio and any token that fails, with the nearest value that passes.

### 2. Lessons stay light in dark mode
- Lesson screens are forced to light, even when the app is in dark mode, until the dark lesson design arrives. This undoes the earlier dark lesson styling.
- No flash: the head boot script already knows the page address before paint, so it skips adding dark mode on lesson pages. Switching between dark navigation and the light lesson then happens without a flash, in both directions.

### 3. Chat bubble showing raw data (fix now)
- The chat shows only a script segment's text or speakable text, never raw item data, JSON, field names or ids.
- Item prompts appear in the item card on the stage. If a prompt has options or fields, the chat shows only its text line.
- A safety check in the chat display catches anything that looks like JSON (braces, quoted keys) or an internal field name (for example fields, options, across_direction, item_id, id). It shows the approved fallback line instead and logs the event.
- A new test runs every script in the starter pack through the chat display and fails if any raw data appears. A second test checks that a raw item object is replaced by the fallback line.

### Deliverables (in addition to the chapter screenshots)
Dark-mode screenshots of Home and Choose a chapter on desktop and phone with the new tokens, the contrast report, and a screenshot of the lesson chat after the fix. Then stop.

## Designer review: gaps closed (no new text or features)
- **Locked cards:** a pointer cursor never shows, hover and press don't lift the card, and screen readers hear "{chapter name}, locked". The lock gets about 85% contrast against the art tint in both modes.
- **Tab order:** breadcrumb Home, then Continue Lesson, then search, then open cards in the order shown. Locked cards are skipped by Tab.
- **Long names:** chapter names and descriptions stay on one line and end with "…" if too long. The banner heading truncates the same way as on Home.
- **Symbol images:** the uploaded symbols are sized to the same visual height (about 28 px glyph), centred in the dashed circle and rotated -4°, so the image and text symbols look alike. They stay sharp on high-resolution screens.
- **Dark art area:** the chapter tint sits on the #04131F card and the white highlight is reduced to about 6% so it doesn't look washed out. Symbols and "CHAPTER 0N" are checked at 3:1 or better.
- **Loading and errors:** reuse the existing Home skeleton and error states, in the same card grid shape so nothing jumps when data arrives.
- **Search:** filtering does not move the banner or heading. "No chapters match" sits where the grid starts. Clearing the search brings back the original order.
- **Back navigation:** returning from quests keeps the search text and scroll position.
- **Reduced motion:** the hover lift and press are turned off and only the shadow change remains.
- **Phone bottom tabs:** the grid gets bottom padding so the last card is never hidden behind the tab bar or the helper pill.

## Sample layout

Desktop (1440). Matches the screenshot: the grid spans the full banner width, and the search box's right edge lines up with the banner and the 4th card.
```text
+--------------------------------------------------------------------------------+
| [logo] uLesson         [#]Home   [=]My Learning   [/]Progress    (o) Amaka K.  |
+--------------------------------------------------------------------------------+
|       Home > Mathematics                                                       |
|       Choose a chapter                                                         |
|       Your WAEC learning path is organised into focused chapters.              |
|       +----------------------------------------------------------------+       |
|     [parrot] Let's continue Coordinate Geometry     x2    pi [Continue Lesson] |
|       |  .o  You're on step 3 of 8 in Gradient of a line.              |       |
|       +----------------------------------------------------------------+       |
|                                                                                |
|       Explore the maths universe                  [ Q  Find a chapter     ]    |
|       Every chapter is a new world of ideas to unlock.                         |
|       +--------------+ +--------------+ +--------------+ +--------------+      |
|       |CHAPTER 05    | |CHAPTER 02   L| |CHAPTER 03   L| |CHAPTER 04   L|      |
|       |  ( (x,y) )   | |   ( x2 )     | |   ( pir2 )   | |   ( /\ )     |      |
|       |1 quest  [CUR]| |              | |              | |              |      |
|       |Coordinate Geo| |Algebraic Pro.| |Mensuration   | |Plane Geometry|      |
|       |Plot points...| |Turn patterns.| |Measure shapes| |Discover rules|      |
|       +--------------+ +--------------+ +--------------+ +--------------+      |
|       +--------------+ +--------------+ +--------------+ +--------------+      |
|       |CHAPTER 01   L| |CHAPTER 06   L| |CHAPTER 07   L| |CHAPTER 08   L|      |
|       |   ( inf )    | |   ( sin )    | |   ( P(A) )   | |   ( S )      |      |
|       |Number & Num. | |Trigonometry  | |Statistics &..| |Calculus      |      |
|       |Master numbers| |Connect angles| |Read data...  | |Explore change|      |
|       +--------------+ +--------------+ +--------------+ +--------------+      |
|                                  [bubble: Hi, I'm your tutor ...] [parrot]     |
|                                                          (Ask your tutor)      |
+--------------------------------------------------------------------------------+
L = lock at top right of the art area (card at 80%)   CUR = CURRENT pill   ( ) = dashed circle
```
The helper overlaps the 4th column in the screenshot. Your rule "it must never cover a card" wins, so at 1440 the helper sits under the grid, lined up with the right edge. It moves into the right margin only when the margin is wide enough to hold it without touching a card.

Tablet (768–1199):
```text
+----------------------------------------------+
| logo        Home  My Learning  Progress  (o) |
| Home > Mathematics                           |
| Choose a chapter                             |
| [parrot] Let's continue...      [Continue]   |
| Explore the maths universe   [Find a chapter]|
| +-------------------+ +-------------------+  |
| | CHAPTER 05  CUR   | | CHAPTER 02     L  |  |
| +-------------------+ +-------------------+  |
| | CHAPTER 03     L  | | CHAPTER 04     L  |  |
| +-------------------+ +-------------------+  |
|   ... 01 06 07 08 ...           (Ask pill)   |
+----------------------------------------------+
```

Phone (under 768, 16 px sides):
```text
+------------------------+
| logo              (o)  |
| Home > Mathematics     |
| Choose a chapter       |
| subtitle               |
| +--------------------+ |
| |[parrot]            | |
| | Let's continue...  | |
| | step 3 of 8 in ... | |
| | [ Continue Lesson ]| |
| +--------------------+ |
| Explore the maths ...  |
| [ Q Find a chapter   ] |
| +--------------------+ |
| | CHAPTER 05 (x,y)   | |
| | 1 quest    CURRENT | |
| +--------------------+ |
| | CHAPTER 02  x2   L | |
| +--------------------+ |
|  ...        (Ask pill) |
+------------------------+
| Home  My Learning  Prog|
+------------------------+
```
Without an active session, the banner block is removed and "Explore the maths universe" moves up.

## Final spec review (before shipping)
Matches the screenshot: top bar, breadcrumb, heading block, banner (parrot overflowing the top edge, faint x² and π, white Continue Lesson), section row with the search box aligned right, the 4x2 grid in the order 05, 02, 03, 04 / 01, 06, 07, 08, each card's art (tint, highlight, dashed circle, symbol, two small decorations, CHAPTER label), the CURRENT pill and the blue current-card border with its ring.

Where the build will differ on purpose (from your written rules):
1. Banner subtitle uses real progress instead of "42% … unlocks your next quest".
2. Locked chapters show at 80% with a lock and no quest count. The screenshot shows "9 quests" and so on, but those numbers aren't real.
3. Coordinate Geometry shows its real quest count ("1 quest"), not "3 quests".
4. The helper says "Hi, I'm your tutor" and "Ask your tutor", not "kiko". The greeting line uses the student's real first name.
5. The helper never covers a card, so it sits under the grid at 1440 instead of over Plane Geometry and Calculus.
6. Small labels are 11–13 px instead of 8–10 px.

## Your answers on the helper and scrolling
- **Helper:** shown exactly as on the Home page. It uses the same part, sizes, placement rules and behaviour: the full helper under the cards where Home puts it, pill-only on tablet and phone, and it never covers a card.
- **Scrolling:** follow the spec and your instructions as written. The spacing comes from the brief (60 / 7 / 5 / 24 / 59 / 13 px, 204 px cards, 25 px row gap) with nothing extra added, so the page stays as compact as the design. The 1440 screenshot check confirms the banner, section row and both card rows appear together the way the design shows them.
