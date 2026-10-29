# Skipped pages, AI-style typing, one working pace, missing working line

## 1. Pages skipped during the demo (investigate first, then fix)
- The cause isn't confirmed yet. One known cause is already fixed: warm-up questions used to be skipped because of answers from earlier restarted attempts.
- First step: replay your last demo lessons from their saved records and list every page that was jumped over: which step, which question, and why the server moved on.
- Likely places to look:
  - leftover skips saved in a lesson that started before today's fix;
  - the "two right in a row" shortcut;
  - a double tap on Next or Continue moving two pages at once;
  - Continue Lesson landing past the saved step.
- Fix each cause found. Then walk the whole lesson once and confirm no page is skipped: the 3 warm-up questions, hook, video, simulation, worksheet, guided assessment, exit ticket and reflection.
- If the replay shows nothing was skipped, I'll tell you which pages you saw and ask which one went missing.

## 2. Chat messages type in like an AI
- Before each tutor message: three pulsing dots for 500 to 800 ms, with the avatar in its thinking look.
- Then the text appears word by word at about 55 characters a second.
  - It pauses 250 ms after a full stop, question mark or exclamation mark, and 120 ms after a comma or colon.
  - A soft cursor shows at the end while it types.
- Maths such as "y = 2(5) − 4" appears in one go, never split.
- Tapping the message shows the rest at once.
- Options, Check Answer and Next keep working while it types.
- With voice on, the text follows the speech instead.
- With reduced motion on, there's no typing: the full message appears after the dots.

## 3. Step-by-step working at the same pace
- Each working line writes on at the same 55 characters a second, then holds for 1.2 s before the next line. The final result line waits an extra 0.8 s.
- The "Here's how it works" box and the chat's "Here's how it works · n steps" block show each line at the same moment, driven by one timer.
- The blue highlight (1 s), the softer colour for earlier lines, and Pause, Next step and Show all all stay.
- After the last line, a 1 s wait, then Good job opens as now.
- This replaces the old 2.5 s per line plus 60 ms per character.

## 4. Missing working line on question 3
- The pack holds four lines, ending "So, y = 6.", but only three play. I'll find where the fourth is lost (most likely Good job opening on the third line, or the step count being taken mid-play) and fix it.
- "n steps" will always show the full count from the start.
- Questions 1 and 2 are checked the same way.

## Checks
- Small tests:
  - typing speed and punctuation pauses;
  - maths kept whole;
  - line hold and result pause;
  - every stored working line plays, and the step count matches.
- Starter pack reload with the hidden-answer check (new rules: chat_stream_chars_per_s, working_line_hold_ms, working_result_pause_ms).
- One preview check of question 3 showing all four lines.

## Technical notes
- Replace `src/shared/working-pace.ts` with a char-rate pacer (`typeDurationMs(text, cps)` with maths units from `keepMathsTogether` and punctuation pauses). Rules are read in `demo-path.server.ts` and sent in `view.pace`; the old `working_line_base/per_char/max_ms` rules are removed from the pack.
- New `StreamingText` component used by the tutor bubbles in `TutorChatPanel`. It's driven by a per-message reveal clock, skips the animation for history loaded on return, and is non-blocking.
- `WorkingPlayer` owns the single timer and pushes each revealed line into the chat block. The title count uses `lines.length`.
- Skip investigation: query `events` and `sessions.state.demo.pos` history for the admin's recent real and preview sessions.
