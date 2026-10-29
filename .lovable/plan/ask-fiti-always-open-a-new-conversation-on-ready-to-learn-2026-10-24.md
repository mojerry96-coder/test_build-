# Ask Fiti: always open a new conversation on "Ready to learn"

## Why the page gets skipped
The "Ready to learn, Mercy?" page shows only while the conversation has no messages and Fiti isn't busy. In a new conversation, Fiti fetches his opening line straight away (first-time talk, or his once-a-day hello). While he fetches, the page counts as "talking", and once his line arrives the conversation has a message. Either way it jumps to the chat view, so she never sees the start page. New Chat opens an empty conversation, so it hits the same thing.

## Change
1. Every new conversation (first visit of the day, New Chat, after Start again) opens on the "Ready to learn" page: the heading, the ask box, the three cards and the waving Fiti, as in your design.
2. Fiti's opening line (when he has one that day) shows as a small speech bubble next to the waving Fiti on that page, with its buttons, instead of turning the page into a chat.
3. Once she types, taps a card, or taps one of Fiti's buttons, the page turns into the chat, with Fiti's opening as the first message so nothing is lost.
4. If Fiti has no opening line, the page just waits for her.
5. Phones: same page; the bubble sits above the ask box, because the big Fiti is hidden there.

## Also included
- **Back from the map:** the "Ready to pick up where you stopped?" offer with its Continue learning button shows in the same bubble on the start page, instead of jumping into a chat.
- **First-time talk:** the getting-to-know-you questions for a brand-new student also start in the bubble; her first answer opens the chat so the rest of the questions run there.
- **Voice:** Fiti reads his bubble aloud as he does now, and the Fiti mute button still silences it.
- **No double greeting:** the opening is saved once, so it never shows twice when the chat opens or after a reload.
- **Loading:** while Fiti's line is coming, the page stays still (no flicker into the chat), and the bubble pops in when ready.
- **Dark mode and sizes:** the bubble uses the existing light/dark bubble colours; checked at phone, tablet and laptop sizes in both themes.
- **Screen readers:** the bubble is announced when it appears, and its buttons can be reached by keyboard.

## Not changing
What Fiti says, when the opening plays (still once per Lagos day; first-time talk unchanged), saved conversations, and how replies are chosen. Coming back to a conversation that already has messages still opens the chat.

## Technical details
- `src/routes/_authenticated/index.tsx`: `talking` becomes "a student message exists, or she has acted" instead of `msgs.length > 0 || busy`; the opening busy state no longer counts.
- `src/components/home/FitilaAgent.tsx` `useFitila`: expose the opening message separately (`openingMsg`) and add a `started` flag set by `run`/`press`/`pick`; the opening is added to `msgs` once she acts (it's already saved on the server).
- Ready page renders `openingMsg` in a bubble next to the parrot (desktop) or above the ask box (phone), with its buttons wired to `press`.
- A small test that a conversation holding only Fiti's opening still shows the start page, and one where she has sent a message shows the chat.
