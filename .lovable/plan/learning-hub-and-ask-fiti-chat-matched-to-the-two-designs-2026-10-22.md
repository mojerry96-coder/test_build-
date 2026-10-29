# Learning Hub and Ask Fiti chat, matched to the two designs

The two screenshots are the spec. Sizes, spacing, colours, fonts, positions and assets are copied from them. The only differences are the ones you asked for: the tutor's name comes from the setting, the badge says "days in a row", the class shows "SS3", and her real name and initials appear.

## Sidebar (both pages)
- Logo at the top, then the blue "+ New Chat" button with its darker bottom edge (same style as the Dark mode button), then "Ask {tutor name}" (bird icon) and "Learning Hub" (the open-book icon you sent). Her initials sit in a grey circle at the bottom.
- The active item gets the light blue tile, as in the design.
- New Chat starts a fresh conversation and opens Ask.
- Phone: a bottom bar with Ask and Learning Hub, plus New Chat as a round floating button above it.
- This replaces the current Today / My plan / Notebook / Progress menu. The My plan and Notebook pages stay but leave the menu; Progress stays reachable from Fiti's progress reply.

## Top right (both pages)
The Dark mode button and the "🔥 {n} days in a row" streak badge with the small parrot, as now.

## Ask page (chat), the new start page after sign-in
1. **Before any message:** the current "Ready to learn, {first name}?" screen with the plan card, ask box and three cards.
2. **After she sends a message:** the page becomes the conversation, as in the second design:
   - her message on the right, in a light blue rounded bubble, with her initials in a navy circle;
   - the tutor's message on the left, with the small standing parrot, a blue name label above it, and the reply streamed in. The reply uses the readable body font; the handwritten font stays for page headings only;
   - the ask box is pinned at the bottom, centred, the same width as in the design.
3. **Choices as a numbered list:** when the tutor offers choices (quests, topics, plan changes), they show as the design's list: a white number badge with a blue bottom edge, a title and one short line. Tapping one runs its action. For example, "Lines and Their Steepness" opens that quest's first topic intro. Choices that aren't available show "Coming soon" and can't be tapped. Only Lines and Their Steepness is available now.
4. **New reply for "I want to learn maths":** the tutor lists the Mathematics quests from the content (names and lines as on the Choose a quest page). The new line is "Absolutely! Let's explore that together. I have {n} quests listed. Which do you want to learn?", saved as a draft for Instructional Design approval.
5. **Saved conversations:** every conversation is saved; New Chat starts a new one; reopening Ask shows the latest one.

## Learning Hub page
1. Heading "My Learning Hub" in the handwritten heading font.
2. **Weekly streak** under the badge: the label "Learning Streak" and seven circles, Mon to Sun (Nigeria time). Days with learning show the orange flame (the flame image you sent), today is highlighted, other days are light with their letter.
3. **Banner:** navy-to-blue gradient, rounded corners, the waving parrot on the right on a soft circle, faint maths symbols (x², π, triangle, a large glassy x²). "Ready for your next" in white and "learning adventure?" in light blue, the line "Keep your momentum going or choose a new subject to explore.", and a white "Continue Learning" button. It opens the lesson in progress at its saved step. If there is none, it says "Start learning" and opens tonight's plan.
4. **Select a Subject:** the nine coloured cards in the design's order, colours and icons (Mathematics, English Language, Biology, Chemistry, Economics, Government, Accounting, Literature in English, Physics). Mathematics opens Choose a chapter. The others show a small lock and "Coming soon" and can't be tapped.

## Assets
- Your uploads: the open-book icon (Learning Hub) and the orange flame (streak days).
- Already saved: the logo, bird icon, moon icon, flask, parrots and the times-sign and DNA icons.
- The existing subject icons for the other seven subjects.
- The English "Aa" icon isn't among your files. I'll reuse the closest existing one unless you send it.

## Test and report
- Run the main flow:
  1. send "I want to learn maths" and tap "Lines and Their Steepness", which opens the first topic intro;
  2. confirm the other two quests can't be tapped;
  3. start a New Chat;
  4. open Learning Hub and tap Continue Learning.
- Desktop and phone screenshots of both pages, compared side by side with your two designs.

## Technical details
- Data: add a nullable `conversation_id` column to `home_messages`, and a server-only `home_conversations` table (id, student_id, created_at, title). History loads per conversation; New Chat creates one.
- Engine: a new intent rule. "learn {subject}" with no topic gives the action `list_quests`, built from `questRows` and the topics table (`open` = has an active topic). The reply carries `options: { title, line, available, action }[]` in the shared `HomeReply` contract. An option tap is sent back as `{ kind: "option", index }` and checked against the last saved options on the server.
- UI: `FitilaShell` gets the new nav. The route `/` renders the Ask page, with a new `/learning-hub` route. `/ask` redirects to `/`. The streak week comes from the same Lagos-day logic as `streakDays`.
- Tests: the option tap only runs an available option; the week circles mark the right Lagos days; "I want to learn maths" gives `list_quests`.
