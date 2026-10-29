# UI/UX review of the student flow, and the fix plan

Tested sign-in, home and the lesson page at phone (390px) and laptop (1280px) sizes while signed in. No console errors.

## What we found (lapses)

**Hover and press feedback**
1. Hover styles barely exist: only about 12 hover rules in the whole app, mostly in the stock button. Subject cards, chapter/quest/topic cards, confidence choices (Sure / Think so / Guessing), step list and chat chips do not change on hover.
2. Subject cards and other tappable cards show a plain arrow cursor instead of a hand.
3. Nothing changes when you press a choice or card on a phone (no pressed state).
4. Keyboard focus rings are missing on custom cards, choices and the maths input (it removes the outline and adds no replacement).

**Touch targets and readability**
5. On phones, the step tracker bar is 6px tall but opens the step map when tapped. It is too small to tap.
6. The "Ask the tutor" opener on phones is 20px tall; it should be at least 44px.
7. The disabled "Check" button is a flat grey with low contrast, and nothing says why it is disabled ("Pick how sure you are first").
8. On phones the tutor message bar covers the bottom of the question card when you scroll.

**Layout**
9. On laptops the tutor chat column is mostly empty space under one message.
10. The parrot in the chat header now sits loose with no frame; it needs a soft circular backing that matches the design (not the old square).
11. Home: locked subjects look nearly the same as the open one; "Coming later" needs stronger muting, and the open card needs a clear call to action.

**Missing modern components**
12. No toast notices: there is nothing like "Saved", "You're offline, we'll sync" or "Answer sent".
13. No tooltips on icon-only buttons (settings, mic, the step map).
14. No loading spinner or busy state on Check / Send while waiting for the server; you can tap twice.
15. No progress or "x of 8 done" summary on the home "Continue" card.
16. No celebration moment when a step is completed (planned earlier, not visible yet).
17. No visible "AI" label next to the tutor in the chat bubble on phones (laptops only show it in the header).

**Tutor chat panel: behaviour and replies**
18. The tutor does not really answer yet. Every typed question gets one of four fixed lines, picked by keywords (are you AI / feeling down / maths-sounding / off topic). "How do I find the run?" and "give me the answer" get the same reply.
19. Possible answer leak: on the current question (gradient through A(2,3) and B(6,11), answer 2), the chat showed "Up is 6 and across is 3, so 6 ÷ 3 = 2". That is a worked line from another item, and its result matches this question's answer. Needs confirming and fixing.
20. Nothing shows while the tutor is thinking, and the student can send again before the reply arrives.
21. Messages have no time and no "AI" tag on phones. Long replies are not split into readable chunks, and old messages do not fade.
22. The chat looks and acts the same in every lesson state. The exit-ticket "quiet" note is the only difference. There is no Override (teacher) view.
23. The voice button only shows "coming soon".

## Tutor chat behaviour per mode (to build)

```text
State                     What the chat does
Autopilot - teaching      Tutor speaks at each step; student can ask; hints only on request
Autopilot - question open Tutor never gives the answer; nudges, reminds, offers a hint
Exit ticket               Chat locked ("On your own now"), asks are queued for after
Reflection / close        Tutor asks the reflection question; summary at the end
Override - teacher live   Banner "Your teacher is guiding now"; teacher messages labelled "Teacher"; AI is silent
Override - paused         Input disabled, "Lesson paused by your teacher"
Hand back                 "The tutor is back" message; AI resumes from the same step
Offline                   Message saved and marked "Will send when online"
Low-data mode             Text only, no avatar or voice
```

Reply rules for every mode: no answers or answer-bearing numbers, no banned words, short (at most 3 lines), always says it is an AI, and gives a safe fallback line if anything fails or takes longer than the time limit.

## Fix plan

