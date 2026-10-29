# Make every button respond the moment it is tapped

## The problem
Buttons across the lesson react late: answer tiles, Check Answer, Hint, Ask Fiti, the header buttons, and the buttons on the popups ("Continue", "Got it", "Let's fix this"). The cause is not confirmed yet, so the first step is to measure it. Then I fix each cause I find.

## Step 1: Measure (on a laptop and on a slow-phone setting)
For each main button, time three moments: the tap, the first visible change, and the finished result. Likely causes to confirm or rule out:
- **Waiting on the server before showing anything.** For example, Check Answer or Continue might show nothing until the answer comes back.
- **Slow press animation.** The "squish" springs back over about half a second, and some buttons bounce on hover, which makes taps feel soft.
- **The page is busy.** Fiti's clips starting, the voice loading, confetti, or the whole screen redrawing on each tap.
- **Popups open late.** The popup waits for the server reply, or its pop-in animation is long (up to about 0.8 s on some cards).

## Step 2: Fix what the measurements show
- **Instant feedback on every tap:** the button shows pressed at once (within about 0.1 s). Buttons that wait on the server show a small loader straight away and can't be tapped twice. This uses the same loader as the Continue Learning button.
- **Show what we already know first:** the picked tile is marked the moment she taps. Popups open at once with their words, and only the parts that need the server wait. Marking stays on the server, so nothing is decided early.
- **Snappier motion:** a faster press and release on buttons, and shorter pop-in animations on popups (about 0.2 s). The hover bounce no longer delays a tap.
- **Keep the page free:** Fiti's clips, voice and confetti start after the screen has updated, never before.
- **Fewer slow server round trips:** load common next steps early where safe, and remove any repeated calls the measurements turn up.

## Step 3: Check
- Re-time the same buttons on a laptop and on the slow-phone setting, and list the before and after times in my reply.
- Check that double taps never send an answer twice, and that light/dark mode and reduced-motion still look right.

## Technical details
- Profile with Playwright and CDP CPU and network throttling. Use `performance.now()` marks around click, first paint (rAF) and settle, plus a server function timing log.
- Candidates: the `.squish` 460 ms spring, `.hdr-bounce`, `.anim-card-in` 820 ms and `.qf-card` 380 ms. Also optimistic `data-pressed` / selected states, and `startTransition` for heavy rerenders. Deferring `say()` / clip / confetti to after paint is another option, as is reusing the guarded loading button pattern.
- Do not change any marking logic. Server checks stay the single authority.
