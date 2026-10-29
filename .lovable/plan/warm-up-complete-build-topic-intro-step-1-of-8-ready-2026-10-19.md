# Warm-up: complete build (topic intro + Step 1 of 8 · Ready)

Source of truth: your build notes (parts A–K), Instructional Design's readiness document wording, and the question 1 screenshot. All wording goes into the starter pack, never into screens. Lines not in the document are stored as "seed" (placeholders for ID approval). Lesson screens stay light-only. Hidden answers, server checking, leak check, reply checks and admin previews are unchanged.

## 1. Flow (part A)
Already in place and kept: Home → chapter → quest → intro → lesson; old welcome page redirects; Enter Quest opens the first open topic's intro (Topics list if a quest has 2+ open topics); Continue Lesson skips the intro.
New or tightened:
- Leaving after the intro with nothing answered: Enter Quest shows the intro again (today it can skip it).
- If she has already shown all three warm-up skills anywhere on the platform, "I'm Ready" goes straight to the hook (Step 2).
- "I'm Ready" runs the normal session start with all its checks, then opens the first warm-up question.

## 2. Layout shared by intro and lesson
- Desktop 1440: content 1277 px wide; breadcrumb; title "Welcome to {topic}" from the topics table; a 690 px row with the main card (925 px) and tutor panel (340 px), 12 px apart. Tablet panel 300 px. This replaces the wider layout from the last round, to match the notes exactly.
- Breadcrumb adds "> {topic}" on lesson steps.
- Lesson steps only, at the top of the main card: an 8 px orange warm-up progress bar (fills by questions answered out of asked), "Step 1 of 8 · Ready · Question n of 3", and the thin 8-part step bar. The old separate lesson top bar goes; the normal top bar is used.
- Phone: no side panel; tutor bottom strip opens the chat sheet; main buttons fixed at the bottom above the strip.
- New tokens: bg-secondary, bg-tertiary, bg-selected, tutor and student bubbles, avatar ring, chip tiles, primary action, warm-up progress, selected option tint/border, right (green) and not-quite (amber) option colours.

