# Chapters, Quests and the new "Let's Begin" path map

Reuse the Ask Fiti / Learning Hub layout (sidebar, Dark mode pill, Learning Streak badge, planet, flask, soft blobs, Patrick Hand headings, hover effects) on three pages, matching the three screenshots.

## 1. Choose a chapter (screenshot 1)
- Move into the shared Fiti layout: sidebar (logo, New Chat, Ask Fiti, Learning Hub, real initials), top-right Dark mode pill and streak badge, planet top-centre, flask bottom-left, soft blob shapes.
- "Back" plus "Choose a chapter" in Patrick Hand.
- Dark blue banner: waving parrot on the left, "Let's continue {chapter}", a progress line, white "I'm Ready" button with a pressed edge. It opens the path map.
- "Explore the maths universe" heading and the "Find a chapter" search on the right.
- 4-column chapter cards: soft tinted top with the symbol in a dotted circle, then quest count, name and description. The current chapter has a blue outline and a "CURRENT" chip. Locked cards keep the lock and the "Locked" wording.
- Hover lifts the card and deepens its shadow. The float effect is reused, with reduced-motion support.
- The old top bar, the breadcrumb, the subtitle and the floating tutor helper are removed.

## 2. Choose a quest + updated welcome popup (screenshot 2)
- Same shared layout. "Back" plus "Choose a quest". 2-column quest cards (the existing quest design), with the standing parrot at the bottom right.
- Tapping an open quest opens the **Great Choice popup** over a dimmed page: thumbs-up parrot, "Great Choice!" in Patrick Hand, a seed line, a blue Continue button, a white card with soft doodles and an orange gradient edge at the bottom.
- Popup line (seed, for ID approval): "Let's start {topic name}. I'll take you through it step by step."
- Continue opens the path map. Esc or a tap outside closes the popup. Focus stays inside the popup while it is open.

## 3. Let's Begin path map (latest screenshot, new page)
- Same shared layout. "Let's Begin" is centred in Patrick Hand, with the topic name under it and a Back link. The thinking parrot (hand on chin) stands at the bottom right, and an "Ask Fiti" pill sits at the bottom left, as in the latest screenshot.
- **Replicated exactly as drawn:** 6 stops at the screenshot's positions. Start is bottom-left, then the path goes right to stop 2, up-left to stop 3, down-right to stop 4, up to stop 5 and right to stop 6. The path is the same wavy, hand-drawn grey line. Badges are thick grey rings with a soft star and a white lock. The next stop is the blue badge with the orange ring and star. No extra labels or decorations are added beyond the screenshot. Each stop's name appears only as a hover/focus tooltip and is read by screen readers.
- **The 8 lesson steps on the 6 stops:**
  - 1 Warm-up
  - 2 Puzzle
  - 3 Video
  - 4 Hands-on
  - 5 Practice (worksheet + exam questions)
  - 6 Finish (exit ticket + reflect)
  - A stop counts as done only when all its steps are done.
- **Phones:** the same 6 stops in a top-to-bottom wavy line.
- Stop states:
  - **Next stop:** blue badge with an orange ring and star, gently pulsing. **No Start button.** Tapping it does the same as "Let's go!".
  - **Done:** coloured badge with a tick. Reflect shows the red feather once she is secure. Tapping a done stop opens a short recap card, not a redo.
  - **Not yet:** grey badge with a lock. Tapping shows "Finish {previous stop} first".
- The path is coloured between done stops and stays grey and dotted ahead.
- Lessons still move from step to step without returning to the map.
- Reduced motion turns off the pulse and the path animation. Stops are buttons in path order, read aloud like "Stop 3, Video, locked".

## 3b. Fiti starts the lesson in chat (replaces Start)
- **Where:** on desktop, a chat panel at the right of the map beside the parrot. On phones, a bottom sheet over the lower part of the map. It reuses the Ask Fiti bubbles, streaming, typing dots, quick-reply chips and mic. The "Ask Fiti" pill opens the same panel when it is closed.
- **First visit** (one line after another, seed lines for ID approval):
  - "Here's our path tonight, {first name}: 6 stops, about 25 minutes."
  - "Let's start with some simple warm-ups and checks: {count_words}, no marks."
  - "Ready?"
  - Quick replies: [Let's go!] [What's a warm-up?] [Not now].
