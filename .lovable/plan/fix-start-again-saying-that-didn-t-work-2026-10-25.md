# Fix "Start again" saying "That didn't work"

## What happened
Your account restarted successfully at 14:58 (Lagos). The second try came less than a minute later, so the once-a-minute limit refused it. The box hides that reason and shows a general "That didn't work."

## Fix
1. A second "Start again" within the minute counts as done when nothing has happened since the last restart (no lesson, quiz or chat started after it). She is taken home fresh, like a normal restart, with no error.
2. If she *has* done something since, the box says plainly: "You just started again. You can do it again in N seconds." The Try again button stays greyed with the countdown, then turns back on.
3. Real failures still show "That didn't work. Please try again."

## Technical details
- `src/server/home/restart.server.ts`: in cooldown, check for sessions or home_messages created after the last `restart_journey` row; none → return `{ ok: true, ended: 0, repeat: true }` (no new audit row); otherwise throw a typed cooldown error with seconds left.
- `src/components/RestartDialog.tsx`: read the error message; cooldown → show countdown text and disable the button until it ends.
- Test in `src/test/`: `canRestart` + new pure `cooldownSecondsLeft` (30 s after → 30; 61 s → 0).
