# "Choose learning path" page after sign-in

## When it shows
Right after she signs in with Google, she lands on this page instead of going straight to Ask Fiti. If she signed in from a shared link to a specific page (a lesson, a quest), she still goes to that page, so links keep working. Opening the app when she is already signed in still goes to Ask Fiti as before.

## What it looks like (copied from the design)
- The same soft page background and shapes as the rest of the app: pale blue, the big grey flower on the right, the pale blue swoosh on the left, the green flask at bottom left.
- The **uLesson** logo with its wordmark at top left, and the blue **Dark mode** pill at top right (the same switch as on the sign-in page).
- There is no side bar and no streak on this page.
- The heading **"Choose learning path"** sits in the middle in large navy text.
- Two white pill buttons side by side below it:
  - **Auto Pilot**, with a thin blue line and a deep blue bottom edge.
  - **Tutor Mode**, with a thin orange line and a deep orange bottom edge.
- Both lift slightly on hover and press down when tapped, with the tap sound. Reduced motion turns the movement off.

## What the buttons do
- **Auto Pilot** opens Ask Fiti, the current flow. Everything after that is unchanged.
- **Tutor Mode** does nothing for now, as you asked. It still shows the tap feedback, and we will scope it later.

## Sizes and modes
- **Phones:** the heading wraps onto two lines, and the buttons stack full width, each at least 48px tall.
- **Tablet and laptop:** side by side, as in the design.
- **Dark mode:** a dark navy page with the same shapes dimmed. The buttons become dark pills with light text and keep their blue and orange lines and edges. These colours are added to our dark-mode readability check.

## Technical details
- New route `src/routes/_authenticated/choose.tsx` (`/choose`), with its own head() title and description. It uses the app backdrop shapes from `FitilaShell` without the rail, and the shared theme toggle.
- `sign-in.tsx` `target()`: when there is no `redirect` or saved back-path, default to `/choose` instead of `/`.
- Auto Pilot: `navigate({ to: "/" })`. Tutor Mode: `playSound("tap")` only, with no route.
- Tokens: `--cp-auto-edge` / `--cp-tutor-edge` and their dark values in `src/styles.css`, plus pairs in `dark-contrast.test.ts`.
