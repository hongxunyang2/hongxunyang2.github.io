"""Exercise real FFmpeg conversions with short disposable clips."""

import contextlib
import io
import json
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest

ART = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ART))
import process_video
import update_gallery


@unittest.skipUnless(shutil.which("ffmpeg") and shutil.which("ffprobe"), "FFmpeg required")
class FeaturedVideoTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory(prefix="art-video-test-")
        self.addCleanup(self.temporary.cleanup)
        self.root = Path(self.temporary.name)
        (self.root / "temp_images").mkdir()
        self.source = self.root / "temp_images/video.MP4"
        self.settings = {"max_width": 90, "max_height": 160, "fps": 15, "crf": 30,
                         "preset": "ultrafast", "audio_bitrate": "64k", "poster_second": 0.1}
        self.write_settings()
        (self.root / "index.html").write_text(
            f'<main>{update_gallery.START_MARKER}\n{update_gallery.END_MARKER}</main>')
        self.create_source()

    def write_settings(self):
        (self.root / "video_settings.json").write_text(json.dumps(self.settings))

    def create_source(self, colour="red"):
        result = subprocess.run([
            "ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-f", "lavfi", "-i",
            f"color=c={colour}:s=180x320:r=15:d=0.4", "-f", "lavfi", "-i",
            "sine=frequency=440:duration=0.4", "-c:v", "libx264", "-preset", "ultrafast",
            "-pix_fmt", "yuv420p", "-c:a", "aac", "-shortest", str(self.source)
        ], capture_output=True, text=True)
        self.assertEqual(result.returncode, 0, result.stderr)

    def process(self, **options):
        with contextlib.redirect_stdout(io.StringIO()):
            return process_video.process(self.root, **options)

    def manifest(self):
        return json.loads((self.root / "gallery.json").read_text())

    def test_optimized_video_audio_poster_and_incremental_skip(self):
        self.assertEqual(self.process(), "converted")
        feature = self.manifest()["feature_video"]
        video = self.root / feature["video"]["path"]
        metadata = process_video.probe(video)
        stream = next(s for s in metadata["streams"] if s["codec_type"] == "video")
        self.assertEqual((stream["width"], stream["height"]), (90, 160))
        self.assertEqual(stream["codec_name"], "h264")
        self.assertEqual(stream["pix_fmt"], "yuv420p")
        self.assertTrue(any(s["codec_type"] == "audio" for s in metadata["streams"]))
        self.assertGreater(feature["video"]["duration"], 0.3)
        data = video.read_bytes()
        self.assertLess(data.index(b"moov"), data.index(b"mdat"))
        stamp = video.stat().st_mtime_ns
        self.assertEqual(self.process(), "unchanged")
        self.assertEqual(stamp, video.stat().st_mtime_ns)

    def test_source_settings_updates_missing_outputs_and_dry_run(self):
        self.assertEqual(self.process(dry_run=True), "convert")
        self.assertFalse((self.root / "gallery.json").exists())
        self.process()
        old_hash = self.manifest()["feature_video"]["source_sha256"]
        self.create_source(colour="blue")
        self.assertEqual(self.process(), "converted")
        self.assertNotEqual(old_hash, self.manifest()["feature_video"]["source_sha256"])
        self.settings["max_width"] = 72
        self.write_settings()
        before = (self.root / "gallery.json").read_bytes()
        self.assertEqual(self.process(dry_run=True), "convert")
        self.assertEqual(before, (self.root / "gallery.json").read_bytes())
        self.assertEqual(self.process(), "converted")
        self.assertEqual(self.manifest()["feature_video"]["video"]["width"], 72)
        (self.root / "assets/videos/feature.webp").unlink()
        self.assertEqual(self.process(), "converted")

    def test_absent_original_preserves_publication_and_invalid_asset_fails(self):
        self.process()
        self.source.unlink()
        self.assertEqual(self.process(), "retained")
        (self.root / "assets/videos/feature.mp4").unlink()
        with self.assertRaisesRegex(ValueError, "restore temp_images/video.MP4"):
            self.process()

    def test_failed_encoding_preserves_published_files(self):
        self.process()
        paths = [self.root / name for name in ("gallery.json", "assets/videos/feature.mp4",
                                               "assets/videos/feature.webp")]
        before = [p.read_bytes() for p in paths]
        self.source.write_bytes(b"broken video")
        with self.assertRaises(ValueError):
            self.process()
        self.assertEqual(before, [p.read_bytes() for p in paths])

    def test_generated_tile_has_muted_autoplay_controls_and_cache_version(self):
        self.process()
        with contextlib.redirect_stdout(io.StringIO()):
            update_gallery.update_gallery(self.root)
        html = (self.root / "index.html").read_text()
        self.assertIn('class="art-feature"', html)
        self.assertIn('autoplay muted loop playsinline controls', html)
        self.assertIn('assets/videos/feature.mp4?v=', html)
        self.assertIn('poster="assets/videos/feature.webp?v=', html)
        self.assertEqual(html.count("<video"), 1)

    def test_hdr_filter_only_applied_to_hdr_sources(self):
        hdr = process_video.video_filters({"color_transfer": "arib-std-b67"}, self.settings)
        self.assertIn("tonemap=tonemap=mobius", hdr)
        self.assertNotIn("tonemap", process_video.video_filters({}, self.settings))


if __name__ == "__main__":
    unittest.main()
