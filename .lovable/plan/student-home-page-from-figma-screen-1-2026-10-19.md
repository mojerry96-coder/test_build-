# Student Home page from Figma screen 1

Rebuild the student Home page to match the Figma frame at 1440 px, adapt it for tablet and phone, and connect it to real data. Existing routes, server functions, rules and the Mathematics flow (meet tutor → welcome → chapters → quests → topics) stay the same.

## 1. Design tokens (replace conflicting ones)
- Fonts: Afacad 600/700 for headings, Mulish 400/500/600/700 for everything else, loaded with display=swap. Manrope removed. No DM Sans.
- Colours: brand #0A3150, text #081D2D / #404D67 / #667085, border and quaternary #DDE2E7, page #F5F8FA with a soft blue glow at the top right, surface #FFFFFF, nav active #506AAC, banner #506AAC with a 39% black overlay, banner eyebrow #7DCFFF, progress #68BC98 on #DDE2E7, online dot #39BC83, helper label #5CBBF3, helper pill #168DCC, and the nine subject tints.
- Radius: cards and banner 16, search 12, icon tiles 8, pills fully round. Shadow-xl as specified.
- All values become named tokens. Pages use the tokens, not raw colours. Other screens pick up the new fonts and colours where they already use the shared tokens.

## 2. Assets
- The seven uploaded subject icons (Physics, Government, Biology, Literature, Chemistry, Accounting, Economics) and the waving parrot in glasses get uploaded as local app assets. No Figma links stay in the code.
- The uploaded uLesson logo (blue book with smile + "uLesson") is used in the top bar on every size, at the design's size.
- **Still needed before build (no stand-ins):** the Mathematics and English icons, and the Home / My Learning / Progress menu icons. Please export these from Figma so they match exactly.

## 3. Page layout (desktop, 1440 wide, 1130 px centred column)
- Top bar (white, 80 px): logo on the left; Home (active), My Learning, Progress in the centre with 36 px gaps; round avatar with initial and first name on the right.
- Heading "What would you like to learn today?" and the line "Choose a learning path and I'll guide you through it, one clear step at a time."
- Continue learning banner: tutor image on the left, slightly over the top edge, with a blue glow and green online dot; "CONTINUE LEARNING", topic name, subject • chapter, 428 px progress bar, "Step x of 8 completed"; white "Continue Lesson" button on the right.
- "Explore Subjects" with "Your SS3 curriculum, all in one place." and the "Find a subject" search on the right.
- 3-column subject grid in the design order: Mathematics, English Language, Economics; Accounting, Chemistry, Literature In English; Biology, Government, Physics.
- Floating tutor helper fixed at the bottom right, sitting in the right margin outside the content column.
- All sizes, gaps and font sizes exactly as listed in your brief.

Sample layout, laptop (1440):
```text
+--------------------------------------------------------------------------+
| [logo] uLesson        [#] Home   [=] My Learning   [~] Progress   (A) Ada |
+--------------------------------------------------------------------------+
|        What would you like to learn today?                               |
|        Choose a learning path and I'll guide you through it, ...         |
|        +--------------------------------------------------------------+  |
|        |[parrot]  CONTINUE LEARNING                                   |  |
|        |  (o)     Gradient of a line                [Continue Lesson] |  |
|        |          Mathematics . Coordinate Geometry                   |  |
|        |          [=====-----------]  Step 5 of 8 completed           |  |
|        +--------------------------------------------------------------+  |
|        Explore Subjects                        [ (Q) Find a subject   ]  |
|        Your SS3 curriculum, all in one place.                            |
|        +----------------+ +----------------+ +----------------+          |
|        | [ic] Maths     | | [ic] English   | | [ic] Economics |          |
|        +----------------+ +----------------+ +----------------+          |
|        | [ic] Accounting| | [ic] Chemistry | | [ic] Literature|  [tip]   |
|        +----------------+ +----------------+ +----------------+ [parrot] |
|        | [ic] Biology   | | [ic] Government| | [ic] Physics   |  (pill)  |
|        +----------------+ +----------------+ +----------------+          |
+--------------------------------------------------------------------------+
```

Tablet (768-1199):
```text
+----------------------------------------------+
| [logo]   Home  My Learning  Progress   (A) Ada|
+----------------------------------------------+
| Heading + line                               |
| [parrot] CONTINUE LEARNING ... [Continue]    |
| Explore Subjects            [Find a subject] |
| [ Maths      ] [ English    ]                |
| [ Economics  ] [ Accounting ]                |
| [ Chemistry  ] [ Literature ]                |
| [ Biology    ] [ Government ]                |
| [ Physics    ]                       (pill)  |
+----------------------------------------------+
```

