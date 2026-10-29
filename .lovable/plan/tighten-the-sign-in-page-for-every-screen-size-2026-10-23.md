# Tighten the sign-in page for every screen size

On your laptop screen the page is too tall: the "Don't have an account? Sign up" line falls off the bottom. Everything is also a bit too big: the logo, the heading, the boxes and the gaps.

## Fit on one screen, no scrolling
- Laptops (about 700 px tall and up): the whole page fits without scrolling, with the footer always visible.
- Sizes and gaps shrink with the screen's height, so short laptop screens get a tighter layout and tall monitors look like your screenshot.
- Very short screens (phones turned sideways): the page scrolls normally and nothing overlaps.

## Tighter sizes (desktop)
- Logo about 25% smaller. The "Dark mode" button gets smaller to match.
- Heading drops one size, and the gap above it is cut by about half.
- Boxes and buttons are about 56 px tall instead of 66–70 px. The column narrows to about 460 px.
- The gaps around "Or continue with", the Google button and the footer are evened out. The large empty gaps go.
- Footer text drops from very large to normal reading size.
- The "coming soon" message only takes up space when it's showing.

## Phones and tablets
- Phone (about 375 px wide): smaller logo, and the mode button shows just the moon or sun icon (still labelled for screen readers). Heading about 36 px, boxes full width with 20 px side margins, buttons at least 48 px tall for thumbs.
- Tablet: the same centred column as desktop.
- The background shapes scale down and stay behind the content. On phones the green star stays small in its corner and never sits under the buttons.
- With a phone keyboard open, the box she's typing in stays visible.

## Gaps closed
- Sign in button contrast: the white "Sign in" text on light blue is hard to read in light mode. It switches to navy text, matching dark mode, and passes 4.5:1.
- Zoom: at 200% browser zoom or large phone text, nothing is cut off, and the page scrolls instead.
- Very wide screens (2560 px): the column and logo stop growing, and the shapes stay at the edges.
- The editor toolbar in your screenshot (select, text, pen, comment) is the preview's own tool. Students never see it.
- Phone notches: the top bar stays clear of the notch and the home bar.

## Unchanged
- All wording, Google sign-in, the "coming soon" behaviour, dark mode and colours.

## Check
- Screenshots at 1377×892, 1280×720, 1920×1080, iPad 768×1024, phone 375×667 and phone landscape, in light and dark.

## Technical details
- Only `src/routes/sign-in.tsx`: use a `min-h-dvh` flex column, with spacing set by `clamp()` on viewport height. Shared button and box classes are pulled into constants to cut repetition. The SVG background is unchanged.
