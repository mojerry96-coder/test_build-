# Tighten the Learning Hub to match the spec, all on one screen

## What changes
1. **Remove "Coming soon"** labels and lock badges from every subject tile. All tiles look the same as in the spec. Only Mathematics opens; tapping any other tile opens nothing and makes no change on screen.
2. **Use your new icons**:
   - English uses the glass "Aa" icon instead of typed text.
   - Chemistry, Economics, Government, Accounting, Literature and Physics use the new glass icons.
   - The large glass "X" goes in the middle of the banner instead of the typed "x²".
   - The fire emoji appears inside each orange streak circle for a learned day.
3. **Streak, matching the spec**:
   - Top right: the "Learning Streak · N days in a roll" badge with the small parrot, next to Dark mode.
   - Below it, level with the "My Learning Hub" heading: the "Learning Streak" label, then seven circles. Learned days are solid orange with the fire; other days are pale with the day letter (M T W T F S S).
   - Note: the spec badge says "in a roll". Your Ask page currently says "in a row". I'll copy the spec unless you tell me otherwise.
4. **Everything visible without scrolling** on laptop and desktop screens (from 1280×720, including your 1377×892):
   - Less space above the heading. The heading and streak sit on one row.
   - The banner is shorter and scales with screen height, about 40% of it and at most 390px. The parrot is sized to the banner and sits on its bottom edge.
   - The gap above "Select a Subject" is smaller, and tiles are about 128px tall. That gives 6 tiles on row one and 3 on row two, as in the spec.
   - Phones and tablets still scroll normally.
5. **Hover** on the open Mathematics tile and the Continue Learning button only.

6. **Additions:**
   - **Background:** the same planet, soft shapes and lower-left flask as the Ask page, matching the spec, sitting behind the tiles.
   - **Today's circle:** marked with a thin ring so she knows which day it is.
   - **Locked tiles:** tapping a locked subject gives a quiet note, "Only Mathematics is open for now", that disappears after 2 seconds. Without it, the tap seems broken. I'll leave this out if you prefer.
   - **Button wording:** with no lesson started, the button says "Start Learning" and opens the first topic intro. It says "Continue Learning" once a lesson is in progress.
   - **Dark mode:** the same layout with the existing dark colours; the bright tile colours stay as they are.
   - **Phone:** the streak circles go under the heading, the banner parrot is hidden and tiles show 2 per row. Scrolling is allowed there.

## Check
Screenshots at 1280×720, 1377×892 and 1920×1080 to confirm no scrolling and a match with the spec.

## Technical details
- Upload `image_47` (Aa), `image_49` (chm), `image_50` (eco), `image_51` (gov), `image_52` (acc), `image_53` (lit), `image_54` (phy), `X.png` and `emojione_fire.png` with lovable-assets under `src/assets/hub/`. Then replace the imports in `learning-hub.tsx`.
- Use viewport-height clamps: `main` padding-top `clamp(24px,6vh,96px)`, banner `h-[clamp(260px,40vh,390px)]`, tiles `h-[clamp(96px,13vh,128px)]`. Then remove the `Lock` import and the badge branch.
- The `Week` component renders the fire `<img>` on an orange `bg-hub-day-on` fill.
