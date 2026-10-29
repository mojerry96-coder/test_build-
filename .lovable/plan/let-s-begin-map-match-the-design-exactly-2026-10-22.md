# "Let's Begin" map: match the design exactly

## What is different today
- Stops are perfect circles; the design's stops are soft "pebble" shapes (slightly uneven round, a bit taller than wide) with a thick grey ring, a white gap, a grey centre with a faint star and a white lock, and a darker edge at the bottom so they look raised.
- The path in the design is a thick, rope-like line (light grey, twisted look), not a thin wobble.
- The map is squashed: stops sit too close vertically, so it looks short. In the design the map spreads over roughly 640 x 400 on a 1312-wide screen, with clear vertical spread (top stops near the heading, Start stop low on the left).
- The next stop (star) has an orange outer ring, white gap, blue centre with an orange star, and a blue "Start" pill under it. Ours has no Start pill.
- Blurry look: the lock is a small picture scaled up and the stop centres use see-through layers. Both will be drawn as sharp shapes so they stay crisp at any size and on high-density screens.

## Changes
1. Stop shape: pebble outline drawn as a sharp shape, ring 6 px grey (#B9BCC4-ish token), white gap, grey centre, faint star, white lock drawn as a crisp icon, darker bottom edge. Sizes ~78 px desktop, ~64 px phone. Done and next stops use the same pebble shape in their colours.
2. Next stop: orange ring, blue centre, orange star, gentle pulse kept, plus a "Start" pill (blue, darker bottom edge, white text) under it; tapping it does the same as tapping the stop.
3. Path: rope look made of a thick light line with a fine twisted pattern on top; done parts recoloured as today; the fill-up animation on "Let's go!" kept.
4. Layout: re-measure all 6 stop positions from the design on a taller canvas so the map is as tall as in the screenshot; map fills the space between the sidebar and the chat, with the heading sitting just above the top stops.
5. Hover tooltip, keyboard order, entry animation and reduced-motion rules stay as they are.
6. Phone keeps the top-to-bottom layout with the new stop and path look.

## To confirm
- The design shows no chat panel and an "Ask Fiti" button bottom-left. Earlier you asked to remove that button and keep the chat beside the map. Plan keeps the chat and only fixes the map, unless you say otherwise.

## Technical details
- Only `src/components/path/PathMap.tsx` and path tokens in `src/styles.css` change.
- Pebble = inline SVG path per state; lock = inline SVG (drop the PNG mask); rope = two stacked SVG strokes (base + dashed highlight with offset).
- New DESK canvas ~720 x 520 with re-measured points; maxWidth raised.
- Typecheck after; one desktop screenshot to compare against the design (needed to confirm the match).
