# Remove the coloured layer behind the tutor (parrot)

The cream/grey square behind the parrot comes from two things: a background colour added around the picture, and the off-white backdrop baked into the parrot images themselves.

## Steps
1. Remove the background colour and rounded tile around the parrot everywhere it appears (sign-in page, meet-the-tutor, lesson chat, page states).
2. Make clean cut-out versions of all 7 parrot images (idle, speaking, thinking, encouraging, celebrate, head, full) with a fully see-through background, keeping the parrot itself unchanged.
3. Swap the app over to the cut-out versions and remove the old ones once nothing uses them.
4. Check the sign-in page and lesson screen on phone and laptop sizes to confirm the parrot sits directly on the page with no box behind it.

## Technical details
- `TutorAvatar.tsx`: drop `rounded-full bg-muted object-cover` → `object-contain`; `auth.tsx`: drop `rounded-3xl bg-card`.
- Regenerate each `src/assets/tutor/*.webp.asset.json` source via image edit with transparent background, upload as PNG asset pointers, update imports, delete old pointers.
