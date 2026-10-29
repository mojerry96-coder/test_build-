# Make pages open faster after a tap

## What I measured (read-only timings from the server)
- Lesson page data: **1.8 to 3.5 seconds**. This is the slow one, and it runs on every lesson step, answer and Continue.
- "Let's Begin" map data: about 0.6 s.
- Ask Fiti / home data: about 0.5 s.

The lesson loads its wording (button labels, popup titles, Fiti's lines, rules) one at a time, roughly 30 to 40 small requests back to back. Each takes 50 to 100 ms, so the waits add up to seconds.

## Fix
1. **Load the lesson's wording in one go.** Read all the approved lines and rules the page needs in one or two requests, not dozens. Target: lesson data under 0.6 s.
2. **Load the independent parts together**: the topic, her name, the questions and the wording at the same time instead of one after another.
3. **Keep wording for a short time on the server.** Rules and approved lines rarely change, so keep them for 60 seconds and skip re-reading them on every tap. A content import clears this at once.
4. **Show the next page straight away.** On the map, Ask Fiti and the lesson, the page opens instantly with its layout while data finishes. The current lesson step is also fetched as soon as she hovers or presses a button, not only after the tap ends.
5. **Measure again** with the same timing script, before and after, for the lesson, map and home. Then report the new numbers.

Nothing changes in what she sees or how answers are marked. It just gets faster.

## Technical details
- `src/server/lesson/demo-path.server.ts`:
  - Add `loadWording(admin, topicId, keys[])`. It runs one `fallback_lines` query (`decision_key in (...)`, topic-first-then-global resolution kept) and one `rules` query, and replaces the per-key `line()`, `rule()` and `fallback()` calls in `getLessonView` and the labels block (around lines 320 to 380). The `tutorName` lookup is folded in.
  - Wrap the independent reads in `Promise.all`.
- New `src/server/lesson/wording-cache.server.ts`: per-server-copy cache with a 60 s lifetime, keyed by topic. It's cleared by the content import after `apply_content_pack`, so new content shows within a minute on other server copies.
- Look at `loadSession`, `chooseWarmup` and `stepItems`, which call `practiceItemIds` again and again. Make them reuse one result per request.
- Client: `defaultPendingMs`/`pendingComponent` show the page shell quickly. `prefetchLesson` is already used from the map, and Continue on lesson steps prefetches too.
- Timing script in `/tmp` (read-only calls only, with a test student rather than your account where a call writes).
- Record the wording-cache rule in `AGENTS.md`.
