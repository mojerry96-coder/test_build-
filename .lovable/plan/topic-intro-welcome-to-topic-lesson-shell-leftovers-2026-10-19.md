# Topic intro ("Welcome to {topic}") + lesson shell + leftovers

Spec: the welcome screenshot plus your two instruction files. Same workflow as Home / chapters / quests: tokens only, real data only, helper never covers content, no "Coming later".

## 1. Remove "Welcome to Mathematics"
- Delete the subject welcome page; /mathematics/welcome (and the old /welcome/mathematics) forward permanently to /mathematics.
- Mathematics on Home: Meet your tutor the first time, then Choose a chapter.
- Remove its copy and every link to it, including the Super Admin "Go to page" list.

## 2. Topic intro page (new address .../gradient-of-a-line/intro)
```text
[top bar]
Home > Mathematics > Coordinate Geometry > Lines and Their Steepness
Welcome to {topic name from the database}
+------------------- main card (925) -------------------+ +-- tutor panel (340) --+
|            parrot in round tile                       | | avatar  {name}  [chat|speaker] - x |
|            Great choice, {first name}!                | | parrot > bubble          |
|            intro lines (from lesson content)          | |                          |
|   [1 skill] [2 skill] [3 skill]                       | |                          |
|              [   I'm Ready   ]                        | | [Ask about anything... mic (send)] |
+-------------------------------------------------------+ +--------------------------+
```
- No "Step x of 8" or progress bar on the intro.
- Skill chips = the topic's 3 warm-up skills from the database, numbered on tinted tiles (#DBEDFF / #EEEDF9 / #F9F2EA). The spec's short chip labels ("Reading Coordinates", "Working with a fraction") differ from the stored names ("Reading coordinates including negatives", "Subtracting and dividing with negative numbers"); I'll show the stored names until the content team adds short labels to the pack.
- Intro wording ("Straight lines are everywhere…") and the tutor's first chat line come from the lesson content (the readiness opener in hidden storage), sent by the server only when the intro opens. Nothing typed into the code. If the content has no intro lines, only the heading shows.
- "I'm Ready" (primary #5CBBF3, hover/press/focus states) runs the normal lesson start with all its checks, then opens the lesson at the first warm-up question; if the warm-up is skipped (all three skills already shown) it opens the Hook.
- Tab title "Gradient of a line · Intro · uLesson Tutor".

## 3. Lesson shell (reused on every lesson step)
- Breadcrumb ends with the topic name; title "Welcome to {topic}"; main card 925 + tutor panel 340, 12 px apart, 690 px tall.
- Step progress at the top of the main card from Step 1: "Step x of 8 · {Ready, Hook, See, Do, Practise, Guided, Exit ticket, Reflect}" and an 8-part bar (done #2CA1DA, current #5CBBF3, upcoming #E3E8EF).
- Tutor panel: avatar on #FCA964 circle; name from the tutor-name setting ("Your tutor" while empty) with "AI tutor" label; chat/speaker switch (voice shows "Voice is coming soon"); minimise (header only) and close (shows "Ask your tutor" pill bottom-right of the card, tap to reopen). Messages: parrot + tailed bubble #E8F3F1, student bubbles #DBEDFF, step dividers ("Step 1 · Ready"), auto-scroll, raw-data safety check kept. Input pill "Ask about anything...", mic, send (disabled while empty).
- Exit ticket hides the panel entirely, as agreed.
- Tablet: panel 300 px. Phone: no side panel; bottom tutor strip that opens the chat as a sheet.
- Existing step content (questions, board, video, simulation) moves into the main card unchanged; lessons stay light-only.

## 4. Entering and returning
- Enter Quest opens the intro of the quest's first open topic; with 2+ open topics it opens the Topics list, whose Start opens each intro.
- Continue Lesson (Home banner, chapter banner, helper) skips the intro and opens the saved step.
- Left after the intro without answering anything: Enter Quest shows the intro again.
- Super Admin "Go to page" gains "Topic intro"; all internal links updated.

## 5. Leftovers from the last build
- Measure every quest-card text colour (QUEST 0N labels, 0N°, descriptions, LOCKED) against AA in light and dark; darken any that fail and add them to the contrast tests.
- Re-measure quest and chapter card/text sizes against the specs and record the result.
- Screenshot the helper bubble to confirm "Tap me for another tip" lines up left.

## 6. Checks and stop
- Screenshots: intro without the step bar, first warm-up question with it (desktop, tablet, phone), plus panel minimised/closed.
- Tests: intro shows no step bar; Enter Quest goes to intro (1 open topic) or Topics list (2+); Continue skips the intro; /mathematics/welcome forwards to /mathematics. All existing tests pass. Then stop.

## Technical details
- New route `$subject.$chapter.$quest.$topic_.intro.tsx`; `$subject.welcome.tsx` becomes redirect-only; `isLessonPath` and the light-only boot script include /intro.
- New server function `getTopicIntroFn` (thin wrapper) → server reads topic, prerequisite skills and the readiness opener script after the same access checks; no answers returned.
- New `src/components/lesson/LessonShell.tsx`, `TutorPanel.tsx`, `StepProgress.tsx`; `LessonScreen` renders inside the shell.
- Tokens in `src/styles.css`: bg-secondary, bg-selected, tutor-bubble, tutor-ring, chip tiles 1-3, primary-action.
- `useStartTopic` / quest Enter → intro; DevTools page list updated; `AGENTS.md` rule for the intro-before-lesson flow.

## Assets supplied
- Thumbs-up parrot (intro hero, inside the round light-blue tile above "Great choice").
- Side-profile parrot head (tutor panel header avatar, on the #FCA964 circle).
- Both hosted as app assets; the small chat avatar keeps the existing waving parrot, as in the spec.

## Gaps closed after review
- Contrast: white text on #5CBBF3 ("I'm Ready", send arrow) is about 2.2:1, below AA. The fill stays as designed and the label uses dark ink (#0A3150, about 7:1); say if you prefer white text on a darker blue instead.
- Spec greeting is "Great Choice, Amaka!": first name comes from the profile, never hard-coded.
- The spec's panel title "AI Tutor" is replaced by the tutor-name setting ("Your tutor" while empty) with the small "AI tutor" label, per your instruction file.
- Intro and lesson pages stay light-only in dark mode, until the dark lesson design arrives.
- Same top bar as the other screens; no test banner.
- Phone and tablet layouts of the intro: card full width, chips stack, "I'm Ready" full width, tutor strip at the bottom.
- Loading, error and locked-topic states on the intro reuse the existing friendly screens.

## Tutor behaviour on the intro (from your rules file)
- **Text mode / voice not connected yet:** no audio; the chat shows one tutor line: "No marks, {first name}. I'm checking {count} skills so I can guide you better." ({count} = number of warm-up skills from the database.)
- **Voice mode (when voice arrives in Phase 4):** prepared now but switched off: reads the intro aloud with captions in the chat, avatar speaking then idle, "I'm Ready" pulses once, nothing advances until she taps. Blocked audio shows a small "Play" button; speaker button mutes (switches to text mode, remembered on the device); weak network skips audio and shows the weak-network notice. The speaker button shows "Voice is coming soon" until then.
- **When she types on the intro:** her message shows as a student bubble, is saved as an event, and the tutor replies with one of 8 moves using the approved lines word for word:
  ready (then does exactly what "I'm Ready" does) · question about the lesson · maths question (no explanation) · asks to skip the warm-up · "are you real?" · off-topic · distress or harm (safe-response line + flag the session as "distress" for a person to review) · unclear or empty.
  Until the AI is connected the move is picked by keyword matching on the server; later the AI only sorts her message into these categories and words the line, the engine still picks the move, and all reply checks apply. The tutor never teaches the topic or gives answers here.
- **Lines live in the lesson content:** the 8 intro lines plus the "No marks" line are added to the starter pack as hidden fallback lines for the intro, then the pack is reloaded with the same import, leak and re-import checks. Nothing typed into the code. All lines pass the banned-word check.
- **Placeholder:** "Ask your tutor a question..." on every lesson screen (replaces "Ask about anything...").
- **Tests:** each of the 8 moves is picked for a sample message; "ready" starts the lesson; distress creates a flag; lines come from the pack, not code.

## Final review additions
- **Number check:** the "{count}" and "25 minutes" in the approved lines are allowed because they appear in the approved script; the live reply check stays on.
- **One turn at a time:** while the tutor is replying, the send button waits; a second message merges into the next turn (existing rule).
- **Consent:** typing on the intro is only saved as an event once guardian consent is on record; otherwise the reply still shows but nothing is stored.
- **Double tap on "I'm Ready":** button locks after the first tap so only one lesson starts; a failed start shows the friendly error with "Try again".
- **Admin preview:** intro works in preview, and preview chats never count toward progress (existing rule).
- **Distress flag:** the student sees only the safe-response line; nothing in the screen says the session was flagged.
- **Keyboard and screen readers:** tab order breadcrumb → chips → I'm Ready → tutor panel; new tutor lines announced politely; Escape closes the phone chat sheet.
- **Skill chips** are not buttons (no tap effect), so they don't look clickable.
