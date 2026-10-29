# Student Home rebuilt, with Fitila acting as an agent

## What she will see
- **Left sidebar** (white, ~200 px): logo, Today (active), My plan, Notebook, Progress, Ask Fitila, her initials at the bottom. On phones it becomes a bottom bar (Today, My plan, Notebook, Progress).
- **Background**: light blue-grey with faint planet, flask and leaf shapes; large waving Fitila bottom right (on phones: small, above the plan card). Top right: Dark mode button and "🔥 {n} days in a row" streak badge with the small parrot.
- **Centre**: "Ready to learn, {first name}?" heading, then Fitila's plan card, the ask box, three cards.
- **Plan card**: Fitila avatar, "Good {morning/afternoon/evening}! Here's tonight's plan:", 1–3 numbered items, "Start with Fitila". Empty plan: "Let's make your plan".
- **Ask box**: "Or ask Fitila anything...", + button, Tutor / Quiz me chips, her class ("SS3"), microphone, orange send button.
- **Three cards**: Continue, Review due, From your teacher (filled with "Explore Mathematics" when fewer than three). Tapping runs the action directly.
- **Fitila's replies** appear in a chat strip under the ask box: typing dots at once, then one or two streamed lines. When a reply opens a screen (lesson, quiz), the screen opens as the line starts.

## How each message is handled
```text
message + mode chip
  -> word list (sure?) --yes--> intent
        | no
  -> AI sorting (3 s limit) --fail--> word list + one clarifying question
  -> engine picks the action from intent + plan + learner record + content
  -> action runs, Fitila's approved line plays (reply checks applied)
  -> intent, action, outcome logged (shown in Session debug)
```
The AI only sorts the message and pulls out topic/day/time words. It never picks actions, topics, dates or facts. Topics are matched only against real topics in the content.

## Actions
| Intent | Action | Line (seed, for ID approval) |
|---|---|---|
| start_plan | Open first plan item | "Let's go! {first item} first." |
| learn_topic | Open topic intro, or resume | "Great choice. Let's start {topic}." |
| quiz | 5 questions from weak + due skills (or named topic), existing items, one try each, evidence saved | "{n} quick questions on {topic}. Ready?" |
| homework_help | Guided walk-through using the quick-fix "Your turn" step cards, hints and maths-engine checking; never the final answer | "Let's do it together. First, {first step question}." |
| change_plan / edit_plan | Small card "Move Gradient to Thu 7 pm?" Yes / Pick another time; saved only on Yes; logged | approved lines |
| progress | Two-line summary + link to Progress | approved lines |
| topic_question | Up to 3 sentences from approved facts, then "Want the full lesson?" button | AI answer checked, else approved line |
| unavailable_topic | Offer an available option | "{subject} is coming soon. Shall we do {option} tonight?" |
| greeting | Greet by name, point to the plan | approved line |
| is_ai, personal_boundary, off_topic, distress, unclear | Existing rules; unclear asks one question with two likely options as buttons | existing lines |

Safety: never the final answer; no plan change without Yes; parent and teacher items cannot be removed; all reply checks apply.

## Things that do not exist yet (must be built)
1. **Tonight's plan** is built by the engine from her real data, in order: lesson in progress, review due, teacher assignment, next available topic. Sample teacher assignments and parent plan items are seeded only for admin preview accounts. Parent/teacher items cannot be removed.
2. **Review due**: skills with weak evidence, firm misconceptions (wrong with "Sure") or lucky guesses (right with "Guessing"), due after an interval from rule `review_interval_days` (default 3).
3. **Streak**: a day counts only with at least one completed lesson step or 5 minutes of learning, using Nigeria time (Africa/Lagos).
4. **Quiz**: 5 items from video check, worksheet, repair and practice items only (never exit ticket or guided assessment), skipping items she saw in the last 24 hours; marked by the maths engine, evidence saved, no answers in the browser.
5. **Homework help**: only when the maths engine can break the problem into steps (gradient between two points today). Otherwise the "I can help with gradient problems for now" line and the lesson offer; never a guessed answer.
6. **Unavailable topics**: anything not in the content (e.g. "add more algebra to my plan", "teach me chemistry") gets the coming-soon reply.
7. **My plan page**: simple list of her plan items (day, topic, source label, done or not). Notebook stays "coming soon".
8. **Ask Fitila chat**: tapping the chat strip under the ask box opens the full Ask Fitila chat, with history kept.
9. **Microphone**: tap to record, tap to stop; the recording is turned into text by Lovable AI speech-to-text, shown in the ask box, then handled like a typed message. Only when the guardian has given voice consent; otherwise the mic explains it needs a parent's OK. Recordings are not stored; small cost per recording from credits.
10. **Class label**: "SS3" for everyone until a class is saved per student.
11. **Plan times**: default study time 7 pm Lagos time (rule), unless she picks another.
12. **From your teacher** card opens the assigned topic's lesson (no separate assignment screen yet).
13. **Decorations**: planet, flask and leaf shapes and parrot images taken from your uploads.
14. **New Fitila lines** go into the starter pack marked draft, for Instructional Design approval.

## Match the design exactly
The shared screenshot is the spec. Sizes, spacing, colours, fonts, shadows, borders and positions are copied from it: logo, sidebar, Dark mode button, streak badge with small parrot, planet top centre-right, flask bottom left, soft leaf shapes, heading, ask box with its blue bottom edge, chips, class label, mic, orange send button, the three cards with their icons, and the large waving parrot bottom right. Every uploaded image is used where it appears in the design. The only differences are the ones you asked for: the plan card between heading and ask box, the menu items instead of "New Chat", the new placeholder, "SS3" instead of "Grade 6", "days in a row", and Fitila's three cards. Checked side by side against the screenshot at the same width before reporting.

## Test set (run after build, report intent, action, reply)
"teach me gradient" (Tutor), "quiz me" (Quiz me), "quiz me on graphs", "solve this: find the gradient of (1, 4) and (5, 12)", "I can't study tomorrow", "add more algebra to my plan", "how am I doing?", "what is a gradient?", "teach me chemistry", "how far", "who won the match", "asdfgh". Desktop and phone screenshots of Home as asked.

## Technical details
- Tables: `plan_items` (student_id, topic_id, kind, source own|parent|teacher, due_at, sort), `assignments`, `plan_changes` (audit). Browser select-only; writes via server functions. RLS per student; guardians/teachers read via existing links.
- Intents added to `src/shared/intro-moves.ts`-style module `src/shared/home-intents.ts` (word list + extractors for topic/day/time); AI kinds extended in `ai.server.ts` classification schema with mode hint.
- Engine: `src/server/home/agent.server.ts` decides action; wrapper `src/lib/api/home.functions.ts`.
- Quiz: `sessions.kind = 'quiz'`, reusing item marking in `src/server/maths`; homework steps via `evaluate.ts` exact fractions.
- Lines: new `home_*` fallback lines in `content/packs/MTH12_09_02_01.seed.json`; reload + leak check.
- Logs: `events` rows `home_intent`, `home_action`, `home_outcome`; Session debug gains a Home section.
- Tests: word-list intents for the test set, plan change needs Yes, locked items cannot be removed, homework never returns final answer, review-due rule.
- Fixes: "days in a row", real first name/initials, class from profile.
