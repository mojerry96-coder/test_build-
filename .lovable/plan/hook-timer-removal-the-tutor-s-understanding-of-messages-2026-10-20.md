# Hook timer removal + the tutor's understanding of messages

## What I found already (evidence)
- AI sorting is ON: rule `ai_provider` = "lovable_ai", sorting limit `ai_classify_timeout_ms` = 2000 ms, answer limit 4000 ms.
- "what does 1:8 mean?" (today 10:19 UTC, quick fix practice REP_SUB_01_P1): the AI **was called** but did not reply within 2 s. The word list then labelled it "unclear", and the quick fix path played "Sorry, I didn't catch that". No AI answer was attempted.
- Last 10 sorting records: AI answered in 1.6–1.9 s when it did; two of the last five hit the 2 s limit. The limit is too tight, and "unclear" outside the warm-up question falls back to "didn't catch that".
- The full report (last 10 calls in a table, plus the AI service log for the 1:8 call to show whether it was slow or failed) goes in the build reply.

## 1. Hook page: remove the timer
- Remove the 10-second countdown bar under the Path A / Path B / Same steepness buttons and the auto-move it triggers. She moves on only by choosing.
- Rule `hook_prediction_timeout_s` is left in place but unused (note in the code).

## 2. Fix the AI sorting
- Raise the sorting limit to 3500 ms (rule change, not code).
- Add "what does … mean", "what is this", "why …" phrases to the word list as "a question about the screen" so these never depend on the AI.

## 3. Admin-only label under my messages
- In admin preview sessions only: tiny grey line under each of your chat messages, "{category} · {AI or word list} · {time} ms". The server sends it only when the user is an admin; students never receive it.

## 4. Help with what she is doing now (whole lesson)
When the tutor can't tell what she means, or she asks about something on screen:
- warm-up question: that question's tip (as now)
- quick fix, watch: "Watch each step. When you're ready, tap Your turn and I'll help you."
- quick fix, your turn step: that step's hint question
- quick fix practice question: "Use the same steps as before: replace x, multiply first, then add."
- video check: the check's attempt help (never the answer)
- simulation: current task's first hint
- practise: the problem's first hint
- guided: "Tap the hint button for help, one step at a time."
These lines are added to the starter pack as draft content. "Sorry, I didn't catch that" only for an empty message or clear gibberish, and never twice in a row (the second time plays the line above).

## 5. Questions about something on screen
- The AI may write 1–3 sentences about the current step's visible content (e.g. "Do you mean 8 + 1? That's this step: add 1 to the 8 you just found. What do you get?"), passing all reply checks: only numbers already on screen, never the current step's answer, banned words. If the AI is off, slow or the reply fails a check, the line from point 4 plays.

## 6. Regressions
- Chat placeholder: "Ask Fitila a question..." (from the name setting), fallback "Ask your tutor a question...".
- Check button in guided steps and quick fix steps: primary style (#5CBBF3, white text).
- Chat input focus: only the 2 px #2CA1DA ring, no browser outline.

## Checks
- Targeted tests only: gibberish/empty detection and never-twice rule, the per-step fallback pick, the admin-label is admin-only, the hook has no auto-move.
- Seed reload + leak check after adding the new lines. No screenshots or recordings.

## Technical details
- Hook: `HookStage.tsx` (countdown state, bar, timeout submit).
- Sorting/answers: `src/shared/intro-moves.ts`, `src/server/lesson/tutor-chat.server.ts`, `demo-path.server.ts` (readiness/quick-fix branch and the generic branch); new pure `pickContextHelp(step, position)` in `src/shared`.
- Admin label: `sendChat` reply gains optional `diag` only after a `has_role` admin check; rendered in `TutorChatPanel.tsx`.
- Placeholder/focus: `TutorChatPanel.tsx`, `styles.css`; Check button: `QuickFix.tsx` / guided stage.

## 7. Video check "How sure are you?" icons (from your new pictures)
- Use your two uploaded icons exactly as given: the badge-tick icon for **Sure**, the person-with-speech-bubble icon for **Guessing**. Think so keeps the thumbs-up.
- Selected Sure = green pill with white icon and text (as in your second picture); unselected = dark icon on the grey track.
- Icons stored as app pictures (not redrawn), so the same files show on every video check.
- Also added to the roadmap when the build starts.
