# Quick fix becomes a short guided lesson

Today the quick fix shows one line and a "Got it" button. It becomes a four-part lesson that teaches the skill, then returns to the warm-up. All the content is the seed wording from your document.

## What she sees after "Let's fix it"
Header: wrench icon, "Quick fix · about 1 minute", and "Skip for now" at the top right. The warm-up progress bar does not move.

```text
+-----------------------------------------------------------+
| [wrench] Quick fix · about 1 minute        Skip for now   |
|-----------------------------------------------------------|
| 1  Slip line (tutor, chosen by the option she picked)     |
| 2  WATCH HOW IT'S DONE                                    |
|    the worked example, one line every 1.5 s, maths shown  |
|    properly (fractions stacked); grid for coordinates     |
|    "Show all" link, then a [ Now you try ] button         |
| 3  YOU TRY                                                |
|    Step 1  "Multiply first: 2 x 4 = ?"   [ 8 ] [Check]    |
|      right: green tick, line written in full, next step   |
|      not quite: amber, one hint, try again                |
|      second miss: filled in for her, with a short reason  |
|    Step 2 ...                                             |
| 4  TRY ONE ALONE                                          |
|    normal warm-up question with letters and Check Answer  |
|    and the same popups; on not quite the button says      |
|    "Continue", there is no Skip, and no second fix        |
+-----------------------------------------------------------+
then the next warm-up question, or the hook after the last
```

1. **Slip line:** one tutor line matched to the mistake she made. It shows at the top of the card and in the chat. For example, "2x means 2 times x. Let's see it."
2. **Watch how it's done:** a worked example with different numbers. The lines appear one at a time, about 1.5 s apart, in Mulish SemiBold 18, #0A3150. Each line is also posted in the chat.
   - For coordinates, the grid draws the arrows and the point: across to 2, then up to 4.
   - "Show all" shows every line at once. "Now you try" moves on.
3. **You try, with help:** a new example split into steps. Each step has a small number box, with the on-screen keypad on phones. Steps that ask about direction use two buttons instead.
   - **Right:** a tick, and the step's line is written in full.
   - **Not quite:** amber, with one hint, and she tries again.
   - **Second miss:** the step is filled in for her, with a short reason, and she moves on.
   - The answers are checked on the server and are never sent to the browser.
   - For coordinates, the grid shows the point (5, 1) while she works.
4. **Try one alone:** the existing practice question, now ending as described in the sketch above.
5. **Skip for now:** "No problem, you can ask me about this any time." is posted in the chat, the skill is saved as not repaired, and she moves on.

## Content (seed, exactly as in your document)
- **REP_COORD_01:**
  - **Slip lines:** for "swapped the axes" and for "moved down for a positive second number".
  - **Watch:** the point (2, 4).
  - **You try:** (5, 1), with across = 5 and up = 1.
  - **Practice:** Q at (4, 1).
- **REP_CALC_01:**
  - **Slip lines:** three, one each for "stopped before dividing", "made a slip when dividing" and "added instead of dividing".
  - **Watch:** (10 − 4) ÷ (5 − 3), shown as a fraction.
  - **You try:** (11 − 2) ÷ (5 − 2), in three steps (9, 3, 3).
  - **Practice:** (9 − 3) ÷ (4 − 1).
- **REP_SUB_01:**
  - **Slip lines:** three, one each for "stopped before the last step", "read 2x as 2 + x" and "made a sign slip".
  - **Watch:** y = 3x + 2 with x = 4.
  - **You try:** y = 2x + 1 with x = 4, in two steps (8, 9).
  - **Practice:** y = 3x + 1 with x = 2.
- Every line is checked against the banned words. Each line is 1 to 3 short sentences, and none teaches the gradient.
- Each watch line and step can carry board cues later, when the illustration kit arrives, without changing the wording.

## Saved data
- **Events:**
  - quick fix started;
  - slip line shown;
  - watch completed or skipped;
  - each step: right first time, right after the hint, or filled in;
  - practice answer;
  - quick fix completed or skipped.
- **Readiness status:** repaired once she finishes the practice question, whether she gets it right or not. Not repaired if she skips.

## Small fix: tutor name in the panel
The name uses the full width of the header, and the mode switch spacing tightens if needed. Only names over 18 characters are cut short, and the full name shows on hover or tap.

