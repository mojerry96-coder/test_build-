# Replication guide and implementation prompt

## Ready-to-use instruction for a builder

> Build the four Gradient Lab screens using the enclosed working implementation and the three reference PNGs. Read the original brief for the academic rules. Use one application shell with changing page instances, not three unrelated sites. Preserve the supplied graph calculations, input validation, mission conditions, keyboard controls and progress persistence. Use the local fonts and mascot asset. Match the pale-blue and white visual system, navy text, flat blue buttons, compact shared header and small supporting parrot. Keep the task and graph more prominent than the mascot. Fit the initial desktop states within the viewport, with readable text and visible controls. Adapt to a single-column layout on narrow screens. Do not render a PNG as the application or use an AI-generated graph as the mathematical implementation. Do not add extra quizzes, intro scenes, course labels, AI chat sidebars, music or reward systems. Use the code files below as the executable source of truth and the PNGs as visual direction.

## Design system

| Element | Rule |
| --- | --- |
| Background | Ice blue `#f3f9fd`; uncluttered page, no large bounding card around the entire screen |
| Surfaces | White `#ffffff`, 14–18 px corner radii, fine pale-blue borders |
| Primary text | Navy `#0b2948` |
| Supporting text | Muted blue-grey `#657e9c` |
| Primary button | Flat blue `#098deb`, white semibold text, minimum 44 px tall |
| Secondary controls | Quiet outline or text-only buttons |
| Student line | Coral red `#f04c35` |
| x / across | Blue `#0789e1` |
| y / rise | Green `#238143` |
| Triangle | Translucent yellow |
| Point B | Small violet accent retained from the brief; no purple application theme |
| UI font | SN Pro, bundled locally in regular and bold weights |
| Task font | Patrick Hand, bundled locally |
| Header | 76 px on spacious desktops; 64 px on shorter desktops |
| Content | Maximum 1600 px wide; flexible columns, shared spacing |
| Mascot | About 100 px high on desktop; 73 px on phones; one instance only |
| Motion | Gentle 320 ms screen entry; 180 ms button transitions; reduced-motion support |

All buttons use native HTML controls with visible focus outlines. The implementation intentionally uses flat action colors and omits the decorative arrows seen in the generated start-page buttons.

### Responsive behaviour

- At desktop widths of 900 px and above, the two activity screens use graph/controls columns.
- The graph flexes to the available height while the mission stays visible beneath it or in the working panel.
- At widths below 900 px, content becomes a single column. Scrolling is permitted to retain usable type, touch targets and graph size.
- Desktop layouts target 1440 × 900, 1366 × 768 and 1280 × 720. Smaller window heights, increased browser text sizes, expanded working/hints or high zoom can require scrolling. Never hide important content merely to enforce a fixed height.
- The parrot sits in reserved desktop space at the lower right. On phones it is reduced, and the content gets extra bottom space.
- The top navigation remains consistent between screens.

## Page 1 — Start

**Reference:** `references/01-start.png`

**Entry file:** `01-start.html`

**Source:** `src/pages/start.js`

### Hierarchy and placement

1. Shared header: back action, compact Gradient Lab brand, three level tabs, theme button and settings.
2. Centered small uppercase subject label.
3. Large Gradient Lab title and a single handwritten subtitle.
4. Three equal cards: Line Lab, Two-point Gradient, Equation Detective.
5. Quiet progress-saving note below the cards.
6. Small parrot at the bottom right.

Cards have equal visual weight, a restrained mathematical symbol, a short description, a mission-count line and one primary action. Do not make the symbol or mascot compete with the title.

### Behaviour

- **Explore lines:** navigate to `#beginner`.
- **Move the points:** navigate to `#intermediate`.
- **Solve a challenge:** navigate to `#advanced`.
- No activities are shown as locked.
- The top-left brand and back button return to Start.
- The page updates inside the existing shell.

### Main replication code

The complete markup is returned by `GL.pages.start.render()` in `src/pages/start.js`; navigation is bound in `GL.render()` in `src/app.js`. To change copy or card order, edit the page module. To change sizes and spacing, edit `.start`, `.hero`, `.cards` and `.card` in `src/styles.css`.

## Page 2 — Line Lab

**Reference:** `references/02-line-lab.png`

**Entry file:** `02-line-lab.html`

**Source:** `src/pages/line-lab.js`

### Hierarchy and placement

- Large square graph on the left.
- Right column: title and short instruction, live equation, m slider, c slider, Walk the line, two checkboxes, brief explanation.
- A mission strip beneath the working area: numbered mission selectors, current task, hint and conditional continuation.
- The parrot is small and clear of the task and controls.

### Initial state

```js
{ m: 0, c: 0, mission: 0, rise: true, lesson: false }
```

