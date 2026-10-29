# Ask Fiti: remember what it asked, show the plan, never repeat

## Why it happened
- When Fiti asks a question ("Shall we start with Gradient of a line?"), it doesn't remember that it asked.
- So the next "yes" goes through normal sorting on its own. A bare "yes" means nothing there, so she gets the clarifying question again.
- "can i see the plan?" also has no matching intent, so it fell through to the clarifying question.

## What changes

### 1. Fiti remembers what it just asked
- Every time Fiti asks a yes/no or choice question, it saves what "yes" would do. Examples: start Gradient of a line, start tonight's plan, open quest 2, or the list of options offered.
- That memory lasts until Fiti's next question or 10 minutes, whichever comes first.
- Her next message is checked against that memory before anything else:
  - **Yes words** (yes, yeah, ok, okay, sure, yes please, let's go, go, start, alright, 👍): Fiti does the saved action.
  - **No words** (no, not now, later, nah): Fiti says "No problem. Would you like to see your plan, or try a quick quiz?" with **See my plan** and **Quiz me** buttons.
  - **A number or an option's name** ("2", "Gradient of a line"): Fiti runs that option.
- Only if none of these match does the normal sorting run.

### 2. New: "See my plan" in the chat
- Fiti understands these: "can i see the plan?", "what's my plan", "show me my plan", "what am I doing this week", "plan".
- It replies with "Here's your plan, {first name}:", then shows a plan card inside the chat:
  - **Tonight:** numbered items, with a **Start** button on the first one.
  - **Rest of the week:** day, topic and a source label: *your plan*, *your mum's plan*, *from your teacher* or *recommended*.
  - An **Open My plan** link at the bottom.
- If the plan is empty, Fiti uses the existing "nothing planned" line plus the Quiz me button.

### 3. Never repeat the same line
- Fiti never posts the same line twice in a row.
- If a second clarifying question would be needed, Fiti says "Pick one, or tell me in your own words." It shows three buttons: **Start tonight's plan**, **See my plan**, **Quiz me**.

### 4. Every clarifying question has buttons
- Clarifying questions show their choice buttons from the very first time they appear. Today's first one has none in your screenshot.
- The default buttons are Start tonight's plan, See my plan and Quiz me.

### 5. Extra details
- **Old buttons:** tapping a button on an older message that is no longer offered gets "That choice has passed. Here's what we can do now:" plus the three buttons. It never runs the old action.
- **Yes without a plan:** if she says "yes" when tonight's plan is empty, Fiti offers Quiz me / See subjects instead of a dead end.
- **Pidgin and short forms:** "oya", "abeg yes", "k", "yh", "yep" count as yes; "abeg no", "no o", "nope" count as no.
- **Mixed replies:** "yes but show me the plan first" does what she asked (shows the plan) and keeps the pending start for her next "yes".
- **Same in Quiz mode:** works the same whether the Tutor or Quiz me chip is selected.
- **New Chat clears it:** a pending question never carries into a new conversation.
- **Logging:** every match is logged as pending_yes / pending_no / pending_option, so you can see why an action ran.

## New wording (draft, for Instructional Design approval)
These are added to the content pack and checked for banned words:
- "Here's your plan, {first_name}:"
- "No problem. Would you like to see your plan, or try a quick quiz?"
- "Pick one, or tell me in your own words."
- "That choice has passed. Here's what we can do now:"

## Check
I'll replay your exact conversation and confirm each reply:
1. Greeting → "can i see the plan?" → plan card
2. Greeting → "yes" → the lesson opens
3. Greeting → "no" → the No problem line with buttons
4. Greeting → nonsense twice → the second reply is "Pick one…" with three buttons, not a repeat

## Technical details
- **Pending action** is saved in the tutor message `meta.pending = { action, expiresAt }`. Possible actions are `start_plan_item(itemId)`, `start_plan`, `options[]` and `apply_change(proposal)`. `handleHome` reads it from `lastTutorMeta` before sorting; the existing `plan_yes`/options handling folds into this.
  - Questions that set it: greeting (start_plan_item for plan[0]), propose_change, list_quests (options), unavailable (option), offer-lesson lines.
- **Yes/no matching** is a new pure `matchPendingReply(text)` in `src/shared/home-intents.ts` (yes | no | number | option name | null), with unit tests for every phrase listed above.
- **New intent `view_plan`** goes in HOME_INTENTS with word-list patterns (it is also added to the AI classifier's allowed intents). `decideAction` maps it to `{type:"view_plan"}`; `act` returns `planView` (tonight items plus week items with day/topic/source label), built from `home.allPlan`. A new `HomePlanView` contract goes in `src/shared/contracts/home.ts`, rendered as a card in `Conversation` (`FitilaAgent.tsx`).
- **No-repeat rule:** before logging, if the reply text equals the previous tutor line, swap it for `home_pick_one` with three buttons. This is a tested rule in `decide.ts` (pure helper).
- **Buttons:** `clarify()` returns three buttons, adding `{ label: "See my plan", send: "show me my plan" }`.
- Then reload the seed and run the leak check, plus targeted tests for home-intents and decide only.
