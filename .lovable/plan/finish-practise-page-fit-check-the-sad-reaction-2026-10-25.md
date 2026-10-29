# Finish: practise page fit + check the sad reaction

## 1. Remove the page scroll on the practise page
- The ~150px of spare space under the cards comes from the page frame's bottom padding (kept for Fiti and Ask Fiti on other steps). On the practise step only, on laptops, drop it so the page is exactly one screen tall.
- Give that height back to the cards, so the graph grows taller (and wider, since the squares stay square).
- Fiti and Ask Fiti stay bottom-left and don't overlap the cards.
- Make the written-lines box show at least 2 full lines before the keys. If it doesn't fit, shrink the keys slightly first (never below 44px).

## 2. Check the page after the last tweaks
- Load the practise page at 1377x892 and confirm it opens with no page scroll, the graph is bigger, every key and the Check button are visible, and lines scroll inside their box.

## 3. Check the other screens
- Short laptop (1280x720), light and dark.
- Phone (390x844): the stacked layout and "Show graph" still work, and the Check button sits under the keys.
- Ask Fiti chat open: the cards shrink beside it, the graph refits, and nothing overlaps.
- Fix anything that looks off on those screens.

## 4. Check the sad reaction in the app
- Pick a wrong answer on a warm-up question, write a wrong practise line, and get a quick fix step wrong. Do each in light and dark mode, and confirm Fiti plays the sad clip once, has no green edge, and returns to normal.
- Video question: a wrong pick shows the see-through sad Fiti. Note whether it plays in Safari.

## Technical details
- `WarmupShell.tsx`: drop `md:pb-[150px]` (content wrapper) when `fitiLeft` (practise only) on `lg`. `PractiseStage.tsx`: card-grid height calc uses the freed space. Set the `ol` to `lg:min-h-[120px]`, and the key height clamp drops to 4.4vh if needed.
- Playwright screenshots under /tmp/browser; only what's needed to confirm each point.
