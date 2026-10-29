# Fiti replies to what she actually types

## What changes for the student
Today, when she types something like "hello i want to learn", Fiti ignores it and jumps to the next fixed question. After this change, Fiti first answers her words in one short, warm sentence, then asks his next question in the same message.

Example:
- She types: "hello i want to learn"
- Fiti: "Hello Kingsley! I love that you're ready to learn. How do you feel about maths right now?"

This applies to every step of the first-time talk (hello, how she feels, hardest area, "sounds good") and the "how have you been?" return chat.

## Rules that stay
- Fiti's questions, buttons and the order of the talk do not change; the AI never picks the next step.
- Button taps (e.g. "It's OK") get no extra line, only typed messages do.
- The AI line is one or two sentences, no question marks, no numbers, no banned words, and must pass the reply checks. If it fails, is slow (over 3 s), or the AI is switched off, Fiti just asks the approved question as today.
- If she types something off-topic, Fiti still replies briefly, then repeats his question instead of losing track.
- Voice reads the new line too.

## Technical section
- `src/server/providers/ai.server.ts`: add `replyToStudent(firstName, typed, step, 3000)` (one-line friendly acknowledgement, streamed, no question).
- `src/server/home/opening.server.ts`: new `ack(admin, text, step)` helper reusing the `reaction()` gating (`ai_provider`, `checkAiAnswer`, banned words, ≤2 sentences, no "?"); prepend its line in each `onboardReply` branch when the text is typed (not equal to a button `send` value). Unmatched typed text at a step returns ack + the same question instead of `null`.
- Feeling step keeps its existing reaction (no double line).
- Log `ai_ack` used/fallback in `home_messages` meta.
- Test in `src/test/`: button tap gets no ack; failed AI check falls back to the approved question only.

# Continue Learning button when she comes back

## What changes for the student
When she returns to Ask Fiti (welcome-back, next day, "how have you been?" replies) and has a topic in progress, Fiti's message shows the same **Continue Learning** button from your design: white pill, thin navy border, deep navy bottom edge, right-aligned just above the ask box. Tapping it opens that topic's map. The other choices ("See my plan", "Not tonight") stay as small chips under Fiti's words. Only Fiti's latest message shows the button.

## Technical section
- `src/server/home/opening.server.ts` `startBtns`: replace the plain "Start" chip with a link button `{ label: "Continue Learning", link: <topic map href from src/shared/routes.ts> }` when `home.plan[0]` is a started topic; brand-new topics keep "Start".
- Rendering already handled by `ContinueButton` in `FitilaAgent.tsx`; button label read from fallback line `home_continue_label` (topic-first, then global) so the copy stays data.
- Test: returning student with an open topic gets one Continue link pointing at that topic's map.

# Also included
- Fiti's quick reply shows straight away with the typing dots, so there is no silent wait while the AI writes.
- He uses her first name at most once per reply, and never repeats the same reply twice in a row.
- Short or unclear messages ("hmm", "ok", an emoji) get a friendly nudge and the same question again.
- If she types a maths question or a topic during the first talk, Fiti answers kindly and offers to start it, instead of forcing the remaining questions.
- Continue Learning works in dark mode (white text on navy, readability checked) and on phones (full-width above the ask box).
- If the topic she was on is finished or locked, the button points to her next open topic instead.
- Tapping Continue plays the tap sound and shows the new loader, like Auto Pilot.
