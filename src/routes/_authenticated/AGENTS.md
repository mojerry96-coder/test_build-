# Learning pages
- Every in-app Back (subject, chapter, quest, map) first asks `cameFromChat()` (`src/lib/chat-open.ts`, rule in `src/shared/back-target.ts`, tested): a trip that left the Ask Fiti chat returns to the chat; Ask Fiti and Learning Hub clear the note. Why: Back must never strand her on chapter pages after she came from the chat.
