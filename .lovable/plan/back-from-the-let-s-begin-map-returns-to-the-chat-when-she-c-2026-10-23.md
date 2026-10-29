# Back from the Let's Begin map returns to the chat when she came from the chat

## What changes
1. **Opened from Ask Fiti chat:** tapping "← Back" on the Let's Begin map takes her back to the same chat, not the chapter/quest page.
2. **"Continue learning" in the chat:** when she lands back in the chat, Fiti's latest message shows a "Continue learning" button. Tapping it reopens the map for the topic she was on, so she picks up where she left off. The line above it is an approved `home_*` fallback line (draft for Instructional Design approval), e.g. "Ready to pick up where you stopped?".
3. **Opened from Learning Hub or the chapter pages:** no change. Back still goes to the chapter page.
4. A direct link or reload of the map with no chat origin behaves as today.

## Technical details
- Chat navigation (`FitilaAgent.tsx` lines 63–64) passes search `{ from: "chat" }` to the `/path` route; the path route adds `validateSearch` for optional `from: "chat"`.
- Back link: `from === "chat"` → `<Link to="/">` with search `{ resume: topicId }`; otherwise unchanged.
- Ask page: when `resume` is present, call a new thin server function that appends one tutor message to the current `home_conversations` row (server-built: approved `home_continue` fallback line + a `HomeOption` "Continue learning" whose action opens the topic map, checked by `pickOption` like other options), then clears `resume` from the URL with `replace` so a reload doesn't repeat it. Skipped if the last tutor message already is that continue prompt.
- Test: decide/option test that the continue option only targets an open topic.
