# Full signed-in walk-through of the lesson

## What I'll do
Sign the preview in as your student account and walk "Gradient of a line" from start to finish the way a student would. I'll take a screenshot at each step on a laptop and on a phone.

1. Choose learning mode: Solo Mode opens Ask Fiti once, with no second Choose page.
2. Ask Fiti, then the "Let's Begin" map: stop names show on hover, and Back returns to the chat.
3. Warm-up: answer one question right and one not-quite, and check the popups, Fiti's reactions and the quick fix.
4. Puzzle (hook): make a prediction and continue.
5. Video: watch the video and answer its check questions. Rewind works, and you can't skip ahead.
6. Simulation (Gradient Lab): finish the tasks and see the "Time to practice" card.
7. Practice: check a line on the worksheet, use a hint, and finish the guided questions.
8. Exit ticket, reflection and the closing summary.
9. Back on the map: tap Warm-up, check the "Go back?" box, confirm, and land on the warm-up page again.
10. Leaderboard tab: it shows the right progress after these steps.

## What you get
- A short report: what worked, and what broke or looked off, with screenshots.
- Anything broken gets fixed in the same pass where it's safe. Bigger issues get listed for you to decide on.
- Item 6 ticked off the list, along with the done-stop item.

## Technical details
- Playwright run against localhost with the minted session (`lovable auth-session --json --self`), viewports 1280x1800 and 390x844.
- Read `/tmp/observability` console, network and runtime errors after each step.
- Answers are driven through the UI only. No database shortcuts, except reading `events` to confirm `step_rewound`.
- Uses "Start again" first so the run begins from a clean state. This resets the test account's progress.

## Added after review
- Dark mode: repeat the map, warm-up, video question card and practice page in dark mode to check readability.
- Voice: confirm Fiti speaks on each step and goes quiet when muted. Speech can't be heard in the test, so this is checked from the voice requests.
- Weak network: slow the connection once, on the video and on "Go back", and confirm friendly messages instead of freezes.
- Leave and return mid-step (reload on the video): the lesson resumes at the same place, and Continue in Ask Fiti takes you back.
- Chat history: the chat from this run appears with a short title and reopens.
- Speed: note any button that takes over a second to respond.
- The run uses your test account. "Start again" wipes its progress first, so tell me if you'd rather keep it.
