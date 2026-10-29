# Leaderboard: sample classmates for the demo

## What she will see
- When she isn't in a class yet, places 2 and 3, and the list below, fill with a few sample classmates (for example "Chidi O.", "Amara E.", "Tunde A."), each with points for every tab: Overall, Lessons, Quizzes and Stars, for both Week and All time.
- Every sample row carries a small "Sample" tag, and the note under the podium says "Sample classmates shown until you join a class."
- Her own row ("You") uses her real points and takes the place her score earns among the samples. With 0 points today she would sit below them.
- As soon as she joins a class, the samples disappear and only real classmates show.

## Where the sample data lives
- The names and points come from content (a new rule `leaderboard_samples`), not code, so Instructional Design can change or remove them. The names I start with are made up; please send real sample names and points if you have them.
- Turning the rule off (empty list) brings back today's view.

## Checks
- A test that the samples show only when she has no class, are tagged as samples, rank correctly with her real score on each tab, and vanish once she has classmates.
- A look at the page in light and dark mode at your laptop size.

## Technical details
- `leaderboard.ts`: a pure `withSamples(rows, samples, me)` that merges tagged sample rows (`sample: true`) and re-ranks them with `rankRows`. Tested in the existing leaderboard test file.
- `leaderboard.server.ts`: read rule `leaderboard_samples` (shape: name plus counts per metric and per period) only when the class scope is empty. Add `sample?: boolean` to the contract row; the page shows the tag and the new fallback line `leaderboard_sample_note`.
- Seed the rule and fallback line in the content pack, then reload the seed.
