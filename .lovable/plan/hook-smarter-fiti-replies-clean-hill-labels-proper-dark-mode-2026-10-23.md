# Hook: smarter Fiti replies, clean hill labels, proper dark mode

## Answer: is an agent used for the chat?
- Warm-up and Home: yes. A word list sorts her message first; only when it is unsure, Lovable AI sorts it, and Fiti then plays an approved line (or a checked AI phrasing grounded in approved facts).
- Hook: no. The Hook uses only a short word list. "how do i solve this" is a help phrase, but the Hook turned help into "unclear", which played "Sorry, I didn't catch that…". That is the bug in your screenshot.

## 1. Fiti on the Hook responds properly
- Use the same sorting as the warm-up: word list first, then the AI only when unsure (same time limit and fallbacks).
- Replies by kind (all approved lines, drafts for Instructional Design):
  - Help / "how do I solve this" / "I'm stuck": "Look at how much each path climbs for every 1 along. Then take your best guess!"
  - "Which is steeper / what's the answer": existing "That's the puzzle! Make your best guess, the video will show us."
  - "What is steepness": existing "How quickly a path climbs. Which one climbs faster?"
  - Off-topic, greeting, distress, boundary: the same lines as the warm-up.
- "Sorry, I didn't catch that" only for empty or keyboard-mash messages, never twice in a row (same rule as the warm-up).
- Fiti never says which path is steeper (no marking on the Hook).
- The chat no longer repeats the whole question as a Fiti message when it opens; it opens only with "What would you like to ask about the two paths?"

## 2. Hill labels never overlap
- "Path A" / "Path B" sit in small white rounded tags above the end of each road, so they never sit on the hill edge or a road.
- "up 2, along 1" and "up 1, along 2" sit in the same small tags beside their triangles, clear of both roads.
- Text keeps a white halo so it stays readable over any colour.

## 3. Dark mode on the Hook
- Picture card: dark navy card, hill a deeper blue (not near-white), clouds soft grey-blue at low opacity (no bright white blobs).
- Labels and tags: tags stay light with navy text, so they read on the dark hill.
- Rise/run triangles: softer yellow fill that still shows on the dark hill.
- Tiles: use the warm-up's dark tile colours with readable text (fixes the faded "Path A", "Not sure"); navy outline swaps to the light outline.
- Question text light, numbers keep the orange token.
- Chat card: bubbles use the chat's dark values so the text is readable (fixes the faded grey text in screenshot 3).
- All text meets AA contrast; added to the existing dark-contrast check.

## 4. Remove the nudge
- "Take your best guess. Any answer is fine here!" is removed from the Hook: no tip pill, no chat line, no spoken line.
- The tip pill only shows Fiti's reply after she picks a tile.
- The skip link timing stays as it is.

## 5. Added gaps
- After her guess, chat questions still get sensible replies (e.g. "why?" -> "Hold that thought, the video will show us!"), never the guess marked.
- Fiti's mood follows the chat: thinking while she types, nodding when she replies.
- Typed answers like "path a" or "A" in chat pick that tile, same as tapping it.
- Every chat reply on the Hook is logged with its kind, like the warm-up.
- Phone: tags on the hill scale down and still don't overlap; chat as bottom sheet.
- Dark mode check covers the hill card, tags, tiles, question and chat bubbles.

## Technical details
- `HookStage.tsx`: drop the nudge step of the timer (keep the skip-link timer).
- `demo-path.server.ts` `askTutor` hook branch: route `help` to new `hook_help` fallback; run `classifyLessonMessage` (as warm-up) when the word list returns maths/prereq/unclear/offtopic/greeting; `unclear` goes through `unclearReply`. `pickHookMove` keeps `help` instead of mapping it to `unclear`.
- Seed: draft `FB_HOOK_HELP`; check hook chat opener source and drop the question echo. Reload seed, leak/banned check.
- `HookStage.tsx` `Hill`: label tags (rect + text) with fixed anchors; dark tokens `--hook-hill`, `--hook-cloud`, `--hook-tri-fill`, `--hook-tag` added to the `.dark` block; tiles `.dark .mcq-tile` ink token.
- Lesson chat bubble dark tokens checked against `dark-contrast.test.ts`; targeted tests only: `pickHookMove` help case and the dark-contrast pairs.
