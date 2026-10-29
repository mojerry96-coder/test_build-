# Remove the "Meet your tutor" page

## What changes
- The "Meet your tutor" page (parrot, "How should I talk to you?" language list, Start learning) is deleted.
- Tapping Mathematics on Home always goes straight to Choose a chapter, including the first time.
- Both of its addresses, /meet-your-tutor and the old /meet-tutor, are removed. Anyone opening them is sent to Home, so old links never show an error page.
- The admin "Go to page" list no longer has a "Meet your tutor" entry. The Restart box's line about "Seen" screens changes to "Tutor tips you've closed", because Meet your tutor no longer exists.
- The "seen it once" setting for this page is removed.

## Also covered by this cleanup
- **"AI tutor" label:** this page was where students were first told the tutor is an AI, not a real person, and that rule must still hold. A small "AI tutor" tag will sit next to the tutor's name in the Home helper bubble and the lesson tutor panel, if either is missing one.
- **Voice choice:** the page only offered Nigerian English (the others were "Coming later"), so nothing is lost. The tutor keeps using Nigerian English.
- **Admin Restart:** after a restart, the student goes straight to Home → Choose a chapter, with no tutor introduction first.
- **Old bookmarks:** both old addresses go to Home, never to an error page.
- **Project rules:** the written student journey changes to subject → chapters → quests → topics, so this page doesn't come back later.

## Technical notes
- Delete `src/routes/_authenticated/meet-your-tutor.tsx`. Turn `src/routes/meet-tutor.tsx` into a redirect to `/`, and add `src/routes/meet-your-tutor.tsx` as a redirect to `/` too (both kept per the "old addresses are redirect-only routes" rule).
- `index.tsx`: `openSubject` always navigates to `/$subject`, and drop `useIntroSeen`. Remove `useIntroSeen` from `ui-prefs.ts` and the `ul.introSeen` handling in `DevToolsPanel.tsx` and `TestDataCard.tsx`. Remove the entry from the `route.tsx` path list and the readable-urls test row, then run only that test.
