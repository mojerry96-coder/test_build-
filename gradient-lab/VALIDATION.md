# Validation

Validated on 29 October 2026.

## Passed

- JavaScript syntax checks for the application source.
- Number parsing: integers, decimals, negative values, fractions, Unicode minus, invalid inputs and division by zero.
- Simplified equations, gradients, intercepts and fraction reduction.
- Completion predicates for all seven Beginner and six Intermediate missions, including the stricter downhill condition, vertical-line exclusion and points-away-from-y-axis condition.
- 500 seeded runs of each Advanced challenge generator against the brief's ranges, plus answer checks, specific wrong-answer comments, scoring and streaks, and the brief's sample Two points working.
- Real browser tests using Chromium Headless Shell 151 with Playwright 1.62.1.
- No horizontal overflow in all four initial screens at 1440 × 900, 1366 × 768, 1280 × 720 and 390 × 844.
- No vertical overflow in initial screens at the three desktop sizes above.
- No automatic completion on initial Beginner load.
- Live slider equations, completion feedback, optional reference line and walk-button activation.
- Mouse dragging and arrow-key point movement.
- Prediction input validation, correct feedback and hiding working after a point moves.
- Optional equation working and vertical-line explanation.
- Three unique pairs in the constrained same-line mission and leaving that mission.
- Advanced: invalid input not counted, all four steps of the feedback ladder, similar example with a small graph, live target rings, sliders moved on reveal, score and type persistence, New challenge leaving the score unchanged, confirmed score reset.
- Theme switching and confirmed progress reset.
- No uncaught browser JavaScript errors during the interaction test.
- Local font files parsed successfully, with separate regular and bold SN Pro weights.
- Local file entry pages loaded with no asset response failures.

## Limits

- The Advanced screen had no generated PNG reference; it is checked against the brief only.
- Chromium was tested; Safari and Firefox were not tested in this environment.
- Initial viewport fit is tested. Expanded hints and equation working, very short windows, high zoom and larger accessibility text settings may require scrolling.
- The mascot is static. No audio or LLM functionality is claimed.
- The generated reference PNGs are design concepts. Mathematical graph positions are determined by the SVG code, not by image pixels.

Run `node tests/math.test.cjs` for the pure checks. Run `npm run test:browser` after installing the development tools for browser checks. Set `CHROMIUM_PATH` only if using your own compatible Chromium executable.
