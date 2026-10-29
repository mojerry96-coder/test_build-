# Fix: missing Continue Learning banner, welcome page gaps, CTA colour, settings icon

## 1. Continue Learning banner (Home and Choose a chapter)
**Cause:** the banner only shows while you have an open lesson. Opening a Super Admin lesson preview closes your own open lesson on that topic, because only one open lesson per topic is allowed. So each time a preview starts, the banner disappears. My quick-fix test did the same thing for a few minutes. Your lesson is back now and the banner shows again, but the next preview would hide it again.

**Fix:**
- Preview lessons no longer count towards the one-open-lesson rule, so your real lesson stays open beside a preview.
- Starting a preview no longer closes your own lesson.
- The banner always follows your real lesson, never a preview.

## 2. Welcome page: the numbered skills list
**What's wrong:** the welcome page lists only the skills you haven't shown yet. Your test account has already shown two of them, so you see one item ("1 Substituting into an equation"). The tutor also says "checking 1 skills".

**Fix:**
- **List:** the welcome page always shows all three numbered skills: reading coordinates, working with a fraction and substituting into an equation.
- **Tutor line:** it uses the right wording for one skill or for several, e.g. "1 skill" or "3 skills".
- **Warm-up unchanged:** it still skips questions for skills she has already shown.

## 3. I'm Ready button colour
- The button changes to the deeper blue #168DCC with white text. A slightly darker shade shows on hover.
- **Readability:** this is the colour you chose. I'll measure it against the readability rule and report the ratio.
- **Same button elsewhere:** the lesson's main buttons (Check Answer, Next, Now you try) use the same style. They'll take the new colour too, so the lesson looks consistent.

## 4. Lesson top-right corner
- The round sliders icon (text size and low-data settings) is removed.
- Save and exit stays.

## Checks
- **Banner:** I'll start a preview and confirm your real lesson stays open and the banner still shows on Home and Choose a chapter.
- **Welcome page:** I'll take a desktop screenshot showing three skills and the new button colour.
- **Tests:** a test that a preview doesn't close the real lesson, and one for the one-skill / several-skills wording.

## Technical details
- **Migration:** replace the partial unique index `sessions_one_active` with one that adds `coalesce(state->>'consent_basis','') <> 'admin_preview'`. In `dev-tools.server.ts`, `startPreview` stops abandoning real sessions. Real-session lookups already exclude `admin_preview` (`me.functions.ts`, `topic-intro.server.ts`, `session-start.server.ts`).
- **Intro chips:** `topic-intro.server.ts` returns every prerequisite skill instead of the unshown ones. The opener's count is formatted as "1 skill" / "N skills", using a word variable in the fallback line or the helper that fills it.
- **Button colour:** token `--primary-action: #168DCC`, `--primary-action-hover` a slightly darker shade, `--primary-action-ink: #FFFFFF`.
- **Settings icon:** remove `<DisplayMenu />` from the lesson header in `LessonScreen.tsx`. The text-size setting keeps its saved value.

## 5. Quick-fix leftovers
- **Coordinates fix on its grid:** I'll run the coordinates quick fix in a preview, using your real account, without closing your lesson.
  - **Watch:** the grid draws 2 across, then 4 up.
  - **You try:** the point (5, 1) gets its arrows as each step is answered.
  - **Practice:** the question about Q at (4, 1).
  - I'll send desktop and phone screenshots.
- **Placeholder wording:** I wrote the lines shown when a step is answered or filled in, such as "The top: 11 − 2 = 9." I'll send you the full list so Instructional Design can approve or change it in the starter pack. Each line is already marked as seed content.
- **Tutor name:** I'll take a screenshot of the panel showing "Your tutor" in full, and test that a name over 18 characters is shortened, with the full name on hover.

## 6. Added after review
- **Dark mode for the banner:** on Home and Choose a chapter, I'll check the restored banner in dark mode as well as light.
- **Other blue buttons:** the new blue with white text must pass the readability rule on every button that uses it: disabled, hover and pressed included. A disabled button stays clearly greyed out.
- **Phone layout:** with three skills, the numbered list wraps neatly on phones, and the I'm Ready button stays fixed at the bottom without covering it.
- **Settings still reachable:** the text-size and low-data choices stay available from the avatar menu, so removing the lesson icon doesn't take them away.
- **Old previews:** preview lessons that are still open stay as they are. Only your real lessons ever show on the banner.

## 7. Tutor panel motion (your new instructions)
All movement uses only position, size-scaling and fade, so it stays smooth on budget phones. Opening takes 280 ms with a soft ease-out; closing uses a quick ease-in; small parts take 180 ms. With "reduce motion" switched on, everything becomes a simple 150 ms fade.

- **Close and reopen (desktop):**
  - **Close (X):** the panel shrinks into the "Ask your tutor" pill at the bottom right of the main card, and the pill pops in with a small bounce.
  - **Main card:** it smoothly widens into the freed space, and narrows back when the panel returns.
  - **Reopen:** tapping the pill opens the panel out of it. The last 5 messages then fade up one after another, 30 ms apart.
  - **Parrot:** the parrot in the pill waves once when the pill appears.
  - **Unread dot:** if the tutor speaks while the panel is closed, the pill shows an orange dot (#EA4B0A) with a white ring, and the parrot nods. The dot clears when the panel opens.
- **Minimise and expand:**
  - **Minimise (–):** the messages and the ask box fold up into the header, and the – turns into an expand arrow.
  - **Expand:** tapping the header or the arrow unfolds them again.
  - **Header:** the avatar, name and voice/text switch stay readable throughout.
- **Messages:**
  - **New messages:** they slide up 8 px and fade in. Tutor messages come from the left, hers from the right.
  - **While the tutor prepares a reply:** a bubble with three gently pulsing dots shows, and the avatar looks thoughtful. The reply replaces the bubble; after the time limit, the approved fallback line does.
  - **Scrolling:** the chat scrolls smoothly to the newest message. If she has scrolled up to read, a "New message ↓" chip appears instead.
- **Voice/text switch:** the white highlight slides between the two buttons.
- **Phone:**
  - **Opening:** the chat slides up from the bottom strip as a sheet with a grab handle, and the page behind dims to 20%.
  - **Closing:** she can swipe down, tap the dimmed area, or press back or Escape. The sheet follows her finger, closes once dragged past a third of its height, and springs back otherwise.
  - **Bottom strip:** its latest line fades into the new one.
- **Accessibility:**
  - **Labels:** the controls read "Close tutor", "Minimise tutor" and "Open tutor", and each says whether the panel is open.
  - **Focus:** opening moves focus to the ask box; closing returns it to the pill.
- **Fixes:**
  - **Counting words everywhere:** every number in a tutor line or label uses the right form: "1 skill" or "3 skills", "1 question" or "2 questions".
  - **Chat icon:** the header icon currently looks like a face. I'll rotate and flip it to match the Figma "messenger" icon.
- **Screen recordings:**
  - closing and reopening on desktop, with the unread dot;
  - minimise and expand;
  - a reply with the typing dots;
  - opening and swiping down the phone sheet.

Technical: the panel and pill transitions are FLIP transforms (`getBoundingClientRect` before and after, then translate and scale with WAAPI). The main card widening is a FLIP on its grid column change. Minimise uses `clip-path` and `scaleY` on the body. The swipe uses pointer events with a `translateY` follow and a snap at a third of the sheet height. Plurals go through one shared `countWords(n, singular, plural)` helper, applied where fallback lines are filled (`count`, `count_words`, `remaining`). The messenger icon gets the matching CSS `rotate`/`scaleX(-1)`.
