# Bounce the whole button on hover

## What changes
- When you hover over the music, sound or Dark mode button, the whole button now bounces with its icon and label, not just the icon inside it.
- The bounce is clear and clean: the button jumps up about 10px with a slight squash on landing, then a smaller second hop, lasting about 0.6 seconds. It plays once per hover, with no jitter or looping.
- The coloured base under each button stays put while the button hops, so it looks like the button is jumping off its base.
- Pressing a button still pushes it down as it does now. Keyboard focus also triggers the bounce.
- No bounce when the device asks for reduced motion.

## Technical details
- `src/styles.css`: move the `icon-bounce` animation from the inner `.icon-bounce` span to the button itself (`.hdr-bounce:hover`, `.hdr-bounce:focus-visible`). During the animation the drop shadow grows as the button lifts, so the base looks fixed. Keep the reduced-motion override.
- `src/components/home/FitilaShell.tsx`: add `hdr-bounce` to the three buttons and remove the inner icon-only bounce wrappers. Pausing the animation on `:active` keeps the existing press effect.
