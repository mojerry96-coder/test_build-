# "Time to practice" card: match the spec

Differences between the spec and the card today, and the fix for each:

1. **Pop-up over a dimmed page.** The spec shows the card floating over a soft grey veil, with the logo and top bar still visible behind it. Today it sits flat on the page. Add the grey veil behind it.
2. **Bigger card.** In the spec the card fills almost the whole screen width and height under the top bar, with very rounded corners. Widen it to about 85% of the screen and make it taller, so the heading, Fiti and the button have the same roomy spacing as the spec.
3. **Bottom edge.** Replace the current orange edge with the spec's thick strip that fades from red-orange to yellow along the bottom, the same as the other pop-ups.
4. **Background shapes.** Replace today's grey blobs with the spec's two large, very pale petal-like shapes: a light blue one on the left and a light peach one on the right, partly cut off by the card edges.
5. **Heading.** Switch the heading to the same handwriting font as the warm-up questions (today it uses a different one). Keep it dark navy, at the spec size, on two lines, centred. Also check the other simulation headings and change any that still use the other font.
6. **Fiti.** Centred and at the spec size, with no box behind him. He stays the waving Fiti you asked for earlier (the spec shows the thinking pose; tell me if you want that instead).
7. **Button.** A light blue "Let's Practice" button with a darker blue edge, about a quarter of the card wide, in our app font. Same as the spec, with clear space above and below.
8. **Close X.** Thin dark X in the top-right corner, as in the spec.
9. **Dark mode and phones.** Dark card with pale shapes dimmed and the same strip. On phones the card fills the screen under the top bar and Fiti gets smaller so everything fits without scrolling.
10. **Keep what works today.** "Let's Practice" still shows a spinner and can't be tapped twice. Esc and the X still go back to the map. Fiti still uses the still picture in low-data and reduced-motion mode. The button gets focus when the card opens.
11. **Rest of the screen.** The grey veil covers the page but not the top bar, so Dark mode and the profile still work. Ask Fiti and the Leaderboard tab are hidden while the card is open, so nothing sits on top of it.
12. **Short laptop screens.** On short laptop screens (about 700px tall), the heading, Fiti and the button shrink so the button never drops off the bottom of the screen.

## Technical details
- `src/components/lesson/SimStage.tsx` `PracticeCard`: render in a fixed overlay (`bg-[var(--overlay-veil)]`-style token, z under header) with card `w-[min(1560px,86vw)] h-[min(980px,calc(100dvh-120px))] rounded-[48px] bg-fh-card overlay-edge`, flex column centred.
- Swap the SVG shapes for two petal paths filled with new tokens `--practice-shape-left` / `--practice-shape-right` (light + dark values in `src/styles.css`).
- CTA: reuse the shared light-blue edge button (`vl-cta`) at `h-14 w-[min(260px,60%)]`.
- No server or content changes; heading still comes from `simPracticeTitle`.
