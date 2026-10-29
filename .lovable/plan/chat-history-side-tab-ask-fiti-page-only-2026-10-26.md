# Chat history side tab (Ask Fiti page only)

## What she sees
- A blue **Chat history** tab on the **left** edge, sitting just right of the left menu (beside Ask Fiti / Learning Hub), halfway down the page. It is built exactly like the Leaderboard tab (same blue, white words and clock icon, darker blue edge), mirrored to face the left.
- It shows **only on the Ask Fiti page**: the "Ready to learn" start page and the open chat. It does not show on lesson steps, the map, Learning Hub or any other page.
- Tapping it slides a panel out from the left, beside the menu, listing her past chats, newest first. On phones it opens from the bottom, and the tab sits above the typing box. The list shows:
  - each one shows its title (her first message, shortened) and when it was last used ("Today, 10:20", "Yesterday", "Mon 19 Oct")
  - the chat she has open now is marked "Open now"
  - a "New chat" button sits at the top
- Tapping a past chat opens it, scrolled to the newest message, and Fiti carries on in that chat. Its old buttons are shown but can't be replayed. Only buttons that are still on offer work, as now.
- **Empty state:** "No chats yet". If loading fails, the panel says so and offers "Try again".
- **After "Start again":** only chats from after her latest restart are listed.
- **Closing the panel:** tap X, tap outside it, or press Esc. It works in dark mode, with the keyboard, with a screen reader, and with reduced motion.

## Also included
- **Empty chats are hidden:** a chat with no messages from her (for example a "New chat" she never typed in) is not listed.
- **New chat appears straight away:** once she sends her first message in a new chat, it shows at the top of the list without a reload.
- **Fiti stays quiet:** opening an old chat does not make him read old lines aloud. He only speaks new replies.
- **No half-finished questions:** a question Fiti asked in an old chat more than 10 minutes ago is not picked up again, as now.
- **Never in the way:** the tab hides while the Restart dialog, profile menu or any other popup is open, and never covers the ask box, the subject cards or Fiti.
- **Back button:** after she opens an old chat and goes to the map, Back returns her to that same chat.
- **Fast and light:** the list loads only when she taps the tab, shows up to 50 chats, and loads quickly on a weak connection.
- **Private:** she only ever sees her own chats, checked on the server.
- **Checks:** one look in the app on a laptop and a phone, in light and dark mode.

## Moving Fiti on the "Ready to learn" page
- The still waving Fiti at the bottom right becomes the moving, waving Fiti from the page loader (same clip, no new picture), looping gently at the same size and spot.
- In low-data mode, with reduced motion, or on iPhones/Safari, he shows as the still waving picture, the same rule the loader already uses.
- The clip loads after the page is ready, so it never slows the page down.

## Technical details
- `src/routes/_authenticated/index.tsx`: replace the `parrot.url` `<img>` with the existing `fitila_wave_loader.webm` / `.webp` assets (reuse the same playback/fallback logic as `FitiLoader.tsx`, extracted into a small shared `WavingFiti` component so both use one rule).
- Extract the tab + sheet shell from `LeaderboardTab.tsx` into a shared `src/components/side-tab/SideTab.tsx` (label, icon, side left/right, position, children). LeaderboardTab reuses it with no visible change; Chat history uses side "left", offset by the menu width (`clamp(132px,8vw,148px)`).
- New `src/components/home/ChatHistoryTab.tsx` rendered only from `src/routes/_authenticated/index.tsx`.
- Server: `listConversations(admin, userId)` (her rows only, after restart cutoff, title or first student message, max 50) and `homeHistory` gains an optional `conversationId` (checked to be hers, else her latest). Thin wrappers in `src/lib/api/home.functions.ts`; type `ConversationSummary` in `src/shared/contracts`.
- Opening a chat sets the `["home-history"]` query data so the existing chat view, auto-scroll and Continue button keep working unchanged.
- Small test: the list keeps only her chats from after the restart, newest first, and falls back to her first message as the title.
- AGENTS.md: one rule for the shared side tab and chat history.
