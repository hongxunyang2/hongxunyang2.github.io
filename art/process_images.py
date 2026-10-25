#!/usr/bin/env python3
"""Incrementally publish original artwork as thumbnail/full-size WebP pairs."""

import argparse
import hashlib
import io
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import sys
import tempfile

from PIL import Image, ImageCms, ImageOps, __version__ as pillow_version, features
try:
    import pillow_heif
except ImportError:
    pillow_heif = None
else:
    pillow_heif.register_heif_opener(thumbnails=False)

ROOT = Path(__file__).resolve().parent
EXTENSIONS = {".jpg", ".jpeg", ".png", ".heic", ".heif", ".webp"}
PIPELINE_VERSION = 1


def digest_file(path):
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def write_json(path, value):
    text = json.dumps(value, indent=2, ensure_ascii=False) + "\n"
    if path.exists() and path.read_text(encoding="utf-8") == text:
        return
    path.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile(mode="w", encoding="utf-8", dir=path.parent,
                                     delete=False) as handle:
        temporary = Path(handle.name)
        handle.write(text)
    try:
        os.replace(temporary, path)
    finally:
        temporary.unlink(missing_ok=True)


def load_manifest(root):
    path = root / "gallery.json"
    manifest = json.loads(path.read_text(encoding="utf-8")) if path.exists() else {
        "version": 1, "artworks": []
    }
    if manifest.get("version") != 1 or not isinstance(manifest.get("artworks"), list):
        raise ValueError("Unsupported gallery.json format; expected version 1 and artworks list.")
    seen = set()
    for entry in manifest["artworks"]:
        source = entry["source"]
        path = Path(source)
        if path.is_absolute() or ".." in path.parts or source in seen:
            raise ValueError(f"Invalid or duplicate source in gallery.json: {source}")
        seen.add(source)
    return manifest


def output_path(root, relative):
    path = (root / relative).resolve()
    if not path.is_relative_to((root / "assets/images").resolve()) or path.suffix != ".webp":
        raise ValueError(f"Invalid generated image path: {relative}")
    return path


def load_settings(root):
    settings = json.loads((root / "image_settings.json").read_text(encoding="utf-8"))
    for name in ("thumbnail", "full"):
        variant = settings[name]
        if not isinstance(variant["max_edge"], int) or variant["max_edge"] < 1:
            raise ValueError(f"{name}.max_edge must be a positive integer")
        if not 0 <= variant["quality"] <= 100:
            raise ValueError(f"{name}.quality must be between 0 and 100")
    if not isinstance(settings["method"], int) or not 0 <= settings["method"] <= 6:
        raise ValueError("method must be an integer between 0 and 6")
    return settings


def find_sources(root):
    directory = root / "temp_images"
    files = []
    for path in directory.rglob("*"):
        parts = path.relative_to(directory).parts
        if any(part.startswith(".") or part == "_archive" for part in parts):
            continue
        if path.is_file() and not path.is_symlink() and path.suffix.lower() in EXTENSIONS:
            if not path.resolve().is_relative_to(directory.resolve()):
                raise ValueError(f"Source is outside temp_images: {path}")
            files.append(path)
    return sorted(files, key=lambda p: (-p.stat().st_mtime_ns, p.relative_to(directory).as_posix()))


def image_id(source):
    # Include the complete relative filename so JPG/PNG names and subfolders cannot collide.
    slug = re.sub(r"[^a-z0-9]+", "-", Path(source).stem.lower()).strip("-")[:60] or "artwork"
    return f"{slug}-{hashlib.sha256(source.encode('utf-8')).hexdigest()[:12]}"


def prepare_image(path):
    if path.suffix.lower() in {".heic", ".heif"} and pillow_heif is None:
        if not shutil.which("sips"):
            raise ValueError("HEIC needs macOS sips, or install pillow-heif into art/.venv")
        with tempfile.TemporaryDirectory(prefix="art-heic-") as directory:
            decoded = Path(directory) / "decoded.png"
            result = subprocess.run(["sips", "-s", "format", "png", str(path),
                                     "--out", str(decoded)], capture_output=True, text=True)
            if result.returncode or not decoded.is_file():
                raise ValueError(f"macOS could not decode HEIC: {result.stderr.strip()}")
            return prepare_image(decoded)
    with Image.open(path) as original:
        if original.format == "MPO":
            # iPhone HDR JPEGs can include a second JPEG containing a gain map.
            # Pillow exposes them as MPO frames, even though the main image is
            # a normal still photograph. Use the primary (possibly cropped)
            # photo, not its auxiliary grayscale data, for the SDR web copy.
            original.seek(0)
        elif getattr(original, "n_frames", 1) > 1:
            raise ValueError("Animated images are unsupported; export the intended still image first")
        image = ImageOps.exif_transpose(original)
        image.load()
        alpha = image.convert("RGBA").getchannel("A") if (
            "A" in image.getbands() or "transparency" in image.info
        ) else None
        profile = image.info.get("icc_profile")
        if profile:
            source_profile = ImageCms.ImageCmsProfile(io.BytesIO(profile))
            colour = image if image.mode in ("RGB", "CMYK", "LAB", "L") else image.convert("RGB")
            image = ImageCms.profileToProfile(colour, source_profile,
                                              ImageCms.createProfile("sRGB"), outputMode="RGB")
        else:
            image = image.convert("RGB")
        if alpha is not None:
            image.putalpha(alpha)
        # Orientation is baked in, colours are sRGB, and all source EXIF/GPS metadata is removed.
        image.info.clear()
        return image


