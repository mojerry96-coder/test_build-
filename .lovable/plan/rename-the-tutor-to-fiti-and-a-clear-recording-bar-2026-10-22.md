# Rename the tutor to Fiti, and a clear recording bar

## 1. Tutor name becomes "Fiti" everywhere
- Change the protected tutor name setting from "Fitila" to "Fiti" through the existing audited admin setting, which records who changed it.
- Because every screen and line reads that one setting, "Fiti" then appears everywhere:
  - the sidebar "Ask Fiti"
  - the speaker name above replies
  - greetings ("Hi, I'm Fiti.")
  - the lesson "Ask Fiti" pill and its placeholders
  - the intro and lesson chat, quiz and plan replies
- No name is typed into the app's code.
- Saved memory is updated so the name is recorded as Fiti.
- After the change, check the Ask page, a topic intro and a lesson step to confirm the name reads "Fiti" in each.

## 2. Recording bar, like your screenshot
When you tap the mic, the ask box turns into a recording bar:
- **Left:** a round ✕ button cancels and throws the recording away.
- **Middle:** a live sound wave that moves with your voice. Bars rise as you speak, and quiet time shows as a dotted line scrolling left.
- **Right:**
  - a round stop button with a blue ring, which stops and turns your words into text in the box;
  - the orange send button, which stops, writes the words and sends them in one tap.
- A small "Recording 0:07" timer sits above the bar, and a soft red dot pulses.
- After you stop, the bar shows "Writing what you said…" until the words appear.
- It matches the app's colours (light theme, blue ring, orange send) instead of the black ChatGPT style, and has a dark mode version too.
- It works on phones too, with large tap targets.
- Your mic is never kept on after you cancel, stop or leave the page.
- The 30-second limit stays, and the bar warns you at 25 seconds.

## 3. "Fix this"
The recording bar replaces the old recording strip under the box, which was hard to notice.

## Technical details
- **Name:** update the `tutor_display_name` setting via the admin setting path. The update writes to `admin_audit`. Name memory moves from Fitila to Fiti.
- **Recording:** the `useMic` hook adds an `AudioContext` `AnalyserNode` sampling volume levels into a ring buffer, plus `cancel()` and `stopAndSend()`. A new `RecordingBar` component draws the bars as divs with transform scale only, inside `AskBox` while recording.
- **Tests:** no rule changes, so no new tests. Run a typecheck and a quick live check of the bar.
