# Mi English GitHub Deployment Diagnostic Report

Date: 2026-03-10

## 1. Executive summary

Mi English is ready to move from Vercel to a standalone GitHub repository plus GitHub Pages with low technical risk.

Why:

1. It is a pure static site with no backend dependency.
2. Runtime assets are referenced with relative paths, so repository-path hosting is compatible.
3. Data and audio integrity checks are already available locally and currently pass.

Primary migration caveat:

GitHub Pages cannot reproduce the custom response headers defined in `vercel.json`, so cache policy and security headers will become simpler after migration.

## 2. Audit scope

The audit covered:

1. Hosting assumptions and Vercel binding
2. Static asset path compatibility
3. Local validation scripts
4. Current documentation and release metadata
5. Upgrade and release readiness

## 3. Current project baseline

### 3.1 Runtime architecture

- Hosting model: static HTML/CSS/JS only
- State model: browser `localStorage`
- Main state key: `mi-english-v2`
- Storage version: `2.6`
- Extra persisted modules: roots progress, scenarios progress, scenario mistakes

### 3.2 Current content footprint

- Lessons: 20
- Vocabulary entries: 815
- Patterns: 192
- Total project size: about 31 MB
- Audio asset size: about 29 MB
- Audio manifest coverage: 1306 / 1306, 100%

### 3.3 Current hosting coupling

Existing Vercel binding is light:

1. `.vercel/project.json` links the project to the Vercel project `mi-english`
2. `vercel.json` defines only response headers
3. No serverless function, edge function, rewrite, or backend API was found

Conclusion:

This is a hosting migration, not an application rewrite.

## 4. Key findings

### Finding 1: GitHub Pages compatibility is strong

Result: pass

Evidence:

1. No root-absolute asset references were found.
2. No `fetch('/...')` or equivalent root-bound runtime path was found.
3. The app is composed of static pages with relative navigation.

Impact:

The site should run under either:

1. `https://<user>.github.io/<repo>/`
2. A custom domain bound to GitHub Pages

### Finding 2: Vercel-only behavior is minimal but not zero

Result: partial

What does not migrate 1:1:

1. `Cache-Control` headers for HTML, CSS, JS, and assets
2. `X-Content-Type-Options`
3. `X-Frame-Options`

Impact:

1. GitHub Pages will still serve the site, but without the current custom header policy.
2. Cache behavior becomes less explicit and harder to tune than on Vercel.
3. If custom security headers matter, a CDN layer such as Cloudflare should sit in front of Pages, or Vercel should remain the production host.

### Finding 3: Documentation is behind the actual product

Result: issue

Observed drift:

1. `CLAUDE.md` still describes `tools/mi-english.html` as the main file and reports an older 9-lesson, 243-vocab, 22-pattern baseline.
2. The actual app has already evolved into a multi-page project under `tools/mi-english/`.
3. The actual data check reports 20 lessons, 815 vocab items, and 192 patterns.
4. The current UI includes `scenarios.html` and `roots.html`, which are beyond the old "5-page" baseline docs.

Impact:

1. Operational docs are now partially stale.
2. Future maintenance, release checks, and onboarding can drift further unless the docs are refreshed.

Recommendation:

Update core docs after migration so the repository state becomes the source of truth.

### Finding 4: Deployment automation was missing in the codebase

Result: fixed in this migration prep

Added in this change set:

1. GitHub Pages workflow
2. Standalone project README
3. `.nojekyll`
4. This diagnostic report

Impact:

The project now has a reproducible GitHub-native publishing path.

### Finding 5: QA baseline is useful but still mostly manual

Result: mixed

Current strengths:

1. `scripts/check-data.js` validates the core dataset structure.
2. `scripts/check-audio-assets.js` validates manifest coverage.
3. Existing project docs already define regression and release checklists.

Current gaps:

1. No browser-level smoke tests
2. No automated regression across the main page flows
3. No release artifact or changelog enforcement

