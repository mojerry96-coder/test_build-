# Make the Leaderboard tab blue

## What changes
- The Leaderboard tab on the right edge becomes solid blue, the same blue as the "Check Answer" button and the lab's Worksheet tab.
- The words "Leaderboard" and the trophy icon turn white.
- It gets the darker blue edge underneath, like the other blue buttons.
- The panel's title and trophy icon use the same blue, so they match the tab.
- Dark mode keeps the same blue and white, and the text stays easy to read.

## Technical details
- `src/components/leaderboard/LeaderboardTab.tsx`: swap the tab's `bg-fh-card border-fh-box-edge text-hub-heading` for the existing tokens `bg-fh-primary text-fh-primary-ink border-fh-primary-edge` and `shadow-[0_4px_0_var(--fh-primary-edge)]`. No new colours are added.
