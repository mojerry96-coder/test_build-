# Batch B gap report + Batch C plan

## Part 1: What is missing from Batch B (checked against the live database)

1. Role changes are NOT in the change log. The only log is `settings_audit`, which records protected-setting changes only. Nothing records when a role is granted or removed, by whom, or to whom. There is no `admin_audit` table.
2. No clean-up marker. `user_roles` has only `id, user_id, role`. Roles given automatically during test access (`dev_open_access`) look identical to roles an admin gave, so they cannot be found and removed in one step.

### Fix (done first, before Batch C)
- Add `admin_audit` table: `action` (setting_changed, role_granted, role_removed), `actor_id` (null = system), `target_user_id`, `role`, `key`, `old_value`, `new_value`, `details`, `created_at`. Admin-read only; written only by the server/database.
- Add to `user_roles`: `granted_via` (`dev_open_access` | `admin` | `system`, default `admin`), `granted_by`, `granted_at`.
- Update the new-account trigger to set `granted_via = 'dev_open_access'`.
- A database trigger on `user_roles` insert/delete writes `role_granted` / `role_removed` rows into `admin_audit` automatically, so no path can skip it.
- Setting changes also write to `admin_audit` (keep `settings_audit` for history, marked deprecated).
- Backfill: existing auto-assigned student roles marked `dev_open_access`.
- One-step clean-up (function now, screen later): admin-only `cleanup_dev_open_access_roles()` deletes every role where `granted_via = 'dev_open_access'`; each removal is logged by the trigger. A dry count function shows how many would be removed.
- Tests: trigger logs grant/remove; auto-signup marker set; clean-up refuses non-admins.

## Part 2: Batch C — content import (admin only)

1. Server function: entry `src/lib/api/content-import.functions.ts` (thin), logic in `src/server/content/` (validate, plan, apply). Server checks admin role; everyone else refused.
2. Admin import page (`/admin/import`): file pick or paste, 2 MB limit; "Check only (dry run)" and "Import"; Import disabled until a dry run on the same content (matched by hash) passed with zero errors; option "Remove rows not in this pack" (off by default); report shown on the page.
3. Validation: all 10 checks from the content-pack guide, each a separate function. Messages name the exact place in plain words (e.g. "Item GRAD_VC2: feedback refers to option d, which does not exist on this item."), grouped by lesson step.
4. Protected settings: any of the 8 protected keys in the pack are skipped and each listed as a warning.
5. Import behaviour:
   - one database transaction (single database function receiving the validated, split pack), all or nothing;
   - upsert by id; unchanged rows detected and counted;
   - items split into item_keys, feedback, escalations, hints (explanation = rung 0), items; clip checks to clip_checks; simulation tasks to sim_tasks;
   - a `content_imports` row for every dry run and import (topic, pack_version, dry_run, status, report, imported_by);
   - rows for this topic missing from the pack are kept and reported as a warning with a count; deleted inside the same transaction only if the option is on.
6. Report: per-table counts (added, updated, unchanged, removed), warnings, errors, pack_version, number of rows still marked `config.status = "seed"`.
7. Import history on the same page: newest first (date, who, pack_version, dry run/real, status); click opens its report.
8. Tests (vitest): one passing fixture plus one failing fixture per check, kept under the test folder only, never imported.

Not in Batch C: the stub content pack (Batch D), authoring screens.

## Step 0: make you admin
- Give the account kingsley@miva.university the admin role (`granted_via = 'admin'`), logged in the change log. Check it worked by viewing the admin area.

## Technical notes
- Migration: admin_audit (grants: select to authenticated via has_role admin policy; all to service_role), user_roles columns with defaults, triggers, clean-up functions (security definer, admin check inside).
- Import apply = `security definer` plpgsql `apply_content_pack(jsonb, remove_missing bool)` executable by service_role only; called by server after admin check.
- Record in AGENTS.md: role changes are audited by DB trigger; content import runs as one DB function.
