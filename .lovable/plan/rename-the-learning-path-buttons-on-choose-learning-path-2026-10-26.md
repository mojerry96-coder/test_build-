# Rename the learning path buttons on "Choose learning path"

## What changes
- **Auto Pilot becomes "Solo Mode"**, with a tiny line under the name: "AI-led, student learns independently".
- **Tutor Mode becomes "Together Mode"**, with a tiny line under the name: "Parent or teacher-led, working with the AI".
- The tiny line sits inside the same pill, centred under the bold name, in a small, lighter weight of the same dark ink (readable in light and dark mode). The pills grow slightly taller so both lines fit; colours, blue/orange edges and the bounce stay the same.
- Both buttons work as they do today: Solo Mode opens Ask Fiti with the loader, and Together Mode does nothing yet.
- Screen readers hear the name and the line together, for example "Solo Mode, AI-led, student learns independently".
- The page description shown in link previews says "Solo Mode or Together Mode".
- On phones the pills stack and the tiny line wraps to two lines if needed, without cutting off.

## Technical details
- `src/routes/_authenticated/choose.tsx`: button labels and sub-lines, `PILL` changed from a fixed height to `min-h` with a two-line flex column, head description and file comment updated.
- Code-side names stay as they are (`autopilot`/`override` session modes, `autoPilot` handler); only the on-screen words change. Comments mentioning "Auto Pilot" in `loader-timing.ts` and its test are updated to "Solo Mode".
- Save the new names and lines to project memory so later screens use the same words.

## Also included
- **Only this page shows the old names.** I checked the rest of the app: no other screen says "Auto Pilot" or "Tutor Mode". The "Tutor mode" label inside the lesson chat is the voice/text switch, so it stays.
- **Together Mode gets a gentle "Coming soon" note** when tapped, so it no longer looks broken. Today the button does nothing.
- **Fits on short laptops and phones:** both pills stay the same width as each other, the tiny line never pushes them off screen at 1377×892, and they stack neatly on phones.
- **Dark mode:** the tiny line is checked for easy reading on the white pill in both themes.
- **Same words everywhere later:** the project notes say the parent summary and the teacher controls must use "Solo Mode" and "Together Mode" when they are built.