Impact:

The project is deployable, but production confidence still depends on manual browser checks.

## 5. Migration target design

Recommended deployment shape:

1. Create a standalone GitHub repository rooted at `tools/mi-english/`
2. Use GitHub Actions to publish to GitHub Pages on every push to `main`
3. Keep Vercel config in the repo only as legacy reference unless you explicitly want dual-hosting

Why this is the right boundary:

1. The parent workspace is not a software repository in the normal sense
2. It contains unrelated documents, backups, and large files
3. Mi English is already self-contained and can live independently

## 6. What I changed locally

Prepared the project for GitHub publication by adding:

1. `.github/workflows/deploy-pages.yml`
2. `README.md`
3. `.nojekyll`
4. `.DS_Store` ignore rule
5. This report

No application logic was changed.

## 7. Remaining blocker to complete GitHub publication

The local machine does not currently expose a usable GitHub publishing path:

1. No Git remote is configured for this project
2. `gh` is not installed
3. No GitHub token or SSH key was discoverable from the current environment
4. No global Git author identity is configured

Meaning:

I can fully prepare the repo and the deployment pipeline, but I still need one of the following to finish the actual GitHub push:

1. A target GitHub repository URL with working credentials
2. A GitHub username plus a PAT with repo scope
3. A pre-authenticated `gh` environment

## 8. Exact publish steps once credentials are available

### Option A: existing GitHub repository

1. Initialize git in `tools/mi-english/`
2. Set local user name and email
3. Commit the prepared files
4. Add the provided remote
5. Push `main`
6. Enable GitHub Pages with GitHub Actions if not already enabled

### Option B: new GitHub repository

1. Create a new repository, preferably named `mi-english`
2. Push the local project as the initial `main`
3. Let the workflow publish automatically

## 9. Upgrade roadmap

### Phase 1: post-migration hardening

1. Refresh stale docs so data counts, file paths, and page inventory match the current app
2. Add a release notes file or changelog keyed off `release.json`
3. Add a basic smoke-test checklist for all current pages: `index`, `learn`, `practice`, `browse`, `progress`, `scenarios`, `roots`

### Phase 2: delivery reliability

1. Add a lightweight CI workflow that runs `node scripts/check-data.js` and `node scripts/check-audio-assets.js` on every push and PR
2. Add an HTML link/path checker to catch broken navigation or asset references early
3. Add pre-release validation around import/export backups and storage migration

### Phase 3: versioning discipline

1. Align `release.json`, `STORAGE_VERSION`, and documentation on every release
2. Introduce a release template that records: release id, migration notes, regression result, rollback target
3. Store dated backups before structure changes

### Phase 4: product upgrades

1. PWA support with an installable manifest and offline caching
2. Data sharding or lazy loading if content keeps expanding
3. Better analytics for review queues, scenario weakness, and listening accuracy
4. Asset compression and cache-busting strategy for audio updates

## 10. Recommended operating model

Recommended production setup:

1. GitHub repository as the source-of-truth code host
2. GitHub Pages for basic static delivery if you want simplicity
3. Vercel only if you still need custom headers, simpler previews, or custom-domain ergonomics

If your priority is:

1. Simplicity and Git-native ownership: GitHub Pages
2. Better hosting controls and headers: keep Vercel
3. Maximum resilience: GitHub as source of truth, Vercel as production host

## 11. Validation results captured during this audit

Checks executed locally:

1. `node scripts/check-data.js` -> passed
2. `node scripts/check-audio-assets.js` -> passed
3. Static path audit for root-absolute references -> no blocking issue found
4. Local static serving -> previously verified as reachable over HTTP

## 12. Final recommendation

Move Mi English into a standalone GitHub repository now.

The application itself is already ready. The real work is operational cleanup:

1. publish the repository,
2. update the stale docs,
3. add CI around the existing validation scripts,
4. decide whether production hosting should stay on Vercel or fully move to GitHub Pages.
