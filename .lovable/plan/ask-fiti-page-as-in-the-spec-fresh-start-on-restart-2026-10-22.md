# Ask Fiti page as in the spec + fresh start on Restart

## 1. The page stays the question (screenshot 1 is the spec)
- While the warm-up is running, the page always shows only the question layout from the spec: large hand-written question with orange numbers, 2x2 answer pills, Check Answer, thinking parrot with question mark bottom right, Hint / Ask Fiti bottom left.
- The quick fix no longer appears on the page ("Quick fix · about 1 minute", the blue slip line, the "Watch how it's done" card and "Your turn" are removed from the page).
- All solving happens in Fiti's whiteboard dialog, which opens over the page:
  - "Watch how it's done": Fiti writes the worked example (as built).
  - "Your turn" and the practice question: shown on the same board inside the dialog, step by step, with the same answer boxes and server checking as now.
  - "Skip for now" moves into the dialog.
- When the quick fix ends, the dialog closes and the page moves to the next question.
- Ask Fiti opened at any time shows the clean chat card on the left, exactly as screenshot 1: header with parrot photo and the tutor name, chat and sound icons in a grey pill, minimise and close; one Fiti line "What do you need help with?" with the small waving parrot; "Ask about anything...." with mic and orange send; navy bottom edge. The question stays beside it.

## 2. Restart gives a clean slate
Today, Restart (profile menu) resets lessons but the Ask Fiti chat on Home still shows the old conversation (screenshot 3), and the lesson chat can keep old lines.
After Restart:
- Ask Fiti on Home opens a brand-new, empty conversation with Fiti's opening greeting only. Old conversations stay in history but are not shown as the current chat.
- Saved tips, "tip shown" state, chat-card question markers and collapsed-chat state for the lesson are cleared in the browser.
- Any question Fiti was waiting on an answer for (yes/no or options) is cleared, so an old question can't be answered by accident.
- The lesson chat starts empty with the first warm-up line.

## Also included
- **Closing the board mid-fix:** the question stays on the page, Check Answer is paused, and a "Back to the board" pill near Hint / Ask Fiti reopens it where she left off.
- **Phone:** the board dialog fills the screen; Ask Fiti opens as the bottom sheet with the same clean chat.
- **New Chat on Home** also starts with only Fiti's greeting (same rule as Restart).
- **Dark mode:** page, chat card and board use the existing dark colours.

## Technical details
- `QuickFix.tsx`: render the repair (watch, you_try steps, practice) inside `WhiteboardDialog` (new `children` slot for step rows below the written lines); the readiness stage underneath keeps rendering the current item (`view.warmup.repair.practiceItem` or the original item) in the spec layout; the dialog opens automatically when `demo.pendingRepair` is set and reopens from Ask/Hint area via a small "Back to the board" pill.
- `WarmupStage.tsx`: stop rendering the quick fix inline.
- `dev-tools.server.ts` `restart_journey`: insert a new `home_conversations` row for the admin and clear `meta.pending` on their latest tutor message; the Home agent already picks the most recent conversation.
- `RestartDialog.tsx` `resetSeenFlags()`: also remove sessionStorage keys `tip:*`, `ask-since:*`, tutor-collapse keys and lesson chat keys.
- Targeted test: restart creates a newer conversation so `currentConversation` returns an empty one.
