# Fix: "Continue learning" missing after coming back from the map

## What happens today
- When Fiti says "Great choice. Let's start Gradient of a line.", he opens the map by himself, but that message has no button of its own.
- The "Continue learning" message is only added if she comes back with the map's own **Back** link. Coming back any other way (the browser back button, the Ask Fiti link in the left menu, or a reload) shows no Continue at all.
- Even after Back, the added message is never saved, so it disappears if the page reloads or the chat history loads a moment later.
- The exact way you came back isn't confirmed yet. The first step is to repeat all three ways and see which one fails.

## Fix
1. Any Fiti message that opens a lesson map gets a lasting **Continue learning** button to that same topic. It's saved with the chat, so it shows however she comes back, and after a reload too.
2. The "Ready to pick up where you stopped?" message after Back is saved with the chat as well. It never shows twice in a row and is never wiped by history loading late.
3. The button keeps today's rules: it points at the next open part of the topic, and shows the finished/locked wording when needed.
4. Restart and New Chat still start clean, with no leftover Continue.

## Checks
- Ask Fiti to start → map opens → come back using Back, the browser back button, and the left-menu Ask Fiti link. Continue shows each time and opens the map.
- Reload the chat: Continue is still there.
- Light and dark mode, laptop and phone.

## Technical details
- Server (`agent.server.ts`): when a reply has `navigate.to === "lesson"`, add `{ label, link: ".../path?from=chat" }` to the saved tutor message's buttons (label from the existing content-driven continue label), so `home_messages`/history returns it.
- `FitilaAgent.tsx` `addTutor`: also write into the `["home-history"]` cache; dedupe against the last tutor message with any link to the same topic path (ignore `?from=chat`).
- `index.tsx` resume effect: run after history is ready so a late history load doesn't replace it.
- Add a small test for the dedupe/link-matching rule.