1. **Shared interaction styles**: hover lift and border tint, a hand cursor, a pressed scale (respecting reduced-motion), and a visible focus ring for every card, choice, chip and input. Add them once as shared tokens so the Figma restyle stays a token swap.
2. **Touch targets**: make the phone step tracker a 44px tap zone (thin bar inside), make the Ask opener 44px, and keep the bottom bar from covering content (reserve space at the bottom).
3. **Check / Send**: stronger disabled colour, a hint line under the button explaining what's missing, and a busy spinner that blocks double taps.
4. **Notices**: add toasts for saved, offline/back online, and errors; add tooltips to all icon-only buttons.
5. **Tutor presence**: soft round backing behind the parrot in the chat, an "AI tutor" label on phones, and a "the tutor is thinking" typing indicator.
6. **Laptop chat column**: show tips and quick-ask chips ("Give me a hint", "Explain again") in the empty space; the chat scrolls on its own.
7. **Home**: stronger muting for locked subjects, a progress bar ("3 of 8 steps") on the Continue card.
8. **Step complete moment**: a short check animation and toast with the encouraging parrot pose; turned off with reduced motion and low-data mode.
9. **Re-test** the same pages at 360, 390, 768 and 1280px, with keyboard-only navigation, and report screenshots.

## Technical details
- Add `@utility interactive` (hover/active/focus-visible) and tokens in `src/styles.css`; apply in NavCard, choice buttons in `parts.tsx`/stages, step list, chips.
- Mount `<Toaster />` (sonner) once in `__root.tsx`; wrap the app in `TooltipProvider`.
- Inputs: replace `focus:outline-none` with `focus-visible:ring-2 ring-ring`.
- Busy state from the mutation's pending flag; no change to server logic or lesson rules.

## Agreed changes from your notes (added), with my view
1. **Banned words** set to: wrong, wrongly, stupid, dumb, careless, carelessly, obviously, easy. "just" removed. The pack check suggests replacements. Agree. Adding "dumb" and the "-ly" forms closes real gaps.
2. **Restore the original wording** ("Just {count_words}, no marks." and "...with just one number?") and reload the pack. Agree. This is only safe after step 1, otherwise the pack check refuses it.
3. **Listening pose** as a sixth tutor state (closest image for now). Agree. It also fits the "tutor is thinking/listening" indicator above.
4. **"Explain the question"** returns the current guided item's explanation (hint rung 0). Agree. Today it returns the generic line.
5. **No step skipping** unless test access is on. Agree, this is important for the demo's honesty.
6. **Teach me / hints** limited to the right problem and the current item, refused on the server otherwise. Agree.
7. **Guided assessment** returns only "saved" per item, and feedback for all three after the third. Agree. The UI needs a matching "Saved" state and a combined review card, which I've added to the UI work.
8. **Reflection text** saved in the session and in the event. Agree.
9. **Parent summary row** at close, every line from this session's evidence. Agree.
10. **Topic-first rules and fallback lines**, never another topic's row. Agree. This is already the rule; I'll check every lookup follows it.
11. **New event types** added to the shared list. Agree.

**My additions from your screenshot:**
- After 3 tries the tutor walks through the full working (11 − 3 = 8, 6 − 2 = 4, 8 ÷ 4 = 2). That's fine as the last step. But those lines stay in the chat when the next question opens, and the earlier "6 ÷ 3 = 2" line matched the next answer. Each new question will start with a divider ("Question 3 of 3"), and older working will be folded away.
- The worked example's numbers (P(1,2), Q(3,8)) need to be checked by the maths checker so they can't equal the student's open question.
- One test per rule above (banned list, no skip, hint/teach-me refusal, guided "saved" only, summary lines from evidence, topic-first lookup).

## Order of work
1. Your agreed changes 1–11 (logic and content), with their tests.
2. Tutor chat fixes 10–14.
3. UI polish 1–9.
4. Full browser run on phone and laptop, then a report with screenshots.

## Final additions
- **Resume safety**: reopening a lesson restores the chat history and the open question exactly. Today the chat starts empty on reload.
- **Text size and captions**: the text-size setting also applies to chat bubbles and maths, and captions stay on in every mode.
- **Accessibility pass**: screen-reader labels on choices and chat, announce new tutor messages politely, and colour plus icon on every alert (amber, never red).
- **Performance budget**: check the first load stays under about 1.5 MB on a slow phone network after the new images and components are added. The parrot images will be resized to the sizes actually shown.
- **Demo checklist**: one written run-through (Autopilot, then the Override screens) to follow on Monday 26 October.
