# Short summary titles for each chat in Chat history

## Today
Each chat is named after her first message, so the list fills up with "hello fiti", "hello fiti", "hello". It's hard to tell the chats apart.

## What she will see
Each chat gets a short title (2 to 5 words, title case) that sums up what happened in it, like ChatGPT and Claude do:
- Opened a topic: the topic's name, e.g. **"Lines and Their Steepness"**.
- Took a quiz: **"Quiz: Lines and Their Steepness"**.
- Looked at or changed her plan: **"My Study Plan"**.
- First-time talk with Fiti: **"Getting to Know Fiti"**.
- Asked a maths question or anything else: a short AI-written title, e.g. **"What Is a Gradient?"**.
- AI off, slow or unsafe: her first real message, cleaned up, e.g. "I Want to Learn Math". Plain greetings like "hello fiti" are skipped in favour of her next message.

The title updates as the chat goes on. A chat that starts with "hello" and then opens a topic is renamed to that topic. The date line under each title stays as it is.

## Safety
- Topic, quiz, plan and first-talk titles come straight from the chat's own record. The AI is only used for the "anything else" case.
- An AI title must be short, use no banned words, contain no numbers she didn't type, and never include an answer. Otherwise the first-message title is used.
- Titles are made on the server and saved with the chat. The AI writes a title at most once per chat, so it doesn't cost more each time she opens the list.
- Existing chats get their titles the first time the list loads.

## Technical details
- New pure `chatTitle(messages)` in `src/server/home/conversations.ts` (tested): priority opened topic (`meta.outcome = opened`, topic from the option) > quiz > plan intents > onboard > null; greeting filter for the first-message fallback.
- New `titleChat()` in `ai.server.ts` (3 s deadline, strict JSON `{ title }`), checked by the shared banned-words function, a length check and the numbers check from `src/server/checks/ai-answer.ts`.
- `home_conversations.title` holds the saved title, plus a small `title_source` column (`event` | `ai` | `first`) so an event title can replace an AI or first-message one later, but never the other way. Migration adds the column with no browser grants.
- `agent.server.ts` refreshes the title after each tutor reply. `listConversations` fills in missing titles for older chats (event rules only; the AI only for the newest 10 missing).
- Tests: topic beats greeting, quiz title, plan title, greeting skipped, AI title rejected when it has a banned word or a new number.
