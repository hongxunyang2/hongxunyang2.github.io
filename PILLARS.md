# Pillars

This site exists to help the user (Xunyang Hong) with job hunting and self-promotion: communicating research and teaching ability to recruiters and collaborators, plus a future outlet for selling art part-time. `index.html` is a pure hub — it only links out to the pillars below; it should never grow real content of its own.

## Pillar status

| Pillar | Purpose | Status |
|---|---|---|
| `research/` | Communicating research work to collaborators. Report pages (`research/reports/<topic>/`) are password-gated per topic — see `CLAUDE.md` for the gate mechanics. | Active. The password gate is expected to come off after the user graduates (no date set yet — ask before removing it). |
| `teaching/` | Showcasing teaching experience and ability, in case the user pursues a teaching career. | Active, expected to grow — treat teaching-related requests as worth extra polish. |
| `art/` | Painting/drawing showcase, with a long-term angle of part-time art sales. | Live: hero, responsive grid, and a click-to-enlarge lightbox, populated with real artwork (see `art/update_gallery.py`). See note below — this pillar is intentionally *not* built on the shared header/nav/footer/CSS pattern. |
| `blog/` | Personal essays. | Low priority — intentionally kept off the homepage's main card grid (small link in the footer instead) so it doesn't compete with Research/Teaching. |
| `showcase/` | Standalone six-area professional showcase, with new detail pages inside the section. | Image-led overview adapted from Lovable: software primary, teaching secondary, research/design supporting. Lab control/art have a full second row, partially visible on desktop before scrolling. Software and lab control have case studies with playable demos; other detail pages remain minimal. |

## Adding a new pillar

Each pillar is a self-contained top-level folder with its own visual identity — there is no shared component system, so a new pillar doesn't need to look like the others:

1. Create `<pillar>/index.html` following the structural pattern used by `teaching/index.html`/`art/index.html`: `<header><nav>` with a `.logo` and a "Home" link back to `../index.html`, `<main class="container">` for content, `<footer>` with `.footer-content`/`.footer-links`. Link `../assets/css/main.css` first (shared base styles + custom properties) and a pillar-specific stylesheet second.
2. Create `<pillar>/assets/css/<pillar>-portal.css` for anything specific to that pillar, reusing `main.css`'s custom properties (`--color-text`, `--font-display`, etc.) rather than hardcoding values.
3. Give the pillar its own accent color: add `--color-accent-<pillar>` to `:root` in `assets/css/main.css`, following the existing `.research-card`/`.teaching-card`/`.art-card` rules as a template (`::before`, `.card-icon`, `h2`, `.card-arrow`).
4. Add a card for it in `index.html`'s `.portal-cards` grid (or a small footer link, if it should stay low-key like `blog/`).

`teaching/` is a good reference example of a pillar following this shared pattern — copy its shape for the next one. (`art/` used to be the reference example but has since diverged — see note below.)

## Art pillar: intentionally independent styling

Unlike every other pillar, `art/index.html` and `art/assets/css/art-portal.css` do **not** follow the "Adding a new pillar" recipe above: no `../assets/css/main.css`, no shared header/nav/footer/hero markup or classes, no link back to the homepage, and its own Google Fonts pairing instead of the site's Crimson Pro/Source Sans 3. The standalone art page does not consume the shared `--color-accent-art` token — that token still exists and is actively used by the homepage's own Art card styling in `assets/css/main.css`; the art pillar just defines and uses its own separate color tokens instead. This was a deliberate choice by the user — the art pillar should read as its own standalone site, not a "cooperative" part of the same portal as Research/Teaching. This is scoped to `art/` only; it is not a new general direction for future pillars unless the user says otherwise.

It also has a dev-only (not visitor-facing) style switch: a `data-theme` attribute on `<body>` in `art/index.html` picks between three CSS presets (`minimal` / `amber` / `dark`) defined in `art-portal.css` — pure CSS, no JS.