The student line is `y = 0`, drawn horizontally on the x-axis. The origin/intercept is marked. A rise/run triangle is not shown when m is zero. No mission is automatically completed on initial render.

### Slider logic

```js
m: min = -4, max = 4, step = 0.5
c: min = -6, max = 6, step = 1
```

On slider input:

1. Update m or c in the live state.
2. Update the simplified equation and slider value.
3. Redraw the line, intercept and triangle.
4. Update the plain-language explanation.
5. Check only the selected mission.

Use `GL.math.equation(m, c)` to avoid `1x`, `+ 0` and double-negative equations.

### Missions

| Mission | Completion condition |
| --- | --- |
| Make the line go uphill | `m > 0` |
| Make it go downhill | `m < 0` |
| Make it flat | `m === 0` |
| Cross the y-axis at 3 | `c === 3` |
| Build y = 2x − 4 | `m === 2 && c === -4` |
| Build y = ½x + 1 | `m === 0.5 && c === 1` |
| Steeper downhill than y = −2x + 1 | `m < -2` |

Hints and success copy live in `GL.beginnerMissions`. Mission buttons are directly selectable. Completion is saved once and shown with a check mark as well as color. The next action goes to an unfinished mission; after all seven, it offers Two-point Gradient.

### Additional interactions

- **Show rise and run:** show a blue horizontal segment and green rise/fall, with a translucent triangle. For half gradients, use run 2 so the rise is a whole number. The graph clips geometry to its visible range.
- **Show the lesson's line:** show dashed `y = 2x − 4`.
- **Walk the line:** a blue dot moves from x = −8 to x = 8 in about 3.2 seconds. Out-of-range parts are hidden. The caption describes uphill, downhill or flat movement.
- Changing a slider cancels the existing walk; navigation cancels its animation frame.
- Reduced motion jumps to the end of the walk.

### Code ownership

- Markup and events: `GL.pages.beginner`.
- Conditions: `GL.beginnerMissions`.
- Plot contents: `GL.graph.beginnerContent()`.
- Shared mission UI: `GL.missionHTML()`, `GL.bindMission()`.
- Layout: `.lab`, `.lab-main`, `.controls`, `.slider-card`, `.mission-strip`.

## Page 3 — Two-point Gradient

**Reference:** `references/03-two-point-gradient.png`

**Entry file:** `03-two-point-gradient.html`

**Source:** `src/pages/two-point.js`

### Hierarchy and placement

- A short title and subtitle above the activity.
- Dominant square grid on the left.
- Right white working panel: prediction/equation switches, coordinates, gradient fractions, explanation and mission.
- Only the needed working is shown. No sliders appear here.

### Initial state

```js
A = { x: -3, y: -1 }
B = { x: 1, y: 3 }
m = (B.y - A.y) / (B.x - A.x) // 1
c = A.y - m * A.x            // 2
```

Display the red line `y = x + 2`, two labeled points and a rise/run triangle with across 4 and up 4. Both prediction and equation reveal are initially off.

### Point movement

- Pointer drag maps screen coordinates into SVG coordinates using the SVG transform matrix.
- Points snap to integer coordinates from −7 through 7.
- A point cannot occupy the same coordinate pair as the other point.
- Tab to a point and use arrow keys to move it one grid unit.
- Repaint the line, triangle and calculation while dragging.
- Check missions when the drag ends or after a keyboard movement.
- Announce the new coordinates for assistive technology after a committed move.

### Working

```js
changeInY = B.y - A.y;
changeInX = B.x - A.x;
gradient = changeInX === 0 ? null : changeInY / changeInX;
intercept = gradient === null ? null : A.y - gradient * A.x;
```

Fractions are stacked in HTML. Negative numbers used in subtraction are bracketed. x-values are blue and y-values are green. The final fraction is simplified.

If both points have the same x-coordinate, draw a vertical line and explain that division by zero means there is no numeric gradient. Do not show Infinity as an answer or fabricate an intercept.

**Show the equation** adds the substitution for c and the simplified line equation when a numeric gradient exists.

### Prediction

When prediction is enabled, hide the working and ask for the gradient. Accept integers, decimals, ASCII or Unicode minus, and fractions. Enter submits the form. Empty, invalid or zero-denominator inputs display an input note without judging the learner.

Any valid numeric prediction reveals the working, accompanied by one of these messages:

- Spot on.
- Upside down: reciprocal error.
- Check the sign.
- Not quite.
- Careful: vertical line.

**Just show me** reveals the working immediately. Moving either point hides it again for a new prediction.

### Missions

