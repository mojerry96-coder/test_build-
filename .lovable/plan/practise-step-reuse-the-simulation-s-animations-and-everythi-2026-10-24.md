# Practise step: reuse the simulation's animations and everything we built there

The Practise step (5 problems, one line of working at a time) still uses the old page: the old top bar, a grey "Teach me / I'll try alone" switch, grey Undo/Redo/Clear buttons, a plain line box and a flat "Check this line" button. It moves into the same look and behaviour as the simulation, which we already rebuilt as our own quick fix. That means Fiti's animated clips (pointing, thinking, celebrating, "almost"), the bubble that writes the question word by word, the "Tap me for a hint!" pill and idle hop, the hint card, the confetti and "You got it!" card, the round step dots, and the bouncing raised buttons. How lines are checked does not change.

## What she will see
- **Same frame as the warm-up and hook:** the new student layout (logo, Fiti's voice / Music / Sounds / Dark mode buttons, name), a progress line with "Problem 2 of 5" shown as round step dots, and Ask Fiti at the bottom left.
- **Question card:** a white card with the orange lower edge, like the quick fix. The question is large, with its numbers in the question colour.
- **Graph:** the quick fix's centred chart shows the two points from the question, so she can see the line she's working on. The points come only from the question on screen, never from the answer. The chart is hidden on very small phones until she taps "Show graph".
- **Teach me / I'll try alone:** two pill buttons in our primary blue. The chosen one is raised with a check badge, and both bounce on hover.
- **Working area:** each checked line is a row with a green tick. A line that needs another look is soft amber with an icon and the approved message (never red). Tapping a line asks Fiti about it, like before. Undo, Redo and Clear become small outlined blue pills. The maths keys get the same raised, pressable style, with a clear look while held down.
- **Fiti on the right (desktop/tablet):** our animated Fiti with his speech bubble. He wears the "Tap me for a hint!" pill while a hint for this problem is unseen, and hops after the idle wait (same rule as the quick fix). Tapping him opens the hint card with the approved hint only. The old "Looks like this one's tricky" box is replaced by this. On phones, a small Fiti sits in the corner.
- **Reactions:** a correct line gives a small pop. A solved problem plays the confetti burst and the "You got it!" card, then the raised blue Next button. Not-quite plays the soft amber reaction.
- **Buttons:** "Check this line" becomes the raised primary blue button with the bounce, readable even while empty (not faded), with "Write the next line first" shown under it.
- **"Watch Fiti work it out"** (Teach me on problem 1) keeps opening the existing quick fix board. Later problems show the worked-together lines in the same white card style.
- Works in light and dark mode at phone, tablet, laptop and wide sizes.

## Not changing: this page's own logic applies
Only the look and animations come from the simulation. Every Practise rule stays exactly as it works today:
- **Line-by-line checking:** each line is checked by our maths engine. A correct line gets a tick. A slip gets the amber "check this line" message from the content pack. The problem counts as solved only when the engine says so.
- **Teach me / I'll try alone:** Teach me shows "I do" on problem 1 (Fiti works it out), "We do" on later problems (worked together), then "You do". I'll try alone goes straight to "You do". Each choice is saved as now.
- **Help:** the hint offer still appears after the same idle time and the same number of amber lines (rules from the content pack). Hints are the approved ones from the server, and tapping a line still asks Fiti about that line.
- **Undo, Redo, Clear and "Show earlier working"** keep their current behaviour.
- **Progress:** 5 problems in order, then Next moves to the next step, as now.
- The simulation's own rules (levels, missions, how it marks) do not come into this page.
- The Prove, Exit ticket and Reflect steps stay as they are for now. They can follow in a later pass.
- The earlier "coloured line, white in dark" button change is on hold, as you asked.

## Also included
- **Voice:** Fiti reads his bubble, hint and line messages aloud. The Fiti voice mute button works here too.
- **Music and sounds:** the "focus" music plays, with a small balafon tick for a correct line, the celebration sound when a problem is solved, and the soft not-quite sound.
- **Keeping her place:** her lines of working for the current problem come back after a reload or a lost connection. Today they are lost.
- **Teacher takeover:** while a teacher has paused or taken over, the keys, Check and Fiti's hops stop, and a "Your teacher paused the lesson" note shows.
- **Weak networks / low data:** Fiti's clips become still pictures and the graph loads only when opened, keeping the page light on budget phones.
- **Accessibility:** captions always on, the text-size setting is followed, every key and button can be reached by keyboard and is at least 44px, and alerts use colour plus an icon.
- **Phones:** the maths keys sit below the line she is writing and never cover it, and Check stays in reach.

## Technical details
- Working lines are saved per problem through the existing lesson events (server-owned), not in the browser only. They are read back with the view.
- `LessonScreen.tsx`: render `worksheet` inside `mcq/WarmupShell` (with Hint/Ask Fiti), like readiness.
- `stages-b.tsx` `WorksheetStage`: keep all state and server calls (`checkLinesFn`, `teachMeFn`, `worksheetModeFn`, `hintFn`). Swap only the markup to reuse `QuickFix`/`WhiteboardDialog` pieces: the `qf-*` motion classes, `QfCards` (`HintCard`, `GotItCard`, `qfBurst`), the `PRIMARY`/`OUTLINE` button classes, `useReaction()` and `splitNumbers`. Idle nudge via `src/shared/idle-hint.ts` with rule `qf_idle_hint_ms` and fallback `qf_tap_hint`, replacing `useIdle`'s tricky card.
- Move the shared button classes and the Fiti-with-pill block from `QuickFix.tsx` into one small shared module so both screens use the same code, not a copy.
- Tokens only (fh-*, wb-*, qf-*). Dark values come from the existing quick fix tokens. Add the new pairs to `dark-contrast.test.ts`.
- Tests: a targeted test that the hint pill shows only while this problem's hint is unseen, and that the idle nudge never fires while solved. Run `idle-hint` and `dark-contrast` only.
- Update `src/components/lesson/AGENTS.md` with one line: Practise uses the WarmupShell + quick-fix pieces.
