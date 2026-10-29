# Chat history keeps every past chat (like ChatGPT / Claude)

## Cause
Your earlier chat ("i want to learn math", 10:49 Lagos) is saved, but "Start again" was pressed at 11:10. Chat history currently hides every chat from before the latest "Start again", so the list showed "No chats yet."

## Fix
- **Chat history always lists all her past chats**, newest first, whether or not she pressed "Start again". "Start again" still resets her progress and opens a fresh, empty chat; it no longer hides old chats.
- **Tap any chat to open it** and see the full conversation, scrolled to the newest message, then carry on talking.
- Still hidden: chats where she never wrote or tapped anything (Fiti's greeting only).
- Still private: she only ever sees her own chats.

## Technical details
- `summarize()` in `src/server/home/conversations.ts`: drop the restart cutoff filter; `listConversations` in `agent.server.ts` stops reading the `restart_journey` audit rows.
- `homeHistory(pick)` already checks only ownership, so reopening older chats works unchanged.
- Update `src/test/conversations.test.ts`: the cutoff test now asserts pre-Restart chats are listed.
- Update the Edge tabs rule in `AGENTS.md` ("post-Restart" removed) and the Restart rule wording so they match.
