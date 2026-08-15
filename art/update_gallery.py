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
"""

from pathlib import Path

ROOT = Path(__file__).resolve().parent
IMAGES_DIR = ROOT / "assets" / "images"
INDEX_HTML = ROOT / "index.html"
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}

START_MARKER = "<!-- GALLERY:START -->"
END_MARKER = "<!-- GALLERY:END -->"

TILE_INDENT = " " * 12
PLACEHOLDER_COUNT = 8


def find_images():
    if not IMAGES_DIR.exists():
        return []
    files = [p for p in IMAGES_DIR.iterdir() if p.is_file() and p.suffix.lower() in IMAGE_EXTENSIONS]
    files.sort(key=lambda p: p.stat().st_mtime, reverse=True)
    return files


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


def build_gallery_html(images):
    if images:
        tiles = [render_image_tile(i + 1, p) for i, p in enumerate(images)]
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
    gallery_html = build_gallery_html(images)
    new_html = f"{before}{START_MARKER}\n{gallery_html}\n{TILE_INDENT}{END_MARKER}{after}"

    INDEX_HTML.write_text(new_html)

    if images:
        print(f"Updated gallery with {len(images)} image(s), newest first:")
        for p in images:
            print(f"  - {p.name}")
    else:
        print(f"No images found in {IMAGES_DIR} — wrote {PLACEHOLDER_COUNT} placeholder tiles.")


if __name__ == "__main__":
    main()
