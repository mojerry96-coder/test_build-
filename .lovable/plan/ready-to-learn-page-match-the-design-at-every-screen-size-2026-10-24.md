# "Ready to learn" page: match the design at every screen size

## 1. Remove what isn't in the design
- The small Fiti picture and his speech bubble ("Hi Kingsley! I'm Fiti… two quick things?" with Sure! / Let's just start) are removed from this page.
- Fiti's opening isn't lost. When she types, taps a card or presses send, the page turns into the chat and his opening is the first message there, with its buttons and voice.

## 2. Match the design (laptop and wider)
- **Heading, ask box and cards** form one centred group, a little above the middle of the screen, as in your design (the heading sits at about 38% of the height). The group grows to about 715px wide on large screens.
- **Waving Fiti** moves to the bottom-right corner of the page, large (about a third of the screen's height), standing clear of the cards. He doesn't sit beside the ask box any more.
- The **three cards** stay in one row under the ask box with even gaps, and their text stays readable instead of being cut short.
- The header (Dark mode, Learning Streak), the side bar and the background shapes stay as they are.

## 3. Other screen sizes
- **Wide (1600px+):** the group stays centred and Fiti scales up a little, but never covers the cards.
- **Laptop (1280-1440px):** Fiti is a bit smaller and still in the bottom-right corner, clear of the cards.
- **Tablet (768-1279px):** the same centred group, the cards stay three across, and Fiti is smaller in the corner. If the space would make him overlap the cards, he's hidden.
- **Phone (under 768px):** the heading, then the ask box, then the cards stacked one above the other. Fiti is hidden so the ask box fits without scrolling, and the bottom tabs keep their place.
- **Short laptop screens:** the group moves up so the cards are never pushed below the fold.

## Also included
- Dark mode uses the same layout with its own colours.
- The ask box, mic and send buttons are unchanged.
- I'll check each size on screen (1440, 1377x892, 1024, 820 and 390 wide) in light and dark mode before reporting back.

## Also covered
- **Long names:** "Ready to learn, Oluwaseun?" wraps onto two lines instead of running off the screen on phones.
- **First-time questions:** a new student still gets Fiti's two quick questions. They're the first thing in the chat once she starts, and nothing is skipped.
- **Ask box:** on phones it stays visible above the keyboard while she types, and the send button stays in reach.
- **Fiti's wave:** it plays once when the page opens, and plays still for students who've turned off motion.
- **Text size:** her text-size setting still works without breaking the cards' row.
- **No jump:** the page doesn't shift as fonts and pictures load.
- **Tablet turned sideways:** handled the same way as a laptop.

## Technical details
- `src/routes/_authenticated/index.tsx`: remove `bubbleEl` and its two placements, and drop the now-unused `startBubble` / `TutorLine` imports.
- `main`: `min-h-[100dvh] flex flex-col justify-center` with a slight upward offset (`pb-[12vh]`), and `max-w-[clamp(560px,52vw,760px)]`.
- Parrot `img`: `fixed bottom-[4vh] right-[clamp(24px,6vw,140px)] h-[clamp(200px,32vh,360px)]`, hidden below 768px and below a 600px viewport height.
- Cards: `sm:grid-cols-3` stays; `truncate` becomes `line-clamp-2` for the subline.
- `showStartPage` is unchanged. Update the AGENTS.md "Ready to learn" rule to remove the bubble mention.
