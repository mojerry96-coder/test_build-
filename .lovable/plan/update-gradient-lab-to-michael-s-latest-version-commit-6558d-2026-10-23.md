# Update Gradient Lab to Michael's latest version (commit 6558d8d)

## What's new in their version
- Fitila's opening is a new 10-second loop: she waves, folds her wings, then points.
- A Worksheet tab on every question screen. It slides in a practice graph for plotting points, and is never marked.
- Fitila's speech bubble keeps the question on show.
- A Back arrow in the lab's header.
- New Line Lab wording: "Make the line climb from left to right to get a positive slope."

## What we do
1. **Copy exactly:** replace our copy of the lab with their `v2/dist/` folder from commit 6558d8d, byte for byte. Nothing gets edited, renamed or left out, and their sound and video files come across too.
2. **Record the source:** update the lab's source note to the new commit, with fresh fingerprints checked against a fresh download.
3. **Keep our hookups working:** re-check each thing we rely on in their new code:
   - level choice and saved screen (`?level=`, `#N`);
   - the `gradientlab:*` reports;
   - how we read her answers off the screen;
   - the duplicate logo we hide;
   - closing the Leave dialog by clicking outside it;
   - music ducking while the lab is talking.
   If they changed something, we adjust our side only.
4. **Their new Back arrow:** it lives inside the lab, so we can't change it. We check where it goes and make sure it can't strand her outside the lesson.
5. **Full screen with just an X:** the lab fills the whole screen on every device. Our breadcrumb, title, header controls, side rail and Ask Fiti are hidden while it's open. One round X button sits in the top-right corner, over the lab and clear of its own header buttons. Tapping X opens our existing "Leave Gradient Lab?" check, then returns her to the Let's Begin map, with her screen saved. Escape works the same as X.
6. **Easy / Intermediate / Hard follows their rule:** in their version, the lab never picks a level itself. The learning platform (us) assigns Beginner, Intermediate or Advanced, and she never sees it. Each level has its own screens:
   - **Beginner:** screens 2–5, plus 12 and 14.
   - **Intermediate:** screens 6–8, plus 13.
   - **Advanced:** screens 11 and 9.
   - **Nothing sent:** the lab defaults to Beginner.
   - **Support:** during a level, the lab only reports her support choices ("Try together" / "Keep trying"); changing her level is left to us.

   What we do:
   - keep deciding her level from her video-check results;
   - send it in their exact level names, every time, so she never falls back to Beginner by accident;
   - log their support reports;
   - not change her level mid-lab.

   Our current mapping of our bands to their levels is checked against these level names and screen lists.
7. **Gaps added after review:**
   - **Answer shown after 3 tries:** on her 3rd try at a question, their lab shows the answer and its working. We record that question as "answer shown", not as a right answer, and it doesn't count towards mastery.
   - **Try together, How to play and the worksheet:** these are support, not answers. We log them (`gradientlab:support`, `gradientlab:tutorial`, `gradientlab:worksheet`) so the parent summary can say she used help. They are never marked.
   - **Admin panel:** we send `role: 'admin'` only to real admins (checked on our server), so students never see their Admin tab.
   - **Sound:** their new opening clip and Fitila's voice still duck our music. Their sounds go silent when our sound button is off, or in Override and low-data sessions.
   - **Pause cover:** in Instructor Override, our pause cover still sits on top of the full-screen lab.
5. **Questions:** compare their question screens with our lesson pack's question list. If the wording or answers changed (e.g. Line Lab), update the pack and reload it, so our marking still matches.
6. **Check in the browser:**
   - each level opens;
   - one right and one not-quite answer are marked by us;
   - the Worksheet tab opens and doesn't count as an answer;
   - a reload returns to the same screen.

## Technical details
- Download the commit as a tarball and copy `v2/dist/*` into `public/sims/gradient-lab-v2/`. Delete files that no longer exist there.
- Run `sha256sum` against the clone and rewrite `gradient-lab-v2.SOURCE.md`.
- Check `lab-v2-reader.ts` selectors, the `gradientlab:*` event names and the iframe CSS hide rules against the new `dist/index.html`.
- Update pack `question_sets` only if they differ, then load with `bun ./scripts/load-seed.ts`.
- Run only `src/shared/lab-v2.test.ts` and the gradient-lab check tests.
