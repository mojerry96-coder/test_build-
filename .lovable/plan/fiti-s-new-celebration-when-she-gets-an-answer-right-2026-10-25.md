# Fiti's new celebration when she gets an answer right

## What she will see
When she picks or writes a correct answer, Fiti plays the new celebration clip (wings out, beak open, cheering) once, then settles back. This replaces his current celebrate move everywhere it plays:
- Warm-up questions (the right-side Fiti), plus the "You got it!" moments
- Video questions (replaces the clapping / thumbs-up reaction on a right pick)
- Quick fix steps, practise lines and a solved practise problem
- The worked-example board when her step is right

The confetti, sounds and Fiti's words stay as they are.

## Preparing the clip
- The clip already has a see-through background, so it sits cleanly on any card in light or dark mode.
- Remove the sound (the win sounds already play) and cut it to about 3 seconds, ending on a calm pose.
- Shrink it for budget phones (aim for 300 KB or less), plus a still frame for low-data mode and reduced motion.
- Make a light and a dark version for the places that play Fiti's clips on a solid card, matching how his other clips work. This also means Safari and iPhones show him properly.

## Fiti speaks on the "You got it!" card
- When the "You got it!" card opens, Fiti says its words out loud ("You got it! Spot on!"), using the same approved words shown on the card.
- One voice at a time: it stops any line he is still saying. Muting Fiti keeps it silent.

## Fix the sad reaction after a wrong answer
- Remove the white box around the sad clip. Play a see-through version so only Fiti shows on the page, in light and dark mode.
- Make it the same size and position as the thinking Fiti (the one with the question mark).
- The sad pose stays on screen until her next answer. A right answer switches him to the celebration; another wrong answer replays sad. He no longer jumps back to idle after 3 seconds.

## Also included
- The "You got it!" card plays the new celebration clip instead of the still cheering Fiti.
- The "You got close!" card plays the sad clip instead of a still Fiti, and Fiti speaks its words too.
- Phone size: the sad and celebration Fiti stay small and never cover the question or buttons.
- Spoken words come only from the words already shown on the card. No new wording is needed.

## Safeguards
- It plays once per right answer and never loops. A quick second right answer restarts it.
- A wrong answer straight after cuts it short for the sad clip.
- If it can't load, he falls back to today's celebrate move.

## Checks
- Run the existing test for which clip plays when, plus a new case: a right answer gives the new celebration.
- Check in the app that it plays on a right warm-up answer and on a right practise line. I'll use the admin shortcut to reach those steps, and say plainly if I can't.
- Check a wrong-then-right answer in light and dark mode on a laptop and a phone: no white box, sad stays until the next answer, Fiti speaks on both cards.

## Technical details
- Use ffmpeg to trim to 3 s, drop audio, VP9 alpha webm (`mascot-celebrate.webm`), and H.264 composited on #FFFFFF / #162839 (`clips/fitila_celebrate2_{light,dark}.mp4`), plus webp stills. Upload with `lovable-assets` and record in `SOURCES.md`.
- `FitiClips.tsx`: point the `celebrate` entry in the LIGHT/DARK sets at the new clips. Pointer Fiti plays it as a cutaway, the same way as sad.
- `celebrate.tsx` `small`/`big` dispatch `fiti:cheer`. The WarmupShell `Parrot` plays the clip on it, like `fiti:sad`.
- `PractiseStage`/`WhiteboardDialog`: a right step or solve requests `celebrate`. `FlowVideoStage`: clapping and thumbs-up swap to the new webm.
- `GotItCard`: speak the shown title and line through the existing voice queue.
- Sad overlay in `Parrot`: use the alpha webm (with a transparent still for low-data mode, and an alpha-capable fallback for Safari) instead of the white mp4. Match the thinking pose's box size, hold the last frame, and clear it only on the next `fiti:cheer` or `fiti:sad`.
