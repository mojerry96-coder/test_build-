# Stop running the full check suite after every change

## What changes
- I'll stop running all 557 automatic checks after each change.
- I'll only run the few checks tied to a rule you change, such as prices, answers, hidden scripts or who can do what. Those cover the rules you care about.
- I'll run the full set only when you ask, or before a big release such as the 26 October demo, and I'll ask you first.
- I won't write "All 557 checks pass" in my replies any more.
- Screenshots: I'll take one only when you ask, or when a change can't be confirmed any other way.

## What stays the same
- The app's own build check runs by itself after every change. It costs you nothing extra, and I'll still fix any error it shows.
- The hidden-answer check still runs whenever the starter pack is reloaded, because a failure there must stop the reload.

## Saved for future chats
- I'll save this as a lasting preference, so it holds in every future conversation on this project.

## Technical notes
- Add a user preference to `mem://~user`: "Don't run the full test suite by default; run only targeted test files for changed rules; run the full suite only on request or before release, after asking. Don't report test counts."
