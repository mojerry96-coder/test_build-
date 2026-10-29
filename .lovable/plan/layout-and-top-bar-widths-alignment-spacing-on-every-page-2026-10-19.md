# Layout and top bar: widths, alignment, spacing on every page

Applies to Home, Choose a chapter, Choose a quest, the topic intro and every lesson step, from phone to projector. Behaviour, rules and server logic are not touched.

## 1. One shared layout set
Three shared containers, used by every page instead of each page setting its own widths:
- **Top bar row**: full-width background; inner row padding 16 / 24 / 40 / 40 px (phone / tablet / desktop / 1920+), capped at 1680 px and centred from 1920 up. The test banner uses the same full width.
- **Navigation container** (Home, chapters, quests): max 1130 px, centred, never narrower than the top bar's side padding.
- **Lesson container** (topic intro, all lesson steps): max 1277 px; from 1920 up the lesson row grows to 1520 px, the main card takes the extra width (stage, grid, video, simulation scale with their proportions) and the tutor panel grows from 340 px up to 380 px.
- Breadcrumb, title and cards always start at the container's left edge (fixes the lesson breadcrumb hugging the screen edge on wide screens).
- Content starts 48 / 40 / 24 px below the top bar line (desktop / tablet / phone).

## 2. Top bar
- Height 72 / 64 / 56 px; logo 30 / 26 / 24 px tall; logo, menu and profile on one centre line.
- Menu (Home, My Learning, Progress) centred on the screen, not between logo and profile; 40 px hit areas, 20 px icons, 8 px icon gap, 32 px between items.
- Active item: colour plus a 2 px #506AAC underline sitting on the top bar's bottom edge.
- Profile: 36 px avatar, 10 px gap to name, 44 px tall pill, padding 4/12/4/4 so the hover background sits evenly.
- 1 px bottom line #E6EBF1 (dark #1E3A52), full width.
- Sticks to the top; soft shadow (0 4px 12px rgba(10,49,80,0.06)) after 8 px of scrolling, gone at the top, 150 ms fade.
- The lesson pages use this same top bar (the separate older lesson header row is retired if it is still rendering).

## 3. Focus rings
- Rings only on keyboard focus, never after a click or tap (fixes the profile button ring after a click).
- Browser default outline removed everywhere; one ring style: 2 px #2CA1DA with a 2 px gap, following each element's rounded corners, on every button, card, link and input.

## 4. Check
Every page at 390, 768, 1280, 1440, 1920 and 2560 wide, screenshots saved to Files:
- from 1200 up, logo and profile sit further out than the content;
- logo, menu, profile share one centre line; Home underline meets the border;
- content centred, nothing touches the screen edges;
- large screens: lesson card uses the extra space and stays readable;
- shadow only after scrolling; no ring after a mouse click, ring on Tab.
- Dark-mode contrast test and all existing tests still pass.

## Technical details
- New `src/components/layout/` with `TopBarShell`, `NavContainer`, `LessonContainer`; `TopBar` in `HomeParts.tsx` moves onto `TopBarShell`; pages replace their own `max-w-[1130px]` / `max-w-[1341px]` / `max-w-[1325px]` wrappers.
- New tokens in `src/styles.css`: `--topbar-line` (light/dark), `--topbar-shadow`, `--nav-underline`, `--focus-ring` set to #2CA1DA; breakpoints 768 / 1200 / 1920 as custom screens.
- Scroll shadow via a small passive scroll listener toggling a data attribute.
- Global `:focus:not(:focus-visible) { outline: none }` plus unified `:focus-visible` rule; remove per-component ring overrides that conflict.
- Lesson grid columns: `minmax(0,1fr)_340px`, and at 1920+ `minmax(0,1fr)_clamp(340px,20vw,380px)`.
- Record the shared-layout rule in `src/components/AGENTS.md`.

## Gaps added
- **Phone bottom tabs**: menu moves to the bottom tabs under 768; give them the same active underline/colour rule, 44 px targets and safe-area padding so they never cover the phone chat strip or Check Answer.
- **Menu crowding at 768 to 1023**: a centred menu can collide with logo or profile name; hide the profile name and tighten item gaps (32 to 20 px) in that range.
- **Active item on every page**: Home is active on Home, chapters, quests, intro and lesson; My Learning and Progress light up on their own pages (currently Home is always marked active).
- **Sticky bar and jump targets**: page anchors, the lesson chat sheet and popups/dialogs sit below the sticky bar (scroll offset and stacking order), and the ADMIN tab is not hidden behind it.
- **Dark mode**: underline, line, shadow and focus ring each get a dark value that passes AA; lesson pages stay light-only.
- **Text zoom and the display-size setting**: at 200% zoom or the large-text setting the bar may grow but must not clip; content still never touches the edges.
- **Landscape phones and short screens** (e.g. 844x390, projectors at 1080 tall): the lesson card and tutor panel fit without double scroll bars.
- **Very wide screens (2560+)**: Home helper bubble and banner stay inside the container; nothing stretches beyond 1680 / 1520 px.
- **Reduced motion**: the shadow fade is instant when motion is reduced.
- **Old layout cleanup**: remove leftover page-specific width wrappers and the old lesson header row so no page silently renders the previous layout.