## 3. Tutor panel (part D)
- Header: avatar on orange ring, name from the setting ("Your tutor" while empty), small "AI tutor" label back under the name, text/voice switch with your icons, minimise, close.
- Bubbles: tutor left with parrot and tail (#DBEDFF); student right (#E8F3F1); divider when a step starts ("Step 1 · Ready").
- Input: 40 px pill, "Ask your tutor a question...", 28 px mic and send; send disabled while empty.
- Close shows a small "Ask your tutor" pill with the parrot at the bottom right of the main card.
- Voice: "Voice is coming soon" until voice is connected; text works fully.

## 4. Topic intro (part E)
- Exact document wording stored in the pack: heading "Great choice, {first name}!", both paragraphs (with {count_words}: "three questions" / "two questions" / "one question" to match the questions she will actually get), closing line "Ready, {first name}? Let's see what you've got!".
- Skill chips only for the skills she will be asked: "Reading coordinates", "Working with a fraction", "Substituting into an equation".
- Opening chat line (seed): "No marks, {first name}. I'm checking {count} skills so I can guide you better."
- Sizes as in the notes (110 px parrot circle, 241 x 48 chips, 446 x 40 button).

## 5. Warm-up questions (part F)
- Content replaced with the document's three multiple-choice questions, word for word, with their four options and feedback each, and the new misconceptions with parent plain words. Old readiness items and their unused misconceptions are removed.
- Skill "Working with a fraction" (CALC-01) replaces the old negative-numbers warm-up skill; any later items that pointed at the old skill are checked and kept valid.
- Question 1 shows an interactive board (x 0–6, y 0–5) with the point (3, 2) plotted and labelled, switched by an item setting show_grid. This is a temporary board: a clean, illustrative drawing that is also interactive, built so your final illustration file can replace it later without changing the screen.
  - Clean drawing: soft grid, labelled axes, origin marked, the point as a clear dot with its label.
  - Interactive: tap or hover a gridline or point to highlight it and show its coordinates. A "Show me" control animates the walk from the origin, 3 across, then 2 up, with arrows and step labels.
  - Choosing an option previews its path on the board: "3 across and 2 up" draws across then up; "2 across and 3 up" draws the swapped path; "3 across and 2 down" draws down. This only shows what that option means. It never marks the option, and the correct path is never confirmed before she checks.
  - Works with keyboard (arrow keys move a highlight) and touch; respects reduced motion (no animation, final state shown).
  - Board actions are saved as events ("board explored") for the engine to read later, never as answers.
  - Question 2 (fraction) and question 3 (substitution) get no board for now; the board can be switched on per item when the illustration kit arrives.
- Question 2 shows a real stacked fraction.
- Options: 2 x 2 cards with radio, letter tile A–D (letters follow on-screen position), text. Shuffled per session on the server, stable on resume.
- Selected: orange tint and border. Check Answer disabled until something is picked.
- Right: green option with a tick, green feedback box and chat line, tutor celebrates, button becomes "Next", moves on by itself after about 3 s.
- Not quite: amber option with an alert icon, never red; others disabled; correct option never shown; amber feedback box and chat line; button "Let's fix it" (seed) opens the quick fix.
- One try, no Try Again, no popups or confetti. After the last question (and any quick fix) the hook starts by itself. "Saved" tick after each answer.
- Only questions for skills she hasn't already shown.

## 5b. Selection state (your selected-option screenshot)
- Selected card: soft orange fill (#FAF2EB), 1 px orange border (#E18C32), radio filled with a 14 px orange dot, option text turns orange. Only one card selected at a time; tapping another moves the selection; she can change it until she taps Check Answer.
- Unselected cards: white, grey border, empty radio, navy text.
- Check Answer turns from 60% faded to full the moment any option is selected.
- Letter tiles (A–D): your notes ask for them, but the screenshots show none. I'll follow the screenshots (no letter tiles) unless you say otherwise; letters are still read out to screen readers ("Option A, 3 across and 2 up").
- Hover (mouse) gives a light border tint; keyboard focus shows the rounded focus ring; the whole card is the tap target (at least 54 px tall).
- The board preview (section 5) follows the selected option.

## 5c. Gaps added
- Question shown: the chat bubble on desktop matches the "Tutor says" line; on screen the card shows only the card wording.
- Double-tap protection on Check Answer and Next, so one answer is never sent twice.
- Resume mid-question: same shuffled order, her selection is not kept (she reselects), answered questions stay answered with their feedback.
- Offline: Check Answer is queued and shows "Will check when you're back online"; no right/not-quite is shown until the server answers.
- Phone: the feedback box scrolls into view above the fixed button; Next/Let's fix it sit in the same fixed spot.
- Screen reader: the result (right / not quite and the feedback) is announced once.
- Reduced motion: no auto-advance animation, celebration shown as a still state; the 3-second auto move still happens, with a visible countdown on Next so it never surprises her.
- Admin preview sessions never write real evidence or affect "already shown" skills.
- Tutor "celebrating"/"encouraging" states use the existing tutor pictures until the avatar set arrives.

## 6. Quick fix (part G, all seed)
- "Quick fix · about 1 minute": a short tutor explanation card, then one practice question that works like a warm-up question, then the next warm-up question or the hook.
- Three repairs as written in the notes (coordinates, fraction, substitution).
- "Skip" link: "No problem, you can ask me about this any time." and continue; skill saved as not repaired.

## 7. Typing to the tutor (part H, all seed)
Ten moves with the exact lines from the notes (ready, about the lesson, topic question, asks for the answer, what does it mean, skip warm-up, are you real, off-topic, distress with a review flag, unclear). Chosen by keyword matching until the AI is connected. Works on the intro and during the warm-up; never gives answers.

## 8. What gets saved (part I)
One evidence row per answer (item, skill, attempt 1, first try, right or not, option, misconception, strength); readiness status per skill (shown / repaired / not repaired); the listed events.

## 9. Checks and report (part K)
- Reload the starter pack; banned-word, leak and re-import checks must pass.
- Tests: no shown skills gets 3 questions; all shown skips to the hook; one right and one not-quite per question; a quick fix completed and one skipped; automatic move to the hook; not-quite never reveals the correct option.
- Screenshots desktop and phone: intro, Q1 with an option selected, Q2 right, Q3 not quite, a quick fix, the hook opening. Then stop.

## Two deliberate differences from the spec (kept unless you say otherwise)
- Button text: "I'm Ready", "Check Answer", "Next" and "Let's fix it" keep dark text on the blue button. White text on that blue (#5CBBF3) is 2.2:1 and too faint to pass the readability rules.
- Ask box wording: stays "Ask your tutor a question...", the wording agreed earlier, not the screenshot's "Ask about anything....". Tell me if you want to switch.

## Other open points
- The screenshot shows an orange send button; the notes say blue (#5CBBF3). I'll follow the notes.
- The screenshot's options differ from the document ("3 up and 3 across"); I'll use the document's options.

## Technical details
- Pack: rewrite readiness items as `mcq` with `options` (readable) and answers/feedback in hidden tables; misconceptions/skills/topic_skills updated; intro and move lines as `intro_*` / `warmup_*` fallback lines with `config.status="seed"`; repairs + practice items; reload via `bun ./scripts/load-seed.ts`.
- Server: replace the readiness part of `demo-path.server.ts` (allowed: replace, keep `lesson.ts` shapes) with skill-filtered item selection, per-session seeded shuffle saved in `sessions.state`, check via `src/server/maths` returning only right/not-quite + misconception + feedback line, repair/skip transitions, auto-advance to hook; "already shown" read from `evidence`.
- Intro server function: count/chips from the filtered skill list; skip-to-hook flag.
- UI: new `WarmupStage` (options grid, grid plot via board SVG, fraction renderer), `QuickFixStage`, lesson layout moved onto the intro shell; `TutorChatPanel` header label restored.
- Tests added under `src/test/` for the rules listed in section 9.
