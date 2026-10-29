# Faster pages, no stop on the loader, and a clear "picked" look

## 1. No stop on the "Getting things ready…" screen
Opening a topic currently goes through an in-between page: it shows Fiti's loader, starts the lesson, then moves on. Instead:
- The tap starts the lesson in the background and goes straight to the lesson. No in-between page.
- Fiti's loader only shows if a load really is slow (over 0.3 s). Once he's on screen, he's gone the moment the next page is ready, with no extra wait.

## 2. Every tap feels instant, across the app
- **Shared details aren't fetched again:** her name, streak and plan are kept for a minute instead of being fetched on every page. Pages she has already seen open straight away and refresh quietly behind.
- **Pages start loading on intent:** when she hovers or presses a link or button, the next page starts loading before she lets go. This covers Home, Learning Hub, chapters, quests, topics, the map, the lesson and quizzes.
- **No blank pages between screens:** the current page stays on screen until the next one is ready, instead of blanking into a loader.
- **Every tap answers at once:** each button presses down the moment it's tapped. Buttons that wait on the server show a small busy state on themselves, so she knows it worked.
- **Measure, then fix the slow ones:** time each main page before and after, and fix any server step over about 300 ms (for example, running steps in parallel).

## 3. An obvious "picked" look on answer cards
The selected card today only gets a thin outline (screenshot 3). When she picks one:
- the card lifts and pops slightly larger, with a quick bounce;
- it gets a thick outline in its own colour (purple for A, orange for B, and so on), plus a soft glow in that colour;
- the other cards fade back a little so the picked one stands out;
- the letter badge fills with a stronger shade of the card's colour.

No tick is added, as you asked earlier. Reduced motion keeps the outline, glow and fade, but drops the bounce. This applies to warm-up, quiz, video checks and practice "Your turn". It works in light and dark mode.

Separately, once she has picked, the Check Answer button already lifts to full strength.

## Technical details
- `src/router.tsx`: set `defaultPreload: "intent"`, and keep `defaultPreloadStaleTime: 0`. Give the `QueryClient` default `staleTime: 60_000` and `placeholderData: keepPreviousData` for the me/home queries.
- Topic route `$topic.tsx`: start or resume the session from the tap (on the map's Start and in the chat), then `navigate` straight to `/lesson/$sessionId`. The topic route stays redirect-only.
- `FitiLoader`: no minimum time on screen; it shows only after 300 ms and fades out the moment the page is ready.
- Shared answer tile: a `data-selected` style with `scale-[1.04]`, `-translate-y-1`, a 4px ring in the option's accent and a glow shadow in the same accent. Unselected tiles get `opacity-80` once one is picked. A `tile-pop` keyframe is added, with a reduced-motion override.
- Time each main page with Playwright before and after. Server steps over 300 ms are made parallel.
