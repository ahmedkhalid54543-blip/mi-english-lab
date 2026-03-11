# Mi English Lab v3.0 Integration Conflicts

Date: 2026-03-11
Owner: Agent E

## Resolved In This Round

### 1. Learner homepage still exposed trainer entry

- Symptom: `index.html` review block linked directly to `trainer.html`.
- Risk: learner users could discover trainer flow from the first screen, conflicting with the trainer-isolation package.
- Resolution: the homepage trainer CTA is now hidden behind `MiTrainerGuard`; anonymous and learner users no longer see a trainer入口 on the first screen.

### 2. Shared CSS tokens were missing after partial package merge

- Symptom: `index.html` and `login.html` referenced `--bg-soft` and `--border-medium`, but `css/style.css` did not define them.
- Risk: inconsistent borders/backgrounds and browser fallback styling.
- Resolution: added both variables to the shared design token set in `css/style.css`.

### 3. Trainer data policies were too broad

- Symptom: `cohorts` and `weekly_reports` were readable by any authenticated user; `cohort_memberships` exposed self-write policies.
- Risk: learner accounts could discover trainer data or self-attach to cohorts.
- Resolution: select policies were tightened to trainer-owned cohorts/reports, and learner self-write membership policies were removed.

### 4. Trainer page lacked explicit access feedback

- Symptom: direct visits to `trainer.html` depended on backend failures and gave weak UX for anonymous/non-trainer users.
- Risk: unauthorized users saw a confusing page state.
- Resolution: `trainer.html` now uses `js/trainer-guard.js` plus an access panel to explain missing login, missing config, and missing trainer-cohort binding.

## Residual Risks

- The repo snapshot does not yet contain Agent B's standalone `js/home-dashboard.js`; homepage logic still lives inline in `index.html`.
- The repo snapshot does not yet contain Agent D's standalone memory-card embedding module; only baseline flashcard learning is present.
- Real cross-device sync and trainer authorization still require a live Supabase project and seeded data for full end-to-end validation.
