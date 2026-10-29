# Make the Hint tip simple and clear

## The problem
In the quick fix ("watch" and "your turn" parts), tapping Hint shows a general help line like "Watch each step. When you're ready, tap Your turn and I'll help you." It tells her how to use the screen, not how to solve the question. Elsewhere the AI tip can also come out wordy.

## What changes
1. **Hint always gives a maths tip for what is on screen**, in every part:
   - Warm-up question: a tip for that question.
   - Quick fix "watch": a tip about the step being shown (e.g. "Count the squares going up from the first point to the second.").
   - Quick fix "your turn" and practice: a tip for the step she is on.
2. **One clear action, plain words.** Each tip is a single sentence, starts with a doing word (Count, Look, Start, Find), at most about 15 words, no screen instructions ("tap…", "watch…"), never the answer.
3. **Safe fallback.** If the AI tip fails the existing checks (no answer, no new numbers, banned words, length) or is slow, the approved tip for that question or step plays. If a step has no approved tip yet, the question's approved tip plays.
4. Same tip appears in the yellow pill and in the chat; "Tip shown" reopens it (unchanged).

## Content
- Rewrite the existing warm-up tip lines to the one-action style above.
- Add draft tip lines for each quick-fix step ("watch" and "your turn"). These are drafts for Instructional Design to approve.

## Technical details
- `demo-path.server.ts`: remove the `fix.part === "practice"` limit on the hint branch; pass the current fix step prompt (and its hidden answer) as visible/hidden context to `groundedAnswer`.
- Tighter instruction to `groundedAnswer` for hints: "One sentence, start with a verb, under 15 words, about the maths on screen, no app instructions, no answer."
- Add a hint-only check: reject replies containing "tap", "watch", "your turn", "ready", or over the word limit → fallback.
- `hintReply` fallback order: step tip `fix_tip__<repair>__<part>__<step>` → `warmup_tip__<qid>`.
- Seed pack: new step tip lines in the server-only scripts; reload with `load-seed.ts` (re-import + leak checks).
- Extend the existing hint-reply test: hint never returns the "watch each step / your turn" line, and fallback order is correct.

---

# Ask Fiti while a question is showing (screenshot 1 is the spec)

## What changes
1. **The question stays on screen.** Opening Ask Fiti keeps the question, the 2x2 answer pills and Check Answer exactly as in the spec (large hand-written question, orange numbers, orange selected pill with tick). The worked-example board is only used when Fiti is solving, not here.
2. **Chat opens clean for this question.** The card opens with one Fiti line: "What do you need help with?" (new draft line for Instructional Design). Earlier lesson lines are not replayed into this card; her questions and Fiti's replies for this question appear below it.
3. **Card layout as in the spec:** single-line header (parrot photo, tutor name, chat and sound icons in a grey pill, minimise, close); small waving parrot beside each Fiti bubble; light blue bubbles with smaller text; "Ask about anything...." input with mic and orange send button; navy bottom edge.
4. **Thinking parrot with question mark** stays bottom right; layout fits 1280x720 and up without scrolling.
5. Tips asked from the chat ("Can I have a tip?") use the same simple one-action tip as the Hint button.

## Technical details
- `WarmupShell` / `TutorChatPanel`: chat card filters to messages created since the current question began (question id on message meta); opener from fallback line `warmup_ask_open`.
- Stage stays on the readiness question while chat is open; quick-fix board only renders when the server is in a fix.
- Typing "tip"/"hint" in chat routes to the same hint path.
- Approved spec placeholders ("Jupiter", Amaka) are not copied; real answers and her name are used. Chat title keeps the protected tutor name.

## Also included
- **After Check Answer:** Fiti's right / not-quite line appears in the open chat card; the next question starts a fresh card with the same opener.
- **Phone:** the same clean chat opens as a bottom sheet over the question; the question and Check Answer stay reachable.
- **Closing or minimising** the card returns the question to its normal centred layout, with no jump.
- **Tips:** the first tip is the simple one; asking again gives the next approved tip for that question, never the same line twice in a row.
- **Dark mode:** card and bubbles use the existing dark colours.
