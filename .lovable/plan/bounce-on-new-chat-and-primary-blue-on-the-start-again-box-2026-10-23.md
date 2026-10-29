# Bounce on New Chat, and primary blue on the Start again box

## 1. New Chat button (side bar)
New Chat gets the same hover bounce as the music, sound and Dark mode buttons. The whole button lifts, squashes a little when it lands, then hops again. It still presses down when tapped. Reduced motion turns the bounce off.

## 2. Start again box
- **Restart:** turns from purple to our primary blue, as a raised button with a darker blue edge and white text, like Check Answer. While it's working it keeps the blue and shows "Restarting…".
- **Cancel:** becomes an outlined button in the same blue (white fill, blue border, blue edge), matching our "Watch again" button. The thick double focus ring is replaced by our normal soft focus ring.
- **Both buttons:** get the same hover bounce and press-down, and keep working in dark mode.
- **Other boxes:** the same restyle applies to every confirmation box using the shared buttons, so they all match.

## Technical details
- `FitilaShell.tsx`: add `hdr-bounce [--bounce-edge:var(--fh-dark-btn-edge)]` to the New Chat button. Also add it to the floating New Chat button on phones.
- `ui/alert-dialog.tsx`: give `AlertDialogAction` the primary raised style (`bg-fh-primary text-fh-primary-ink shadow-[0_5px_0_var(--fh-primary-edge)] hdr-bounce squish rounded-full`) and `AlertDialogCancel` the outline style (`border-2 border-fh-primary bg-fh-card text-fh-heading shadow-[0_5px_0_var(--fh-primary-edge)] hdr-bounce squish rounded-full`), with `focus-visible:ring-2 ring-fh-primary/40`.
- `RestartDialog.tsx`: drop its local purple/height overrides so it picks up the shared styles.
