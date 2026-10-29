# Answer tiles: centred like the spec, picked tile outlined in its own colour

## Changes
1. **Picked tile outline**: the picked tile gets a 3 px outline in its own darker shade (A purple-blue, B orange, C green, D gold), the same colour as its bottom edge, in place of the navy outline used for every tile today. It still lifts slightly when picked.
2. **Centred text**: each answer sits exactly in the middle of its tile, as in the spec. The letter badge stays top-left without pushing the text. The tick that appears on the right when picked is removed, so the text stays centred; the outline shows what's picked. A right answer still turns green, and a not-quite answer still turns amber with its icon.
3. **Centred block**: the question, the 2x2 tiles and Check Answer share one centre line in the space to the right of the side menu, as in the spec.
4. **Dark mode**: the outline uses the same per-tile colours, and the contrast test is kept passing.
5. **Check Answer is back**: on questions like the (3, 2) one, the graph is hidden, and the button was hidden along with it. Check Answer now always shows under the tiles: greyed out until she picks, raised blue once she has.
6. **What happens after Check Answer**:
   - **Right**: the picked tile turns green with a little pop, the success sound plays, the parrot cheers, and Fiti's approved praise line shows in the pill above Hint. The button becomes "Next".
   - **Not quite**: the picked tile turns soft amber with its warning icon and a gentle shake (never red). Fiti's approved line shows in the amber pill. The quick fix opens as now, and "Back to the board" sits under Check Answer.
   - **While checking**: the button shows it's busy and can't be tapped twice.
   - **Offline**: "Will check when you're back online" shows under the button.
   - **Response pop-ups use your new design** (same card as "Great Choice!"): a white rounded card over a dimmed page, with the round parrot picture at the top, a big title, a short message, one raised blue button, and the orange gradient bottom edge with the soft squiggle, star and cloud shapes.
     - **Right** ("You got it!"): thumbs-up parrot, Fiti's approved praise line, button "Continue".
     - **Close / not quite** ("You got close!"): thinking parrot with glasses, Fiti's approved explanation line, button "Try Again". No red anywhere.
     - The quiz and video check pop-ups use the same card. Titles and messages still come only from approved lesson content.

## Technical details (Check Answer)
- `WarmupStage.tsx`: the bottom actions are hidden when `item.board` is set, but the graph itself is hidden by `hideGraph`, so neither place renders the button. Base both on the same "graph shown" result (export it from `QuestionBody`'s rule).

## Technical details
- `src/styles.css`: `.mcq-tile[aria-checked="true"]` outline uses `var(--e)` in place of `var(--mcq-sel)`.
- `WarmupStage.tsx` `WarmupOptions`: drop the selected-tick span (keep the badge icon for warn), use equal `px-10` padding with absolute badges, and give the text `w-full text-center`.
- Check the shared quiz screen, which uses the same tiles, picks this up unchanged.
