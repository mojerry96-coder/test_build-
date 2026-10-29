# Bring in Gradient Lab v2 exactly as built

The source is github.com/mojerry96-coder/k12 at commit 68c929b, "Gradient Lab v2: still-beak Fitila, guided support, walkthrough, admin levels". Our current v1 copy was taken from that same commit's root folder. This switches to its `v2` lab.

## 1. Copy it in unchanged
- Copy `v2/dist` byte for byte into the app: `index.html`, every Fitila clip (WebM, HEVC `.mov` and posters) and every still pose. No file is edited, renamed, compressed or left out.
- Add a separate notes file beside it with the commit and a checklist proving every file matches the original.
- After copying, compare each file's fingerprint with the original so nothing is missing or changed.

## 2. A preview page to see it on its own
- A new admin-only page, "Gradient Lab v2 preview", shows the lab full-screen exactly as it opens from the repository. You should see the first screen with Fitila and the "How to play" button.
- Check: open it in a test browser and confirm there are no missing files and no errors. I'll also take one screenshot of the first screen, since this can't be confirmed any other way.

## 3. Use it in the hands-on step
The lab runs untouched. Everything else is done from outside it, using only what v2 already supports:
- **Level from her band:** sent through v2's own setting (`?level=`), never shown to her.
  - Rebuild → Beginner
  - Bridge → Intermediate
  - Extend → Advanced
- **What she does:** v2's own reports (attempt, support offered or chosen, How to play, complete) are saved on her session and logged.
- **When she's done:** "Back to lesson" (v2's complete report) moves the lesson on to the worksheet.
- **Classroom sessions:** when a teacher pauses, a see-through cover on our side blocks taps on the lab. The lab itself is not changed.
- **Backup:** if v2 sends nothing within 5 seconds, fails to load, or low-data mode is on, the built-in board for her band opens, as today.
- **Admin preview:** v2's admin panel turns on only for admins, using v2's own setting.

## Things that change because nothing may be edited
- **Marking:** v2 marks answers itself and reports only right or not right. It never sends her actual values, so our maths engine can't re-check them. I'll record v2's result as the lab's own verdict, labelled as such, and the lesson only uses it to move on. Her real marks come from the worksheet and checks that follow, which our engine still marks. This is an exception to the rule that only our engine marks.
- **Fiti's words:** inside the lab, Fitila speaks only v2's own words, not our approved lines. Our chat panel stays quiet during the lab except for one approved line when it opens and one when she finishes.
- **Sound:** v2 has its own sound button, which our header sound button can't control.
- **Where she left off:** v2 doesn't save her place. A reload starts her at the first screen of her level. Her band is still saved, so the level stays the same.
- **Showing the answer:** after a third wrong try, v2 shows the answer with its working, as Michael's team designed it.
- **Download size:** v2 is about 15 MB, and its clips load only when the hands-on step opens.
- **v1 removed:** the old v1 copy and its 11 missions are removed. The old record type stays as a backup option.

## Also included
- **Phone check:** run the preview at a phone size and a desktop size, and confirm both of v2's layouts (side by side and stacked) look right.
- **Safari check:** confirm the `.mov` clips play in Safari-style browsers (WebKit).
- **Request to Michael's team (needs you):** ask them to add the submitted values to their "attempt" report. Then our engine can re-mark answers without us editing their lab.

## Technical details
- Files: `public/sims/gradient-lab-v2/` = exact copy of `v2/dist`; `public/sims/gradient-lab-v2.SOURCE.md` sits outside the folder so the folder stays identical. Check with `sha256sum` against a fresh clone.
- Preview: `src/routes/_authenticated/admin.sim-preview.tsx` (role checked server-side), iframe `src="/sims/gradient-lab-v2/index.html"` plus a "Open in new tab" link.
- `GradientLabStage.tsx`: new engine `gradient-lab-v2`. Listens for `message` events from the frame's window whose `type` starts with `gradientlab:`. Ready signal is the frame `load` event plus the first message, or the frame loading, within rule `sim_load_timeout_ms`. Sends `{type:'gradientlab:config', level, role}` after load. Override cover is a sibling `div` over the frame.
- Server: new `simLabV2` server function saves events (`sim_v2_attempt`, `sim_v2_support`, `sim_v2_tutorial`, `sim_v2_complete`) and settles the step on `complete`. Results are stored with `source: "lab_reported"` and never feed mastery. Events added to `src/shared/contracts/events.ts`.
- Content pack: band records become `url: "gradient-lab-v2"` with `init.lab.level`; drop the v1 GL tasks; re-run `bun ./scripts/load-seed.ts`.
- Remove `public/sims/gradient-lab/`. Update root `AGENTS.md` (lab copy rule: "copied unchanged; integration only from outside") and `src/components/lesson/AGENTS.md`. Targeted tests: band→level mapping only.
- Roadmap: add "Gradient Lab v2 unchanged copy + preview + hands-on wiring".
