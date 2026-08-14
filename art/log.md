# Art pillar rebuild — implementation log

Summary for another AI/reviewer picking this up: what was built, why, and what's deliberately left undone. Revised after an external AI review — see "Response to external review" below for what was accepted/fixed vs. pushed back on, and why.

## Git baseline (important, corrected from the original version of this log)

`art/` is **entirely untracked** — nothing under it exists in `HEAD` (confirmed via `git ls-tree -r HEAD -- art/`, which returns nothing, and `git status --short art/`, which shows `?? art/`). No commit has been made this session. That means:
- There is no git history to recover anything from — e.g. the deleted `art/requirements.md` is genuinely gone, not "available in git history" (the original log wrongly implied otherwise).
- Root `index.html` was **already modified in the working tree before this session started** (visible in the session's very first `git status`, which showed `M index.html` prior to any edit here). `git diff HEAD -- index.html` shows the actual committed baseline (last commit `a7f58f3`) had a **Blog card** in that grid slot, not an Art card — the swap from a Blog card to an Art card (new icon, `<h2>Art</h2>`, description, plus restructuring the footer into `.footer-content`/`.footer-links` with a Blog link) was already present, uncommitted, when this session began. **This session's own change to `index.html`** was narrower: removing `<span class="coming-soon-badge">Coming Soon</span>` from that already-present Art card and rewording its `<p>` from "...a gallery launching soon." to "...outside the lab." (The original log incorrectly described this as the only change relative to some art-card baseline; the correct framing is relative to git `HEAD`, which had no Art card at all.)

## What changed (relative to `HEAD`, i.e. everything currently in the working tree)

| File | Change |
|---|---|
| `art/index.html` | New (untracked). Standalone gallery page: title/wordmark, intro, 8-tile placeholder gallery, footer, inline lightbox script. |
| `art/assets/css/art-portal.css` | New (untracked). ~290 lines, fully self-contained (own reset, own tokens, own theme presets, native `<dialog>`-based lightbox styling). |
| `art/assets/images/README.md` | New (untracked). Documents the convention for dropping in real images. |
| `index.html` (root) | Pre-existing uncommitted change (Blog card → Art card, footer restructure) inherited at session start, **plus** this session's own edit: removed the `coming-soon-badge` span and reworded the Art card's description. |
| `PILLARS.md` | New (untracked). Includes the `art/` status row and the "Art pillar: intentionally independent styling" section. |
| `CLAUDE.md` | New (untracked) as of this session's edits — updated its two Art-pillar mentions (see review response below). |
| `art/requirements.md` | Was created this session, then deleted per the user's request once this log existed. Never committed — not recoverable from git. |

## Key decisions

1. **Fully independent from the shared site.** Explicit user correction mid-planning: no `main.css`, no shared header/nav/footer/hero markup or classes, no link back to the homepage. Verified via `grep -n "main.css\|coming-soon-badge\|footer-content\|nav-links" art/index.html` → no matches. Scoped to `art/` only.

2. **Own typography.** Instrument Serif (wordmark + headings) + Inter (body/UI), loaded from Google Fonts, independent of the site's Crimson Pro / Source Sans 3.

3. **Dev-only style switching, zero JS.** `data-theme="minimal"|"amber"|"dark"` on `<body>`, three CSS preset blocks in `art-portal.css`. One-attribute edit, no UI toggle.

4. **Placeholder-first gallery, designed for near-1-line swaps later.** No live Instagram integration (highlights have no public embeddable URL; user will save images manually into `art/assets/images/`). 8 dashed-box placeholder tiles for now. See "Review item 1" below for how the swap-in path was corrected.

5. **Lightbox — now built on the native `<dialog>` element**, not a hand-rolled overlay (changed in response to review — see below). `showModal()` gives focus trapping, an inert background, and Escape-to-close for free; a small inline `<script>` still builds the tile's content, adds/removes a CSS class for the "pop up" open animation, closes on backdrop click, and restores focus to the tile that opened it on the `close` event.

## Response to external review

An external AI reviewed this implementation. Per the user's instruction, findings were independently verified against the actual code/git state before acting — not accepted at face value. Outcome per item:

**Critical**

1. **`data-full` breaking the documented swap workflow — confirmed real, fixed.** Every placeholder button shipped with `data-full="assets/images/placeholder-N.jpg"` (a nonexistent path), and the lightbox script preferred `data-full` over the `<img>`'s own `src` (`tile.getAttribute('data-full') || img.src`). Replacing only the inner placeholder `<div>` with a real `<img>`, as originally documented, would leave the stale `data-full` in place and the lightbox would keep pointing at the nonexistent placeholder file. Fixed by removing `data-full` from all 8 placeholder buttons entirely (the JS fallback to `img.src` already existed and now actually applies) and rewording the inline instructional comment to show the simple case with no `data-full` needed, noting it's an optional override only for when you want the lightbox to show a different/larger image than the thumbnail.

2. **Lightbox accessibility — agreed it needed work, implemented differently than suggested.** Rather than hand-rolling `role="dialog"`, `aria-modal`, a manual focus trap, and manual focus restoration (as the review suggested), the lightbox now uses the native HTML `<dialog>` element with `.showModal()`. This gets focus trapping, an implicit `dialog` ARIA role, `aria-modal` semantics, an inert (non-interactive-to-AT) background while open, and Escape-to-close — all as native browser behavior, with less custom code than a hand-rolled implementation, and more reliably correct across screen readers than a bespoke reimplementation. What still needed manual code: building the lightbox's inner content, restoring focus to the tile that opened it (via the dialog's native `close` event), and closing on a backdrop click. `aria-label="Artwork preview"` was added to the dialog itself.

