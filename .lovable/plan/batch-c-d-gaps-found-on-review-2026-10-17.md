# Batch C/D: gaps found on review

The main scope is done. These smaller items were in scope (or close to it) but are not finished yet.

## 1. Save the check results with the load
- The leak check and re-import check results are printed when I load, but they are not saved anywhere.
- Fix: save both results on the load's entry in the import history, so you can open them later from the import page.

## 2. Leak check for signed-out visitors
- The leak check runs as a student and as an admin, but not as someone who isn't signed in.
- Fix: add a signed-out pass. It must confirm that a visitor who isn't signed in can read nothing at all from the content tables.

## 3. One real run of the import page in a browser
- The import page has only been tested in code. You chose not to use it for the demo, but it should still work.
- Fix: as admin in the browser, paste the starter pack and press "Check only". The report should show all rows unchanged and no errors. I will not press Import.

## 4. Database security scan
- I added a hidden scripts store and changed access on four tables, but haven't run the automatic security scan since.
- Fix: run the scan and fix anything it flags.

## 5. Small tidy-ups
- The "Remove rows not in this pack" option is untested on real data. Add a test that removes a row inside one trial load and undoes it.
- The loader takes the earliest admin as the importer. Make it name you directly (kingsley@miva.university) so the history is clear.

## Deliberately left for later (not gaps)
- The screen to remove test-access roles (the one-step function already exists).
- Sending hidden scripts to the lesson when the engine needs them (Phase 2).
- Wiring the shared banned-word list into the live tutor-reply check (Phase 2; the shared matcher is ready).
- Testing Google sign-in on the published app (waits on publishing).
- Your two wording confirmations ("Just" changed to "Only", and "with just one number" changed to "with one number").
