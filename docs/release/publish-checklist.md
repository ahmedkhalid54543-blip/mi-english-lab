# Mi English Lab v3.0 Publish Checklist

Date: 2026-03-11
Owner: Agent E

## Before Publish

1. Re-run `supabase/schema.sql` in the target Supabase project.
2. Confirm Email auth is enabled in Supabase Auth.
3. Fill `mi-supabase-url` and `mi-supabase-anon-key` via HTML meta tags or `window.MI_SUPABASE_CONFIG`.
4. Verify at least one trainer account is bound through `cohorts.trainer_user_id`.
5. Verify weekly report rows exist for at least one cohort.

## Build and Repo Hygiene

1. Run local validation scripts and resolve failures.
2. Confirm no unrelated workspace files are included in the publish repo.
3. Confirm homepage, login, and trainer pages point to the shared `css/style.css?v=3.0`.
4. Confirm `trainer.html` is reachable only after auth + RLS validation.

## GitHub Pages

1. Push this directory as a standalone repository.
2. Enable GitHub Pages with `GitHub Actions` as the source.
3. Trigger one deploy from the default branch.
4. Open the Pages URL and smoke test `index.html`, `login.html`, and `trainer.html`.

## Post Publish Smoke Test

1. Open homepage as anonymous user.
2. Open login page and verify missing-config message is understandable if config is absent.
3. Log in with learner account and verify homepage works but trainer page stays blocked.
4. Log in with trainer account and verify trainer page can load cohorts and the latest report.
5. Confirm no learner-visible route links back to trainer from the homepage first screen.
