# Quick fix in dark mode

## What's wrong in the screenshot
- Fiti stands inside a visible square. His moving picture has a light background that blends in on white but shows as a box on dark.
- Fiti's speech bubble is dark navy text on a dark card, so it can barely be read.
- The close X (top right) is dark on dark and almost invisible.
- The answer box is a flat grey, its "Type your answer" hint is faint, and the Check button and its label nearly disappear.
- The pink flower dots on the panel glow too brightly against the dark.
- The panel itself stays light, which is fine, but its edge looks harsh against the dark card.

## Changes (dark mode only; light mode stays exactly as now)
1. **Fiti without the box:** Fiti stands on a soft, rounded, light "spotlight" shape, the same pale colour as the panel. His picture's background then blends into it, like on light mode, and the square disappears. A soft glow fades it into the dark card.
2. **Readable bubble:** the bubble becomes a light card with dark navy text, matching the panel, with a soft shadow. The "Tap me for a hint!" pill gets the same look.
3. **Close X and top buttons:** light outline and icon on the dark card. Pause and Show all steps also become light-on-dark outlined pills.
4. **Answer box and Check:**
   - The answer box is white with dark text, a readable placeholder and the blue ring.
   - Check stays raised primary blue with a white label. While empty it is only slightly dimmed, still clearly readable.
5. **Softer panel details:** the flower dots and swoosh are toned down, and the panel gets a thin soft border and shadow so it sits nicely on the dark card.
6. **Contrast check:** every text in the quick fix meets the AA readability level in dark mode. This is added to the existing dark contrast test.

## Technical details
- `src/styles.css`, `.dark` block, quick-fix tokens only:
  - `--qf-flower` and `--qf-swoosh` become lower-opacity values.
  - Add `--qf-stage`, `--qf-bubble-bg` (light), `--qf-ctrl-ink` (light) and `--qf-input-bg` (white).
  - `.dark .qf-say` and `.dark .qf-avatar-tip` use the light bg with `--wb-navy` text.
  - `.dark .qf-panel` gets a border plus shadow.
- `WhiteboardDialog.tsx`:
  - A spotlight wrapper (`.qf-stage`: rounded-[40%] radial light background behind `FitiClips`, both breakpoints).
  - The close and top-control buttons use `--qf-ctrl-ink` in place of the hard-coded `--wb-navy` colour.
- The answer input and Check button in `QuickFix.tsx` / `YouTry` use the new input token. Check uses the shared primary style with `disabled:opacity-80`.
- Extend `src/test/dark-contrast.test.ts` with the pairs: bubble text on bubble bg, control ink on dark card, placeholder on input bg, Check label on primary. Run only that test.
