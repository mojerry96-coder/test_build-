# Super Admin panel + readable page addresses

Goal: you can move to any screen, step or state in one click while testing, and students never see any of it.

Built in two parts, in this order, because the panel's "Go to page" list uses the new addresses.

## Part 1 — New page addresses (from "NEW URLS")

1. Pages move to the new addresses:
   - /sign-in, /, /meet-your-tutor, /mathematics/welcome, /mathematics
   - /mathematics/coordinate-geometry (quests), /mathematics/coordinate-geometry/lines-and-their-steepness (topics)
   - /mathematics/coordinate-geometry/lines-and-their-steepness/gradient-of-a-line (the lesson)
   - /my-learning, /progress, /admin, /admin/content-import, /admin/settings
   - /admin/sessions/[id] and /admin/playground are reserved now and get built in Phase 3 (they do not exist yet).
2. Short readable names ("slugs") for subject, chapter, quest and topic, made from the display names, stored with the content, unique within their parent. The content import creates them; the current topic is filled in. Topic id MTH12_09_02_01 stays the internal key.
3. If a display name changes, the old name in the address still works and forwards to the new one.
4. Lesson address has no session id: opening it continues your active lesson for that topic, or starts one with the same checks as today. `?attempt=2` shows a past attempt (your own only). `?preview=1` is for admin preview lessons only.
5. Every old address forwards permanently: /auth, /meet-tutor, /welcome/mathematics, /chapters/mathematics, /admin/import, and /lesson/[id] (to the owner's lesson address, or Home for anyone else).
6. Browser tab titles: "[Page] · uLesson Tutor", lesson adds the step ("Gradient of a line · Warm-up · uLesson Tutor").
7. Every link, breadcrumb, Continue button and the helper's "Ask your tutor" updated.

## Part 2 — Super Admin panel (from "Add a Super Admin panel")

### Access (checked on the server every time)
Shown only when all three are true: you are admin, new protected setting `dev_tools_enabled` is on, and this is not the live published build. Otherwise the panel code is never downloaded and every panel action is refused. The setting is admin-only, logged, and never touched by content import.

### Look
- Slim purple (#7259CF) "Admin" tab, ~24 px, right edge, vertically centred.
- Click or Ctrl+Shift+A opens a 52 px icon rail (44 px on phone) that floats over the page without moving it.
- Each icon opens one 260 px flyout beside the rail; on phone a short bottom sheet.
- Close with X, Escape or the shortcut. Drag up/down; position and open state remembered on the device. Thin purple line on the right edge while open. It moves aside so it never covers the page's main button.

### Sections
1. Go to page — every screen above, skipping first-time screens (Meet your tutor, Welcome).
2. Lesson jump — any of the 8 steps, Start again, or a chosen item.
3. Force states — correct / not quite, escalation try 1–3, simulation band, weak network / offline notice, "Voice is coming soon", help prompt, secure / not-secure close.
4. Display — light / dark / device, text size, low-data, reduced motion, show/hide tutor helper, reset "seen" flags.
5. Viewport — preview at 390, 768 or full width.
6. Info — page, session id, step, attempt, pack version, roles, dev settings, each with a copy button.

### Safety
- Jumps and forced states only ever run on your own admin preview lessons (marked "admin_preview"), kept out of evidence, summaries and metrics, and labelled as preview. Never a student's lesson.
- No answers, feedback or hints are ever shown; forced answers are done on the server.
- Every action logged as "dev_tool_used". Leak check re-run and must pass.

### Before launch
AGENTS.md note: turn `dev_tools_enabled` off before launch. Tests prove the panel never loads for a student, or when the setting is off, or on the live build.

## Gaps closed in this plan
1. Sign-in return: after sign-in you land back on the page you asked for (new addresses), including a lesson address.
2. Google sign-in return address updated to /sign-in so sign-in keeps working.
3. Lesson address for a locked or hidden topic: goes to that chapter page, not an error.
4. Unknown subject/chapter/quest/topic name in the address: friendly "not found" with "Back to my topics".
5. Two tabs on the same lesson address share one lesson (no second session started).
6. Preview lessons: one per topic per admin, reusable; "Start again" wipes only that preview; tidied by the existing test-data cleanup.
7. Panel turning off: if `dev_tools_enabled` is switched off while open, the panel closes on next action and the action is refused.
8. Panel stays out of the way of keyboard focus order (last in tab order), is readable in both light and dark, and works with screen readers (labelled buttons).
9. Ctrl+Shift+A does nothing while typing in an answer box; Escape closes the flyout before the rail.
10. Panel actions that change display (theme, text size) use the same device settings as the avatar menu, so they never disagree.
11. Audit entries record which section and action, never answer content.
12. Phone: bottom sheet never covers the Continue / Submit button; it closes on page change.

## Honest limits today
- The lesson currently runs on the temporary fixed walk (real engine is Phase 2/3). Lesson jump and force states will drive that walk now and switch to the engine later without changing the panel.
- Debug view and playground links appear once those pages are built in Phase 3.
- /my-learning and /progress get simple placeholder pages with no "Coming later" text, matching current rules.

## Technical details
- Routes: rename files under `src/routes/_authenticated/` to `$subject.tsx`, `$subject.welcome.tsx`, `$subject.$chapter.tsx`, `$subject.$chapter.$quest.tsx`, `$subject.$chapter.$quest.$topic.tsx`; `auth.tsx` → `sign-in.tsx` (integration gate redirect target updated). Old paths become redirect-only route files.
- Migration: `slug` columns + `slug_history` table for old slugs; backfill; `apply_content_pack` generates slugs; `sessions.consent_basis` gains `admin_preview`; `admin_audit` action check gains `dev_tool_used`; rule `dev_tools_enabled` (protected, global).
- Server: `src/server/functions/dev-tools.server.ts` (has_role + setting + non-production check on every call), thin `src/lib/api/dev-tools.functions.ts`; lesson resolver by topic slug in `lesson.functions.ts`.
- Client: panel lazily imported only after `getDevToolsAccessFn` returns true; state in localStorage.
- Tests: access refusal (student, setting off, production), slug generation/uniqueness, old-URL redirects, preview sessions excluded from evidence.
