# Practise page: tapping Fiti gives the hint (never opens chat) + leftovers

## 1. Tapping Fiti must drop the hint, not open Ask Fiti
What she should see: tap Fiti on the practise page, the approved hint drops in as a bubble beside him (same as the simulation), Fiti speaks it, and the Ask Fiti chat stays closed. Tapping again closes the hint.

Steps:
- Reproduce first in the browser at her laptop size (1377x892): tap Fiti, record what actually receives the tap and whether the chat opens. Likely suspects (not yet confirmed): the Fiti picture sits directly on top of the Ask Fiti button so part of the tap lands on the button; the "Tap me for a hint!" pill or Fiti's lower edge overlaps the button; or a failed hint request falls back to opening chat.
- Fix whichever it is:
  - Fiti's tap is fully self-contained (stops the tap from reaching anything under him) and only runs the hint.
  - Leave a clear gap between Fiti and the Ask Fiti button so the two never overlap; the pill sits to his right, not over the button.
  - If the hint can't load, Fiti shows the approved step tip in the bubble instead of opening chat.
- Ask Fiti opens chat only when she taps the Ask Fiti button itself.
- If the chat is already open, tapping Fiti still drops the hint beside him and leaves the chat as it is (no empty chat panel).
- Same on phones: tapping Fiti (top right) shows the hint, never the chat sheet.
- Works with the keyboard too (Enter/Space on Fiti gives the hint).
- A new hint stops any line Fiti is already saying, so only one voice plays; the hint closes when she types, taps a key or presses Check.
- The "Tap me for a hint!" pill goes away once she has seen the hint for that problem.

## 2. "Try this one on your own" after a reveal
- On the next problem after Fiti showed an answer, Fiti says one short approved line (new fallback line `worksheet_after_reveal`, added to the content pack, not code) in his bubble, spoken once.
- Shown only once per problem; not after a normal right answer.

## 3. Checks (done in the browser, reported back)
- Reload on a shown problem: the board still shows Fiti's worked answer, the problem stays "shown", and Next is still there.
- Phone and dark mode: reveal card, new graph, keypad and hint bubble all readable and fitting.
- Voice: confirm the speech audio actually returns and plays (not just requested); you'll still need to listen once yourself, since I can't hear it.
- Laptop fit: with 5+ lines written, the keys and Check button stay on screen; if not, the working list scrolls inside its card instead of the page.

## Technical details
- Files: `PractiseStage.tsx` (Fiti button `stopPropagation`, hint failure fallback, after-reveal line), `WarmupShell.tsx` (spacing between `#practise-fiti` slot and the buttons row), seed pack + `bun ./scripts/load-seed.ts`, `demo-path.server.ts` only to send the approved line.
- Test: small check that the after-reveal line plays only on the problem right after a reveal (`src/test/worksheet-reveal.test.ts`).