3. **`CLAUDE.md` — confirmed real, fixed.** It still described `art/` as a "coming soon" placeholder and pointed at it as "the reference example for scaffolding a brand-new pillar" — both stale. Updated the pillar-list line, the "Art pillar (placeholder)" section (now describes the standalone/independent design and points to `PILLARS.md` for the rationale), and the "CSS organization" list (flagged `art-portal.css` as the one exception that doesn't build on `main.css`'s shared base/tokens). `teaching/` is now called out as the reference example instead.

4. **Log accuracy — confirmed real, this rewrite fixes it.** See "Git baseline" section above.

5. **Whether to publicly promote an unfinished/placeholder gallery — reviewed, not changed, pushed back to the user instead of unilaterally reverting.** This raises a fair general product point, but it directly contradicts an explicit decision the user made earlier in this same conversation: they were asked directly whether to keep the "Coming Soon" framing or remove it now, and explicitly chose to remove it, and separately approved a plan whose whole point was 8 clickable placeholder tiles to prove the lightbox interaction end-to-end before real art exists. Reverting that unilaterally because a reviewer disagreed would override a considered, explicit user choice without being asked to. Left as-is; flagged back to the user as something they can reconsider if they want to, but not treated as a bug to silently fix.

**Important**

6. **`PILLARS.md`'s `--color-accent-art` wording — confirmed ambiguous, clarified.** The original sentence, read out of context, could be misread as claiming the token doesn't exist anywhere. It's still defined in `assets/css/main.css` and actively used by the homepage's own Art card styling (5 references) — only the *standalone art page* doesn't consume it. Wording updated to say that explicitly.

7. **Unused CSS —**
   - `--accent` in `art-portal.css`: confirmed genuinely unused (defined per-theme, never referenced via `var(--accent)` anywhere). This is worse than harmless dead code since it looks like it should be doing something. Fixed by wiring it into `.art-tile:hover`/`:focus-visible` (outline + placeholder border/text color) and `.art-lightbox-close:hover`/`:focus-visible` (border/text color) — now has real, theme-differentiated visual effect.
   - `.coming-soon-badge` in `assets/css/main.css`: confirmed currently unused site-wide (its only usage, the Art card's badge span, was removed). **Disagreed with "remove it."** It's a small, generically-named, self-explanatory homepage-portal-card utility, not something introduced by this task — plausible to be reused if another pillar goes into a placeholder state later, per `PILLARS.md`'s existing `.portal-card` conventions. Removing shared `main.css` for this reason felt like scope creep beyond the art pillar and low-value (an unused, clearly-named 13-line rule isn't really "misleading"). Left in place; flagged to the user as a judgment call they can override.