def encode_variant(image, destination, variant, method):
    preview = image.copy()
    preview.thumbnail((variant["max_edge"], variant["max_edge"]), Image.Resampling.LANCZOS)
    destination.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile(dir=destination.parent, suffix=".webp", delete=False) as handle:
        temporary = Path(handle.name)
    try:
        preview.save(temporary, format="WEBP", quality=variant["quality"], method=method,
                     exact=True, exif=b"", icc_profile=b"", xmp=b"")
        os.replace(temporary, destination)
    finally:
        temporary.unlink(missing_ok=True)
    return {"width": preview.width, "height": preview.height,
            "sha256": digest_file(destination)}


def outputs_valid(root, entry):
    for name in ("thumbnail", "full"):
        info = entry.get(name, {})
        if not info.get("path"):
            return False
        path = output_path(root, info["path"])
        if not path.is_file() or digest_file(path) != info.get("sha256"):
            return False
    return True


def process(root=ROOT, dry_run=False):
    settings = load_settings(root)
    fingerprint = hashlib.sha256(json.dumps({
        "settings": settings, "pipeline": PIPELINE_VERSION, "pillow": pillow_version,
        "heif": pillow_heif.__version__ if pillow_heif else "macOS-sips",
        "webp": features.version("webp")
    }, sort_keys=True).encode()).hexdigest()
    manifest = load_manifest(root)
    entries = {item["source"]: dict(item) for item in manifest["artworks"]}
    sources = find_sources(root)
    new_sources = []
    converted = skipped = 0
    for path in sources:
        source = path.relative_to(root / "temp_images").as_posix()
        source_hash = digest_file(path)
        entry = entries.get(source, {"source": source})
        if (entry.get("source_sha256") == source_hash and
                entry.get("conversion") == fingerprint and outputs_valid(root, entry)):
            skipped += 1
            continue
        print(f"{'Would convert' if dry_run else 'Converting'}: {source}", flush=True)
        if not dry_run:
            try:
                image = prepare_image(path)
                for name, folder in (("thumbnail", "thumbs"), ("full", "full")):
                    relative = f"assets/images/{folder}/{image_id(source)}.webp"
                    info = encode_variant(image, output_path(root, relative), settings[name], settings["method"])
                    info["path"] = relative
                    entry[name] = info
            except Exception as error:
                raise ValueError(f"Cannot convert {source}: {error}") from error
            entry.update(source_sha256=source_hash, conversion=fingerprint)
        if source not in entries:
            new_sources.append(source)
        entries[source] = entry
        converted += 1

    present = {path.relative_to(root / "temp_images").as_posix() for path in sources}
    retained = [item for source, item in entries.items() if source not in present]
    for entry in retained:
        if not outputs_valid(root, entry):
            raise ValueError(f"Missing or damaged WebP for {entry['source']}; restore its original in temp_images.")
    if not dry_run:
        manifest["artworks"] = [entries[source] for source in new_sources] + [
            entries[item["source"]] for item in manifest["artworks"]
        ]
        write_json(root / "gallery.json", manifest)
        (root / "temp_images").mkdir(exist_ok=True)
    print(f"{'Would convert' if dry_run else 'Converted'} {converted}; unchanged {skipped}; "
          f"retained without original {len(retained)}.")
    if any(item.get("conversion") != fingerprint for item in retained):
        print("Some retained artwork uses older settings. Restore its original to rebuild it.")
    return converted, skipped, len(retained)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dry-run", action="store_true", help="Report changes without writing files")
    arguments = parser.parse_args()
    try:
        process(dry_run=arguments.dry_run)
    except Exception as error:
        print(f"Artwork update failed: {error}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
