# "Start again" for every student, and remove Low-data mode from the menu

## What changes
- The account menu (tap the round initial at the bottom of the side bar) gets a **Start again** option for every signed-in student, not only admins. Menu order: Admin (admins only), Talk to me again, Start again, Music, Sign out.
- **Low-data mode** is removed from that menu.
- Tapping Start again opens the same "Start again from the beginning?" box, with wording for students:
  - This resets: your lessons and progress, back to 0; warm-up answers and hook choices; tutor tips you've closed.
  - "Your sign-in and settings are not touched."
  - Cancel is focused first; Restart shows "Restarting…" and then opens Home fresh, with Ask Fiti starting a new empty chat and the first-time greeting again.
- Admins keep their current wording ("Students' lessons… are not touched").

## What a student restart does
- Ends only her own open lessons (marked as left, never deleted, so the history stays).
- Progress, Home, warm-up skips and openings count only lessons started after the restart, using the same clean-slate rule admins already use.
- Starts a new empty Ask Fiti chat and resets the first-time talk.
- Unlike admin restart, it does not open an admin preview lesson.
- Each restart is logged.

## Low-data mode after removal
- The menu switch goes away. Anyone who already switched it on gets it switched back off, so no one is stuck with it and no way to turn it off.
- The automatic slow-connection fallback stays (text instead of voice and video on weak networks), since the project rules ask for it.
- The lesson note "You can turn it off in your profile menu" is changed to "Low-data mode is on because your connection is slow."

## Technical details
- New server action `restart_my_journey` (auth required, any role) in a student-facing server file, wrapped by a thin `src/lib/api/*.functions.ts` entry. It abandons the caller's own active/paused sessions on all topics, inserts a `home_conversations` row, calls `resetIntro`, and writes an `admin_audit` row with `section: "restart_journey"` so the existing `resetAt` cutoff applies with no change to progress reads.
- `RestartDialog` takes a `role` prop for the two wordings and calls the matching action.
- `FitilaShell` account menu: add Start again, remove the Low-data item; clear any saved low-data choice (local and server) once.
- Add a targeted test: a student restart ends only her own sessions and the cutoff hides earlier progress.
- Update the AGENTS.md rule about Restart to say students can restart too.

## Added after review
- Safety: while a teacher has her lesson paused or taken over in class, Start again is greyed out with "Your teacher is running this lesson right now."
- Learning Streak resets to 0 after a restart, so Home doesn't show an old streak.
- Any lesson answers still waiting to send (weak network) are dropped on restart, so old answers can't land in the fresh start.
- Saved place in the Gradient Lab and the remembered simulation level are cleared too.
- Parent summaries already sent stay as they were; nothing is deleted.
- Restart is limited to once a minute, so a double tap can't run it twice.
- Music, sound and dark mode choices are kept.