Gallery content is not hand-edited in `index.html` — it's generated. Drop image files into `art/assets/images/` and run `python3 art/update_gallery.py` from the repo root; it regenerates the tiles between the `<!-- GALLERY:START -->`/`<!-- GALLERY:END -->` markers, newest file first by modified time, no captions (see `art/assets/images/README.md`).

## Art pillar: media & commissioning plan

When building out `art/` further:

- **Images** — store directly in the repo at `art/assets/images/`, web-optimized (JPG or WebP, roughly a few hundred KB each). This matches the existing convention (e.g. `research/assets/figure_research/`) and GitHub Pages serves this fine at personal-site scale.
- **Videos** — do not commit raw video files to the repo; git handles large binaries badly (slow clones, repo bloat) and GitHub Pages has soft bandwidth limits. Host clips externally (YouTube unlisted is the default recommendation — free compression/CDN/thumbnails) and embed them. Only self-host a clip directly (e.g. under `art/assets/videos/`) if it's a few seconds and well under ~5-10MB.
- **Contact / commissioning form** — GitHub Pages is fully static, so there's no backend to receive a form submission directly. Use a third-party form service (Formspree is the default recommendation: point the form's `action` at their endpoint, submissions land by email, free tier is enough here) rather than a bare `mailto:` link, so a commission request can capture structured info (reference images, budget, timeline). Needs a Formspree account/form endpoint from the user before wiring in.

## Showcase navigation

The homepage links into `showcase/`. Showcase pages use their own stylesheet and keep the name link and “Back to showcase” inside that folder. The overview's Art navigation link and Paintings & drawings panel intentionally open the existing gallery at `https://hongxunyang2.github.io/art/` in a new tab, so they also work when the showcase is hosted on its own domain. Other section content belongs in each section’s `index.html`; section media belongs in `showcase/assets/`.

The showcase header shows `Physics | Software | Design | CV` below the name. The final CV link opens `showcase/assets/pdf/cv_rd_1.pdf` in a new tab; update its `href` in `showcase/index.html` if a replacement CV has a different filename. Keep this line visible at compact sizes so the CV stays accessible.

The overview additionally loads `showcase/assets/css/showcase-index.css`, scoped to `.showcase-page` so detail pages keep their simple styling. Its source design is [the Lovable project](https://lovable.dev/projects/ab19d521-91aa-4ad4-8826-e5730b68fc3f), revision `b741ebe8a47b686808477c3c9644bf72f3f762a2`, with the warm ivory/terracotta palette completed locally (accent/focus colours and frame shadows). Images in `showcase/assets/images/` are optimized copies of the originals in `showcase/temp_assets/`; the software GIF stays animated, with a still image for reduced-motion preferences. The overview works as static HTML/CSS without a build step.

Software and lab-control detail pages share `showcase/assets/css/showcase-project.css` through the `.project-page` body class. The software page content is distilled from `showcase/temp_assets/advisor_docs/`, with the MATLAB-to-Python contribution supplied by the user. The one-minute overview and three feature clips are H.264 MP4s in `showcase/assets/videos/advisor/`, with WebP posters in `showcase/assets/images/advisor/`. Videos have native controls, no autoplay, and `preload="none"`; captions and text descriptions explain the silent recordings. These optimized assets must be tracked, since the source docs under `temp_assets/` are ignored. Do not present proposed UI-polish items as released features or copy the appendix's equations without an independent correctness check.

The lab-control page (`showcase/automation/index.html`) describes interactive instrument control, camera-guided alignment and Laue image acquisition. Automatic alignment is not implemented; keep the future section as an HTML TODO comment until validated functionality is available. Its four 3× MP4 demos live in `showcase/assets/videos/laue/`, with posters in `showcase/assets/images/laue/`; the original recordings and source metadata stay in ignored `showcase/temp_assets/laue_docs/`. The recordings retain their audio with pitch-preserving 3× time compression, are encoded at 720p in H.264/AAC with fast-start metadata, and do not autoplay. Source: [UZH Laue manual](https://www.physik.uzh.ch/groups/chang/content/laue_manual.php).