8. **Distinct accessible names per placeholder tile — confirmed real, fixed.** All 8 buttons previously shared the visible text "Add image" as their only accessible name. Each now has its own `aria-label` (e.g. `"Open Untitled study 3"`).

## Addendum: gallery automation + real content added

After the review response above, the user asked whether a Python-based template engine (e.g. Jinja2) was worth adding for gallery generation. Recommendation given and followed: no — a third-party templating library would mean a `pip install`, breaking this repo's no-build-step/no-package-manager premise for a task this simple. Built `art/update_gallery.py` instead, using only the Python standard library:

- Scans `art/assets/images/` for `.jpg`/`.jpeg`/`.png`/`.webp`.
- Sorts **newest-first by file modified time** — not filename, since these are IG screenshots with unpredictable names, and not alphabetical for the same reason.
- Regenerates the tiles in `art/index.html` between `<!-- GALLERY:START -->`/`<!-- GALLERY:END -->` marker comments, one `<button class="art-tile">` + `<img>` per image, no captions (generic `"Artwork N"` alt text instead — real captions from screenshot filenames like `IMG_7413.jpg` would be worse than none).
- Falls back to the original 8 dashed-box placeholder tiles if the folder is empty.
- This **supersedes** the earlier "manually swap one placeholder `<div>` for an `<img>`" workflow described in the original review-response section above (item 1) — that workflow still works as documented (removing `data-full` fixed its bug), but the marked region is now script-owned, and hand-editing individual tiles there will be overwritten the next time the script runs. Updated `art/assets/images/README.md`, `PILLARS.md`, and `CLAUDE.md` accordingly.

While this was being built, the user independently dropped **27 real JPGs** (`IMG_7413.jpg`–`IMG_7441.jpg`, phone screenshots, ~300–800 KB each, ~14 MB total) into `art/assets/images/`. Running the finished script against them worked correctly on the first try — verified via `diff` that a second run is a no-op (idempotent), that tile count matches image count (27/27), that the file still parses cleanly, and that the images actually serve over HTTP. This also resolves review item 5 in practice: the gallery is no longer placeholder tiles being presented as finished content — it now holds real artwork. Total image payload (~14 MB) is somewhat above `PILLARS.md`'s "a few hundred KB each" guidance for a couple of the larger files (~700–800 KB); worth flagging to the user as an optional future compression pass, not something fixed automatically here.

## Explicitly out of scope (not built)

- Instagram API/embeds of any kind.
- Commissioning/contact form (Formspree, per `PILLARS.md`'s existing plan).
- Video hosting.
- Any change to `research/`, `teaching/`, `blog/`, or the homepage beyond the Art-card badge/copy edit already described above.
- An automated "drop images in a folder, one script regenerates the gallery" tool — discussed with the user (Python stdlib or bash, no template engine like Jinja2, captions dropped in favor of file-modified-time ordering since filenames are unpredictable IG screenshot names) but not yet built as of this log.

## Verification performed

- Served the repo locally (`python3 -m http.server`) and confirmed `art/index.html` and `art/assets/css/art-portal.css` return HTTP 200.
- `grep`-verified: no `main.css`/shared-class references in `art/index.html`; no stale `data-full` left on any placeholder button; exactly 8 `.art-tile` buttons each with a distinct `aria-label`; exactly one real `<dialog>` element (tag-balance checked).
- Ran the repo's `index.html` through Python's `html.parser` as a lenient well-formedness check (no parse errors).
- **Not performed, and worth doing before treating this as fully verified**: actual interactive testing in a browser. This session has no browser-automation tool and no local Chrome/Chromium/Node install available, so the lightbox's open/close behavior (all three close paths), focus restoration, keyboard-only operation, the three `data-theme` presets, and responsive layout at mobile widths were verified by careful static code reading, not by clicking through a running page. Recommend: open `art/index.html` directly, click a tile, confirm the popup opens with the animation, close it via the × button / clicking the dimmed backdrop / pressing Escape, tab to a tile and press Enter to confirm keyboard access and that focus lands back on that tile after closing, edit `data-theme` between the three values and reload, and check the devtools console for errors. Also worth testing with one real local `.jpg` dropped into `art/assets/images/` and swapped into a tile per the documented pattern, to confirm the real-image path (not just the placeholder path) renders correctly in both the grid and the lightbox.
