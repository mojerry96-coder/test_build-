# Warm-up page: fix what looks off

These are the problems I found in your screenshot, and the fix for each.

1. **Sound button missing.** I hid it on this page, so she can't turn the game sounds or music off. Fix: bring it back to the left of Dark mode, in the same blue style as Dark mode, with the speaker icon.
2. **Flask drawing hits the Hint button.** The faint green flask in the background sits right behind Hint and Ask Fiti. Fix: hide that flask on this page, or move it up and away from the buttons, so the buttons have clear space.
3. **Parrot looks small and the question mark floats.** The parrot is shorter than in your design, and the question mark sits apart from its head. Fix: make the parrot about 30% taller, and place the question mark just above and to the right of its head, as in the design.
4. **Too much empty space at the top.** The question starts far down the page. Fix: move the question, answers and Check Answer up, so the group sits in the middle between the top bar and the buttons.
5. **Name has no menu.** Tapping "Kingsley" does nothing, so Sign out, Restart lesson and Admin can't be reached here. Fix: tapping the name and round picture opens the usual profile menu.
6. **The question's "?" stays navy.** This is correct: only the numbers turn orange. No change.

The small toolbar at the bottom of your screenshot (select, text, pen, comment) belongs to the editor's preview tools, not your app, so students won't see it.

## Check
Open the warm-up on a large screen, with and without the chat open, and take one screenshot to confirm.

## Technical details
- `FitilaShell.tsx`: in `bare` mode, render `SoundButton`, and wrap the initials and name in the existing `ProfileMenu` trigger. Add a `hideDecor` option to `Backdrop` that drops the flask shape.
- `WarmupShell.tsx`: the parrot box grows from `clamp(220px,34vh,340px)` to about `clamp(280px,42vh,430px)`. Anchor the question mark to the head (about top 8%, right 0). The top padding drops from `clamp(120px,22vh,230px)` to about `clamp(90px,14vh,150px)`.

## 7. The tip pill shows a real tip (your second screenshot)

**Why it said "Have a go with that tip…":** the Hint button sends her message through the same path as typed help. If Fiti's last line was already that question's tip (for example, the chat had already shown it), the tutor answers with the "try it first" line instead of the tip. So the pill showed that line rather than a tip.

**Fix:**
- The Hint button is marked as a hint request, so the tutor always answers with a tip for the question on screen, never the "Have a go…" line.
- The Fiti tutor writes the tip, as you asked:
  - The AI writes a short, fresh tip for this question using only the approved facts for this warm-up skill, and the question text.
  - It must pass the existing reply checks: no answer revealed, no new numbers, no banned words, short enough, on time.
  - If it fails or is slow, the approved tip for that question plays instead. That approved tip is "Here's a tip: work out the top and the bottom first…" for the current question.
- Tapping "Tip shown" again reopens the same tip and asks for nothing new.
- The tip is logged as before, and it counts as help for that question, as now.
- Typed messages like "help" in the chat keep their current behaviour, including the "Have a go…" line when she asks again.

**Check:** a small test that a hint request always returns a tip line and never the "try it first" line. Then one live try on a warm-up question to confirm the pill shows a real tip.

**Technical:** `askTutorFn` gets an optional `intent: "hint"`. In `demo-path.server.ts`, a hint request skips `pickTip`'s "again" branch and calls `groundedAnswer(..., ["warmup"], { visible: prompt, hiddenItemIds: [qid], tipFor: qid })`, falling back to `warmup_tip__${qid}`. `WarmupShell.hint()` sends `intent: "hint"`.

## 8. Also added
- **While Fiti writes the tip:** the Hint button shows three typing dots and can't be tapped twice. The pill appears as soon as the tip is ready, after about 3 seconds at most.
- **Same tip in the chat:** the tip also appears in the Ask Fiti chat, so opening the chat shows what she was told. It isn't shown twice in a row.
- **Quick-fix practice questions:** Hint gives these the same real-tip treatment, using that practice question's approved tip.
- **Phones:** the tip pill sits full-width just above Hint and Ask Fiti, and wraps onto up to 3 lines.
- **Offline or error:** the approved tip still plays, and the pill never shows an error message.
