# Cleanup: contrast, banner parrot, "no active lesson" view

Three leftovers from the Choose a chapter build. Light mode keeps your design colours wherever they already pass. Only the failing values move, and each moves by the smallest amount that passes.

## 1. Contrast fixes

| Where | Now | Change |
|---|---|---|
| Light "CHAPTER 03" label (orange) | below 4.5:1 on white | Darken the same orange until it reaches 4.5:1 |
| Light "CHAPTER 04" label (green) | below 4.5:1 on white | Darken the same green until it reaches 4.5:1 |
| Banner small grey-blue line | 4.5:1+ where the text sits, 3.3:1 at the far right | No colour change. The line is kept from running into the bright right end (it truncates before it); the check measures behind the text |
| Dark mode: card vs page | 1.09:1 (#04131F on #081D2D) | Lift the card a step lighter, same hue, so cards clearly stand apart from the page |
| Dark mode: card border | 1.46:1 (#1E3A52) | Lighten the same blue until it reaches 3:1 against both page and card (the rule for borders and other non-text parts) |

- Fixed-colour items stay as they are: the white Continue button, the white tip bubble, the pastel icon tiles, the green progress bar and the tutor images.
- The automated contrast check gains these five cases, so none can slip back.
- You get a short table of old value → new value → contrast ratio for sign-off. Values are saved to the dark-mode memory.

## 2. Banner parrot
- Enlarge the parrot on the Choose a chapter banner to the size and position in the design on laptop. Scale it down in step on tablet and phone.
- It may overhang the top of the banner, as in the design. It never covers the chapter name, the topic line or the Continue Lesson button.
- Checked in light and dark, on laptop, tablet and phone.

## 3. "No active lesson" view
- Use the Super Admin panel's Start again / test-data reset on the test student's lesson, so Home and Choose a chapter show with no Continue banner.
- Screenshot both pages in light and dark, laptop and phone. Confirm the layout closes the gap where the banner was, with no empty space or leftover text.
- Then reopen the lesson so the test student is back where they were (a new attempt; the old one stays in the history).

## Technical details
- Tokens in `src/styles.css`: `--ch-03-ink`, `--ch-04-ink` (light), dark `--card` / `--surface` and `--line` / `--border`. Each new value is found by stepping lightness in oklch at fixed hue and chroma until it reaches the target ratio.
- `src/test/dark-contrast.test.ts`: add the light chapter-label cases, a dark card-vs-page check, a border 3:1 check, and banner subtitle contrast measured at the text's actual position.
- Banner subtitle: `max-width` and truncation in `ChapterBanner` (`src/components/chapters/ChapterParts.tsx`) so the text never reaches the bright gradient end.
- Parrot: adjust the size and offsets of the image box in `ChapterBanner` at each breakpoint; Playwright checks that it never overlaps the text or the button.
- No-active view: Playwright as the test student after the reset; screenshots under /tmp/browser/cleanup.