## Checks and report
- **Reload and checks:** the starter pack is reloaded, then the leak check and re-import check are run. The leak check now also covers the slip lines, the watch lines, the step answers and the hints.
- **Tests:**
  - the slip line matches the misconception;
  - a step answered right moves on;
  - a first miss gives the hint;
  - a second miss fills the step in;
  - step answers are never in what the browser receives before checking;
  - skipping saves the skill as not repaired;
  - finishing the practice question saves it as repaired.
- **Screenshots:** the substitution quick fix on desktop and phone, from the slip line, through watch and you try (one step right, one after a hint), to the practice question. Then stop.

## Technical details
- **Pack shape:** each repair gains:
  - `slip: { [misconceptionId]: Script }`;
  - `watch: Script` (each segment can carry `display: "fraction"`, `board` cues);
  - `you_try: { board?, steps: [{ id, prompt, input: "number" | "choice", choices?, answer, hint, filled_line, full_line }] }`.
  - `micro_lesson` is dropped.
- **Import:** `plan.ts` stores `slip`, `watch` and each step's `answer`, `hint`, `full_line` and `filled_line` in the server-only `scripts` table (`repairs:{id}:slip:{mis}`, `repairs:{id}:watch`, `repairs:{id}:step:{n}:*`). Only step prompts and input types go to the browser, one step at a time as she reaches it. The leak check gains these keys.
- **Server (`demo-path.server.ts`):**
  - repair state lives in `demo.repairState = { part, step, misses }`;
  - new `repairStepFn` (check one step: right, hint, or filled) and `repairAdvanceFn` (watch to you try to practice); both are thin wrappers in `lesson.functions.ts`;
  - answers go through `src/server/maths` `answerMatches`, so a typed hyphen counts as a minus sign.
- **Client (`WarmupStage.tsx`):** a new `QuickFix` component with the parts SlipLine, WatchCard (it reuses the line-by-line reveal from the "Here's how it works" box), YouTrySteps and the practice question. It works the same in admin preview.
- **Contracts and events:** `lesson.ts` contracts are updated. The new events (`repair_slip_shown`, `repair_watch_done`, `repair_watch_skipped`, `repair_step`) are added to `EVENT_TYPES`.
- **Tutor panel header:** the name is `min-w-0 flex-1`, with a `title` tooltip when it is over 18 characters.

## Also in this build: the two open items
1. **Option changes saved:** each time she picks or changes an option before checking, an "option changed" event is saved with the question and the option. Fast taps are grouped so a quick double change saves once.
2. **Replaying the whole warm-up:** there's no need to wipe your account.
   - **Admin preview:** it always asks all three warm-up questions, ignoring skills your account has already shown. Your real student record stays untouched, and preview lessons never count as real evidence.
   - **Super Admin, Lesson jump:** a new "Fresh warm-up" button starts a new preview at question 1. "Start again" does the same.
   - **Screenshots:** with that in place, I'll take desktop and phone screenshots of questions 1 and 2, the quick fix and the hook.

Technical: `warmupIds` skips the "already shown" filter when `sessions.mode`/state marks the session as `admin_preview`, and the restart dev action reuses that. A debounced `option_changed` event (400 ms) goes through a thin `logOptionFn` that checks the session belongs to her.

## Added after review
- **Coming back mid-fix:** if she leaves and returns, she lands on the same part and step, and the watch lines she has already seen are shown at once.
- **Answer box:** works with the on-screen keypad and a real keyboard; Enter presses Check. Spaces and a hyphen used as a minus sign are accepted. Empty boxes can't be checked.
- **One check at a time:** the Check button is locked while waiting for the server, so a double tap is never counted as two tries.
- **Gentler motion:** for students who turn off motion, the watch lines and the grid arrows appear without animation. The 1.5 s timing pauses while the tab is hidden.
- **Screen readers:** each new line, tick, hint and filled-in step is read out once.
- **Phones:** the steps scroll inside the card, and Check stays above the keypad.
- **No connection:** a step check that can't reach the server shows "Check your connection" and keeps her answer. It isn't counted as a try.
- **Reply checks:** slip lines, hints and filled-in explanations pass the same banned-word and number checks as every tutor line.
