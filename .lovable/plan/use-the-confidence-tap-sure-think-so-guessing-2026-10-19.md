# Use the confidence tap (Sure / Think so / Guessing)

**Where things stand today:**
- She only picks Sure / Think so / Guessing on the three video checks (your screenshot). The warm-up and the other steps don't ask, so their confidence is saved as empty.
- Confidence is saved on each answer, but it doesn't change the answer's strength yet. "Wrong + Sure" is already noted on video checks, but nothing uses it.
- This plan applies the rules wherever she picks a confidence, which today means the video checks. Steps that don't ask keep today's behaviour. Tell me if the warm-up should start asking too.

## 1. How strong each answer counts
| What happened | Strength |
| --- | --- |
| Right first try + Sure | strong |
| Right first try + Think so | moderate |
| Right first try + Guessing | weak (never strong) |
| Right after the try 1 feedback | moderate (as before) |
| Right after the try 2 example | weak (as before) |
| Needed try 3, or still not right | none (as before) |
| Wrong + Sure | firm misconception saved for that skill (misconception, question, time) |

- A step with no confidence picked keeps today's rule.
- A "Guessing" right answer never counts as "skill shown", so the warm-up can't be skipped because of a lucky guess.

## 2. What the tutor does next
- **Right + Guessing:** she always sees "Here's how it works" before moving on, opened by the line "You got it! Let's make sure it wasn't luck. Here's why." It plays at the agreed pace through the same player, and the next part starts only after the working has finished.
- **Wrong + Sure, on try 1:** the line "Lots of people think that, so let's look closely." comes first, then that option's own feedback. The misconception is marked firm for later practice.
- **Wrong + Think so or Guessing:** the normal three-try help, unchanged.
- Both new lines go in the starter pack, marked as drafts for Instructional Design. If a question has no working stored, the approved full-explanation line plays instead.

## 3. Routing stays the same
Which simulation she gets still depends only on first-try right answers. Confidence never changes it. A check confirms this.

## 4. Saved for later
- Every answer keeps its confidence, as today.
- Each lesson keeps two counts: lucky guesses (right + Guessing) and firm misconceptions (wrong + Sure, with the misconception, question and time).
- **Session debug page:** shows both counts and the list of firm misconceptions.
- **Parent summary:** the "struggled with" line adds each firm misconception in plain words: "was sure that…" followed by that misconception's plain-words text. Each one appears once, never twice.
- The parent summary wording isn't checked for banned words, as agreed (plain words are exempt).

## Checks
- A test for each rule above: the strength table, the Guessing working and its lead-in, the Sure lead-in on try 1 only, the counts, and routing unchanged by confidence.
- Reload the starter pack and run the hidden-answer check. The working shown after a Guessing answer appears only after she has answered.

## Technical details
- `src/shared/video.ts`: `videoStrength(correct, attempt, confidence)`, with a pure `evidenceStrength` shared by every step. A null confidence keeps the old rule.
- `demo-path.server.ts` `checkAnswer`: pass confidence through. On right + guessing, return the item's working lines (feedback lines with role `working`, or the `full_explanation` fallback) prefixed by fallback `confidence_lucky_lead`. On wrong + sure on try 1, prefix the feedback with `confidence_firm_lead`. Store `demo.firm` as `{ misconception_id, item_id, skill_id, at }[]` (old string entries are read too), and `demo.luckyGuesses` as a count.
- `VideoStage.tsx`: when the result carries working, play it through WorkingPlayer before the next check or resuming the video.
- Routing (`pickBand`): untouched; a test asserts the same band with different confidences.
- Parent summary: build "was sure that {plain_words}" from `demo.firm`, deduplicated against existing struggles.
- Session debug: add lucky-guess and firm-misconception rows from session state.
- `shown-skills`: exclude evidence with confidence `guessing` (already covered, because it is weak).
