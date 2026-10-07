# Universal Education IELTS — V13.1.8 FINAL READY TO TEST

## This is the clean test package
This ZIP intentionally contains only the files required to run the current platform:

1. `index.html` — application entry page and Supabase JS loader.
2. `app.js` — complete frontend application.
3. `DATABASE_V13_1_8_FINAL_COMPLETE.sql` — single cumulative Supabase database file.
4. `README_V13_1_8_FINAL_READY_TO_TEST.md` — setup and test checklist.

Historical migration files, old READMEs, verification notes and obsolete fix files are **not included** in this clean package.

## V13.1.8 fix included
The Writing Faculty Evaluation save flow was hardened so it no longer blindly reads `.value` from missing DOM elements. The page now reports a clear refresh/load message if the evaluation fields are not present.

`index.html` also uses a new cache-busting version for `app.js` (`13.1.8`) so GitHub Pages is less likely to keep serving the previous JavaScript file.

## Final IELTS Mock architecture
Each Mock / Exam Set is isolated by **Student + Mock**:

- Listening — student test, 40 questions, 4 Sections, one continuous audio, automatic score/band.
- Reading — student test, 40 questions, 3 Passages, automatic score/band.
- Writing — student test, Task 1 + Task 2, autosave/resume, final submission lock, Faculty Task 1/Task 2 bands, Task 2 double weighting, final Writing Band, feedback and checked-answer support.
- Speaking — Faculty Assessment only; no student Speaking timer/test. Faculty enters 0–9 in 0.5 steps for the selected Student + Mock.
- Overall — calculated only when all four final bands exist for the same Student + Mock. No NaN and no fake zero for pending modules.

## Writing calculation
Final Writing Band = `(Task 1 + 2 × Task 2) / 3`, rounded to the nearest 0.5 band.

Example: Task 1 = 6.0, Task 2 = 6.0 → Final Writing Band = 6.0.

## Overall calculation
Overall IELTS Band = average of Listening + Reading + Writing + Speaking, rounded to the nearest 0.5.

Example: 7.5 + 7.0 + 6.5 + 7.0 → 7.0.

## Supabase setup
### Important
The database file assumes the accepted **V12.5.x base IELTS schema** already exists. It deliberately stops with a clear error if the base tables are missing instead of creating an incompatible partial schema.

### Run this one database file
Use only:

`DATABASE_V13_1_8_FINAL_COMPLETE.sql`

Steps:
1. Open Supabase → SQL Editor.
2. Make sure the accepted V12.5.x base schema is present.
3. Paste/run the complete SQL file.
4. Confirm the final result says `V13.1.8 FINAL DATABASE READY`.
5. Do **not** run historical migration files from older versions on top of this package.

The database script is designed to be re-runnable and does not delete student attempts/results.

## GitHub Pages deployment
Upload these four files to the same GitHub Pages folder:

```text
index.html
app.js
DATABASE_V13_1_8_FINAL_COMPLETE.sql
README_V13_1_8_FINAL_READY_TO_TEST.md
```

Only `index.html` and `app.js` are used by the live website. The SQL file is for Supabase, and the README is documentation.

## Final test checklist
### Admin / Faculty
- [ ] Admin/Tutor login works.
- [ ] Create Listening test.
- [ ] Create Reading test.
- [ ] Create Writing test with Task 1 + Task 2.
- [ ] Configure answer keys and publish module tests.
- [ ] Create Mock 01 and select Listening + Reading + Writing.
- [ ] Assign a student and publish the Mock.
- [ ] Open Overall Results.
- [ ] Open a Student + Mock.
- [ ] Enter Writing Task 1 and Task 2 bands.
- [ ] Click **Save Writing Evaluation** and confirm no JavaScript error.
- [ ] Confirm Task 2 double weighting and final Writing Band.
- [ ] Enter Speaking band for the same Student + Mock.
- [ ] Confirm Overall changes from `TEST IN REVIEW` to the calculated band.

### Student
- [ ] Student sees only assigned published Mocks.
- [ ] Listening answers/autosave/submission work.
- [ ] Reading answers/autosave/submission work.
- [ ] Writing Task 1 and Task 2 autosave/resume work.
- [ ] Writing cannot be changed after final submission.
- [ ] Writing remains `Test in Review` until Faculty evaluation.
- [ ] Overall remains `TEST IN REVIEW` until Writing + Speaking are finalized.
- [ ] Student can view final Overall Band after all four modules are complete.

### Mock isolation
- [ ] Create Mock 02 for the same Student ID.
- [ ] Submit/score Mock 01 and Mock 02 independently.
- [ ] Confirm Listening, Reading, Writing, Speaking and Overall scores never mix between Mocks.

## Code audit performed for this package
- `app.js` passed `node --check` syntax validation.
- Writing save handlers were checked for unsafe direct `.value` reads from missing DOM elements.
- `index.html` references the current cache-busted `app.js` version.
- No local CSS, image, JS, audio or PDF file is required by `index.html`; the frontend is contained in `app.js`.
- Package contents were reduced to the four required files listed above.


## V13.1.8 Option Entry UX Fix
- Admin question/group Options are entered one per line; option letters A, B, C... are generated automatically.
- Existing saved options in legacy `A|Option Text` format are displayed as plain option text while editing.
- Alternative Accepted Answers are entered one answer per line.
- Student option rendering remains A, B, C... and is unchanged.
- Database schema is unchanged for this UI-only improvement.

## V13.1.8 Options Display Final Fix
- Admin question/group options are entered one option per line; legacy `A|Apple` input remains readable for compatibility.
- Student-facing Listening/Reading options display only the option text (for example Apple, Banana, Orange) with no A./B./C. labels.
- Student dropdowns, inline blank dropdowns, multiple-choice radio/checkbox options, and shared/group word lists all use text-only display.
- Internal option keys remain unchanged for answer storage and scoring, so no database schema migration is required for this UI change.
