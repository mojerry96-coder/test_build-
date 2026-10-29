# Warm-up question 1: fit on one screen, tutor hand-over, stray point

## 1. Stray point (cause found)
- The light-blue "(3, 5)" is the grid's hover marker: wherever the mouse rests on the grid, it draws a faint dot with its coordinates. It stays put when the pointer stops, so it looks like a second point.
- Fix: remove the hover marker completely. The grid shows only the item's own point (3, 2) and its label, plus the dashed path preview for the chosen option (unchanged).
- Check: the grid is shared by any question with the grid switch on; only question 1 uses it today. The hook and simulation grids are checked for the same hover-dot leftover.

## 2. Desktop (1280 px wide and up)
- Under the question: a two-column row. Left: grid about 360 x 260 px (x 0–6, y 0–5). Right: four option cards stacked, full column width, 54 px tall, 12 px apart, with Check Answer directly under them.
- Question text drops to Afacad SemiBold 28 on grid questions so everything fits at 1280 x 720 without scrolling.
- Questions without a grid keep the 2 x 2 options and the current button position.

## 3. Phone and tablet
- Grid full width, at most 200 px tall; options in one column right under it; Check Answer stays fixed at the bottom (already the case).

## 4. Tutor hand-over (seed)
- After each warm-up question's "Tutor says" message, the tutor adds: "Your turn: pick the answer you think is right, then tap Check Answer." Stored in the starter pack as a seed line, not in the screen.
- When that line appears, the options get a soft #DBEDFF glow for 1.5 s (a still glow with reduced motion).

## 5. Safety net
- If the options aren't fully visible (small screen or zoom), a small "↓ Choose your answer" cue floats at the bottom of the main card.
- When the hand-over line appears, the page scrolls smoothly to the options.
- The cue hides once the options are visible or one is selected.

## Checks
- Starter pack reload with leak and banned-word checks.
- One small test: the grid draws only the item's point. No screenshots unless you ask.

## Technical details
- `PointBoard` in `WarmupStage.tsx`: delete `hover` state, pointer handlers and the hover `<g>`; add a `compact` size prop (360x260 desktop, max-h 200px phone).
- `QuestionBody`: when `board` exists, `lg:grid-cols-[360px_minmax(0,1fr)]`; `WarmupOptions` gets a `stacked` prop (single column, h-54, gap-3); Check Answer rendered inside the right column on desktop; question `lg:text-[28px]` for grid items.
- New fallback line `warmup_your_turn` (config.status seed), sent by `demo-path.server.ts` right after the item prompt line; client triggers glow class (token `--color-tutor-bubble` #DBEDFF) and `scrollIntoView({behavior:"smooth", block:"nearest"})`.
- Cue uses an IntersectionObserver on the options group (threshold 1).
