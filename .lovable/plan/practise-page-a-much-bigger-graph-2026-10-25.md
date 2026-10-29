# Practise page: a much bigger graph

On your laptop (1377x892) the graph is only about 384 x 275 px. The card is about 490 px wide, and the graph leaves an empty band under it.

## Changes
1. **Question card gets more width than the working card.**
   - The question card takes about 55% and the working card about 45%.
   - Total width stays at most 1400 px. The working keys still fit, slightly narrower.
2. **The graph fills the card.**
   - It uses the full width of the card, minus the padding.
   - It grows down into the empty space below it, so it fills the card's height. The boxed frame around it goes, so no room is lost.
   - On your laptop this gives about 560 x 430 px, roughly twice the area of today. On big screens it gets larger still.
3. **Readable numbers.**
   - The axis numbers and the point labels like (1, 2) show at about 18-20 px on screen. Today they are about 15 px.
   - The dots and the line scale up with the graph.
   - Labels never collide with the line. The (1, 2) label sits below-right of its dot.
4. **Square grid squares,** so the slope looks true: the grid keeps equal steps across and up.

## Checks
- Screenshot at 1377x892 to confirm the graph is clearly bigger and everything fits without scrolling. Also at 1920 wide, and on a phone, where the graph takes the full width.
- Dark mode: the graph labels stay readable.

## Technical details
- `PractiseStage.tsx`:
  - The grid becomes `lg:grid-cols-[11fr_9fr]`.
  - The question section becomes `flex flex-col`. The graph wrapper is `flex-1 min-h-[300px] w-full`, and the figure loses its border and padding.
  - `TwoPointGraph` measures its box (ResizeObserver) and draws its viewBox at the real pixel size. Font sizes are then true pixels (labels 20, ticks 18), and the scale stays equal on both axes.

## Fiti's voice on "Watch Fiti work it out" (practise page)
Today, Fiti writes the worked example on the board but stays silent.

- **Cause not yet confirmed.** What I found:
  - The page tries to say the whole worked example in one go the moment "Teach me" is tapped.
  - The board also says each line as it writes it, and waits for the voice to finish before the next line.
  - The two collide, and a second tap on "Watch Fiti work it out" is treated as already spoken, so it stays silent.
- **First step:** open the page, tap "Teach me" and then "Watch Fiti work it out", and watch which voice requests go out and which fail. That confirms the real cause before changing anything.
- **Fix:**
  - On problem 1 the board alone does the speaking. He says each line as it appears, at the slower pace already set.
  - On problems 2 and later ("Worked together" lines on the card), he speaks the lines once.
  - Reopening "Watch Fiti work it out" plays the voice again from the start.
  - Maths is read as words ("six minus two over three minus one"), using the same spoken form as the quick fix.
  - Closing the board, pausing or tapping "Your turn" stops his voice at once.
  - If his voice is muted, the board still writes at the normal pace.
- **Check:** in the browser, confirm the voice requests succeed and Fiti speaks every line, on the first open and on reopening.

Technical: in `PractiseStage.tsx`, drop the page-level `useSay(teachLines)` when the board is used, and pass `speakable` lines to `WhiteboardDialog`. In the dialog, reset its done/replay state when it reopens, so `speakLines` runs again.

## Fiti shows the answer after 3 tries (practise page)
Today she can get "Check this line" forever, and nothing changes.

- After her **3rd** "check this line" on a problem, Fiti shows the answer.
  - The board opens and he writes the approved worked solution one line at a time, saying each line, the same way as "Watch Fiti work it out".
  - It starts with an approved line, e.g. "Let's work this one out together."
- **Afterwards:**
  - Her working stays visible.
  - The button becomes "Next", so she moves on, with no retyping.
  - The problem dot shows "shown", not "done". She doesn't get a tick for it.
- **Saved as help, not as a right answer:** the problem is recorded as shown after 3 tries, so mastery, the simulation band and the parent summary count it as weak evidence.
- **Changeable:** the number 3 comes from a rule (`worksheet_reveal_after`), not code. The lines come from the content's worked solution and approved fallback lines (`worksheet_reveal_intro`). Nothing is written by the AI.
- **Hidden until needed:** the worked solution is only sent after the 3rd try, never before.
- **Reload:** a problem whose answer was shown stays shown.
- A small test: the reveal happens on the 3rd try, and not on the 2nd.

Technical:
- `checkLines` in `demo-path.server.ts`: when `attempts >= rule worksheet_reveal_after`, return `reveal: Script` (`worksheet_reveal_intro` + `item_keys.worked_solution`). Set `demo.results[itemId] = { correct: false, revealed: true, attempts }`, and insert weak evidence.
- Add `reveal?` to `LineResult` and `revealed?` to results in `src/shared/contracts/lesson.ts`.
- Add the pure `shouldReveal(attempts, limit)` in `src/server/lesson/` with a test.
- `PractiseStage` opens `WhiteboardDialog` with the reveal lines (voice on) and then shows Next.
- Add the rule and the fallback line to the seed pack, then reload.

## Also included
- **Counting tries:** only real "check this line" results count towards the 3 tries. Typos like unreadable brackets don't. Undo and Clear never reset the count, and nor does a reload.
- **Warning before the answer:** after the 2nd try, Fiti says "One more try, then I'll show you", as an approved line. The answer showing up never comes as a surprise.
- **Hints and Teach me:** if she already used a hint or Teach me, the 3-try rule still applies. Each counts as help in her record.
- **"I'll try alone" after a reveal:** the next problem shows a short "Try this one on your own" line, so she gets to practise straight after seeing the method.
- **Teacher pause:** while the lesson is paused, the reveal waits and doesn't play.
- **One voice at a time:** the reveal stops any hint or bubble line before it speaks.
- **Phone:** the reveal board fits the phone screen, and the Next button is always visible.
- **Graph during the reveal:** the question card and graph stay on screen behind the board, so she can see the points being used.
- **Checks:** walk through 3 tries on the laptop and confirm the voice speaks every line, the reveal shows, Next appears and the dot shows "shown". Also check after a reload.
