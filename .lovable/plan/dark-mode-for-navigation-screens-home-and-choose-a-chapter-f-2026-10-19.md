# Dark mode for navigation screens (Home and Choose a chapter first)

## 1. Tokens
- Every colour token gets a light value (unchanged) and a dark value. Components use tokens only; any colour written directly in the Home and chapter screens gets moved into a token.
- Dark values below were sampled from the attached design. If you send the exact Figma values, those replace them.

| Token | Dark value (sampled) |
|---|---|
| Page background | #071D2D, soft blue glow top-right |
| Top bar | #0A3051 |
| Cards | #04141E |
| Banner | #025888, no black overlay |
| Search box | #0A3051, no border |
| Primary text / headings / subject names | #FFFFFF |
| Secondary text | about #D0D8E0 |
| Tertiary text | about #A8B4C0 |
| Borders | about #16364D |
| Nav active | #FFFFFF, bold |
| Progress track | #DEE2E5 |

- Same in both modes: pastel subject icon tiles, tutor images, white Continue Lesson button, white tutor tip bubble (with its dark text), green progress fill, amber alert with icon.

## 2. Switching
- Default follows the device's light/dark setting and changes live when that setting changes.
- Avatar menu gets three choices: Light, Dark, Use device setting, with the current choice ticked. The choice is remembered on that device.
- No flash of the wrong colours: a tiny script in the page head sets the mode before anything is drawn.

## 3. Scope
- Dark mode applies to navigation screens only: Home, Choose a chapter, plus the quests and topics lists and the welcome screen, since they share the same look. Each new navigation screen joins by using the same tokens.
- Lesson screens, sign-in, meet the tutor and admin stay light in every mode until their dark designs arrive.

## 4. Accessibility
- Every text/background pair in dark mode is measured against WCAG AA (4.5:1 normal, 3:1 large). The report lists each pair with its ratio, and for any failure the nearest passing value.
- Cards vs page: #04141E on #071D2D is very close in brightness. If the measured difference is too small to read as a separate card, I add a thin border token (about #16364D) to cards in dark mode only and report it. The card fill stays as in the design.
- Final check: screenshots of Home and Choose a chapter in light and dark at laptop, tablet and phone. Also confirm a lesson page stays light while dark is on, and that the page doesn't flash on reload.

## 5. Also covered (easy to miss)
- Phone bar: the browser/status bar colour on phones matches the mode (top bar colour in dark, page colour in light).
- Phone bottom tabs, the avatar menu, the search placeholder and the "No subjects match" line all use the dark tokens.
- Loading and error states on navigation screens (skeletons, "That didn't load") follow the mode, so dark doesn't flash white while data loads.
- Locked "Coming later" cards: the faded look stays readable in dark and still meets contrast.
- Keyboard focus outline: a dark-mode focus colour that stays visible on cards and the banner.
- Moving from a dark Home into a light lesson switches cleanly, with no half-dark frame. Coming back restores dark.
- Open from you: exact dark values for secondary text, tertiary text and borders (the design only lets me approximate them).

## Technical details
- `src/styles.css`: fill the existing `.dark` block for the home tokens (`--page`, `--card`, `--text-*`, `--line`, `--banner`, `--nav-active`, a new `--topbar`, `--search`, `--track`). Fixed tokens (`--tint-*`, `--progress`, bubble, white button) get a `--*-fixed` token or keep one value in both blocks.
- The `dark` class goes on a navigation-screen wrapper, not on `<html>`, so lesson routes ignore it. A `theme` preference (`light|dark|system`) is kept in localStorage. An inline head script in the root route sets `data-theme` on `<html>` before first paint, and a small `useTheme` hook plus a `matchMedia` listener keep it in sync. Navigation layouts apply `.dark` when the resolved theme is dark.
- Avatar menu: a `DropdownMenuRadioGroup` in the `TopBar`.
- Contrast: a small unit test computes ratios from the token values and fails below AA.
