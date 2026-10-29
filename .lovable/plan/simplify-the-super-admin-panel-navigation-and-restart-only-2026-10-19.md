# Simplify the Super Admin panel: navigation and Restart only

## 1. Remove
- Take Lesson jump, Force states, Display, Viewport and Info out of the panel's side strip, together with their code: the viewport frame, forced states, display toggles and the info view.
- Keep everything else exactly as it is:
  - who can open it (admin role, the `dev_tools_enabled` setting on, never on the live app)
  - the slim purple tab on the right edge
  - Ctrl+Shift+A
  - dragging, and its remembered position
  - the admin_audit logging
- Text size, low data and theme stay reachable from the avatar menu, so removing Display loses nothing.

## 2. The strip
It holds exactly three buttons:
1. **Go to page** (compass icon)
2. **Restart** (circular arrow icon)
3. **Close** (X)

Each opens a small panel beside the strip, as now. Escape closes it.

## 3. Go to page: one list in journey order
- Sign in
- Home
- Meet your tutor
- Choose a chapter (Mathematics)
- Choose a quest (Coordinate Geometry)
- Topic intro (Gradient of a line)
- Lesson: Ready (warm-up)
- Lesson: Hook
- Lesson: See (video)
- Lesson: Do (simulation)
- Lesson: Practise
- Lesson: Guided
- Lesson: Exit ticket
- Lesson: Reflect
- Admin: Content import
- Admin: Session debug

**How each item behaves**
- One tap goes to that page.
- Each "Lesson:" item opens your own admin preview lesson at that step. It reuses the current preview or starts one, then moves it to that step and opens the lesson address with preview on.
- Preview lessons stay marked as previews, so they never count in evidence, summaries or metrics. Your real lesson is never touched.
- The current page is highlighted. For lesson pages, the highlight follows the step the preview is on.
- Every tap is logged in admin_audit.

**Admin: Session debug is a new page.** No such page exists yet, so I will add a small read-only admin page. It shows your current preview lesson: step, attempt, saved prediction, warm-up status and its last 20 events. It is admin-only and never shows answers or hidden scripts.

## 4. Restart (start the journey again)
1. Tapping Restart opens a small confirmation in the panel: "Start again from the beginning? This resets your test progress." with **Restart** and **Cancel**.
2. On Restart:
   - **Server side:**
     - End every open admin preview lesson of yours for this topic.
     - Start a fresh preview lesson (new attempt, nothing answered, no prediction, warm-up not started).
     - Log it in admin_audit as "dev_tool_used", "restart journey".
   - **On this device:**
     - Clear your "seen" flags: Meet your tutor, the tutor helper bubble, and any dismissed tips.
     - Clear the client lesson cache.
     - Go to Home.
3. Restart only ever touches your own preview lessons. It never changes a student's lessons or evidence, never your real lesson, and never signs you out.

**One thing to know about the Continue Learning banner.** Home already ignores preview lessons. But your account also has a real lesson in progress (at the video step), so Home will still show the banner for that real lesson after a Restart. To see Home with no banner, use Admin "Start afresh" on the real lesson, as before. I will not clear your real lesson from Restart, because the instruction says it affects preview data only.

## 5. Checks
- The strip shows only Go to page, Restart and Close.
- Every Go to page item opens the right page. Each Lesson: item opens the preview at that step.
- After Restart:
  - your old preview lessons are ended and a fresh one exists
  - Meet your tutor appears again
  - the topic intro and the warm-up start fresh
  - no student data and no real lesson changed
- A student account still never sees the panel: the access test is kept, plus a browser check signed in as a non-admin where possible.
- Automatic tests are updated for the removed parts and pass, along with the type check.
- Screenshots of the strip, the Go to page list, and Home after a restart. Then stop.

## Technical notes
- **Panel:**
  - `DEV_SECTIONS` becomes `["goto", "restart"]`.
  - The `force` server action and the client force event are removed.
  - `jump` stays, but is called only from the Go to page lesson items.
  - The old "lesson", "display", "viewport" and "info" code is deleted.
- **Restart action:** a new server action `restart_journey` (topic based, no session id needed) abandons all of the caller's active or paused sessions where `consent_basis = 'admin_preview'`, then calls `startPreview`.
- **Seen flags:** `ul.introSeen`, `ul.seen*` keys, and any per-visit helper dismissal key are cleared, and a `ul-pref` event is sent so open screens update.
- **Session debug:** a new route `/admin/session-debug`, gated like the other admin pages. A server function reads only the caller's preview session and its events through the server, and filters out hidden fields.
