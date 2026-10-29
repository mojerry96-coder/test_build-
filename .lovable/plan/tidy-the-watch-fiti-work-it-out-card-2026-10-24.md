# Tidy the "watch Fiti work it out" card

## 1. Steps centred and raised
- The numbered steps become one block centred left-to-right in the white card. Each line still starts at its number, so they stay easy to read.
- The block moves up to sit just under the question line, with a small gap, instead of floating in the middle with a big empty space above.
- When a graph is shown, the steps and the graph sit side by side as one centred group, as they do now.
- The lines grow with the card's height, so tall laptop screens don't leave a big empty gap at the bottom either.

## 2. Fiti's hidden bubble
The pale shape cut off above Fiti's head is his speech bubble, the one holding the question or his line. Fiti's picture is too tall for the space, so it pushes the bubble out of view at the top. The fix:
- Fiti shrinks to fit the height that's left, so the bubble always shows in full above his head.
- The bubble keeps at most 3 lines, so a long question never pushes Fiti off the bottom.
- In dark mode, the dark rectangle behind Fiti is removed so he stands straight on the card's background, the same fix already used on Practise.

## Also checked
Laptop (1377x892), wide screen and tablet, in both light and dark mode. Phones keep their own layout, with the small Fiti in the corner.

## Not changing
What the steps say, Fiti's voice, the buttons, and how the card works.

## Technical details
- `WhiteboardDialog.tsx` inner board: replace `justify-center` with `justify-start` on the board column. The steps row loses `flex-1` and becomes `mx-auto w-fit max-w-full` (`flex-none`). The `ol` uses `flex-none` when there's no drawing too. Add a top gap of `mt-[clamp(16px,4vh,48px)]` under the heading.
- Fiti column: `FitiClips` gets `h-full w-auto max-w-full` instead of `w-full` with the aspect ratio forcing its height, so it fits the `flex-1 min-h-0` stage. The bubble keeps `shrink-0`.
- Check that the dark-mode blend fix from Practise (`mix-blend-lighten`) reaches the pointer variant in this card. If not, pass the theme the same way.
- Headless screenshots of the warm-up explanation at 1377x892 and 1440x900, light and dark.
