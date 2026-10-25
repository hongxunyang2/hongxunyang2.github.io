"""Integration checks using disposable originals; never modify the real gallery."""

import contextlib
import importlib.util
import io
import json
import os
from pathlib import Path
import shutil
import subprocess
import tempfile
import unittest
from unittest.mock import patch

from PIL import Image, ImageCms


ART = Path(__file__).resolve().parents[1]


def load_module(name):
    spec = importlib.util.spec_from_file_location(name, ART / f"{name}.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


processor = load_module("process_images")
gallery = load_module("update_gallery")


class ImageWorkflowTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory(prefix="art-test-")
        self.addCleanup(self.temporary.cleanup)
        self.root = Path(self.temporary.name)
        (self.root / "temp_images").mkdir()
        self.settings = {"thumbnail": {"max_edge": 80, "quality": 88},
                         "full": {"max_edge": 160, "quality": 90}, "method": 1}
        self.write_settings()
        (self.root / "index.html").write_text(
            f'<main>{gallery.START_MARKER}\n{gallery.END_MARKER}</main>')

    def write_settings(self):
        (self.root / "image_settings.json").write_text(json.dumps(self.settings))

    def original(self, name="drawing.JPG", colour="red", size=(240, 120)):
        path = self.root / "temp_images" / name
        path.parent.mkdir(parents=True, exist_ok=True)
        Image.new("RGB", size, colour).save(path)
        return path

    def run_process(self, **options):
        with contextlib.redirect_stdout(io.StringIO()):
            return processor.process(self.root, **options)

    def entries(self):
        return json.loads((self.root / "gallery.json").read_text())["artworks"]

    def generate_html(self):
        with contextlib.redirect_stdout(io.StringIO()):
            gallery.update_gallery(self.root)

    def test_incremental_content_changes_and_unchanged_html(self):
        path = self.original()
        self.assertEqual(self.run_process(), (1, 0, 0))
        self.generate_html()
        manifest = self.root / "gallery.json"
        html = self.root / "index.html"
        stamps = (manifest.stat().st_mtime_ns, html.stat().st_mtime_ns)
        self.assertEqual(self.run_process(), (0, 1, 0))
        self.generate_html()
        self.assertEqual(stamps, (manifest.stat().st_mtime_ns, html.stat().st_mtime_ns))
        old_stat = path.stat()
        self.original(colour="blue")
        os.utime(path, ns=(old_stat.st_atime_ns, old_stat.st_mtime_ns))
        self.assertEqual(self.run_process(), (1, 0, 0))

    def test_new_images_prepend_without_reordering_existing(self):
        self.original("old.png")
        self.run_process()
        self.original("new.png")
        self.run_process()
        self.assertEqual([e["source"] for e in self.entries()], ["new.png", "old.png"])
        self.original("old.png", colour="green")
        self.run_process()
        self.assertEqual([e["source"] for e in self.entries()], ["new.png", "old.png"])

    def test_collision_safe_names_and_archive_exclusion(self):
        for name in ["same.JPG", "same.png", 'nested/画 & "study".PNG', "_archive/unused.jpg"]:
            self.original(name)
        self.assertEqual(self.run_process(), (3, 0, 0))
        self.assertEqual(len({e["thumbnail"]["path"] for e in self.entries()}), 3)
        self.generate_html()

    def test_removing_original_retains_publication_and_missing_output_rebuilds(self):
        path = self.original()
        self.run_process()
        entry = self.entries()[0]
        thumbnail = self.root / entry["thumbnail"]["path"]
        thumbnail.unlink()
        self.assertEqual(self.run_process(), (1, 0, 0))
        path.unlink()
        self.assertEqual(self.run_process(), (0, 0, 1))
        self.assertTrue(thumbnail.is_file())
        self.generate_html()
        thumbnail.unlink()
        with self.assertRaisesRegex(ValueError, "restore its original"):
            self.run_process()

    def test_settings_rebuild_and_dry_run_does_not_write(self):
        self.original()
        self.run_process()
        original = (self.root / "gallery.json").read_bytes()
        self.settings["thumbnail"]["max_edge"] = 60
        self.write_settings()
        self.assertEqual(self.run_process(dry_run=True), (1, 0, 0))
        self.assertEqual((self.root / "gallery.json").read_bytes(), original)
        self.assertEqual(self.run_process(), (1, 0, 0))
        self.assertEqual(self.entries()[0]["thumbnail"]["width"], 60)

    def test_rotation_transparency_colour_and_no_upscaling(self):
        rgba = Image.new("RGBA", (40, 20), (100, 150, 200, 0))
        rgba.putpixel((10, 10), (120, 140, 160, 255))
        exif = Image.Exif()
        exif[274] = 6  # rotate 90 degrees clockwise
        exif[270] = "Private camera metadata"
        profile = ImageCms.ImageCmsProfile(ImageCms.createProfile("sRGB")).tobytes()
        rgba.save(self.root / "temp_images/rotated.png", exif=exif, icc_profile=profile)
        self.run_process()
        for variant in ("thumbnail", "full"):
            with Image.open(self.root / self.entries()[0][variant]["path"]) as output:
                self.assertEqual(output.size, (20, 40))
                self.assertEqual(output.mode, "RGBA")
                self.assertEqual(output.getchannel("A").getextrema(), (0, 255))
                self.assertFalse(output.info.get("exif"))
                self.assertFalse(output.info.get("icc_profile"))

    def test_failed_conversion_preserves_manifest_and_gallery(self):
        self.original()
        self.run_process()
        self.generate_html()
        before = [(self.root / name).read_bytes() for name in ("gallery.json", "index.html")]
        (self.root / "temp_images/broken.jpg").write_bytes(b"invalid image")
        with self.assertRaisesRegex(ValueError, "Cannot convert broken.jpg"):
            self.run_process()
        self.assertEqual(before, [(self.root / name).read_bytes()
                                  for name in ("gallery.json", "index.html")])

    def test_hdr_jpeg_uses_primary_photo_and_preserves_original(self):
        path = self.root / "temp_images/cropped.JPG"
        primary = Image.new("RGB", (240, 120), "red")
        auxiliary = Image.new("L", (120, 60), 128)
        exif = Image.Exif()
        exif[274] = 6
        primary.save(path, format="MPO", save_all=True, append_images=[auxiliary], exif=exif)
        original_bytes = path.read_bytes()
        with Image.open(path) as image:
            self.assertEqual(image.format, "MPO")
            self.assertEqual(image.n_frames, 2)
        self.assertEqual(self.run_process(), (1, 0, 0))
        with Image.open(self.root / self.entries()[0]["full"]["path"]) as output:
            self.assertEqual(output.size, (80, 160))
            red, green, blue = output.convert("RGB").getpixel((40, 80))
            self.assertGreater(red, 240)
            self.assertLess(green, 15)
            self.assertLess(blue, 15)
        self.assertEqual(path.read_bytes(), original_bytes)
        self.assertEqual(self.run_process(), (0, 1, 0))

    def test_actual_animated_webp_still_requires_still_export(self):
        path = self.root / "temp_images/animation.webp"
        Image.new("RGB", (40, 20), "red").save(
            path, format="WEBP", save_all=True,
            append_images=[Image.new("RGB", (40, 20), "blue")], duration=100, loop=0)
        with self.assertRaisesRegex(ValueError, "Animated images are unsupported"):
            self.run_process()
        self.assertFalse((self.root / "gallery.json").exists())

    def test_persistent_alt_text_captions_and_lazy_loading(self):
        for n in range(5):
            self.original(f"drawing-{n}.png")
        self.run_process()
        manifest = processor.load_manifest(self.root)
        manifest["artworks"][0].update(alt='Study "one" & two', caption="<Sunset>")
        processor.write_json(self.root / "gallery.json", manifest)
        self.run_process()
        self.generate_html()
        html = (self.root / "index.html").read_text()
        self.assertIn('alt="Study &quot;one&quot; &amp; two"', html)
        self.assertIn('data-caption="&lt;Sunset&gt;"', html)
        self.assertEqual(html.count('loading="lazy"'), 1)
        self.assertEqual(html.count('data-full="assets/images/full/'), 5)

    @unittest.skipUnless(shutil.which("sips"), "macOS HEIC decoder required")
    def test_heic_decodes_with_native_macos_tool(self):
        source = self.original("input.png")
        heic = source.with_suffix(".HEIC")
        result = subprocess.run(["sips", "-s", "format", "heic", str(source), "--out", str(heic)],
                                capture_output=True, text=True)
        if result.returncode:
            self.skipTest("Native HEIC encoder unavailable in this environment: " + result.stderr.strip())
        source.unlink()
        self.assertEqual(self.run_process(), (1, 0, 0))
        with Image.open(self.root / self.entries()[0]["full"]["path"]) as output:
            self.assertEqual(output.size, (160, 80))

    def test_heic_decoder_failure_is_actionable_and_preserves_gallery(self):
        (self.root / "temp_images/broken.HEIC").write_bytes(b"invalid heic")
        failed = subprocess.CompletedProcess([], 1, "", "invalid HEIC data")
        with patch.object(processor, "pillow_heif", None), \
                patch.object(processor.shutil, "which", return_value="/usr/bin/sips"), \
                patch.object(processor.subprocess, "run", return_value=failed):
            with self.assertRaisesRegex(ValueError, "macOS could not decode HEIC"):
                self.run_process()
        self.assertFalse((self.root / "gallery.json").exists())


if __name__ == "__main__":
    unittest.main()
