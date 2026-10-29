# Dark mode on every screen, logo, icon contrast, search box and two fixes

These rules become the standard for every screen: navigation, lesson, sign-in and the rest.

## 0. Dark mode on every screen
- Dark mode no longer stops at navigation screens. Lesson, sign-in, meet the tutor, welcome and admin screens all follow the same Light / Dark / Use device setting choice, using the same dark tokens. No screen stays light-only.
- Lesson screen parts (board, item cards, maths keyboard, chat, captions, video and simulation frames, Override bar, alerts) are checked one by one. Any colour not on a token moves to one. The amber wrong-path alert keeps colour plus icon, never red.
- Simulations and videos come from other teams. Their frames get a dark surround, but the content inside stays as delivered.
- The contrast check widens to cover lesson text pairs (board, item card, captions, chips, alert) at AA.
- The same rules are recorded so every new screen uses them.

## 1. Locked cards: lock only
- Remove the "Coming later" line under locked subjects and the hover message "Coming later. We're working on it." The lock badge alone shows a subject isn't open yet.
- Screen readers still hear "{subject}, not available yet". Tapping a locked card on a phone does nothing, so no message pops up.
- The same applies to the locked chapter card ("More chapters").

## 2. Dark mode logo
- Add your white logo as the dark logo; the current one stays as the light logo.
- Every top bar, the sign-in page and loading screens switch with the mode (including "Use device setting"), with no flash of the wrong logo. Both show at the same size and position, keep their shape, and have alt text "uLesson".

## 3. Subject icons in dark mode (dark only; light unchanged)
- Open subjects: the tile is the subject colour at 18% over the card, and the icon shows fully in a lighter tint of that colour.
- Locked subjects: the same tile and icon at 60%, plus the lock badge.
- Lock badge in dark: a small dark circle with a light lock and a thin ring in the card colour.
- All 9 subjects get their own dark tile and icon colours. Each subject colour is taken from its own icon (Mathematics #E18C32 as given); the lighter tints are picked to pass.
- Contrast: every icon must reach at least 3:1 against its tile. I'll report each subject's ratio and adjust any that fail. An automatic check keeps it that way.
- Choose a chapter: the chapter card's icon tile follows the same dark rule.

## 4. Search box (one shared box for Home and Choose a chapter)
- Coloured line fix (your screenshot): the square blue box drawn around only the text area comes from the app-wide focus outline hitting the inner field. It goes away on the inner field only. Focus moves to the whole box: a 2 px #2CA1DA ring that follows its 12 px rounded corners (no size change), a slightly lighter background (dark: next lighter navy), and a blue search icon. 150 ms ease-out.
- The same check covers every other text field on all screens (sign-in, lesson answer box, chat), so none shows a square line inside a rounded box. Keyboard focus stays visible everywhere.
- Clicking anywhere in the box, including the icon, puts the cursor in it.
- Placeholder colour passes 4.5:1 in both modes.
- While typing, a clear (×) button appears; × or Escape clears the text and keeps the cursor in the box.
- Screen readers hear "Search subjects" or "Search chapters", plus a quiet results count ("3 subjects found").
- Choose a chapter has no search box today. Since the spec names "Find a chapter", I'll add it there, filtering the chapter list.

## 5. Two small fixes
- Mathematics icon: the current "√" is a stand-in from the icon set, not your Figma export, so no crop can fix it. I'll draw a "√x" icon to match the Figma look in both modes. If you can export the real Mathematics icon from Figma, I'll swap it in.
- Banner: shows "Step {x} of 8" for the step she's on. The bar fills by completed steps (step 1 = empty, step 5 = 4 of 8).

## 6. Continue Lesson button: hover and press
- Hover (mouse) and keyboard focus: the button lifts 2 px with a soft shadow, the background warms to a very light blue tint (#EEF3FF), and the text darkens slightly (#3F5797). Cursor: pointer. 180 ms, same easing as the cards.
- Press (click, tap, Enter or Space): it settles to 0 px lift and 97% size for 100 ms, then opens the lesson. A second tap during the press is ignored.
- Keyboard focus also shows a 2 px #2CA1DA ring with a 2 px gap, visible on the banner.
- Touch screens: press only, never stuck in hover after a tap. Reduced motion: no lift or shrink; colour change only.
- The button stays white in both modes as agreed; the hover tint and text colour are the same in light and dark, and both pass 4.5:1.
- The same button behaviour is reused for every main button on future screens.

## 7. Gaps closed (found in review)
- Other buttons on Home get the same hover/press language: the "Ask your tutor" pill, the bubble's X and "Tap me for another tip", the top bar tabs, and the avatar button.
- The tutor helper bubble stays white in dark mode as agreed, and its text still passes AA.
- Dark mode on lesson screens covers the lesson's own top bar, the help/hint buttons and the finish (close) screen, not just the board.
- Images that are white-backed (tutor pictures, simulation stills) get no dark tint, and none show a white box on navy.
- Switching mode mid-lesson changes colours instantly without restarting the lesson or losing her place.
- The phone browser bar colour follows the mode on every screen, not just navigation.
- Contrast numbers for every token pair go into the final report: pass/fail, plus the nearest passing value for any failure.

## Check
- Light and dark screenshots of Home, Choose a chapter, sign-in and a lesson (board, item card, video, simulation, alert) at laptop and phone.
- Reload in dark: no light flash or light logo.
- Search: click the icon, type, ×, Escape, keyboard focus ring, results count read out.
- Banner at step 1 shows an empty bar and "Step 1 of 8".
- Contrast report for all 9 icons, the placeholder and the lesson text pairs.

## Technical details
- Scope: drop `NAV_PATH` gating. The boot script puts `dark` on `<html>` before paint and the theme hook toggles it, so portalled menus and dialogs inherit it. Replace the AGENTS.md dark-mode rule with "all screens use tokens; `.dark` on html".
- Locked cards: remove the Tooltip/toast from `LockedCard` and the "Coming later" subtitle; `aria-label` becomes "{subject}, not available yet".
- Logo: `logo-dark.png.asset.json` from the upload; both `<img>` tags render, toggled with `dark:hidden` / `hidden dark:block`.
- Tokens: `--subject-{key}`, `--subject-{key}-tile-dark`, `--subject-{key}-icon-dark` for the 9 keys. Dark icons are drawn as a CSS mask of the existing PNG filled with the icon token.
- A `SearchBox` component used by Home and chapters; `:focus-within` styles, `outline:none` on the inner input only, `aria-live="polite"` count.
- Banner: the label uses the active step; the bar width is `(step-1)/8`.
