# Pin the top buttons and add a hover bounce

## What changes
- The music, sound and Dark mode buttons and the Learning Streak card stay pinned at the top right while you scroll the conversation (and the other pages that share this layout: Home, Learning Hub).
- A soft see-through fade sits behind them, so chat text scrolling underneath doesn't clash with the buttons.
- The chat's first message gets enough space at the top so it never starts hidden under the pinned buttons.
- Hovering the music, sound or Dark mode button makes its icon do a quick, springy bounce. A keyboard focus does the same. Reduced motion turns the bounce off.
- Phones: the buttons stay pinned too, with the same fade. Their size doesn't change.

## Technical details
- `src/components/home/FitilaShell.tsx`: change the top-right group from `absolute` to `fixed` (z above content, below dialogs), add a token-based gradient backdrop strip (`from-fh-bg` to transparent) behind it, and wrap each icon in a `group-hover:`/`group-focus-visible:` bounce class.
- `src/styles.css`: add an `icon-bounce` keyframe (translateY 0 → -5px → 0 → -2px → 0, ~500ms) and a reduced-motion override.
- Check top padding on Ask, Home and Learning Hub so nothing sits under the pinned bar; verify by scrolling a long conversation in the test browser at laptop and phone sizes.
