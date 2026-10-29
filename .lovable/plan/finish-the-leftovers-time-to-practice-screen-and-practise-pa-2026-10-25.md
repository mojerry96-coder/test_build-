# Finish the leftovers: "Time to practice" screen and practise page

## Time to practice screen (after the simulation)
1. **Heading from content:** add the line "Time to practice what you've learnt" to the starter pack as an approved line, have the lesson send it with the other labels, and reload the demo content. The screen already shows it when present; the current words stay as the backup.
2. **Dark-mode readability:** add the heading colour on the dark card and the button text on its blue to the readability test; run that test only. Darken a colour if one fails.
3. **Ask Fiti button:** confirm it shows at the bottom left on this screen; fix the placement if it doesn't.
4. **Reload:** reload on this screen and confirm it comes back to the card, not into the simulation; fix if needed.
5. **Look check:** screenshots on laptop (1377x892) and phone, light and dark, next to the spec. Adjust sizes or spacing that differ.

## Practise page (question and working side by side)
6. **Laptop fit:** at 1377x892, confirm the question, working and "Check this line" fit without scrolling; shrink the graph or gaps if not.
7. **"Tap me for a hint!" pill:** confirm it sits to Fiti's right and never covers Ask Fiti; move it if it does.
8. **Look check:** screenshots on laptop, tablet and phone, light and dark.

## How it is checked
- One browser run that signs in, opens the lesson at each screen and takes the screenshots above. I'll share what I saw and anything I changed.

## Technical details
- Seed: fallback key `sim_practice_title` in `content/packs/MTH12_09_02_01.seed.json`; `demo-path.server.ts` maps it to `warmup.labels.simPracticeTitle` (make sure `warmup.labels` is sent on the simulation step); reload with `bun ./scripts/load-seed.ts`.
- `src/test/dark-contrast.test.ts`: pairs `fh-ink`/`fh-card` (dark) and `vl-cta-ink`/`vl-cta` (light and dark).
- Ask Fiti / pill fixes, if needed, in `mcq/WarmupShell.tsx` and the `qf-avatar-tip` style.
