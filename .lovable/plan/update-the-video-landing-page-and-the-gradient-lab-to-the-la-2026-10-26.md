# Update the video landing page and the Gradient Lab to the latest versions

## 1. Video landing page (from Dave's new zip)
Rebuild our "Watch, Choose & Learn" screen to match his updated landing page:
- Heading becomes "Watch, Choose" / "& Learn". "Learn" is in orange with a hand-drawn gold underline that draws in, replacing the yellow circle.
- The two small cards go. "How it works" now opens a small note right under the buttons instead of a pop-up card.
- Begin and How it works use his raised 3D pill buttons (blue with an arrow, and white).
- A large Fiti rises from the bottom right, behind the text, playing his new idle loop. He tilts a little toward the mouse. A still image shows in low-data and reduced-motion modes, and on iPhone if the clip won't play.
- Back button at the bottom left. Lesson title at the top left, sound toggle at the top right.
- Enter starts the lesson.
- These stay the same: shows once per lesson, Begin starts the video with a loader, the welcome line, the fallback if the video fails, dark mode, and the tutor's name from settings.
- His other updated parts (his own video player, question card, reactions) are not used. Ours already replace them. The reference copies get refreshed.

## 2. Gradient Lab (Michael's repo, new update from 23 Oct)
- Update to commit 179fff2, which adds the Gradient Lab mark in the header, keeps the spaces in question text, and swaps in a full-head pose for "think".
- Copied byte for byte as before. The file check (sha256) and the source note are updated.
- Re-run the answer-reading check so our marking still reads its screen.

## Also included
- Landing Back goes to the map, or back to the chat if she came from there. It does not use browser history, and it sits clear of our left menu.
- Only one Fiti on screen: the side Fiti stays hidden while the landing shows. Fiti doesn't cover the heading or buttons on short laptops or phones.
- Fiti's idle clip loads after the page appears, so the first video isn't slowed on weak networks.
- Enter starts the lesson only when no other button or box has focus, and only once.
- His new line "Watch short scenes → answer 3 checkpoints…" and the heading words come from the content pack, not code. The checkpoint count uses the real number of questions. His grammar slip ("that Build") is fixed, and the wording is flagged for Instructional Design approval.
- Lab: the new header mark doesn't push our Back or Leaderboard tabs out of place. The "think" pose swap needs nothing from us. The lab's question text didn't change, so the pack questions stay as they are (to be confirmed by a diff).
- After the copy, the browser loads the new lab, not an old saved copy.

## Checks
- Laptop and phone, light and dark, on the landing page and in the lab.
- One lab answer marked through our engine. Start again shows the landing page again.

## Technical
- `src/features/video-lesson/VideoIntro.tsx` rewritten from `Landing.tsx`. Add `UnderlinedWord.tsx`. Our `.vl-cta` button gets the btn-3d style. Fiti's idle-hd webm is uploaded as a Lovable asset, not loaded from his storage. Remove the `video_intro_card*` labels from use; the `video_intro_*` lines stay in the content pack.
- `public/sims/gradient-lab-v2/` replaced from `v2/dist` at 179fff2; `gradient-lab-v2.SOURCE.md` fingerprints regenerated; `lab-v2-reader.ts` checked against the new header markup.
- `SOURCE.md` and `docs/video-lesson-upstream/` refreshed.
