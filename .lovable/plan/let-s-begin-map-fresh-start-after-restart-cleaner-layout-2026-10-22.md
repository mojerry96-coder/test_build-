# "Let's Begin" map: fresh start after Restart, cleaner layout

## 1. Restart gives a clean map
- Today, Restart closes the open lesson but the map still counts the lesson she finished before, so every stop shows a tick and no stop glows.
- After Restart, the map ignores anything from before the restart: Warm-up glows (orange, breathing) with its Start pill, and the other stops are locked.
- The same rule covers the topic and quest cards that say "done" and the Home greetings, so nothing anywhere looks finished after a restart.

## 2. Tidier map
- Stops follow one clear zig-zag that never crosses itself (today the Puzzle → Video and Video → Hands-on lines cross).
- More even spacing between stops, and the map sits centred under the heading.
- Layout follows the reference (screenshot 3): a clean S-shaped zig-zag rising from bottom-left (Warm-up) to top-right (Finish), with soft wavy lines between stops.
- The parrot on the map is bigger, as in the reference: about a third of the screen height (around 330 px tall on a laptop), standing bottom-right, never covering a stop or the chat. Phones keep the current size. (Parrot box: `h-[clamp(240px,34vh,340px)] w-[clamp(170px,13vw,240px)]`.)
- "Let's Begin" and the topic name stay centred and never sit under the sound / Dark mode buttons on mid-size screens (screenshot 2): the top buttons get their own row above the heading when space is tight.
- Each stop's name stays readable under its pebble; the flask drawing never sits under a stop.
- Phones: the same S-shape runs top to bottom, one stop per row, alternating left and right.
- Dark mode: the glowing current stop, lines and labels keep enough contrast on the dark background.
- Reduced motion: the current stop keeps its orange ring but stops breathing.
- Restart also clears saved whiteboard places and the low-data notice, so the lesson starts from the very first line.

## 3. Tapping a finished stop
- Remove the "Warm-up: you finished this stop." pop-up.
- For now a finished stop just gives a small bounce and does nothing else. You'll send the real flow later.

## 4. Whiteboard leftovers
- Practise "Teach me" (problem 1) plays on Fiti's whiteboard, using the approved worked steps; the old card goes.
- Ask Fiti homework help: Fiti's step reply gets a "Watch Fiti work it out" button that opens the same whiteboard with the approved steps (never the final answer).
- Low-data switch also appears in the first-time setup questions.
- Low-data choice is saved on her account (works on any device); her place on the board is saved with the lesson, so a reload on another device carries on too.
- Fiti's voice: add the `fiti_voice_id` setting (audited, admin only) now; voice and word-timed captions switch on once you add the ElevenLabs key and voice ID.
- "Let me clear the board." and "There we go! Your turn now." move into the lesson content as draft lines for Instructional Design approval; the app reads them from there.

## Technical details
- Teach me: replace the worked card in `stages-b.tsx` with `WhiteboardDialog` (resume key per session + problem).
- Homework: `agent.server.ts` homework step reply adds a `board` option carrying the approved steps from `homework.ts`; Home chat opens `WhiteboardDialog` with them.
- Low data: `student_prefs.low_data` (server-only table) via a small get/set server function; `useLowData` reads it once and keeps the device copy as cache; onboarding adds one yes/no step.
- Board place: new `boardProgressFn` saves `{key, n, base}` into `sessions.state.demo.board`, clamped server-side to the approved line count; dialog reads it on open.
- Voice: `fiti_voice_id` through the existing audited admin setting path; ElevenLabs provider behind the voice switch, key `ELEVENLABS_API_KEY` (not requested until you're ready).
- Seed: fallback lines `wb_clear_board`, `wb_watch_end` in the pack; dialog gets them from the lesson view; reload with `load-seed.ts` (re-import + leak checks).
- `src/lib/api/me.functions.ts`: drop sessions that started before the student's latest `restart_journey` audit row (same cutoff as `shown-skills.server.ts`; shared helper `restartCutoff(userId)`, read server-side). `completed`, `secure`, `lastWorkedAt` use only sessions after it.
- `src/components/path/PathMap.tsx`: new desktop points (non-crossing zig-zag), e.g. `[[70,430],[250,300],[110,150],[360,90],[560,250],[660,70]]`, checked with a small test that no two segments intersect; header wraps buttons on widths under ~1440px.
- Path route `onStop`: done → pop animation only, no toast.
- Tests (targeted): restart cutoff ignores older completed sessions; path segments do not cross.
