# Mi English

Mi English is a static English learning tool for Xiaomi international training scenarios. The app runs entirely in the browser with no backend and stores user progress in `localStorage`.

## What is included

- `index.html` and feature pages: home, learn, practice, browse, progress, scenarios, roots
- `css/`, `js/`, `assets/`: runtime assets
- `scripts/check-data.js`: data integrity check
- `scripts/check-audio-assets.js`: audio manifest coverage check
- `.github/workflows/deploy-pages.yml`: GitHub Pages deployment workflow
- `vercel.json`: existing Vercel-specific header config

## Local preview

```bash
python3 -m http.server 4173
```

Then open:

- `http://127.0.0.1:4173/index.html`
- `http://127.0.0.1:4173/learn.html`

## Validation

```bash
node scripts/check-data.js
node scripts/check-audio-assets.js
```

Expected current output:

- lessons: 20
- vocab: 815
- patterns: 192
- audio coverage: 100%

## GitHub Pages deployment

1. Create a standalone GitHub repository for this directory.
2. Push the `main` branch.
3. In GitHub, enable Pages with `GitHub Actions` as the source.
4. The workflow will publish the site automatically on every push to `main`.

The generated Pages URL will usually be:

- `https://<github-username>.github.io/<repo-name>/`

Because this project uses relative asset paths, it works on both a custom domain and a repository subpath.

## Vercel differences

`vercel.json` currently adds response headers such as cache and frame protection. GitHub Pages does not support custom response headers natively, so those policies will not carry over 1:1 after migration.

## Suggested repo scope

Keep this project as a standalone repository instead of pushing the whole `AI项目` workspace. The parent workspace contains unrelated archives, documents, and large files that should not be part of the site repo.