- **Let's go!**, or a typed or spoken yes, ok, ready, go: her reply shows, then Fiti says "Here we go!", the path animates to stop 1 (about 1 second) and the first readiness question opens.
- **What's a warm-up?** → "Three quick questions to see what you already know, so I can help you better. No marks!", then "Ready?" with the same chips.
- **Not now** → "No problem. I'll save your spot." Then [Move it to tomorrow] (saved only through the existing plan-change rules) and [Back to Learning Hub].
- **Anything else typed** is answered with the Ask Fiti agent rules, then Fiti asks "Ready?" again. The saved "Ready?" question means "yes" later still works.
- **Nudge:** after 20 seconds with no reply, Fiti posts one nudge: "Whenever you're ready, just say go!" It never moves on without her reply, and the nudge never repeats.
- **Returning** (lesson in progress): "Welcome back, {first name}! You're at stop {n}, the {stop name}. Shall we carry on?" with [Let's go!] [Recap where I was]. The recap is one or two lines about what she last did (only things she already saw), then "Ready?".
- **Accessibility:** the chips are keyboard buttons, new lines are announced politely, and reduced motion turns off the path animation.
- **Screenshots I'll send, then stop:** the first-visit chat with its quick replies, the chat after "What's a warm-up?", and the moment the first readiness question opens.

## 4. Flow changes
- Quest (or Fiti's chat) → Great Choice popup → Continue → map → Fiti's chat → "Let's go!" → warm-up.
- "Continue Learning" (Learning Hub, chapter banner, Home) opens the map with her next stop highlighted.
- The separate topic intro page is removed. Its welcome and mission move into Fiti's chat on the map, and its address redirects to the map so old links still work.
- Fixes: "days in a row", the tutor name from the setting, and her real initials on all three pages.

## 5. Gaps found and added
- **Assets:** your three new pictures are used exactly where the screenshot shows them:
  - the filled lock inside each locked stop;
  - the outline bird icon in the bottom-left "Ask Fiti" pill;
  - the thinking parrot (hand on chin) at the bottom right of the map.
  - The planet, flask and background shapes are reused from Ask Fiti and the Learning Hub, and the thumbs-up parrot from the popup. The stop rings and star are drawn to match the screenshot.
- **Quests with several topics:** a quest with more than one topic still opens its Topics list first. Picking a topic shows the popup, then the map.
- **Topic already finished:** every stop shows done and Reflect shows the feather. Fiti says the topic is complete and offers [Recap] [Next topic] [Back to Learning Hub].
- **Recap card:** shows only what she already saw, for example "Warm-up: 3 of 4 right" or "Video watched". No answers or hidden tutor lines.
- **Back buttons:** Back on the map goes to that chapter's quests. The lesson's Back or Exit returns to the map, not the quest list.
- **Fiti chat "Start":** Fiti's "Start" for tonight's lesson on Ask Fiti also goes popup → map, so there is one way in.
- **Chat history:** the map chat is its own short conversation per topic visit. It is logged like Ask Fiti messages and never mixed into the Ask Fiti history list.
- **Restart lesson (admin):** the map resets to stop 1 and the first-visit chat.
- **Quizzes:** never shown on the map and never count as done stops.
- **Tablet (768–1279px):** the winding path is kept but smaller, and the parrot shrinks so it never covers a stop.
- **Loading and errors:** a soft placeholder path while loading, and the friendly error with "Try again" if loading fails.
- **Page titles:** each page gets its own browser and share title.

## To confirm
- How the 8 steps are grouped onto the 6 stops (above).
- Your instructions mention a done stop as a "coloured badge with a tick" and Reflect's red feather. Neither is in the screenshot, so I'll use them only once a stop is done.
- The streak badge says "in a row", following your instruction 4, not the "in a roll" in the screenshots.
- Dark mode follows the existing dark tokens. There is no dark design for these pages yet.

## Technical details
- Pages: `$subject.index.tsx` and `$subject.$chapter.index.tsx` are wrapped in `FitilaShell` with the shared background layer from Learning Hub/Ask. A new route `$subject.$chapter.$quest.$topic_.path.tsx` holds the map. `..._.intro.tsx` becomes redirect-only.
- New `src/components/path/PathMap.tsx` draws 6 stops on a wavy SVG path, with coordinates measured from the screenshot on a fixed viewBox scaled to fit. Phones get a vertical layout, and the fill uses `stroke-dashoffset`. Stop-to-step grouping lives in `src/shared/path-stops.ts` (tested).
- Stop states come from the session's current step and completed steps, read through the existing lesson API in `lesson.functions.ts`. Recaps use only data the student already saw, never hidden scripts.
- `GreatChoiceDialog` uses the shadcn Dialog with the uploaded thumbs-up parrot asset.
- New seed fallback lines (`path_*`) are added to the starter pack for every chat line above and the popup line. Then the seed is reloaded and the leak check is run.
- The map chat reuses the Ask Fiti message components and `handleHome`. A new pending kind `path_ready` makes "yes / go / ready" (word list first) start the lesson through the existing start-topic call. The 20-second nudge is client-timed, shown once and logged.
- Every `/intro` link (Learning Hub, Home, chapter banner, quests, `useStartTopic`) is updated to point to `/path`.
- Targeted tests cover the stop-state rules (next, done and locked) and the "Finish {previous} first" message. The `AGENTS.md` intro rule is replaced with a path-map rule.
