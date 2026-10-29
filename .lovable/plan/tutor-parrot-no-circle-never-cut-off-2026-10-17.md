# Tutor parrot: no circle, never cut off

## What is wrong
The parrot is drawn inside a light-blue circle, and the circle crops its wing, tail and feet.

## Fix (everywhere the parrot appears)
- Remove the light-blue circle behind the parrot, so it sits straight on the page.
- Show the whole parrot inside its space, with nothing cropped: wing tips, red tail and feet stay fully visible.
- Keep the same sizes as now, so layouts don't shift.
- Places this covers: sign-in page, meet the tutor, the tutor chat (header, each message, phone strip), the guided step, the lesson close / celebration, loading and error screens, and the empty "no lessons" screen.
- Check each place with phone and laptop screenshots, and send them.

## About the footer you asked about
"Test walkthrough only · Done with this task · Skip step" is a testing bar. It only shows while the test-access setting is on (the setting that lets anyone sign in during testing). It lets us finish a simulation task or skip the step without playing the lab. Real students won't see it once test access is turned off before launch. Nothing changes here unless you want it hidden now.

## Technical details
- One change in `TutorAvatar.tsx`: drop `rounded-full bg-accent`, keep `object-contain`. If any pose image has its own edges cut off in the file itself, it gets re-edited to fit.

## The parrot comes alive (moods and movement)
Today only the chat header switches between the mood pictures, with a hard cut and no movement.

**When each mood shows**
- Listening: the student taps into the ask box or the microphone.
- Thinking: while the tutor works on a reply or checks an answer.
- Speaking: while a tutor reply is shown.
- Encouraging: after a right answer, a finished simulation task, or a finished step.
- After a not-quite answer: the encouraging pose too, never anything that looks disappointed.
- Celebrating: lesson close.
- Idle: back to idle after a few quiet seconds.

**Effects (small and calm)**
- Soft fade between poses.
- Idle: slow breathing. Thinking: three small dots. Speaking: a light bob. Encouraging: a small hop. Celebrating: a hop and falling feathers.
- All movement turns off when the phone asks for less motion. Hidden in low-data mode, as now.

**Where**
- Chat header and phone tutor strip follow the live mood. The small parrot beside each chat message stays still.
- Sign-in and meet-the-tutor: gentle breathing. Lesson close: celebrating.
- Moods change visuals only, never what the tutor says.
- Check with screenshots of each mood on phone and laptop.

## Technical details (moods)
- One `TutorAvatar` with crossfade and per-mood animation utilities in `styles.css`, behind `prefers-reduced-motion`. Mood timing in the lesson context; answer checks set encouraging. Add this task to roadmap.md when building.
