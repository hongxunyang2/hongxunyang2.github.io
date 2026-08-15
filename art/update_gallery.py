#!/usr/bin/env python3
"""Regenerate the art gallery tiles in art/index.html from art/assets/images/.

Usage (from anywhere — paths are resolved relative to this script):
    python3 art/update_gallery.py

Drop .jpg/.jpeg/.png/.webp files into art/assets/images/ and rerun. Images
are ordered newest-first by file modified time (IG screenshot filenames
aren't reliable enough to sort or caption by). If the folder has no images,
the gallery falls back to placeholder tiles. Everything between the
GALLERY:START / GALLERY:END markers in index.html is fully owned by this
script — don't hand-edit that region, it gets overwritten on every run.

To add an Instagram reel as a tile: drop a cover-frame image into
art/assets/images/ like any artwork photo, then add an entry mapping that
filename to the reel's URL in art/assets/reels.json, e.g.:
    {"reel_cover.jpg": "https://www.instagram.com/reel/XXXXXXXXXXX/"}
That image renders as a tile with a play-icon overlay; opening it plays the
real Instagram embed in the lightbox instead of a static image (see the
data-reel handling in index.html's lightbox script). Any image not listed
in reels.json renders as a normal artwork tile.
"""

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
IMAGES_DIR = ROOT / "assets" / "images"
INDEX_HTML = ROOT / "index.html"
REELS_JSON = ROOT / "assets" / "reels.json"
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}

START_MARKER = "<!-- GALLERY:START -->"
END_MARKER = "<!-- GALLERY:END -->"

TILE_INDENT = " " * 12
PLACEHOLDER_COUNT = 8

PLAY_ICON = (
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4l14 8-14 8V4z"/></svg>'
)


def find_images():
    if not IMAGES_DIR.exists():
        return []
    files = [p for p in IMAGES_DIR.iterdir() if p.is_file() and p.suffix.lower() in IMAGE_EXTENSIONS]
    files.sort(key=lambda p: p.stat().st_mtime, reverse=True)
    return files


def load_reels():
    if not REELS_JSON.exists():
        return {}
    return json.loads(REELS_JSON.read_text())


def render_placeholder_tile(n):
    return (
        f'{TILE_INDENT}<button class="art-tile" type="button" aria-label="Open Untitled study {n}" data-caption="Untitled study {n}">\n'
        f'{TILE_INDENT}    <div class="art-tile-placeholder"><span>Add image</span></div>\n'
        f'{TILE_INDENT}</button>'
    )


def render_image_tile(n, image_path):
    src = f"assets/images/{image_path.name}"
    return (
        f'{TILE_INDENT}<button class="art-tile" type="button" aria-label="Open artwork {n}">\n'
        f'{TILE_INDENT}    <img src="{src}" alt="Artwork {n}">\n'
        f'{TILE_INDENT}</button>'
    )


def render_reel_tile(n, image_path, permalink):
    src = f"assets/images/{image_path.name}"
    return (
        f'{TILE_INDENT}<button class="art-tile art-tile--reel" type="button" aria-label="Play reel {n}" data-reel="{permalink}">\n'
        f'{TILE_INDENT}    <img src="{src}" alt="Reel cover {n}">\n'
        f'{TILE_INDENT}    <span class="art-tile-play">{PLAY_ICON}</span>\n'
        f'{TILE_INDENT}</button>'
    )


def build_gallery_html(images, reels):
    if images:
        tiles = []
        for i, p in enumerate(images):
            permalink = reels.get(p.name)
            if permalink:
                tiles.append(render_reel_tile(i + 1, p, permalink))
            else:
                tiles.append(render_image_tile(i + 1, p))
    else:
        tiles = [render_placeholder_tile(i + 1) for i in range(PLACEHOLDER_COUNT)]
    return "\n".join(tiles)


def main():
    html = INDEX_HTML.read_text()

    if START_MARKER not in html or END_MARKER not in html:
        raise SystemExit(
            f"Could not find {START_MARKER} / {END_MARKER} markers in {INDEX_HTML}. "
            "Not touching the file."
        )

    before, rest = html.split(START_MARKER, 1)
    _, after = rest.split(END_MARKER, 1)

    images = find_images()
    reels = load_reels()
    reel_names = set(reels.keys())
    known_names = {p.name for p in images}
    missing = reel_names - known_names
    if missing:
        print(f"Warning: reels.json references image(s) not found in {IMAGES_DIR}: {', '.join(sorted(missing))}")

    gallery_html = build_gallery_html(images, reels)
    new_html = f"{before}{START_MARKER}\n{gallery_html}\n{TILE_INDENT}{END_MARKER}{after}"

    INDEX_HTML.write_text(new_html)

    if images:
        reel_count = sum(1 for p in images if p.name in reels)
        print(f"Updated gallery with {len(images)} tile(s) ({reel_count} reel(s)), newest first:")
        for p in images:
            tag = " [reel]" if p.name in reels else ""
            print(f"  - {p.name}{tag}")
    else:
        print(f"No images found in {IMAGES_DIR} — wrote {PLACEHOLDER_COUNT} placeholder tiles.")


if __name__ == "__main__":
    main()
