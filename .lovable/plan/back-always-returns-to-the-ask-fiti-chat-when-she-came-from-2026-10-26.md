# Back always returns to the Ask Fiti chat when she came from it

## Problem
Only the "Let's Begin" map knows she came from the chat, and only while its address still carries the "from chat" note. As soon as she moves on (into a lesson step and back to the map, a reload, or a page that drops the note), Back falls back to the chapter's "Choose a quest" page, as in your screenshot. The chapter and quest pages have no idea about the chat at all.

## Fix (one rule for every Back)
- **Remember where the trip started.** When she leaves the Ask Fiti chat for any learning page (Continue Learning, a Fiti button, a typed "start lesson"), the app notes "this trip started in chat" for the browser tab, along with which chat it was.
- **Clear it when she starts a new trip elsewhere.** Opening Learning Hub, a subject from the menu, or New Chat starts a fresh trip with no chat behind it.
- **Every Back asks the same question.** Back on the map, on "Choose a quest", on "Choose a chapter", on the topics list and in the lesson steps checks the note first:
  - Trip started in chat: go straight to that chat, scrolled to the newest message (never the empty "Ready to learn" page).
  - Otherwise: keep today's behaviour (map goes to quests, quests to chapters, chapters to Learning Hub).
- **The browser's back button** keeps working step by step as it does now; the in-app Back button is the one that jumps to the chat.
- Works after a reload, because the note lives for the tab, not in the address.

## Also included
- Opening a chat from Chat history updates the note to that chat.
- "Start again" clears the note.
- A small test for the rule: started in chat goes to chat; started from Learning Hub goes up one level; New Chat clears it.

## Technical details
- New `src/lib/learning-trail.ts`: sessionStorage `{ origin: "chat", conversationId }`, with `startTrailFromChat`, `clearTrail`, `backTarget(fallback)`; pure decision in `src/shared/back-target.ts` (tested in `src/test/back-target.test.ts`). Replaces the ad-hoc `?from=chat` / `chat-open.ts` check (kept only as an extra signal).
- Set in `FitilaAgent.tsx` and `_authenticated/index.tsx` where they navigate to a map; cleared by Learning Hub/subject nav in `FitilaShell.tsx`, New Chat, and the restart epoch reset.
- `PageHeading onBack` in `$subject.index.tsx`, `$subject.$chapter.index.tsx`, `BackLink` in `$subject.$chapter.$quest.index.tsx`, the map's Back, and the lesson Back in `WarmupShell.tsx` all call `backTarget()`; going to chat navigates to `/` with the saved conversation opened via `openConversationFn`.
- Add one `AGENTS.md` rule replacing the current "Back from map" behaviour note.
