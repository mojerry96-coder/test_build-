# Make Fiti teach properly on the practice page

## The problem
On practice, when she asks "how do I solve this", Fiti answers from general topic facts only. He can't see her working, which step she's on or what she asked before, so he gives a vague line ("Check which coordinates are y values...") that doesn't move her forward.

## What Fiti will do instead
- **Answer the question she asked, about the problem on screen.** "How do I solve this" gets the method for this problem, using its numbers: "First find how much y goes up: from 2 to 6. What is 6 − 2?"
- **Teach one step at a time.** He looks at the lines she has already written, says what is good, and gives only the next step, ending with a short question for her to try.
- **Give more help each time she asks.** 1st ask: name the next step. 2nd ask: show how to set it up with her numbers. 3rd ask: offer "Teach me" (the worked example) or walk her through it, one line at a time.
- **Remember the chat.** He sees the last few messages on this problem, so he doesn't repeat himself and knows what "I don't get it" refers to.
- **Spot her mistake.** If her last line was marked "Check this line", he explains what went off in that line (e.g. points swapped between top and bottom) without writing the fixed line for her.
- **Still never gives the final answer** and still passes every reply check. If the AI is slow or a reply fails a check, the approved hint for her current step plays, never the generic line.

## Fiti speaks every written reply
- Every reply he writes in the chat and every hint bubble beside him is spoken aloud, including AI-written teaching replies (not only fixed lines).
- Text and voice start together, as they do in Ask Fiti now; long replies are spoken sentence by sentence until the end.
- If the voice fails, the text still shows and the next reply still speaks.

## Checks
- Tests: the help level goes up with each ask on the same problem and resets on a new problem; the final answer is never allowed in a reply; numbers from the question and her own lines are allowed.
- Try "how do I solve this", "I don't understand", "is my line right?" on problem 1, then on problem 2, on laptop and phone.

## Technical details
- `src/server/lesson/demo-path.server.ts` (worksheet branch of the ask path): build a practice context for `groundedAnswer`: item prompt, her `workLines` with each line's check result, the current work step and its approved hint (from hidden `scripts`, never its answer), the last 4 chat turns for this item, and an ask count per item saved in session state.
- `src/server/lesson/tutor-chat.server.ts`: new `practise` fact level with tutoring instructions per help level (next step / set-up with her numbers / offer worked example), plus an "On her board" section. Final answer, accepted forms and the current step's answer go into `hiddenAnswers`, so `checkAiAnswer` blocks them; question numbers and her lines count as allowed numbers.
- Fallback when the AI is off/slow/fails checks: the current work step's approved hint, then the existing line. Log help level and check result in `question_asked`.
- Pure help-level picker in `src/server/lesson/practise-help.ts` with tests in `src/test/practise-help.test.ts`.
- Model and timeout rules stay unchanged.

## Also added
- **Same teaching in Prove it.** Prove it keeps only hints. Asking there gets the approved hint, not a step-by-step walk-through, so the check stays fair.
- **"Teach me" vs "I'll try alone".** In "I'll try alone" he starts at the lightest help level. In "Teach me" he starts one level higher.
- **Short and clear.** Two short sentences at most, plain words, numbers written as on the board. The spoken form says the symbols as words ("six minus two").
- **Help counts are saved.** They live in the session, so a reload doesn't reset them. A rewind or Start again does reset them.
- **Off-topic or upset messages** still get the existing approved replies, never AI teaching.
- **Low data / voice off:** text still arrives right away.
- **Leaderboard:** asking for help never counts as a wrong answer.
- **Wording:** the new fallback hint lines are marked for Instructional Design approval.
- **Verification:** use the dedicated test student, never Kingsley's account.
