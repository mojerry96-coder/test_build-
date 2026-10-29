# Slimmer side menu, checked at every screen size

## What changes
- The left menu gets narrower: about 128px on laptops (it's 168–176px now), and up to about 144px on very large screens.
- The logo, New Chat button, Ask Fiti / Learning Hub buttons and the account circle all scale down to fit. Text stays readable (Ask Fiti / Learning Hub at about 15–16px, icons about 28px).
- On short laptop screens the gaps shrink so the account circle never gets pushed off the bottom.
- The page content shifts left to match, so nothing hides behind the menu.
- Phones keep their bottom tabs, unchanged.

## Checks
- Test-browser screenshots of Home, Learning Hub and Ask Fiti at 768, 1024, 1280×720, 1377×892, 1440, 1920×1080 and 2560×1440, in light and dark mode.
- On big screens: the chat box, the streak card and the "Continue learning" banner stay a sensible width and centred, not stretched edge to edge. Fix any that stretch.

## Technical details
- `src/components/home/FitilaShell.tsx`: one shared width token (e.g. `clamp(120px,7.5vw,144px)`) used by both the aside and the content's left padding; shrink logo (~80px), New Chat (h-12, 15px), nav items, avatar (56px); height-based clamps for vertical gaps.
- Cap main content width on 2xl screens where needed (HomeParts / Ask page containers).

## Fiti moves in the chat
- Fiti's picture next to his messages in Ask Fiti becomes his animated clip: a wave when a new message arrives, then a gentle idle loop (breathing, blinking).
- Uses the existing Fiti clips (light and dark versions to match the theme), the same ones used elsewhere in the app.
- Only the newest Fiti message animates; older ones stay as still pictures so the page stays light on budget phones.
- Low-data mode and reduced motion keep the still picture.
- Technical: swap the `parrotSmall` img in `FitilaAgent.tsx` for the existing `AnimatedAvatar` (greet then idle clip) on the latest tutor message. Add this task to roadmap.md.
