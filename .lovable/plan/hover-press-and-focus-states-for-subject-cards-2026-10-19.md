# Hover, press and focus states for subject cards

One shared card behaviour, used now on Home subject cards and later on chapter, quest and topic cards.

## 1. Open cards (Mathematics for now)
- Hover or keyboard focus: the card lifts 3 px and gets the large soft shadow. A 1 px border appears in the subject colour at 35% (Mathematics #E18C32). The icon goes from 50% to 100% and the tile grows to 1.05. A 16 px chevron fades in on the right, sliding 4 px into place. The cursor becomes a pointer.
- All changes take 180 ms with the given easing, and reverse smoothly when the mouse leaves.
- Press: the card settles (down to 1 px lift, 99% size) for 100 ms, then opens the subject.

## 2. Locked cards ("Coming later")
- No lift, shadow or chevron; normal arrow cursor.
- Hover: after 300 ms a tooltip appears above the card, "Coming later. We're working on it." (Mulish Medium 13, white on #0A3150, 8 px corners, small arrow).
- The lock icon wiggles once per hover (−8° to 8° and back, 300 ms).
- Phone tap: the same message shows as a short toast at the bottom instead of a tooltip.

## 3. Keyboard and screen readers
- Open cards: reachable with Tab, open with Enter or Space. Focus shows the hover look plus a 2 px #2CA1DA ring with a 2 px gap.
- Locked cards: not focusable; read out as "{subject}, coming later, not available yet".

## 4. Phones and tablets
- No hover look on touch screens: only the press state on open cards and the toast on locked ones. A card never stays stuck in its hover look after a tap.

## 5. Reduced motion
- No lift, scaling, slide or wiggle. Border, shadow, icon brightening and tooltip stay.

## 6. Dark mode
- Same states with dark colours. Instead of a shadow, the card gets a slightly lighter background (about #0A2232) plus the subject-colour border.
- Chevron in dark: #506AAC is too faint on navy (about 2.6:1), so it uses the light blue #7DCFFF.
- Tooltip in dark: #0A3150 nearly matches the top bar, so it gets a thin light edge to stand out.

## Decisions made where the spec is silent
- Subject colours: each subject gets its own colour token. Only Mathematics (#E18C32) is given; the others are needed only once their cards open, and will come from your Figma values then.
- Dark mode cards keep their current thin resting edge (added for contrast). On hover it switches to the subject colour.
- Keyboard users can't reach the locked-card message, since locked cards aren't focusable. Screen readers still hear "coming later, not available yet", which covers it.

## Additions to make the effects feel solid
- No jumping: the 1 px border space is always there (invisible at rest), so text never shifts when the border appears.
- Enter and Space show the same short press before opening, like a tap.
- No double opens: a second tap or click during the 100 ms press is ignored.
- Toasts don't pile up: repeated taps on locked cards show one toast, not a stack.
- The chevron is decoration only, so screen readers don't read it.
- Tablets with a mouse or trackpad get the hover look; pure touch screens don't.
- The lift never gets cut off: the grid leaves room above cards so the raised card and its shadow aren't clipped.

## Check
- Laptop: mouse hover, press, Tab plus Enter, Tab skipping locked cards, tooltip timing, one wiggle per hover.
- Phone: tap press then open, locked tap shows toast, no stuck hover.
- Reduced motion on, and dark mode.

## Technical details
- New `InteractiveCard` (open) and `LockedCard` in `src/components/home/`, reused later by `NavCard`.
- Tokens: `--subject-math` (#E18C32), `--focus-ring` (#2CA1DA), `--chevron`, `--card-hover` (dark only), `--tooltip-bg`. Timing and easing as CSS variables.
- Hover styles under `@media (hover: hover)` so touch never sticks; `:focus-visible` mirrors hover. Press uses `:active`, with navigation after a 100 ms timeout. Reduced-motion overrides go in the existing reduced-motion block.
- Tooltip: shadcn Tooltip with `delayDuration={300}`, shown only on hover devices. The touch toast uses sonner.
- Locked card: a `div` with `role="group"` and an `aria-label`, no tabindex.
