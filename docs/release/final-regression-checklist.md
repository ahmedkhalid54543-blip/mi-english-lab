# Mi English Lab v3.0 Final Regression Checklist

Date: 2026-03-11
Owner: Agent E

## Scope

Integrated packages covered in this regression round:

- Agent A: login and sync baseline
- Agent C: trainer access isolation
- Existing review queue and weakness ranking modules used by homepage

Not fully merged in this repo snapshot:

- Agent B standalone `js/home-dashboard.js` extraction
- Agent D standalone memory-card asset/data embedding module

## Functional Checklist

- [ ] Homepage loads without console errors
- [ ] Learner homepage no longer exposes `trainer.html` CTA in first screen
- [ ] Login page shows clear config/auth feedback
- [ ] Logged-in flow still routes back to homepage after sync
- [ ] Trainer page blocks anonymous access with explicit guidance
- [ ] Trainer page blocks non-trainer access with explicit guidance
- [ ] Trainer page loads report UI only for trainer accounts with assigned cohorts
- [ ] Review queue renders on homepage without crashing when remote sync is unavailable
- [ ] Bottom nav and more-menu links still work across learner pages

## Data and Policy Checklist

- [ ] `supabase/schema.sql` re-run in Supabase SQL editor
- [ ] `cohorts` select policy only exposes rows where `trainer_user_id = auth.uid()`
- [ ] `weekly_reports` select policy only exposes reports for trainer-owned cohorts
- [ ] `cohort_memberships` learner self-write path is removed from policy setup
- [ ] Existing localStorage keys remain unchanged

## Local Validation Checklist

- [ ] `node --test tests/*.test.js`
- [ ] `node scripts/check-data.js`
- [ ] `node scripts/check-role-tags.js`
- [ ] `node scripts/check-audio-assets.js`
- [ ] Static preview opened with `python3 -m http.server 4173`
- [ ] Browser smoke test on `index.html`, `login.html`, `trainer.html`

## Release Gate

Public demo ready only if all items above are checked and Supabase config is present in the deployed environment.
