# Ask start screen and sidebar, matched to the spec

The second screenshot is the spec. Anything not in it is removed.

## Sidebar (Ask and Learning Hub pages)
- Show only these, top to bottom: the uLesson logo (shown whole, no cut-off, sized and placed as in the spec), "+ New Chat", "Ask {tutor name}", "Learning Hub" (your book icon), and the initials circle at the bottom.
- Hide My plan, Notebook and Progress for now. Their pages stay but nothing links to them. There is no "Learning Lab" anywhere.
- Spacing and sizes come from the spec: the sidebar is narrower (about 180 px), with New Chat under the logo and the two items lower down.
- The initials circle is light grey with dark initials, as in the spec.

## Start screen (before any message)
- Heading "Ready to learn, {first name}?" in Patrick Hand, exactly as you gave it:
  - colour #024064, with a 1px stroke in the same colour;
  - 60px size, 64px line height, 2px letter spacing, weight 400, centred.
- Remove the "tonight's plan" card, as you chose.
- Ask box placeholder: "What do you want to learn today?"
- The three cards under the ask box, exactly as in the spec:
  - "Practice Maths · Solve it step by step" starts a maths quiz;
  - "Explore Science · Discover something else" and "English Language · Learn composition" show "Coming soon" and can't be tapped.
- The waving parrot you sent sits at the bottom right, as in the spec, with the flask at the bottom left.

## Chat page and background (your latest screenshot)
- Use your new files: the flask drawing (bottom left) and the small thumbs-up parrot as the tutor's picture beside each chat reply.
- The background on the Ask and Learning Hub screens copies the spec:
  - the outlined planet with its small moon and star at the top centre;
  - the large soft grey flower on the right;
  - the pale shape on the left;
  - the flask at the bottom left.
  Sizes, positions and opacity are taken from the spec.
- **Screen sizes:** the spec layout holds at 1280, 1440 and 1920 px wide, on tablet and on phone.
  - Shapes and the parrot scale with the screen and never cover the text, ask box or cards.
  - On phones the parrot and flask hide, and the bottom bar replaces the sidebar.
  - I'll check each size against the spec in screenshots before reporting back.
- Chat layout as in the screenshot: her bubble top right with her initials, the tutor's name and reply on the left, the numbered quests, and the ask box centred at the bottom.

## Flags (where I won't copy the spec literally)
- **Chat font:** in the spec, her bubble and the tutor's reply are both handwritten. You asked earlier for readable Mulish on the tutor's replies, so I'll keep Mulish there and use Patrick Hand for her bubble only, unless you say otherwise.
- **Class label:** the spec says "Grade 6". It will show her class from her profile (SS3), as you asked earlier.
- **Badge:** the spec says "2 days in a roll". It will say "days in a row", as you asked earlier.
- **Tutor name:** the spec says "Fiti". The name comes from the tutor-name setting (Fitila today).
- **Science "Coming soon" label:** the spec doesn't show one on any card. It only marks cards that can't be tapped yet, the same rule as the subject cards.
- **Admin tab:** the small purple "ADMIN" tab on the left edge isn't in the spec. Students never see it; it shows only for admin accounts.
- **Plan removal:** without the plan card, "Start learning" on the Learning Hub, typing "start my plan" and the tutor's own replies still open her plan.

## Technical details
- Load Patrick Hand with the existing font link in the root head, and add a `font-hand` utility plus a `--hub-heading` colour token with a dark-mode value.
- Upload the waving parrot, the thumbs-up parrot and the flask to the asset store, replacing the current flask and the small chat parrot.
- Redraw the background shapes in the shell to match the spec: SVG at fixed positions, using `fh-*` tokens.
- `FitilaShell`: narrower aside, logo with `object-contain` and no clipping, only the two nav items, grey avatar.
- Start cards become a fixed display list in `src/shared/` (temporary, like `chapters-display`). Practice Maths sends `{kind: "text", text: "quiz me", mode: "quiz"}`.
