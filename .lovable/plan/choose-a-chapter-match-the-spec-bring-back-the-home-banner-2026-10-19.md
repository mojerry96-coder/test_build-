# Choose a chapter: match the spec + bring back the Home banner

Spec = screenshot 2 (desktop 1500 frame). Screenshot 1 = current build.

## 1. Banner (the section that differs from the spec)
- Height and shape as the spec: slimmer banner (about 115 px tall at desktop), 16 px radius, blue gradient lighter on the right, faint x², π symbols.
- Parrot sits **inside** the banner on the left, bottom-aligned and cropped by the banner edge, about 130 px wide. No overhang above the banner and no online dot (spec shows neither).
- Remove the extra empty gap above the banner: it follows the intro line by 24 px, like the spec.
- Title "Let's continue {chapter}" in Afacad SemiBold 22 px; subtitle in Mulish 13 px.
- Subtitle follows the spec pattern "You're already {n}% through. One more topic unlocks your next quest." using real progress only. If the real numbers don't support a sentence (e.g. 0%), fall back to the current "You're on step X of 8 in {topic}." No made-up numbers.
- Continue Lesson button: white pill, smaller (about 155 x 42 px), Mulish SemiBold 14 px, existing hover/press states kept.

## 2. Section header and search
- "Explore the maths universe" Afacad 24 px, subline 13 px, 20 px gap below the banner as in the spec (currently ~90 px).
- Search box width ~340 px, height 50 px, right-aligned with the card grid's right edge.

## 3. Chapter cards
- Smaller, tighter cards like the spec: art area ~120 px, text area ~90 px, card height ~210 px, 14 px gap between cards and rows.
- Text sizes from spec: "CHAPTER 0N" 11 px, quest line 11 px, name Afacad 16 px, description 11 px.
- Lock icon stays on locked cards (your rule: lock only, no "Coming later").
- Quest count shows for any chapter whose real count is known; locked chapters with no content keep no count (no invented numbers).
- Current chapter: blue outline + CURRENT pill, unchanged.

## 4. Fit at a glance
- With the spec sizes, header, banner, search and all 8 cards fit in one 1440 x 900 screen without scrolling.
- Tutor helper keeps your rule: never covers a card. At ≥1440 it sits in the right gutter beside the bottom row (as close to the spec position as possible without overlap); narrower it sits under the cards.

## 5. Home banner "removed"
- Cause found: the Home code still shows the Continue banner whenever you have an unfinished lesson. It disappeared because the no-lesson check earlier closed the lesson in progress; a new one was then started for the test student only. If you're signed in as a different account (e.g. your admin account), that account has no open lesson, so Home hides the banner.
- Admin previews never show the banner (by design, so they don't mix with real progress).
- Fix: confirm which account you used, make sure that account has a normal lesson in progress (restore it), and re-verify Home shows the banner. No design change to Home.

## 6. Checks
- Playwright screenshots at 1440, tablet and phone, light and dark, compared side by side with the spec.
- Dark tokens unchanged; contrast tests rerun. All existing tests pass.

## 7. Added after review
- Smaller card text (11 px) must still pass AA contrast; if a label fails, darken the colour, not enlarge the text.
- Long chapter names and descriptions cut off with "…" on one line, so all cards stay the same height.
- Tap targets stay at least 44 px even with smaller cards and button.
- Phone: the slimmer banner keeps the parrot, title and Continue Lesson readable; button drops below the text if needed.
- Home: add a short guard so the banner returns as soon as any normal lesson is open, and check Home with the same account you use in the preview.
- Same banner design reused on Home, so both screens match.

## Technical details
- Files: `src/components/chapters/ChapterParts.tsx` (banner, cards, header sizes), `src/routes/_authenticated/$subject.index.tsx` (spacing, helper placement), progress % from existing `me.functions.ts` topic progress.
- No server, data or rule changes.
