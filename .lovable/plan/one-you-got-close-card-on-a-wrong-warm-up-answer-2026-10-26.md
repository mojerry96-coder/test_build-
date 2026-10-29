# One "You got close!" card on a wrong warm-up answer

## What happens today
After a wrong warm-up answer, two "You got close!" cards can show for the same miss:
1. **Quick card from the check reply** — opens at once (added to make taps feel faster). It's drawn before the lesson knows a quick fix follows, so it shows **Continue** and no "Skip for now".
2. **The proper card** — arrives a moment later with **Let's fix it** and **Skip for now** (your screenshot). This is the one that applies.

A third look-alike also exists inside the quick fix (its own "You got close!" step card), which can pop up again after "Let's fix it".

## Fix
- Wrong answers: the quick early card no longer opens. Only the proper card shows, with "Let's fix it" / "Skip for now" (or "Continue" when there's no fix). The picked tile still turns amber instantly and the Check button shows its loader, so taps still feel quick.
- Right answers keep the instant "Good job!" card (nothing to disagree about).
- After "Let's fix it", the quick fix does not show a second "You got close!" for the same miss; its own card stays only for misses made inside the fix.

## Checks
- Wrong answer on the (3, 2) question: exactly one card, with Let's fix it + Skip for now; Fiti's sad clip and voice play once.
- Tap Let's fix it: the board opens with no repeat card. Right answer still opens "Good job!" at once. Light and dark.

## Technical details
- `WarmupStage.tsx`: only set `localPopup` when the check reply is correct (or when the reply already says no repair follows); wrong + repair waits for `w.popup`.
- `QuickFix.tsx` line 172: confirm when `dialog.kind === "close"` fires; suppress it on the fix's opening if it repeats the warm-up miss.

## Also: Fiti's voice on the worked example ("Across comes first… 2")
On the quick-fix board, Fiti starts "Across comes first, up comes second." but you hear "Across comes first, 2", so the end of the line gets lost. The cause isn't confirmed yet. The maths-to-words step doesn't change these words. The likeliest cause is that the board writes the next line ("…2 across") before he finishes, which cuts him off.
- First, record what is sent to the voice and when each line starts and stops for this example.
- Fix: each line is spoken in full before the next one starts. The waiting limit grows with the line's length, so a slow voice is never cut off. Numbers are read as whole words ("2 across" becomes "two across"), never left hanging.
- Check: play the (2, 4) example and hear all three lines in full, also after Pause and after Watch again.
- Technical: `WhiteboardDialog.tsx` say-on-write / `voiceIdle()` ceiling. `src/lib/voice.ts` queue (check that a new line doesn't hush the one still playing). Add a test in `voice-queue.test.ts`.
