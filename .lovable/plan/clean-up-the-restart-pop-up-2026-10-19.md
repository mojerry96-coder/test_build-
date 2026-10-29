# Clean up the Restart pop-up

## What changes
- The empty white "Restart ×" card in the bottom-left corner goes away. When you tap Restart in the admin tools, only the confirmation box in the middle of the screen opens.
- Cancel (or Esc, or tapping outside) closes the box and leaves the admin tools exactly as they were.
- After a restart, there's no "Started again" message, because the page reloads to Home straight away and you'd never see it. The admin tools close too, so nothing sits over the fresh Home page.
- Everything else stays the same: what gets reset, the wording in the box, the spinner while it works, and the "please try again" note if it fails.

## Technical notes
- `DevToolsPanel.tsx`: skip the `<section>` wrapper when `section === "restart"` and render `<Body>` (the AlertDialog) directly. Remove `toast("Started again")` and call `persist({ open: false })` before `window.location.assign("/")`.
