# Leaderboard page

## What she sees
A new **Leaderboard** item in the left menu, under Learning Hub, opens its own page. The page uses the same look as the practice worksheet: the navy page, the white card with the orange bottom edge, Fiti on the left, the hand-drawn font for headings, and the same chunky pill buttons.

```text
+----------------------------------------------------------+
|  Leaderboard · This week            [Week] [All time]     |
|                                                           |
|  Fiti      +------------------------------------------+   |
|  (pointer) |  [ Overall ][ Lessons ][ Quizzes ][ Stars ]  |
|  bubble:   |                                          |   |
|  "You're   |      2nd        1st        3rd           |   |
|   4th this |     (Ada O.)  (Tunde B.)  (Kemi A.)      |   |
|   week!"   |    podium with the top three             |   |
|            |  ----------------------------------------|   |
|            |  4  You (Amara E.)     1,240 pts  ^2     |   |
|            |  5  Chidi N.           1,180 pts         |   |
|            |  6  ...                                  |   |
|            +------------------------------------------+   |
+----------------------------------------------------------+
```

- **Tabs:** Overall (all combined), Lessons finished, Quiz scores, and Stars (right first tries). Each tab shows the same podium and list for that measure.
- **Week / All time switch:** this week is the default, so newer students can still reach the top.
- **Her own row** is always highlighted and pinned at the bottom of the card if she is not in view. A small arrow shows if she moved up since last week.
- **Fiti's bubble** says one approved, encouraging line about her place (never naming who is behind her). He also speaks it, using the voice rules already in place.
- **Phone:** Fiti shrinks to a small avatar above the card, the podium becomes a row of three, and the list fills the screen.
- **Light and dark mode** both use the existing worksheet colours.

## Who is on it
- **Her class only:** the students who have joined any class run by her teacher. If she isn't in a class yet, the page shows only her own scores, with Fiti saying "Join your class to see how you compare."
- **Today there are no classes set up**, so in the preview the board will show only your own row until a teacher creates a class and students join.
- **Privacy (students are minors):** other students appear as first name + last initial only. No photos, emails or exact activity times are shown.

## How the Overall score works (placeholder, can be changed later without code)
- 100 points per lesson finished
- 10 points per right first try (a star)
- 10 points per correct quiz answer
- Restarted or abandoned lessons, and anything before her last "Start again", don't count.
These numbers are a rule in the content, not fixed in the app. Tell me if you want different weights.

## Technical details
- Route `src/routes/_authenticated/leaderboard.tsx` (own head(), loader `ensureQueryData` + `useSuspenseQuery`); add `/leaderboard` to `NAV` in `FitilaShell.tsx` with an icon.
- Contract `src/shared/contracts/leaderboard.ts`: `{ period, metric, rows: { rank, name, score, me, delta }[], me, fitiLine }`.
- Pure, tested `src/server/home/leaderboard.ts`: score from evidence/sessions rows, ranking with ties (same score = same rank), name masking ("Amara E."), week window (Lagos Monday 00:00), restart cutoff via `src/shared/restart-cutoff.ts`, and quiz sessions (`state.kind = 'quiz'`) counted only in Quizzes and Overall.
- `src/server/home/leaderboard.server.ts`: class mates = students in `class_members` for any `class_sessions` owned by the instructor of her classes; reads through the admin client after auth; no new browser grants. Weights from rule `leaderboard_weights`; Fiti lines from new `leaderboard_*` fallback lines in the seed pack, noted for voice.
- Thin `src/lib/api/leaderboard.functions.ts` (`requireSupabaseAuth`).
- UI `src/components/leaderboard/*` reusing `WarmupShell`/practice card pieces, `LiveTutor`/FitiClips, and `fh-*` tokens; no new colours except podium tokens added to `styles.css` with dark values and a contrast-test entry.
- Tests: weights (lesson 100, star 10, quiz answer 10), tie ranking, name masking, week start, and the restart cutoff.
- Record the leaderboard rule in `AGENTS.md`.
