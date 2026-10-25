#!/usr/bin/env python3
"""Generate static gallery HTML from gallery.json. Run `make -C art` to convert first."""

from html import escape
import json
from pathlib import Path
from urllib.parse import quote

ROOT = Path(__file__).resolve().parent
START_MARKER = "<!-- GALLERY:START -->"
END_MARKER = "<!-- GALLERY:END -->"
TILE_INDENT = " " * 12


def render_image_tile(n, artwork):
    thumbnail = artwork["thumbnail"]
    src = escape(quote(thumbnail["path"], safe="/"), quote=True)
    full = escape(quote(artwork["full"]["path"], safe="/"), quote=True)
    alt = escape(artwork.get("alt") or f"Artwork {n}", quote=True)
    caption = artwork.get("caption", "")
    caption_attribute = f' data-caption="{escape(caption, quote=True)}"' if caption else ""
    loading = "eager" if n <= 4 else "lazy"
    return (
        f'{TILE_INDENT}<button class="art-tile" type="button" aria-label="Open {alt}" '
        f'data-full="{full}"{caption_attribute}>\n'
        f'{TILE_INDENT}    <img src="{src}" alt="{alt}" '
        f'width="{int(thumbnail["width"])}" height="{int(thumbnail["height"])}" '
        f'loading="{loading}" decoding="async">\n'
        f'{TILE_INDENT}</button>'
    )


def render_video_tile(feature):
    source = escape(quote(feature["video"]["path"], safe="/"), quote=True)
    poster = escape(quote(feature["poster"]["path"], safe="/"), quote=True)
    version = feature["video"]["sha256"][:12]
    poster_version = feature["poster"]["sha256"][:12]
    width, height = int(feature["video"]["width"]), int(feature["video"]["height"])
    return (
        f'{TILE_INDENT}<figure class="art-feature" aria-label="Featured drawing video">\n'
        f'{TILE_INDENT}    <video id="artFeatureVideo" autoplay muted loop playsinline controls '
        f'preload="metadata" poster="{poster}?v={poster_version}" width="{width}" height="{height}" '
        f'aria-label="Outdoor drawing reel">\n'
        f'{TILE_INDENT}        <source src="{source}?v={version}" type="video/mp4">\n'
        f'{TILE_INDENT}        <a href="{source}">Watch the outdoor drawing video</a>\n'
        f'{TILE_INDENT}    </video>\n'
        f'{TILE_INDENT}    <figcaption><span class="art-feature-kicker">In motion</span>'
        f'<span>Outdoor drawing</span></figcaption>\n'
        f'{TILE_INDENT}</figure>'
    )


def update_gallery(root=ROOT):
    index = root / "index.html"
    html = index.read_text(encoding="utf-8")
    if html.count(START_MARKER) != 1 or html.count(END_MARKER) != 1:
        raise ValueError("Gallery markers are missing or duplicated; HTML was not changed.")
    manifest_path = root / "gallery.json"
    if not manifest_path.exists():
        raise ValueError("Missing art/gallery.json. Run make -C art to convert originals first.")
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    if manifest.get("version") != 1:
        raise ValueError("Unsupported gallery.json version.")
    artworks = manifest["artworks"]
    for artwork in artworks:
        for variant in ("thumbnail", "full"):
            path = (root / artwork[variant]["path"]).resolve()
            if (not path.is_relative_to((root / "assets/images").resolve()) or
                    path.suffix != ".webp" or not path.is_file()):
                raise ValueError(f"Missing or invalid {variant} for {artwork['source']}; run make -C art.")
    tiles = "\n".join(render_image_tile(i + 1, item) for i, item in enumerate(artworks))
    feature = manifest.get("feature_video")
    if feature:
        for asset in (feature["video"], feature["poster"]):
            path = (root / asset["path"]).resolve()
            if not path.is_relative_to((root / "assets/videos").resolve()) or not path.is_file():
                raise ValueError("Featured video assets are missing or invalid; run make -C art.")
        tiles = render_video_tile(feature) + "\n" + tiles
    before, rest = html.split(START_MARKER, 1)
    _, after = rest.split(END_MARKER, 1)
    updated = f"{before}{START_MARKER}\n{tiles}\n{TILE_INDENT}{END_MARKER}{after}"
    if updated != html:
        index.write_text(updated, encoding="utf-8")
        print(f"Updated gallery: {len(artworks)} artwork(s).")
    else:
        print(f"Gallery unchanged: {len(artworks)} artwork(s).")


if __name__ == "__main__":
    try:
        update_gallery()
    except (ValueError, KeyError, OSError) as error:
        raise SystemExit(f"Gallery update failed: {error}")
