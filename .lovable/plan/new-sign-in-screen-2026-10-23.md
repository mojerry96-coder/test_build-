# New sign-in screen

Rebuild the sign-in page exactly as your screenshot shows. Only your four text fixes differ from it.

## Layout (exactly as the screenshot)
- Top left: uLesson logo at the same size and place (white logo in dark mode). Top right: the blue "Dark mode" pill with the moon icon and darker bottom edge (shows "Light mode" when dark).
- Pale blue background with the same large faint shapes: the blue swoosh on the left, the grey flower on the right, the soft shape at the bottom, and the green star doodle in the bottom-left corner. They're drawn to match, with darker versions in dark mode.
- Centre column, same widths and gaps: "Welcome Back!" heading in large bold navy (kept as shown), white rounded email box ("Enter your email"), white rounded password box ("Password") with the eye icon, "Forgot password?" right-aligned under it.
- "Sign in" button: light blue with the darker navy bottom edge, as shown.
- Dotted lines either side of "Or continue with".
- "Continue with Google": white with the Google "G" and the blue bottom edge.
- Footer: navy "Don't have an account?" with "Sign up" in blue, underlined.
- Sentence case on every button and link only, per your fixes.
- On phones the same column fills the width with side margins; the background shapes shrink to fit.

## Behaviour
- Google stays the only working way in; the existing Google flow, return-to-page and error message are unchanged.
- Sign in with email/password: nothing is sent anywhere. A message appears under the button: "Email sign-in is coming soon. Please continue with Google." Pressing Enter in a box does the same.
- "Forgot password?" shows that same message.
- Footer "Sign up" starts the Google flow directly.
- Dark mode button switches instantly, is remembered and applies across the whole app (same setting as the avatar menu).
- The message is read out to screen readers; the eye button says "Show password" / "Hide password".
- Removed: the tutor picture and the "The tutor is an AI. No camera is ever used." line, since the design doesn't have them. Say if you want that line kept.

## Gaps closed
- Already signed in: the page still sends her straight on, as today.
- While Google opens, both Google buttons show "Opening Google…" and can't be tapped twice.
- The "coming soon" message clears when she types again or taps Google.
- Boxes have hidden labels for screen readers, and phones offer saved emails.
- Every button and link shows a visible keyboard focus ring; no square line inside the rounded boxes.
- Buttons use the same hover and press feel as the rest of the app.
- Text, placeholders and links pass contrast in light and dark.
- No flash of the wrong mode or logo on reload.

## Technical details
- Rewrite `src/routes/sign-in.tsx` only; reuse `useTheme().setPref`, logo assets `logo.png`/`logo-dark.png` toggled with `dark:` classes.
- New tokens in `src/styles.css` for button bottom edges and background shapes (light + dark); no hard-coded colours.
- Email form `onSubmit` preventDefault, set local notice state; no Supabase call.
