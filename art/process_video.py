#!/usr/bin/env python3
"""Incrementally optimize temp_images/video.MP4 for the featured gallery tile."""

import argparse
import hashlib
import json
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile

from PIL import Image
from process_images import ROOT, digest_file, load_manifest, write_json

PIPELINE_VERSION = 1


def run(arguments):
    result = subprocess.run(arguments, capture_output=True, text=True)
    if result.returncode:
        raise ValueError(result.stderr.strip() or f"{arguments[0]} failed")
    return result.stdout


def probe(path):
    return json.loads(run(["ffprobe", "-v", "error", "-show_streams", "-show_format",
                           "-of", "json", str(path)]))


def load_settings(root):
    settings = json.loads((root / "video_settings.json").read_text(encoding="utf-8"))
    for key in ("max_width", "max_height", "fps"):
        if not isinstance(settings[key], int) or settings[key] < 2:
            raise ValueError(f"{key} must be an integer of at least 2")
    if not 0 <= settings["crf"] <= 51 or settings["poster_second"] < 0:
        raise ValueError("crf must be 0–51 and poster_second cannot be negative")
    if settings["preset"] not in {"ultrafast", "superfast", "veryfast", "faster", "fast",
                                  "medium", "slow", "slower", "veryslow"}:
        raise ValueError("Unknown H.264 encoder preset")
    return settings


def asset_path(root, relative):
    path = (root / relative).resolve()
    if not path.is_relative_to((root / "assets/videos").resolve()):
        raise ValueError(f"Invalid video asset path: {relative}")
    return path


def outputs_valid(root, entry):
    for key in ("video", "poster"):
        asset = entry.get(key, {})
        if not asset.get("path"):
            return False
        path = asset_path(root, asset["path"])
        if not path.is_file() or digest_file(path) != asset.get("sha256"):
            return False
    return True


def video_filters(stream, settings):
    filters = []
    if stream.get("color_transfer") in {"arib-std-b67", "smpte2084"}:
        filters += ["zscale=t=linear:npl=100", "format=gbrpf32le", "zscale=p=bt709",
                    "tonemap=tonemap=mobius:desat=0", "zscale=t=bt709:m=bt709:r=tv"]
    filters += [f"scale=w='min({settings['max_width']},iw)':h='min({settings['max_height']},ih)':"
                "force_original_aspect_ratio=decrease:force_divisible_by=2",
                "format=yuv420p", f"fps={settings['fps']}", "setsar=1"]
    return ",".join(filters)


def process(root=ROOT, dry_run=False):
    manifest = load_manifest(root)
    entry = manifest.get("feature_video")
    candidates = [path for path in (root / "temp_images").glob("*")
                  if path.name.lower() == "video.mp4" and path.is_file() and not path.is_symlink()]
    if len(candidates) > 1:
        raise ValueError("Keep only one video.MP4 in art/temp_images (filename matching ignores case).")
    if not candidates:
        if entry and not outputs_valid(root, entry):
            raise ValueError("Featured video assets are missing/damaged; restore temp_images/video.MP4.")
        print("Featured video retained without original." if entry else "No featured video; skipped.")
        return "retained" if entry else "absent"

    source = candidates[0]
    settings = load_settings(root)
    source_hash = digest_file(source)
    fingerprint = hashlib.sha256(json.dumps({"settings": settings, "pipeline": PIPELINE_VERSION},
                                             sort_keys=True).encode()).hexdigest()
    if (entry and entry.get("source_sha256") == source_hash and
            entry.get("conversion") == fingerprint and outputs_valid(root, entry)):
        print("Featured video unchanged; skipped.")
        return "unchanged"
    if dry_run:
        print(f"Would convert featured video: {source.name}")
        return "convert"
    if not shutil.which("ffmpeg") or not shutil.which("ffprobe"):
        raise ValueError("Video processing needs FFmpeg and ffprobe. On macOS: brew install ffmpeg")

    print(f"Converting featured video: {source.name} (this may take a minute)", flush=True)
    metadata = probe(source)
    stream = next((s for s in metadata["streams"] if s["codec_type"] == "video"), None)
    if stream is None:
        raise ValueError("video.MP4 does not contain a video stream")
    directory = root / "assets/videos"
    directory.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix=".encode-", dir=directory) as temporary:
        temporary = Path(temporary)
        video = temporary / "feature.mp4"
        run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-nostdin", "-y", "-i", str(source),
             "-map", "0:v:0", "-map", "0:a:0?", "-map_metadata", "-1", "-map_chapters", "-1",
             "-vf", video_filters(stream, settings), "-c:v", "libx264", "-crf", str(settings["crf"]),
             "-preset", settings["preset"], "-pix_fmt", "yuv420p", "-color_primaries", "bt709",
             "-color_trc", "bt709", "-colorspace", "bt709", "-c:a", "aac", "-b:a",
             settings["audio_bitrate"], "-movflags", "+faststart", str(video)])
        output = probe(video)
        stream = next(s for s in output["streams"] if s["codec_type"] == "video")
        duration = float(output["format"]["duration"])
        frame = temporary / "poster.png"
        second = min(settings["poster_second"], max(0, duration / 2))
        run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-nostdin", "-y", "-ss", str(second),
             "-i", str(video), "-frames:v", "1", str(frame)])
        poster = temporary / "feature.webp"
        with Image.open(frame) as image:
            image.save(poster, format="WEBP", quality=88, method=6, exif=b"", icc_profile=b"")
        entry = dict(entry or {})
        entry.update(source=source.name, source_sha256=source_hash, conversion=fingerprint,
                     video={"path": "assets/videos/feature.mp4", "sha256": digest_file(video),
                            "width": stream["width"], "height": stream["height"],
                            "duration": duration, "bytes": video.stat().st_size},
                     poster={"path": "assets/videos/feature.webp", "sha256": digest_file(poster)})
        # Keep previously published assets intact until both new files have been generated.
        video.replace(directory / "feature.mp4")
        poster.replace(directory / "feature.webp")
    manifest["feature_video"] = entry
    write_json(root / "gallery.json", manifest)
    print(f"Featured video ready: {entry['video']['width']} × {entry['video']['height']}, "
          f"{entry['video']['bytes'] / 1_000_000:.2f} MB (original {source.stat().st_size / 1_000_000:.2f} MB).")
    return "converted"


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dry-run", action="store_true")
    arguments = parser.parse_args()
    try:
        process(dry_run=arguments.dry_run)
    except Exception as error:
        print(f"Video update failed: {error}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
