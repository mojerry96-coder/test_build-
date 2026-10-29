# Video question: smarter Ask Fiti and a chat-open layout that fits

## What's wrong
1. **Fiti's reply.** When she asked "how do i solve this" during the video question, Fiti said only "We can take this question one step at a time." and stopped. The message was sorted as "don't understand", and on the video step it ends in the general fallback line, which has no next step. It also skips the first hint for that question. Why the AI's grounded answer didn't come first is not confirmed yet: either the question-on-screen match failed or the AI answer was rejected. The logs will tell us.
2. **The screen.** With the chat open, the video column gets squeezed:
   - the card is very tall
   - the answers show only A/B/C/D with no values
   - "Sure / Think so / Guessing" overlaps and "Guessing" is cut off
   - the control bar is shrunk
   - Fiti and his question mark take up a wide empty right column

## Fix: Fiti on the video question
- Order of replies for "how do I solve / help / I don't get it" on a video check:
  1. Grounded AI help: one short line about the question on screen. It uses only approved facts, checks that pass, and never gives the answer or picks an option.
  2. If that fails or is rejected, use the first approved hint for this question, e.g. "Gradient is rise divided by run. What is the rise here?".
  3. Only then the general line, always followed by one concrete next step so the reply never dead-ends.
- Fiti remembers what he just said in this chat. A follow-up like "still confused", "what's the rise?" or "ok" gets the next hint, not the same line again (the no-repeat rule already used on Home and the warm-up).
- When it fits, the reply ends with a short question that hands back to her ("Which number is the rise?").
- She can ask about the video too ("what did he say about run?"). The answer is grounded in what the video has already shown.
- The video check gets its own approved fallback line in the content pack (draft, needs Instructional Design approval), replacing the dead-end line.
- Diagnosis first: read the logged turn for this message to see why the AI answer didn't play, and fix that path.

## Fix: screen with chat open (desktop)
- Chat card on the left as now, and the video column takes all remaining width. Drop the extra right-side space when the chat is open. Fiti shrinks and sits under the chat or bottom-right without taking a column.
- Card keeps a sensible minimum width, and the question is limited to about 3 lines at a smaller size.
- Answers always show their values ("A  1/2"). They stay in 2×2 and drop to one column only if very narrow.
- The confidence bar never wraps or cuts: labels shrink a little or stack as three equal pills.
- The control bar keeps full size and readable section bars.
- Same rules when the window is between tablet and desktop width.
- Remove the debug line under her message ("dont_understand · AI · 1972 ms") for students; it stays visible only in admin debug mode.

## Also
- Opening the chat on a video question pauses the video. Closing it does not auto-play; she taps play.
- The chat opens with a short line tied to the question on screen (like the warm-up's opening line), not an empty panel.
- Typing dots show immediately while Fiti thinks, and replies type in one after another.
- Fiti's avatar in the chat changes mood: thinking while replying, a nod when she gets it.
- Phone: the chat opens as a bottom sheet, and the question card stays readable above it.
- Dark mode: the chat card and bubbles use the readable dark colours from the warm-up.
- If she answers inside the chat ("is it 2?"), Fiti never says right or wrong. He tells her to pick it and tap Check Answer.
- Asking in chat does not count as a try and does not change her confidence evidence. It is logged as a question asked.
- Re-run the earlier Ask Fiti test messages on the video question and report each reply.

## Technical details
- `demo-path.server.ts` `askTutor` video branch: check `question_asked` events for the AI log, and fix the `screenQ`/grounded path. For `dont_understand` with a current item, use `contextHelp` (first_hint) before `fallback`. Add a `ctx_video_check` approved line plus a follow-up rung via `history` (same `avoidRepeat` approach).
- `VideoStage.tsx`: remove `lg:pr-[220px]` when chat is open (shell `chatOpen` context), set card `min-w`, keep option labels from truncating, and use `ConfidencePicker` with `whitespace-nowrap` plus a compact size.
- Diag chip: show only when the admin debug flag is on.
- Targeted tests: reply order for video check help, and no repeat on follow-up.
