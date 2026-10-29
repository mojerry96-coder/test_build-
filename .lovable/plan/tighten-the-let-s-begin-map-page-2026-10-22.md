# Tighten the "Let's Begin" map page

## Changes
1. **Remove the Ask Fiti button** at the bottom left. On phones, the chat opens from a small round parrot button instead, because the page needs some way to open it there.
2. **Chat box on this page:** remove "Quiz me" and "SS3". The mic, the send button and "+" stay. The "Tutor" label goes too, since there is nothing left to switch between. The Ask Fiti page keeps all of these.
3. **Chat messages:**
   - Every Fiti line gets the same small parrot avatar. The first one is no longer squashed.
   - Fiti's lines that arrive together are grouped: the name shows once, with less space between lines.
   - The chat opens scrolled to the newest message.
4. **Parrot with motion:** the big parrot at the bottom right now moves.
   - Each time Fiti sends a new chat line, it gives a short shake or bob.
   - Its motion follows the mood of the line:
     - happy or celebrating: hop;
     - encouraging: nod;
     - asking a question: tilt;
     - thinking while Fiti is typing: slow sway;
     - otherwise it rests with gentle breathing.
   - It uses the existing tutor picture, so a future animated parrot can replace it.
   - No motion for reduced-motion settings, and it stops when the tab is hidden.
5. **Layout:**
   - The map and chat sit as one centred pair, with the map larger and the stops more evenly spread.
   - The chat is a fixed height that ends above the parrot. Fiti stands just under the chat's bottom-right corner, so they read as one unit.
   - The space between "Let's Begin" and the map is tightened, and "Back" lines up with the heading.
   - Under about 1100 px wide, the chat drops below the map at full width and the parrot shrinks.
   - The phone layout stays as it is, with the round parrot button opening the chat.

## Technical details
- `AskBox` gets a `minimal` prop that hides the mode chips and the class label; the path route passes it.
- The path route drops the Ask pill. On phones it adds a round parrot button that toggles `open`.
- The parrot uses `LiveTutor` with `mood` taken from the newest tutor message: celebrate when its key starts with `path_great`/done, question when the text ends with "?", thinking while `typing`, and encouraging otherwise. A new `lt-shake` keyframe (transform only) replays, keyed by the message count. It respects `prefers-reduced-motion`; LiveTutor already pauses when hidden.
- Chat grouping and avatar sizing are done in the route's wrapper classes and the `Conversation` props; no server changes. Wording is unchanged.
