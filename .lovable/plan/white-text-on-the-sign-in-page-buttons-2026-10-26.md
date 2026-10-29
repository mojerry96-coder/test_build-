# White text on the sign-in page buttons

## What changes
- The "Sign in" button and the "Dark mode" / "Light mode" button on the sign-in page get white text and a white icon, the same as the blue buttons inside the app.
- This applies in both light and dark mode.
- The other buttons and links on the page stay as they are.

## Note
White on this light blue is softer to read than the current dark text. It matches the rest of the app, but if it looks faint later, the blue can be made a little deeper.

## Technical details
- `src/styles.css` lines ~960 and ~966: change `--si-btn-ink` from `#062236` to `#FFFFFF` for light and dark. The buttons already read this colour, so no component change is needed.
