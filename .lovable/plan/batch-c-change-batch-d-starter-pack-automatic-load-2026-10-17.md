# Batch C change + Batch D starter pack (automatic load)

## 1. Batch C change: feedback trigger format
- Standard format: `option:<id>`. `option_d` and `d` are still accepted, but each shows a warning: "Item GRAD_VC2: feedback trigger 'd' should be written 'option:d'".
- Other triggers stay valid: `correct`, `other`, `value:<answer>` for numeric items, and named triggers for the structured readiness item (e.g. `swapped_axes`, `ignored_negative`).

## 2. Wrong-path field (new, hidden)
- The answer key for line_work and theory items gets a `wrong_paths` list. Each entry has the wrong line, a misconception id and an optional note. It is stored in item_keys, which students cannot read.
- W3 gets the wrong path "15/5" → MIS_SIGN_DROP.
- Two new validation checks:
  - every wrong-path misconception exists;
  - no wrong path matches a line in the worked solution or an accepted method.

## 2b. General rule: every tutor script is hidden (global fix)
Readable tables hold only what the student sees on screen before acting: prompts, options, fields, task goals, labels, and the hook's opening script and prediction. The server sends a script only when the engine decides to play it. This rule is recorded in the project notes.
- One new server-only store for scripts. Students cannot read it at all.
- What moves there:
  - repair micro-lessons;
  - the hook close script;
  - simulation task hints and completion lines;
  - simulation opening lines and closing;
  - the readiness opener (it would otherwise sit in R1's readable settings).
- What stays readable:
  - repairs: id, topic, skill, practice item;
  - hooks: id, topic, type, script, image, prediction, answered by, active;
  - simulations: id, band, url, start state;
  - simulation tasks: id, order, goal, required.
- The old script columns are emptied and marked as no longer used.
- All of these are included in the leak check.
- The engine-side delivery comes in Phase 2.

## 2c. Banned-word check
- One shared list, stored as the teaching rule `banned_words`, starting with: wrong, stupid, careless, easy, obviously, just. The same list and matching code are used by the pack check and by the live tutor-reply check, so the two can't drift apart.
- The pack check refuses any tutor script that contains a banned word as a whole word, ignoring capitals. It names the item and field. This covers prompts, feedback, escalations, hints, explanations, teach-me, repairs, hook scripts, simulation scripts, fallback lines and the readiness opener.
- Parent-facing misconception descriptions are not checked.
- **Clash to resolve:** your readiness opener, "Just {count_words}, no marks.", contains "just", so it would be refused. Unless you say otherwise, I'll write it as "Only {count_words}, no marks." Nothing else in your brief is changed.

## 3. Starter pack file
- `content/packs/MTH12_09_02_01.seed.json`, pack_version `0.1-seed`, built exactly from your brief. No other maths is added.
- Everything is marked `config.status = "seed"` except the readiness items R1 to R3 and the active hook.
- The scripts you asked me to write are short and use only the steps and numbers already in your brief: VC1/VC3 escalations, repair board scripts, guided explanations and hints, simulation closing lines, and the 18 fallback lines (warm, no answers, never "wrong").
- The readiness opener is stored on R1's settings (`config.opener`).
- Rules contain teaching rules only, none of the 8 protected settings. Every item has tags.

## 4. Automatic, repeatable load (no button; the import page stays as it is)
- A load script runs the pack through the same import logic as the page: validation, splitting answers into the hidden tables, and skipping protected settings. It writes in one step and records the load in the import history, with you named as the importer.
- If validation fails, I fix the pack and load again until it passes with zero errors.
- The topic is switched on (active) after loading, so the student home shows "Gradient of a line".
- To change content later: edit the seed file and run the same load again. Unchanged rows stay untouched.

## 5. Checks included in the load report
- **Leak check:** run as a temporary test student and as the admin, using the same access the browser has:
  - Structure check: no table or view the browser can read has any answer-bearing field (answer, accepted forms, worked solution, accepted methods, wrong paths, marking guide, feedback/escalation/hint scripts, teach-me, repair script).
  - Text check: scan readable tables only for hidden text of 12 characters or more (feedback, hint, escalation, repair and worked-solution lines). Any match fails. Short values such as "2" are not scanned.
  - Hidden tables refuse access entirely.
  - The temporary student is deleted afterwards.
- **Re-import check:** load the same pack a second time. Every row must show as unchanged, with no duplicates (the number of rows per table stays the same).
- Unit tests: the passing and failing test packs for the new checks, a test for the trigger warning, and a test that the starter pack passes with zero errors.

## 6. Report back, then stop
- Load report: counts per table, warnings, seed rows, leak check result, re-import check result.
- Confirm the "Gradient of a line" card shows on the student home (screenshot while signed in).
- Stop before Phase 2.

## Technical notes
- The load script runs under `scripts/` with bun and the service connection. It imports the same `src/server/content` validate/plan code and calls `apply_content_pack`. Afterwards it sets `topics.is_active = true` for this topic.
- Id-style warning will allow hyphens (COORD-01).
- Migration: new `scripts` table (id = owner_table:owner_id:field, owner_table, owner_id, field, script jsonb), service_role-only grants, RLS on with no policies. Defaults and DEPRECATED comments on repairs.micro_lesson, hooks.close_script, sim_tasks.hint_script/completion_script, simulations.opening_lines/closing; the import writes empty values there and the real scripts to `scripts`. apply_content_pack's allowed tables include `scripts`.
- Banned words: shared matcher in `src/shared/contracts` (or `src/server/checks/banned-words.ts`), reading the list from the pack's `banned_words` rule during validation and from the rules table at reply time.
- The structure check reads the column lists of browser-granted tables and views from the database catalog.
- Record in AGENTS.md: seed content is loaded via the load script from `content/packs`.
