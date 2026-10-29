# Ask start screen: match screenshot 2 (spec) exactly

Comparing what we have (1) with the spec (2), these are the gaps to close:

## 1. Large waving parrot
- **Now:** about 260px tall, sitting high and floating above the bottom.
- **Spec:** about 28% of the screen height (around 340px at 1205px tall). Its feet are about 110px above the bottom edge, its centre is about 600px right of the cards, and its head sits just below the cards.
- Show it from 1100px wide up. It shrinks and moves right on narrower screens so it never covers the cards. It stays hidden on tablets and phones.

## 2. Heading, ask box and cards (spec is smaller and sits lower)
- **Group position:** move the whole group down so the heading sits at about 37% of the screen height, as in the spec.
- **Ask box:**
  - Placeholder at 14px.
  - Tutor and Quiz me chips at 24px tall with 12px text.
  - The + button and send button at 36px.
  - The class label at 11px.
- **Cards:**
  - Title at 15px, subtitle at 10px, icon at 32px.
  - Cards 60px tall.

## 3. Sidebar
- **Width:** about 9% of the screen (176px at 1920px).
- **Logo:** about 113px wide, centred near the top.
- **New Chat:** 140×64 with a darker bottom edge and 16px text.
- **Ask tile:**
  - Starts about 130px below New Chat, about 120×112.
  - Outline dove/hand icon with the label in the active blue.
- **Learning Hub:** about 45px below the Ask tile, with a grey outline book and a two-line label.
- **Profile circle:** 72px, about 40px from the bottom. The ADMIN tab stays for admins only.
- **Hover:** a light blue tile fades in on the item you're not on.

## 4. Ask icon
- The spec uses an outline dove/hand icon, but we show a filled bird.
- I'll draw a matching outline icon so it takes the blue/grey colour.
- Send the exact file if you'd prefer it.

## 5. Top-right controls
- **Dark mode:** 48px tall with 17px text, as in the spec.
- **Streak badge:**
  - Smaller text: label 10px, days line 14px semibold.
  - The full thumbs-up parrot shows uncropped at about 52px.

## 6. Background
- **Flask:** show the whole flask, bottom-left, its bottom about 110px above the edge, as in the spec (ours is cut off at the bottom).
- **Right flower:** a larger, softer grey flower with petals reaching from the top right to the bottom, behind the parrot, as in the spec.
- **Also matched:** the soft round blob in the lower centre and the left pale shape.

## Kept as agreed
SS3 instead of Grade 6, "days in a row", and the tutor name read from the setting.

## Still differs (flag)
- **English "Aa":** it stays as text until you send the 3D "Aa" icon.

## Technical details
- `FitilaShell.tsx`: sidebar width `clamp(150px,9.2vw,176px)`, spacing, icon, Dark mode and badge sizes.
- `_authenticated/index.tsx`:
  - Main group offset.
  - Parrot sized `h-[min(340px,28vh)]` at `bottom-[9vh] right-[max(4vw,calc(50vw-...))]`, shown from `min-[1100px]`.
  - Card and AskBox text sizes.
- Backdrop SVG: flask position, flower shape and size, centre blob.
- Generate the outline Ask icon as a transparent PNG and upload it as an asset.
- One screenshot at 1920×1205 and one at 1377×892, compared side by side with the spec.

## Also covered (were missing from the list above)
- **Heading:** Patrick Hand 60px / 64px line height, letter spacing 2px, colour #024064 with a 1px outline, kept exactly.
- **Planet:** the top centre-right ringed planet with its small moon and star, outline-only, pale lilac, about 250px wide, partly cut off by the top edge.
- **Hover states:** kept from the last change on the cards, buttons, sidebar items, chips, mic and send.
- **Logo:** a clean, uncropped book logo. The current one was cut from a wordmark and looks soft; send the original file for a pixel-sharp match.
- **Phone and tablet:** the layout carries these changes down without overlaps; the parrot and flask stay hidden on phones.
