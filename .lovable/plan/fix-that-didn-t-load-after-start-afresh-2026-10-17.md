# Fix: "That didn't load" after Start afresh

## What happened
"Start afresh" worked. It cleared every lesson, so the old lesson link you had open no longer exists. The page shows "This lesson isn't yours or no longer exists" with a "Try again" button, and pressing it just fails again.

## Fix
1. When a lesson is missing or isn't yours, show "Back to my topics" as the main button instead of "Try again". It goes to the student home, where "Start" begins a new lesson at step 1.
2. Keep "Try again" only for real network failures (offline, slow connection).
3. After "Start afresh" or "Restart lesson" on the admin page, add a "Open student home" link in the success message so you go straight to a fresh start.
4. Check: open the old lesson link and see the new button, press it, start the topic, and confirm step 1 with an empty chat. Then check that 6/3 on problem 4 turns amber.

## Technical details
- Lesson route error state: tell apart a not-found/forbidden error from session load and a network error; not-found shows a Link to `/` (student home).
- TestDataCard success message gets a link to `/`.
