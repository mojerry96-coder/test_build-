# Remove the subject card outline in dark mode (Home)

## Change
- In dark mode, the subject cards on Home lose their thin blue resting outline. The cards stand out from the page by their lighter navy fill alone, as in light mode.
- Kept as is: the open card's hover/keyboard-focus look (subject-colour border, lift, chevron), the keyboard focus ring, locked-card tooltip and lock. Light mode doesn't change.
- The border space stays (transparent), so nothing shifts when the hover border appears.

## Check
- Dark-mode screenshot of Home: no outline at rest, cards still clearly visible against the page, and the hover border still shows on Mathematics.
- The dark contrast test still passes.

## Technical notes
- `src/styles.css`: remove the `.dark .s-card { border-color: var(--line); }` rule.
- Update the dark-mode memory note that said dark cards keep a thin resting edge.
