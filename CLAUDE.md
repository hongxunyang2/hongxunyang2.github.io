# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A static personal/professional website (no build step, no package manager, no framework) for hongxunyang519@gmail.com — plain HTML/CSS/JS. It's a self-marketing site (job hunting, showcasing research and teaching ability) organized as independent **pillars**, each its own top-level folder, all linked from the hub page `index.html`:

- `research/` — research portal and generated report pages
- `teaching/` — course materials and a teaching blog
- `art/` — standalone painting/drawing gallery; deliberately independent of the shared site styling (own CSS, own fonts, no shared header/nav/footer)
- `blog/` — personal blog (source markdown → hand-authored HTML); intentionally de-emphasized on the homepage (small footer link, not a full card)

See `PILLARS.md` for each pillar's purpose/status and the convention for adding a new one.

There is no dev server, bundler, or test suite. "Running" the site means opening the HTML files directly in a browser or serving the directory with any static file server (e.g. `python3 -m http.server`).

## Your role: website manager

The user writes no HTML/CSS/JS themselves — you're the site's maintainer, not just a code-writer. That means implementing requests end-to-end (a finished, working result, never a snippet to paste in), *and* proactively flagging content, layout, or UX issues you notice and suggesting improvements, since the site's job is to represent the user well to recruiters/collaborators. Scale process to size: small changes (copy edits, style tweaks, link fixes, small bugfixes) — just implement directly. Big/ambiguous changes (new pages/sections, restructuring, real design decisions) — write a short requirement/plan, confirm with the user (plan mode where appropriate), implement, then review your own diff before calling it done.

## Deploying

`./update.sh` adds the SSH key, commits all changes with the message "auto update", and pushes to `main`. It's a blunt auto-commit script — don't run it on the user's behalf unless asked; prefer normal `git add`/`git commit` with a real message when making changes on request.

## Architecture

### Research reports are generated output, not hand-written

Everything under `research/reports/<topic>/` (e.g. `lesco_susceptibility/`, `ni112_magnon/`, `overdoped_eu_lsc/`, `rixs_pre_toolbox/`, `van_hove/`) is produced by an external "Report Generator" tool that lives outside this repo — there is no generator script checked in here. Each topic folder follows the same convention:

- `<topic>.html` — index/table-of-contents page for that topic, built from `reports_metadata.json` (filename, title, date per report) and `todo_list.json` (a status table). These two JSON files drive the HTML that's already baked into the index page — editing the JSON alone will *not* update the HTML; the index page contents are static output from the generator run.
- `<topic>_login.html` — a client-side-only password gate (see below) that redirects to `<topic>.html` on success.
- Individual `*.html` report pages — self-contained analysis write-ups, typically using MathJax (via CDN) for math rendering.
- `static/css/style.css` — shared stylesheet for that topic's report pages.

Because these are generated artifacts, treat hand-edits to report content/index pages as temporary — they'll be overwritten by the next generator run. It's fine to fix small things (typos, broken links) but don't restructure the generated pages' templates here.

### Fake auth pattern used to gate research reports

Report topic pages are "protected" by a `_login.html` page that checks a hardcoded plaintext password (e.g. `"xun"`) in a `<script>` block and sets `localStorage.authenticated = "true"`. Each protected index page checks `localStorage.getItem('authenticated')` on load and redirects to `<basename>_login.html` if absent. **This is not real security** — it's obfuscation only (password and gated content are both shipped to the client). Don't present it as an access-control mechanism, and don't add sensitive data to a page relying solely on this pattern.

### Blog posts: markdown source → hand-converted HTML

The blog has a documented, deliberate authoring workflow at `blog/assets/docs/blog-post-workflow.md` — read it before adding or editing a blog post. Summary:

1. Source markdown (with `title`/`date`/`tags` front matter) lives in `blog/assets/md/`.
2. It's converted to a standalone HTML file in `blog/` (same basename), using the template and content-conversion rules in the workflow doc (paragraphs, code blocks, images, collapsible `<details>` blocks for content marked `^guide for cursor` in the markdown, etc.).
3. `blog/index.html` is then updated in two places: the featured-post section (if this is the newest post) and the "Recent Thoughts" card grid.

Blog styling: `assets/css/main.css` (site-wide) + `blog/assets/css/blog-portal.css` (blog-specific classes like `.article-content`, `.post-tag`, `.collapsible-block`, `.blog-post-card`).

`blog/assets/examplary_websites/` is a gallery of standalone AI-generated demo sites (one per subfolder, each with its own `index.html`/`styles.css`), referenced from the blog post about AI-generated webpages. `blog/assets/examplary_websites/prompt.md` documents the reusable prompt used to generate new gallery entries — follow its instructions (one site at a time, 2-3 hue color scheme, varied layout/style) if asked to add another.

### Teaching section

`teaching/` mirrors the same static-portal pattern: `teaching/index.html` links to `teaching/courses/` (per-course folders like `condensed-matter/`, `laue-diffraction-lab/`, each with their own `index.html`, exercise sheets, tutorials, forms) and `teaching/blog/` (a separate blog for teaching-related reflections, styled by `teaching/blog/assets/reflection.css`).

### Art pillar (standalone, intentionally non-conforming)

`art/index.html` is a real gallery page (hero, responsive tile grid, click-to-enlarge lightbox) populated with real artwork. Gallery tiles are **generated, not hand-written**: drop image files into `art/assets/images/` and run `python3 art/update_gallery.py` from the repo root — it regenerates everything between the `<!-- GALLERY:START -->`/`<!-- GALLERY:END -->` markers in `art/index.html`, newest file first by modified time, no captions (unreliable IG screenshot filenames). Don't hand-edit tiles in that marked region; edit the script or the images instead. Unlike every other pillar, it does **not** follow the shared pillar recipe: no `../assets/css/main.css`, no shared header/nav/footer/hero markup, no `--color-accent-art` token, no link back to the homepage, and its own Google Fonts pairing (Instrument Serif + Inter) instead of the site's Crimson Pro/Source Sans 3. `art/assets/css/art-portal.css` is fully self-contained. This was a deliberate user choice — the art pillar should read as its own standalone site — and is scoped to `art/` only, not a new direction for future pillars. See `PILLARS.md`'s "Art pillar: intentionally independent styling" section for the full rationale, including its dev-only (non-visitor-facing) `data-theme` CSS switch. **`teaching/` is now the reference example for scaffolding a new conventional pillar** — not `art/`.

### CSS organization

There's no shared global stylesheet across sections — each portal has its own CSS root, all building on the shared base (`body`, `header`/`nav`, `.container`, `.hero`, `.content-section`) and CSS custom properties (`--color-accent-*`, `--font-display`, etc.) defined in `assets/css/main.css`:
- `assets/css/main.css` — site root: homepage hub, shared base styles, and site-wide custom properties
- `research/static/css/main.css` — research portal shell
- `research/assets/css/*.css` — page-specific research styles (`aboutme.css`, `markdown_to_html.css`, `evaluation_styles.css`, `laue_manual_password.css`)
- `research/reports/<topic>/static/css/style.css` — per-topic report styling (generated, see above)
- `teaching/assets/css/teaching-portal.css`, `teaching/blog/assets/reflection.css`
- `blog/assets/css/blog-portal.css`
- `art/assets/css/art-portal.css` — exception to the "shared base" statement above: this one doesn't import `main.css` or use its custom properties at all; it defines its own tokens and reset from scratch (see the Art pillar note above).

When editing styles, match the CSS custom-property pattern already used in each file (`--background-color`, `--primary-color`, `--text-color`, etc.) rather than hardcoding colors.
