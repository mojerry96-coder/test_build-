# Fiti speaks in the Ask Fiti chat

## What we found
- The Ask Fiti chat never asks for Fiti's voice. His messages are typed on screen only.
- The server also doesn't add Ask Fiti messages to the list of lines he may speak, so even a voice request would be refused.

## What changes for the student
- Each new Fiti message in the chat is read aloud once, starting as the words begin typing on screen. This covers the first-time chat, welcome-back messages and normal replies.
- Old messages loaded from history stay silent. Only the newest message speaks.
- When she sends a new message, taps a button, starts a New Chat or leaves the page, any line still playing stops.
- The voice button, low-data mode and her saved voice-off choice all apply here too.
- Music softens while he talks, the same as in lessons.
- Button labels (e.g. "Sounds good!") and option lists are not read. Only his words are.

## Technical section
- `src/lib/api/home.functions.ts`: after `homeSendFn` / `homeOpeningFn` (and history), call `noteShown(userId, reply.lines)` like `lesson.functions.ts` does.
- `FitilaAgent.tsx` `ConvTutor`: for a live (`m.live`) latest tutor message, `useSay(m.lines ?? [m.text], "home-msg:"+m.id)`. Call `hush()` on send, on button press, on New Chat and on unmount.
- No change to the Welcome or Quick Check cards (they already speak).
- Test: the server notes every line of a home reply (small unit test on the wrapper's noted payload).

## Also included
- The AI-written lines (her feeling reaction, the friendly reply to what she typed) are noted too, so they speak.
- Phones: the first line after a reload speaks once she taps anywhere (phones block sound before a tap).
- A slow or failed voice never delays the text; the words always appear on time.
- Two quick messages in a row don't talk over each other; the newer one replaces the older.
- The microphone is never listening while Fiti talks, so he doesn't hear himself.
- Turning voice off mid-line stops him at once.