Phone (under 768):
```text
+--------------------------+
| [logo]               (A) |
+--------------------------+
| Heading (32)             |
| Line                     |
| +----------------------+ |
| |[parrot]              | |
| | CONTINUE LEARNING    | |
| | Gradient of a line   | |
| | Maths . Coord. Geom. | |
| | [=====------]        | |
| | Step 5 of 8 completed| |
| | [  Continue Lesson  ]| |
| +----------------------+ |
| Explore Subjects         |
| Your SS3 curriculum...   |
| [ (Q) Find a subject   ] |
| [ Maths              ]   |
| [ English            ]   |
| ...  (one per row)       |
|                 (pill)   |
+--------------------------+
| Home | My Learning | Prog|
+--------------------------+
```

## 4. Real data and behaviour
- Name and initial: first name from the student's profile.
- Banner: shown only when the student has an open lesson. Topic, subject and chapter come from that lesson's topic; step count and bar width from its current step. "Continue Lesson" opens that lesson at the saved step. No open lesson: banner hidden, subjects move up.
- Mathematics card: from the topics list, opens the existing Mathematics flow. Its line shows the real number of chapters with an active topic (today "1 chapter").
- The other 8 subjects: same card, faded icon tile, small lock, "Coming later", not clickable. Kept in one clearly marked list so they can be removed later.
- Search: filters cards by name as she types; "No subjects match" when nothing matches.
- My Learning and Progress: a small "Coming later" message when tapped.
- Helper: label "Hi, I'm {tutor name from settings}", or "Hi, I'm your tutor" while the setting is empty, never a hard-coded name. Bubble "Hello, {first name}! What shall we learn today?". "Tap me for another tip" cycles the 3 tips. X hides the bubble for this visit; parrot and pill stay. Pill "Ask your tutor": opens the open lesson if there is one, otherwise scrolls to the subjects. Never covers a card. If the right margin is too narrow, only the pill shows.
- Non-students (waiting for access) and the loading and error states stay exactly as they are today; nothing new is added.

## 5. Tablet and phone
- Tablet (768–1199): 2-column grid, smaller tutor in the banner, helper shows only the pill.
- Phone (under 768): one column, 16 px side padding, heading 32 px. Banner stacks: small tutor top left, text below, full-width Continue Lesson. Search full width under "Explore Subjects". Top bar shows logo and avatar; Home, My Learning and Progress move to a bottom tab bar with the same icons. Pill sits above the tab bar.
- Every tap target at least 44 px.

## 6. Checks
- Desktop at 1440 compared side by side with your screenshot: spacing, sizes, colours, fonts.
- No Figma links in the code; every image loads from a local file at the right size.
- Banner checked with an open lesson (real data) and without one (hidden).
- Phone (390) and tablet (820) screenshots: no overlap, helper never covers a card.
- First load stays within budget: parrot images load lazily, fonts limited to the listed weights.

## Clean screen
- No test banner. The screen shows only what the Figma frame shows.
- No extra text beyond the design; only the "Coming later" lines and "No subjects match" you asked for.
- Anything that is an image or icon in the design is used as an image, never replaced with text.

## Technical details
- Fonts: replace the Manrope link in `__root.tsx` with one Google Fonts link for Afacad:wght@600;700 and Mulish:wght@400;500;600;700; set `--font-display-stack` / `--font-body-stack`.
- Tokens: new oklch values in `:root` of `src/styles.css`, registered in `@theme inline` (brand, text-secondary/tertiary, nav-active, banner, banner-eyebrow, progress, online, helper, helper-pill, tint-*), plus `--shadow-xl` and a `page-glow` utility.
- Assets: `lovable-assets create` from `/mnt/user-uploads` into `src/assets/subjects/*.png.asset.json` and `src/assets/tutor/wave.png.asset.json`.
- `src/lib/subjects.ts`: extend to 9 entries with icon, tint and a `PLACEHOLDER_SUBJECTS` block marked for removal; chapter count = distinct `chapter` values of active topics.
- `src/routes/_authenticated/index.tsx`: rewritten from new components in `src/components/home/` (TopBar, BottomTabs, ContinueBanner, SubjectGrid, TutorHelper). Uses existing `meQueryOptions`, `useStartTopic`, `useIntroSeen`, and the tutor name hook in `src/lib/tutor-name.ts`. No server function changes.
- Helper placement: shown only when the viewport leaves room beyond the 1130 px column (`min-[1500px]`); otherwise pill only.
