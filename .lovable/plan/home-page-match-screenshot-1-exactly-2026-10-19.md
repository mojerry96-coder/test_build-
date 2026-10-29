# Home page: match screenshot 1 exactly

Screenshot 1 (the Figma frame) is the target. Below are the gaps found when comparing it with today's build (screenshot 3), and how each is closed.

## 1. Tutor helper (biggest gap)
- The full helper (parrot, bubble, pill) gets its own space in the page so it never covers a card:
  - Laptop: a row directly under the subject grid, right-aligned to the grid's right edge. Bubble on the left, parrot on the right, pill at the parrot's feet, same look as image 18. It scrolls with the page instead of floating over it.
  - Very wide screens (enough room beside the 1130 px column): the helper floats in the right margin beside the cards, as in screenshot 1, never touching them.
  - Tablet and phone: pill only, placed in the same row under the grid (above the tab bar on phone), never floating over cards.
  - "Ask {tutor}" on the pill still opens the open lesson, or scrolls to the subjects.
- Pill restyled to the design's "Ask Kiko" look, reused everywhere the pill appears (laptop, tablet, phone): small (about 64 x 24), helper blue #168DCC, white 2 px border, soft shadow, Mulish Bold 10, white text. It reads "Ask {tutor name}", or "Ask your tutor" while the name setting is empty.
- Bubble as designed: label "Hi, I'm {tutor name}" in light blue, bold line "Hello, {first name}! What shall we learn today?", small "Tap me for another tip", X at top right. X hides only the bubble; the parrot and pill stay.
- The parrot uses the same full-body waving picture (red tail, feet), about 145 x 181.
- Tablet and phone: same small pill style, no bubble, parrot hidden (unchanged rule from your brief).
- How it is drawn (from your close-up, image 18):
  - Parrot: the full-body waving picture you just re-sent, about 145 x 181, standing on its own with no background, tile or circle; red tail and feet fully visible.
  - Bubble: white card about 262 x 128, 12 px corners, thin #DDE2E7 border, large soft shadow. It sits to the parrot's upper left, its right edge tucked just behind the parrot's raised wing, its top level with the parrot's head. Inside, 16 px padding: light blue label (Mulish 12), then the bold dark line (Mulish Bold 16, two lines), then "Tap me for another tip" (Mulish 13, dark grey). X (16 px, dark) at the top right.
  - Pill: sits over the parrot's right foot, slightly to the right of the body; helper blue with a white 2 px border and a soft blue shadow, "Ask {tutor name}" in white bold.
  - Stacking: the bubble sits behind the parrot's wing; the pill sits in front of the parrot's foot. The whole group floats above the cards.

## 2. Continue learning banner
- Parrot: use the original banner picture with its soft blue glow, blended into the dark banner like the design, sitting inside the banner's left side and touching the bottom edge, top of the head slightly above the content. No pale box, no green dot showing over the progress bar (the dot moves onto the parrot's shoulder area, as small as the design).
- Text block starts 230 px from the banner's left edge, so "CONTINUE LEARNING" lines up with the design.
- Progress bar 428 px wide, then "Step x of 8 completed" beside it, as in the design.
- Button: white, 149 x 40, fully rounded, "Continue Lesson" in #506AAC.
- Subject line shows the subject name as stored with the topic. Today the starter content says "SS3 Mathematics"; the design shows "Mathematics". The plan leaves the stored name unchanged unless you want it changed in the content.

## 3. Subject cards
- Mathematics icon: the design uses a "√x" style icon. Until you export it from Figma, the current stand-in stays; same for the English icon and the three menu icons.
- Spacing checked against the design: icon tile 50 px, 12 px gap to the name, 24 px top and bottom padding, 16 px gap between cards.

## 4. Top bar
- Matches already. Avatar circle stays plain grey with the initial, first name beside it.

## 5. Checks
- Laptop screenshot at 1440 put side by side with screenshot 1: helper position, bubble, pill, banner parrot, text start, bar width.
- Tablet and phone screenshots: pill in the new style, nothing else changed.
- No errors on screen.

## 6. Other spec items checked again
- Page background: #F5F8FA with the soft blue glow at the top right (already in, kept).
- Banner colour: #506AAC with a 39% dark overlay, as in the spec (checked against the build's colour).
- Bubble: 205 px wide, 12 px corners, #DDE2E7 border, the large soft shadow from the spec.
- Fonts: only Afacad 600/700 and Mulish 400/500/600/700 load; no Manrope anywhere.
- Phone: bottom tab bar, pill above it; tap targets at least 44 px (the small pill keeps a larger invisible tap area).
- Search, "No subjects match", "Coming later" taps, locked cards, real chapter count, banner hidden with no open lesson: already built, rechecked after the change.

## 7. Small finishing touches (no new words on screen)
- Bubble stays closed: after X, it stays hidden when she leaves Home and comes back during the same visit.
- Tip changes smoothly: the bubble text fades over on "Tap me for another tip" (off when the phone asks for less motion).
- Pill tap area: keeps its small design size but has a 44 px tap area.
- Long names: topic and chapter names in the banner cut off neatly with "…" on one line.

## Decided: the tutor never covers a card
The look follows screenshot 1 and image 18; the position follows your rule that it never covers a subject card.

## Technical details
- `TutorHelper` in `src/components/home/HomeParts.tsx`: rendered in normal page flow after the grid (`flex justify-end`), not `position: fixed`; at `min-[1600px]` it becomes `sticky`/absolute inside a right-margin gutter outside the 1130 px column. Pill shared via one `AskPill` component; label uses `tutorName ?? "your tutor"`.
- Banner: switch back to the original glow picture (re-upload `Image_Ada...png` as `tutor/banner-glow.png`), apply `mix-blend-mode: luminosity`-free approach: radial mask (`mask-image`) to fade its light edges into the banner colour; move the online dot.
- Banner text padding `lg:pl-[230px]`, bar `w-[428px]`.
- No server or data changes.
