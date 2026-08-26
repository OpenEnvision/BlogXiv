# AGENTS.md

## Cursor Cloud specific instructions

BlogrXiv is a **fully static site** (plain HTML/CSS/JS under `site/`). There is
**no build step, no `package.json`, and no dependencies to install** — all Node
maintenance scripts under `scripts/` use only `node:*` built-in modules. The VM
already ships with Node.js and Python 3, so no dependency-refresh step is
required; the update script is intentionally a no-op sanity check.

Supabase is only the optional published data source. With no Supabase
credentials configured, the site (and the tests) transparently fall back to the
static corpus in `site/assets/js/app.js`, so everything runs locally without any
secrets.

Run / lint / test commands (see also `README.md` "Local Development" and
`docs/SUPABASE.md` "Verification"):

- Run the dev server: `python3 -m http.server 8000 --directory site`, then open
  `http://127.0.0.1:8000/index.html`. Serve from the `site/` directory (not the
  repo root) so page-relative asset paths resolve correctly.
- Lint (syntax check): `node --check site/assets/js/app.js` (and any other JS
  file under `site/assets/js/`).
- Tests: `node scripts/test-blog-data.mjs`, `node scripts/test-blog-like.mjs`,
  `node scripts/test-blog-manager.mjs`, `node scripts/test-highlights.mjs`.

Non-obvious gotchas:

- The blog-detail comment widget (Giscus) makes external calls to `giscus.app`
  and logs `403 / "giscus is not installed on this repository"` console errors
  in local/dev. This is expected and unrelated to core functionality.
- The static server is not a hot-reloading dev server; refresh the browser after
  editing files under `site/`.
