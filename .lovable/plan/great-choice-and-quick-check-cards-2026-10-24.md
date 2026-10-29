# "Great Choice!" and "Quick Check" cards

## When it shows
On her **first time into a topic**: she picks a quest or topic in Ask Fiti and the server replies "open the intro" (she has never started it). Today the app jumps straight to the map after about 1 second. Instead, the welcome card appears and the map opens only when she taps Continue. Going back into a topic she has already started still opens the map directly, as it does now.

## What it looks like (copied from the design, without the red flow arrow)
- The chat stays behind, dimmed with a soft grey veil over the whole page, including the side bar and header.
- A centred white card with large rounded corners, about 650px wide, and an orange gradient bottom edge (dark orange on the left to light orange on the right), like the quick-fix card.
- Faint decorations in the card: a squiggle top right, a starburst left of Fiti, a cloud bottom right.
- Fiti with glasses giving two thumbs up, inside a soft round crop at the top centre.
- The heading **"Great Choice!"** in the large navy handwriting font.
- Two centred lines underneath in plain navy: "I'll guide you through you will be learning first, click the button to continue". This wording comes from the design. It will be stored as an approved Fiti line, so it can be fixed later without code changes.
- A light blue raised **Continue** pill with a deeper blue bottom edge, which bounces on hover and presses down when tapped.

## Behaviour
- Continue opens the topic's "Let's Begin" map and can only be tapped once.
- Fiti reads the heading and line aloud in his voice, unless his voice is muted.
- Escape, or tapping outside the card, closes it and leaves her in the chat. Fiti's message then keeps a Continue Learning button, so she can still go in.
- The card pops in with a little bounce. With reduced motion turned on, it simply appears.
- Focus moves to Continue, and keyboard focus stays inside the card while it is open.

## Sizes and modes
- **Phones:** the card fills the width with a side margin, Fiti is smaller, and the button is full width and at least 48px tall.
- **Short screens:** Fiti shrinks so the button always shows without scrolling.
- **Dark mode:** navy card, light text, the same orange edge, and Fiti blended into the card. The text pairs are added to our dark-mode readability check.

## Second card: "Quick Check" (after tapping Start on the map)
- It shows when she taps **Start** on the "Let's Begin" map, or says "go" in the map chat, before the warm-up questions open. It appears every time a fresh lesson starts. When she is resuming a lesson she already began, the lesson opens straight away.
- It uses the same card as above, the same veil over the map, and the same Fiti with thumbs up. The heading is **"Quick Check"**, with one line underneath: "Let's see how rusty you are in maths". The button is a light blue **Ready** pill. The design's wording ("how you rusty") is tidied to "how rusty". Like the first card's wording, this text is stored as an approved Fiti line.
- Ready opens the warm-up questions. Escape or tapping outside closes the card and leaves her on the map, where she can tap Start again.
- The map's Fiti, the Hint and Ask Fiti buttons stay visible but dimmed behind the veil, as in the design. The red arrow is not drawn.
- The same rules for voice, motion, focus, phones, short screens and dark mode apply.

## Also included
- **Music and sound:** music softens while Fiti speaks, and the card plays the existing pop sound when it opens and the tap sound on its button.
- **No double cards:** each card opens only once per tap, and the button locks after the first tap.
- **Start again / New Chat:** an open card closes, and nothing carries over.
- **Teacher pause:** if a teacher has paused the lesson, Ready waits and the card says so with its approved line.
- **Slow network:** the card shows at once with its text. Fiti's picture loads in its reserved space without the card jumping.
- **Text size setting** applies, and long lines wrap.
- **Logged:** each card opening and button tap is recorded as an event, so we can see who continued.
- **Learning Hub path:** a first-time topic opened from the Learning Hub also gets the "Great Choice!" card before the map.

## Technical details
- Quick Check: fallback lines `path_quick_check_title` / `path_quick_check_line` / `path_quick_check_button`. The map route's `go()` opens the card, and Ready runs the current start logic. Both cards use one shared `WelcomeCard` (title, line, button label, onGo, onClose).
- `FitilaAgent.tsx` `useFitila`: when `r.navigate.to === "intro"`, set `welcome = { path }` instead of the 900ms navigate. Expose `welcome` and `closeWelcome`. Leave `lesson`/`quiz`/`subject` unchanged.
- New `src/components/home/WelcomeCard.tsx`: fixed overlay (`bg-fh-veil`), `role="dialog"` with `aria-modal`, `overlay-edge`, orange edge reusing the quick-fix gradient token, thumbs-up asset with glasses (use the existing tutor asset if it matches, otherwise generate a matching one), and `useSay` for speech.
- Copy: fallback lines `home_welcome_title` / `home_welcome_line`, inserted by a migration and returned with the reply (`r.welcome`) through the existing `home_*` fallback-line path. Nothing hard-coded.
- Rendered in `src/routes/_authenticated/index.tsx`.
- Tokens: `--fh-veil` plus dark values in `src/styles.css`, and pairs in `dark-contrast.test.ts`.
- Check with screenshots at 1377x892, 390x844 and dark mode.
