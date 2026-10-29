# Gradient Lab

This package contains runnable HTML, CSS and JavaScript for all four Gradient Lab screens: Start, Beginner, Intermediate and Advanced. It also contains the three original PNG references, a reusable transparent parrot asset, local fonts and the original simulation brief.

## Open the simulation

1. Extract the entire ZIP.
2. Open **index.html** in a modern browser.
3. Choose **Explore lines**, **Move the points** or **Solve a challenge**.

No installation, API key, login or build command is required. Keep the folder structure intact. The files run locally without network requests.

For a local server, open a terminal inside this folder and run:

```bash
python3 -m http.server 8080
```

Then visit `http://localhost:8080`. This gives the most consistent browser storage behaviour. Opening files directly also works; some browsers restrict or isolate storage for `file://` URLs.

## Files for each page

| Screen | Open directly | Page-specific implementation | Original generated reference |
| --- | --- | --- | --- |
| Start | `01-start.html` | `src/pages/start.js` | `references/01-start.png` |
| Line Lab | `02-line-lab.html` | `src/pages/line-lab.js` | `references/02-line-lab.png` |
| Two-point Gradient | `03-two-point-gradient.html` | `src/pages/two-point.js` | `references/03-two-point-gradient.png` |
| Equation Detective | `04-equation-detective.html` | `src/pages/advanced.js` | Original brief (no PNG) |

The separate HTML files are entry points into the same app. They share CSS, graph rendering and state rather than duplicating those systems. While navigating within the app, only the page instance changes; there is no full-page reload. Hash routes are `#start`, `#beginner`, `#intermediate` and `#advanced`.

`index.html` restores the last visited screen when browser storage is available. `01-start.html` always opens the start screen, and the other direct entry files open their respective screens. A valid hash route overrides the entry file.

## Scope

**Implemented:** all four screens; all seven Beginner missions; all six Intermediate missions; sliders; draggable and keyboard-controlled points; automatic mission checks; hints; progress saving; predict mode; equation reveal; walk-the-line animation; the Advanced equation detective with its four random challenge types, three-try feedback ladder, worked similar examples and saved score; light/dark/system themes; settings and progress reset.

There was no generated PNG for the Advanced screen. It follows the original brief and reuses the visual system of the other three screens.

The guide mascot is a static image with contextual short tips. There is no LLM integration, mascot speech, audio, animated bird sprite, XP system, video or server backend in this package. Those were not shown in the three generated screen designs.

## Folder structure

```text
Gradient_Lab_Replication/
  index.html
  01-start.html
  02-line-lab.html
  03-two-point-gradient.html
  04-equation-detective.html
  README.md
  REPLICATION_GUIDE.md
  VALIDATION.md
  package.json
  assets/
    mascot.png
    SNPro-Regular.ttf
    SNPro-Bold.ttf
    PatrickHand.ttf
    snpro-OFL.txt
    patrickhand-OFL.txt
    ASSETS.md
  references/
    01-start.png
    02-line-lab.png
    03-two-point-gradient.png
    Gradient_Lab_Original_Brief.pdf
  src/
    styles.css
    math.js
    state.js
    graph.js
    app.js
    pages/
      start.js
      line-lab.js
      two-point.js
      advanced.js
  tests/
    math.test.cjs
    browser.test.cjs
```

## Shared source files

- **styles.css:** design tokens, typography, viewport layout, controls, responsive behaviour and motion rules.
- **math.js:** fractions, number parsing, line equations, gradients and intercepts.
- **state.js:** per-screen state and versioned browser persistence.
- **graph.js:** SVG grid, accurate lines, rise/run triangles, target rings, small example graphs, keyboard movement and pointer dragging.
- **app.js:** shared header, navigation, mission UI, settings, theme and render cycle.

The graph is real SVG generated from coordinates. It is not a screenshot, canvas placeholder or generative image. Its axes are mathematically positioned; both axes cover −8 to 8. The visual references are inspiration for the layout, not authoritative mathematical diagrams.

## Tests

The pure math, mission and challenge-generator checks need Node.js and no installed dependencies:

```bash
node tests/math.test.cjs
```

Browser verification requires Playwright as a development-only tool:

```bash
npm install
npx playwright install chromium
npm run test:browser
```

There are no production dependencies. See **VALIDATION.md** for the checks actually performed on this delivery.

## Using this with Claude or Lovable

Upload this ZIP and ask the builder to read **REPLICATION_GUIDE.md**, use the PNGs for visual reference, and preserve the working mathematical logic in the supplied source. The guide includes a ready-to-use replication prompt and the implementation contract for each screen.
