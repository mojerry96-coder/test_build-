# Floating subject cards, readable labels, tidier streak

## 1. Cards float gently
- **Each card drifts in a slow loop:** sideways 0 → 6px and back, a small bob of 0 → −3px, and a tiny tilt of −0.6° → 0.6°, all eased smoothly.
- **No two cards move in step:**
  - Each card takes between 6 and 9 seconds per loop.
  - Start delays run from 0 to 2.5 seconds, depending on the card's position.
  - Odd cards start drifting right, even cards left.
- **Icons float a bit more than the card**, up to 8px sideways and −5px up, on a slightly different timing, for depth.
- Only movement effects are used, never size or layout changes, so it stays smooth on budget phones.

## 2. Hover, keyboard focus and tap
- **Hover or focus:** the float pauses smoothly, the card lifts 4px, its shadow deepens and the icon grows to 1.08×. Moving away resumes the float.
- **Press:** the card shrinks to 0.98× briefly, then opens the subject.

## 3. Subjects not open yet
- **Float:** they still float, at half the distance.
- **Label:** a small lock and "Coming soon" appear under the name.
- **Tapping:** they can't be opened. A tap shows the short "Only Mathematics is open for now" note.
- **Mathematics** floats normally and opens.
- Note: two messages ago you asked me to remove "Coming soon". This new request brings it back as a small label under the name. I'm following the newer instruction.

## 4. Rules
- **Reduced motion:** if the phone or computer is set to reduce motion, there is no float or tilt, only the hover lift.
- **Low-data mode:** the app has no working low-data switch right now. If one is added later, it will turn the float off the same way.
- **Pausing:** the float pauses when the cards are scrolled off screen or the tab is in the background.

## 5. Label contrast (all nine checked against 4.5:1)
Today only Economics and Physics pass:

| Subject | Now | New colour | New contrast |
|---|---|---|---|
| Mathematics | 2.6 | #B23A0C | 4.3, then darkened to reach 4.5+ |
| English | 3.5 | #155891 | 4.8+ |
| Biology | 2.7 | #4F45B8 | 5.0 |
| Chemistry | 1.6 | #8E4A0E | 5.0 |
| Economics | 6.0 | unchanged | |
| Government | 2.7 | #8A5A0A | 4.8 |
| Accounting | 3.9 | #0F6646 | 5+ |
| Literature | 2.7 | #8A5A0A | 4.8 |
| Physics | 5.2 | unchanged | |

- Your suggested #A85A12 for Chemistry only reaches 3.75 on its peach card, so I'll use the deeper #8E4A0E, which still reads as orange-brown.
- Each final colour will be confirmed at 4.5 or above by an automatic check. The dark-mode labels are checked too.

## 6. Improve the streak section (your second screenshot)
- **Overlap:** the "Learning Streak" label currently touches the streak badge. It moves down with a clear 20px gap, left-aligned with the circles, matching your spec.
- **Circles:** they shrink from about 48px to 40px, with 10px gaps, as in the spec. Learned days use the solid orange with fire and no heavy bottom shadow; today keeps its thin blue ring.
- **Text:** the badge text stays "4 days in a row". Your spec says "in a roll", which reads as a typo; tell me if you want it changed.

## Check
- Watch the float briefly at 1377 wide.
- Confirm the page still fits without scrolling.
- Run the contrast check for all nine labels.

## Technical details
- **Animation:** keyframes `hub-float` and `hub-float-icon` are defined in `src/styles.css`. They are driven by CSS variables per tile: `--dur`, `--delay`, `--dx` (±6px, ±3px when locked), `--dir`.
- **Pause and reduced motion:** `[data-paused]` and `:hover`/`:focus-visible` set `animation-play-state: paused`, and `@media (prefers-reduced-motion)` disables the animation.
- **Off-screen and background pause:** one IntersectionObserver plus a `visibilitychange` listener on the grid toggles `data-paused`.
- **Press:** `active:scale-[.98]`, done through a wrapper so it doesn't clash with the animated transform.
- **Colours:** update the `--hub-*-ink` tokens, and add the hub label pairs to `src/test/dark-contrast.test.ts`.

## 7. Also included (gaps found)
- **Screen readers:** cards that aren't open yet are read as "Chemistry, coming soon", not as a silent tile. Mathematics is read as a link.
- **Keyboard:** Tab moves through all nine cards. Enter on Mathematics opens it; Enter on a locked card shows the same note as a tap.
- **Phone and tablet:** the drift shrinks to half on narrow screens so cards never touch or get clipped at the grid edge. Cards aren't tilted while the page is scrolling on touch.
- **Shadow:** the deeper hover shadow fades in rather than being redrawn, so it stays smooth on budget phones.
- **Lock icon:** a small outline lock in each card's own label colour, no new image needed.
- **Dark mode:** the dark label colours are kept at 4.5:1 or above.
- **No new wording:** "Coming soon" and "Only Mathematics is open for now" already exist.
