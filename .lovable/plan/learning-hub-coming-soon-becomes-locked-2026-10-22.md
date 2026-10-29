# Learning Hub: "Coming soon" becomes "Locked"

## Change
- **Label:** on the eight subject cards that aren't open yet, the small line under the name changes from "Coming soon" to "Locked". The lock icon stays.
- **Screen readers:** these cards are read as, for example, "Chemistry, locked".
- **No change:** the float, the hover lift, Mathematics, and the "Only Mathematics is open for now" note on tap.

## Technical details
- `src/routes/_authenticated/learning-hub.tsx`: change the label text and the `aria-label` in `SubjectTile`. Nothing else changes.