| Mission | Completion condition |
| --- | --- |
| Gradient 2 | `m === 2` within numerical tolerance |
| Gradient −1 | `m === -1` within tolerance |
| Gradient ½ | `m === 0.5` within tolerance |
| Three pairs on y = 2x − 4 | Three unique unordered x-pairs tried |
| Gradient −3, y-intercept 2 | `m === -3 && c === 2` within tolerance |
| Gradient ⅔ away from the y-axis | `m === 2/3 && A.x !== 0 && B.x !== 0` within tolerance |

For the same-line mission, points are constrained to `y = 2x − 4`, with x from −1 to 5. The initial pair counts as one; additional unique pairs are recorded on committed moves. A and B swapped between the same two positions count as the same pair. The caption explains the constraint. Leaving this mission restores the previous free points.

### Code ownership

- Markup, prediction feedback and mission selection: `GL.pages.intermediate`.
- Conditions: `GL.intermediateMissions`.
- Plot: `GL.graph.intermediateContent()`.
- Drag/keyboard controller: `GL.graph.bindPoints()`.
- Fraction parsing and math: `GL.math`.
- Layout: `.intermediate`, `.working-panel`, `.working`, `.fraction`, `.inline-mission`.

## Persistence and state

Browser storage key: `gradient-lab-replication-v1`.

Saved: completed missions, last visited screen, theme preference, Advanced points, solved, streak, best streak and challenge type.

Session only: slider values, point positions, selected mission, prediction reveal, hint visibility, same-line pair counter and the current Advanced challenge. State survives switching screens within the same running app. Reloading restores progress but resets those temporary controls.

Storage failures are caught so the activities still work. Resetting progress requires a confirmation in Settings. No data is sent to a server.

## Mathematical fidelity versus generated reference pixels

The original generated PNGs contain approximate UI typography, spacing and graph rendering. The implementation normalizes the header and brand across pages, removes decorative button arrows, uses real local fonts and computes graph geometry directly. The code corrects any plotted-position or axis-spacing ambiguity in the PNGs. It is a faithful functional recreation, not a promise of pixel-identical raster tracing.

## Page 4 — Equation Detective

**Reference:** the Advanced section of `references/Gradient_Lab_Original_Brief.pdf` (no PNG was generated for this screen)

**Entry file:** `04-equation-detective.html`

**Source:** `src/pages/advanced.js`

### Hierarchy and placement

- Grid on the left with a caption line.
- Right panel, scrolling when notes grow: title, five type buttons (Mixed, Read the graph, Two points, Missing coordinate, Hit the targets), four score boxes (points, solved, streak, best streak), the challenge, then **New challenge** and **Reset my score**.
- The Advanced tab shows the number of challenges solved.

### Challenge types

| Type | Graph | Answer | Generation |
| --- | --- | --- | --- |
| Read the graph | Red line only | m and c boxes | m from ±1, ±2, ±3, ±½, ±3/2, ±⅓, ±⅔; c from −4 to 4; the line passes through a second on-screen grid point |
| Two points | None while working; line and points shown after the challenge ends if they fit | m and c boxes | Same gradients; c from −5 to 5; whole-number points |
| Missing coordinate | The line | One box: k or y | m a whole number ±1 to ±4; c from −6 to 6; k from −5 to 5, not 0; find-k and find-y equally likely |
| Hit the targets | Two rings that turn green when the line passes through them | m slider (−4 to 4, step 0.5) and c slider (−8 to 8) | m from ±0.5 to ±3 in steps of 0.5; c from −4 to 4; targets at x = −4, −2, 2 or 4, on screen |

Mixed picks one of the four for each challenge. Choosing a type loads a fresh challenge and is saved.

### Feedback ladder and scoring

1. Correct on any try: green **Correct!** note, points earned and full working. The answer locks and **Next challenge** appears.
2. First wrong answer: yellow **Not yet** note with a specific comment where one applies, the hint and “Try again.”
3. Second wrong answer: the hint stays, and a blue **Try a similar one first** note works a different challenge of the same type, with a small graph for Read the graph and Hit the targets.
4. Third wrong answer: red **Here is the answer** note with the full working. Hit the targets moves the sliders to the answer. The answer locks.

Empty or non-numeric input shows a yellow note and does not count as a try. Decimals typed to two or more places, such as 0.33 for ⅓, are accepted.

Correct on try 1/2/3 earns +3/+2/+1; a revealed answer earns 0. Only a first-try solve raises the streak; anything else resets it. Best streak keeps the highest value. **New challenge** skips without changing the score. **Reset my score** asks for confirmation and sets all four boxes to 0.

### Code ownership

- Generators, answer checks, scoring, questions and worked solutions: `GL.detective` (pure, tested in Node).
- Markup and events: `GL.pages.advanced`.
- Plot contents: `GL.graph.detectiveContent()`, `GL.graph.ring()`, `GL.graph.marker()`.
- Layout: `.detective-panel`, `.type-buttons`, `.scores`, `.challenge`, `.note`.
