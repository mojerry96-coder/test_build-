# Ask Fiti: icon, tappable quest numbers, recording, bolder text, background

## 1. Ask Fiti icon
- Use your dove icon file (la_dove.png) for the sidebar tile.
- It takes the active blue on the selected tile and grey otherwise.
- It replaces the outline icon I drew.

## 2. Quest list: every number and row answers
- **Now:** only "Lines and Their Steepness" can be tapped. Numbers 2 and 3 do nothing.
- **Change:** tapping the number circle or the row of any quest gets a reply about that quest.
  - **Open quest (1):** the tutor replies in one line and opens its first topic, as it does today.
  - **Coming-soon quest (2, 3):** the tutor replies with an approved line, e.g. "Distance Between Points is coming soon. Want to start Lines and Their Steepness instead?", with a button to start it. Nothing locked ever opens.
- **Typing "2" or "quest 3":** does the same as tapping it.
- **Hover:** the number circle lifts slightly and the row gets a light tint. Coming-soon rows get a softer tint so they don't look fully open.
- The tap is still checked by the server against the options it offered.

## 3. Recording (mic)
- **First:** reproduce the failure with a real recording and read the server error. I don't know the exact cause yet.
- **Fixes, whatever the cause turns out to be:**
  - While you speak, show a red recording dot, a running timer and "Tap to stop". Today it says "Listening…" only after you stop, which is confusing.
  - After you stop, show "Writing what you said…" until the text appears in the box.
  - Accept the recording formats phones and Chrome actually produce, such as webm with codecs, ogg and mp4.
  - Fix how the recording is sent to the transcription service, based on the logged error.
  - Clear messages for: no mic permission, no parent voice OK, too short, voice paused.
  - Tapping the mic again stops cleanly. Leaving the page also stops the mic.
- **Check:** confirm with a spoken test sample that the words appear in the ask box.

## 4. Slightly bolder text
- Tutor reply text and quest descriptions go from regular to medium weight.
- Quest titles go to semibold, and the "Coming soon" tag to semibold.
- The handwritten "I want to learn maths" bubble stays as it is.

## 5. Background and design
- **Planet:** replace the drawn planet with your exact planet artwork, as supplied: pale lilac at 40% opacity, top centre-right, partly cut off by the top edge, on both the start screen and the chat.
- **Right flower:** a large grey flower with six long rounded petals and a soft centre, from the top right down past the bottom, as in your chat screenshot. It sits behind the ask box and the messages and never over them.
- **Lower right:** add the small pale blob shape near the bottom right.
- **Chat screen:**
  - The "ME" circle sits beside the top right of the student bubble.
  - The quest list has more even spacing between rows (about 48px apart).
  - The ask box stays pinned at the bottom with its blue edge.

## Technical details
- Upload `la_dove.png` and the planet SVG as assets. Use the dove through the existing mask in `FitilaShell`. Use the planet as an `<image>` in `Backdrop`, replacing the hand-drawn circles.
- Option handling:
  - `ConvTutor` renders every option as a button.
  - `pick` sends every `num`.
  - In `src/server/home/decide.ts`, an offered but unavailable option returns a new `quest_unavailable` action using a draft `home_quest_soon` fallback line, with an offer to start the open quest.
  - The number-word match goes in `home-intents.ts`.
  - Add one test in `decide`: an unavailable option never opens a topic.
- Mic:
  - In `useMic`, show the live state and pass the base MIME type.
  - In `/api/transcribe`, check `file.type` by prefix, pass a proper filename extension, and log the gateway status and body.
  - Run a live test with a generated speech sample.
- Seed: add the `home_quest_soon` line to the content pack, then reload the pack and run the leak check.

## 6. Also covered
- **Dark mode:** the planet, flower and dove icon use the existing dark tokens, so they stay soft and never glare. The text keeps AA contrast.
- **Phones:** the quest rows stack with a 44px number circle and full-width tap area. The recording dot and timer sit inside the ask box.
- **Learning Hub:** gets the same planet and flower background.
- **Voice permission:** with no parent OK, the mic note says so and links to the consent screen, if one exists. Otherwise it only says "Ask your parent to allow voice".
- **Wording:** the new `home_quest_soon` line is marked draft for Instructional Design approval.

## 7. No "Coming soon" tags on quests 2 and 3
- Remove the "Coming soon" tag next to Distance Between Points and Midpoint of a Line.
- All three rows look the same, so 2 and 3 are no longer greyed out.
- Tapping 2 or 3 still gets the tutor's one-line reply that the quest isn't ready yet, with a button to start Lines and Their Steepness. Nothing locked opens.
- This replaces the "softer tint" point in section 2: all rows get the same hover.
