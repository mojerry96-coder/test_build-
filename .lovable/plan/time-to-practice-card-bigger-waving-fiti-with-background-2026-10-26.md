# "Time to practice" card: bigger waving Fiti with background

## What she will see
- The thinking Fiti on the card is replaced by the **waving Fiti** from the page loader, moving in a loop.
- He is much bigger: about 340px tall on a laptop (today about 260px), 240px on phones. The heading, Fiti and "Let's Practice" still fit on a 1377×892 screen without scrolling.
- **Background:** the card gets the same soft shapes as the page behind it (pale blobs and flower, very light), inside the white card behind Fiti, so he stands on a scene instead of plain white. Dark mode uses the dim versions.
- Low-data mode, reduced motion, or phones that can't play see-through clips show the still waving picture instead.
- The close X, the coloured edge and "Let's Practice" stay the same.

If by "background" you meant something else (for example the waving clip with its original backdrop), tell me and I'll adjust.

## Technical details
- `SimStage.tsx` `PracticeCard`: swap `parrot-think-glasses` `<img>` for `<video autoplay muted loop playsInline poster>` using `fitila_wave_loader.webm` / `.webp` (same fallback logic as `FitiLoader.tsx`); height `md:h-[min(340px,36vh)]`.
- Add an absolutely positioned, low-opacity copy of the shell `Backdrop` shapes inside the card (`pointer-events-none`, `-z` behind content), token colours only.
- Screen check at 1377×892 and phone, light and dark.
