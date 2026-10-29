# Batch A: contracts, enums, tables and access rules

The source of truth is your two guides (Data and Evidence; Content Pack), with Change 1 and Change 2 applied. I'll stop after Batch A.

## Three things to note before I start
1. **Where server code lives.** This app blocks the browser from importing anything in `src/server`, which is what you want. The catch is that the app's buttons must still be able to call the seven functions. So each function is split into two parts:
   - a tiny entry point in `src/lib/api/*.functions.ts` (for example `session-start.functions.ts`). It holds no logic and no keys; it only checks the caller and hands off.
   - all the real logic in `src/server/functions/...`, plus the engine, maths, checks, providers and content code, all server-only.
   The seven names stay the same.
2. **The project knowledge is out of date.** It still says `supabase/functions` and "edge functions". I'll record the `src/server` rule in the project notes file, and suggest you update the knowledge text too.
3. **Hook prediction timer.** The hook prediction's `timeout_s` and the rule `hook_prediction_timeout_s` overlap. I'll make the hook's own value win, and use the rule as the default.
4. **Student-first priority.** Batch A still builds the tables and access rules for every role, so nothing has to be redone later. It also includes these future-proofing pieces:
   - **A test-mode switch.** A rule called `dev_open_access` (default off, server-only to change). While it is on, `has_learning_consent` returns true, so test students go straight into the lesson.
   - **Ready for Override later.** Sessions carry a `controller` (ai or instructor) and a `paused` flag, which the engine checks before every turn. The instructor event types are in the contracts already, marked "log only, never starts a turn".
   - **The parent summary** is stored at session close from the very first test session. The parent page comes later.
5. **A message I didn't receive.** You mentioned "Google sign-in and dev_open_access as in my last message", but that message never reached me. Batch A doesn't depend on it. Please resend the details before Batch B.

## What gets built
1. **Turn on Lovable Cloud.**
2. **Shared contracts** in `src/shared/contracts`:
   - The script segment (text, speakable, cues) and the allowed cue list.
   - Placeholders: {student_name}, {count_words}, {prediction}, {tutor_name}.
   - The tutor request has no do_not_reveal field and no answer keys. The tutor reply holds segments and wait_for.
   - Gradient lab messages follow section 6.4.
   - Also covered: the video manifest, the content pack with key shapes per kind, the full event type list, the rule keys, and fallback reasons.
3. **All 15 enums** exactly as listed in Guide 1.
4. **All tables** with the fields from Guide 1, covering identity, content, runtime and the allowed extras. This includes:
   - an automatic profile when an account is created;
   - only one active hook per topic;
   - only one active session per student per topic;
   - a unique student + topic + attempt;
   - a unique event sequence number per session;
   - a unique rule key per topic, where a topic's rule overrides the global one;
   - a 6-character class join code with no confusing letters.
5. **Helper functions:**
   - `has_role(user_id, role)`
   - `has_learning_consent(student_id)`, which is true only if a linked guardian granted learning_data
   - `owns_class(class_session_id)`
6. **Access rules (row-level security on every table):**
   - **Server-only, with no browser access and no browser grants at all:** item_keys, feedback, escalations, hints, fallback_lines, turns.
   - **Readable by signed-in users, written by nobody from the browser:** topics, skills, topic_skills, misconceptions, items, repairs, hooks, simulations, sim_tasks, clips, clip_checks, rules, content_imports (admin only).
   - **Sessions, events and evidence:** the student reads own rows only with learning consent. The owning instructor reads them. Admins read all. Browser writes: none.
   - **Summaries:** the student reads own, the linked guardian reads, and admins read all.
   - **Class sessions and members:** the owning instructor reads, members read their own class, and admins read all.
   - **Consents and guardian links:** the guardian reads and creates own rows, and admins read all.
   - **Profiles and roles:** users read their own, admins read all, and only admins assign roles. There is no public sign-up.
   - **Flags:** admin only.
7. **Realtime** on sessions and class_sessions.

## How I'll check it
- I'll create temporary test users (a student and an admin) and try to read the six server-only tables using the browser's key and session. Each read must fail or come back empty, even for the admin.
- I'll confirm a student without consent can't read their own sessions.
- I'll run the Lovable Cloud security scan.
- I'll then delete the temporary users. The real seeded accounts come in Batch B.

## Batch A report
- Every enum and table created, and any place I differed from the guides and why.
- How I proved the server-only tables are unreadable from the browser.
- Questions before Batch B, for example who creates the first admin account, and where the shown-once passwords appear.
