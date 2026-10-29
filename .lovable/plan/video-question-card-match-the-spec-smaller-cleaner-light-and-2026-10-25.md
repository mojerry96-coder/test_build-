# Video question card: match the spec (smaller, cleaner), light and dark

## What changes (from screenshot 1)
- **Size:** the card becomes narrower, about 560 px wide on desktop instead of 720 px. Everything inside is smaller and more evenly spaced.
- **Header:** "Question 1" in light blue and "1/2" in grey, both smaller (about 16 px).
- **Question:** a bolder, rounder hand-written font, as in the spec, at about 26 px. It is centred and navy, with no orange numbers.
- **Answer tiles:**
  - Each tile is shorter (about 72 px tall) and narrower (about 220 px), in a tight 2x2 grid in the middle of the card.
  - The letter dot is smaller (about 18 px).
  - The answer is in the same hand-written font as the question, and long answers like "m is equal to the y-intercept" fit on two lines.
- **Confidence buttons:** three equal white pills, about 48 px tall. Each has a thin navy outline, a navy bottom edge, and navy text and icons.
- **Check Answer:** a centred light-blue pill, about 340 px wide and 56 px tall, with a darker blue bottom edge and white text.
- **Watch again:** stays as a small grey link under Check Answer, made smaller so it doesn't compete with the button.
- **Phones:** the card is full width, the tiles stay 2x2, and the pills shrink to fit three in a row (or wrap if needed).

## Dark mode (screenshot 2 shows it broken)
- **Card:** stays dark navy with the same orange-to-yellow edge.
- **Question text:** white.
- **Confidence pills:** these are the broken part today. They show white pills with white text. They become dark navy with a light-blue outline, a light-blue bottom edge and light text. The chosen one fills light blue with navy text.
- **Check Answer:** stays blue. While it's off it is dimmer but still readable, not grey-on-grey.
- **Watch again:** light grey, readable.
- **Answer tiles:** keep their pastel colours with navy text, as in light mode.
- Each colour pair gets a dark-mode readability check.

## Added
- **Clear choice states:** a chosen answer tile and a chosen confidence pill are obvious in both modes. Tried (locked) tiles fade, and right or not-quite marks still show.
- **Same look for every card moment:** the hint, "Good job!", the full working and the explain-back box use the same smaller sizes and fonts.
- **Fits on a laptop without scrolling:** the whole card fits over the video at 1377x892, including when a hint is showing.
- **Font loads quickly:** the new font is loaded with the page, and the card never flashes a plain font first.
- **Touch targets:** pills and tiles stay at least 44 px tall on phones.
- **Check:** screenshots of the card in light and dark on laptop and phone, compared side by side with your spec.

## Technical details
- `FlowVideoStage.tsx` card:
  - Width `md:max-w-[560px]`, padding `p-6`.
  - Header 16 px.
  - Question uses a new `font-hand-bold` utility (Gochi Hand, added to the root font link, falling back to Patrick Hand) at `text-[26px]`.
  - Tile grid `max-w-[460px]`.
  - CTA `max-w-[340px] h-14`.
- `WarmupOptions` gains a `compact` option: shorter tiles, a smaller letter dot, and the hand-written answer font. It is used only in the video card, so the warm-up is unchanged.
- `ConfidencePicker pills`: `h-12`, sized to fill a row of three.
- `styles.css`:
  - `.vl-conf` and `.vl-cta` colours move to tokens (`--vl-conf-bg/ink/edge`, `--vl-cta*`) with `.dark` values.
  - Selected state for dark.
  - `.vl-card` keeps the gradient edge in both themes.
- Add the dark pairs to `src/test/dark-contrast.test.ts` and run that test only.
