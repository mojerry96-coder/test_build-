# Batch A fix + Batch B: student Google sign-in

## Fix from Batch A: guardian links
- Remove the browser's ability to create guardian links (both the permission and the access rule). From now on, links are created only by an admin through a server function, which comes with the admin tools.
- Consents stay creatable from the browser, but only by a parent-role account and only for students already linked to them. The current rule already checks the link; I'll add the parent-role check.
- Guardians reading summaries: no change.

## Settings (system settings, protected)
- Seed `dev_open_access` = true and `allowed_email_domains` = [] now (empty means any Google account).
- These keys are system settings, not lesson content: dev_open_access, allowed_email_domains, ai_provider, voice_provider, elevenlabs_voice_id, elevenlabs_model_id, elevenlabs_voice_settings, tutor_display_name.
- A shared list of them goes in the contracts. In Batch C, the content import will skip any of these keys found in a pack and list each one as a warning in the report.
- Only an admin can change them, through a server function. The settings screen comes later with the admin tools.

## Automatic role on new accounts
- The new-account setup always creates a profile.
- It gives the student role only if `dev_open_access` is true AND the email domain is allowed (any domain when the list is empty).
- Otherwise the account has no role. The app then shows "Your account is waiting for access" and nothing else.

## Sign-in (Google only)
- Turn on Lovable Cloud's built-in Google sign-in. Email and password sign-in stays off.
- A clean sign-in page: the uLesson AI Tutor name, one "Continue with Google" button, and a short line saying the tutor is an AI and no camera is ever used.
- Every signed-in page sits behind the standard sign-in gate. Signing out is in the top bar.

## Screens
- **Top bar:** the uLesson name, an "Admin" link (only for the admin role, checked on the server), and Sign out.
- **Test banner** on every screen while `dev_open_access` is on: "Test build. Do not use with real students." The app reads the setting from the rules table.
- **Student home** (designed for phones first, with large touch targets):
  - "Hi, [first name]".
  - One card for each active topic in the database, showing its name as stored. No topic name is written into the page.
  - Each button reads "Start", or "Continue: [topic name], [step]" when an active session exists. The step names are friendly labels, for example "Warm-up" and "Video".
  - With no active topics (before the Batch D import), the page shows "No lessons loaded yet".
- **Start / Continue:** a `session-start` server function.
  - It checks the topic exists and is active, and returns a clear message if not.
  - It checks learning consent.
  - It creates the session (attempt 1, or the next number after a completed one), or reuses the active session.
  - It saves `consent_basis: "dev_open_access"` or `"guardian"` with the session.
  - It stores the pack_version from the latest successful content import for that topic (empty until Batch D).
  - It logs a session_started event.
  - It then opens a placeholder lesson page: "The lesson screen is coming in Phase 3."
- **Admin page:** an empty shell, closed to anyone without the admin role, with a "Content import (Batch C)" placeholder.
- **Page titles and descriptions** are set for each page.
- **Design:**
  - At most two font families, loading only the weights used, showing text straight away in a system font while they load, and falling back to system fonts.
  - The first load stays small for budget Android phones on mobile data.
  - All fonts and colours are kept in one place, ready for the Figma restyle.

## Admin for you
After you sign in once with Google, send me your email and I'll grant your account admin, then confirm in chat. You can also do it yourself in Lovable Cloud.

## Checks I'll run and report
1. **Two test students** (temporary accounts I create myself): student A cannot read student B's sessions, events, evidence or summaries.
2. **Consent switch:** with `dev_open_access` briefly off, a student with no guardian consent can't read their own sessions, and session-start refuses. Then I switch it back on.
3. **Guardian links:** a signed-in student can't create one; the database refuses it.
4. **Server-only tables:** all six are unreadable from the browser for both a student and an admin.
5. **New accounts:** a new account gets the student role while the switch is on, and no role while it's off.
6. **End to end:** signed in as a test student, the home page shows Start, Start opens the placeholder, and coming back shows Continue.

I'll delete the temporary test accounts afterwards.

## Additions
1. **No-role accounts.** Accounts without a role see a "Your account is waiting for access" page. session-start and every other student server function refuse them on the server, not just in the page.
2. **Settings changes are recorded.** A new admin-only `settings_audit` table records the key, old value, new value, who changed it and when. A server-only `update_setting` helper checks the caller is an admin, refuses non-system keys, and writes the record. The settings screen comes later.
3. **First name only.** The profile stores only the first name from Google. No full name, photo or other Google data is saved. The new-account setup is updated to match.
4. **Published sign-in check.** Once you publish, I'll test Google sign-in on the published address as well as the preview.
5. **Switching test mode off.** The report will spell out that turning `dev_open_access` off does not remove roles from existing test students. Test accounts must be cleaned up by hand before any real student uses the app.

## Not in this batch
The parent consent screen, parent page, instructor pages, role picker, "Test as" switcher, and content import.

## Technical details
- New migration covering:
  - drop the "guardian creates links" access rule and revoke the browser's create permission on guardian_links;
  - add the parent-role check to the consent creation rule;
  - replace `handle_new_user` with the dev_open_access and allowed-domain logic;
  - insert the two global rules.
- Files:
  - `src/lib/api/session-start.functions.ts` (a thin wrapper using sign-in middleware) calling `src/server/functions/session-start.server.ts`;
  - `src/lib/api/me.functions.ts` (returns your roles, the test-build flag and the active session);
  - routes `/auth`, `/_authenticated/index` (home), `/_authenticated/lesson.$sessionId`, `/_authenticated/admin`;
  - sign-in state is refreshed from `src/routes/__root.tsx`.
- Tests are vitest unit tests for the role-assignment rule and the "Start or Continue" label logic. The database checks run as SQL with a simulated signed-in user.
