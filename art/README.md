# Updating the art gallery

1. Drop originals into **`art/temp_images/`**. JPG/JPEG, PNG, HEIC/HEIF and static WebP are supported, including uppercase extensions and subfolders.
   For the featured reel, add **`art/temp_images/video.MP4`** (filename matching is case-insensitive).
2. On macOS, double-click **`art/update_art.command`** in Finder. It opens Terminal, runs the update, and waits for Return so you can read the result.
3. Open `art/index.html` to preview. Commit and publish the changed HTML, manifest and WebP files through your normal workflow.

The launcher only prepares local website files. It does not commit or push anything.

Alternatively, from the repository root:

```sh
make -C art          # convert changed images/video and regenerate gallery HTML
make -C art check    # show what would change, without changing artwork or HTML
make -C art test     # run checks with disposable images
./art/update_art.sh  # shell equivalent of the Mac launcher
```

Run the launcher again after adding or editing images; it is not a background folder watcher. Paths are resolved relative to the scripts, so launching from another working directory works too.

## Dependencies

Python 3.9+, Make and Pillow with WebP support are required. The first run creates a local, ignored `.venv` and uses an existing Pillow installation if available; otherwise it installs `requirements.txt` (internet required). macOS's built-in `sips` decodes HEIC/HEIF. On other platforms, install `pillow-heif` into `art/.venv` to enable HEIC/HEIF.

Changed videos also require **FFmpeg with libx264, zscale/tonemap and ffprobe** (`brew install ffmpeg` on macOS). Unchanged published videos can be retained without FFmpeg or the source file.

## What gets published

| Folder/file | Purpose |
|---|---|
| `temp_images/` | Original artwork. Ignored by Git; keep a separate backup. |
| `temp_images/_archive/` | Originals excluded from processing, at any folder depth. |
| `assets/images/thumbs/` | WebP gallery thumbnails, maximum longest edge 800 px. |
| `assets/images/full/` | WebP lightbox images, maximum longest edge 2400 px. |
| `image_settings.json` | Thumbnail/full-size limits, quality and compression effort. |
| `assets/videos/` | Optimized `feature.mp4` and its WebP poster. Both are committed. |
| `video_settings.json` | Maximum video dimensions, frame rate, compression and poster frame. |
| `gallery.json` | Stable artwork order, source fingerprints, generated paths and optional descriptions. |

Images are never enlarged or cropped. Rotation is applied before resizing, embedded colour profiles are converted to sRGB, transparency is retained, and camera/GPS metadata is removed. WebP quality starts at 88 for thumbnails and 90 for full-size views. The first four images load normally; remaining thumbnails use browser lazy loading. Full-size images load when clicked.

iPhone HDR JPEGs can contain an extra gain-map image and be detected as MPO files, including after editing in Preview. The converter uses their primary photo (with the existing crop and orientation) to make a standard-colour WebP, leaving the original unchanged. Actual animated PNG/WebP files still require exporting the desired still image first.

Content hashes detect changed originals even when file dates stay the same. Unchanged artwork is skipped; changing conversion settings rebuilds available originals. Missing/damaged generated files are rebuilt if their originals are present. Different source extensions and subfolders get distinct output filenames.

Existing artwork keeps its position when edited or re-encoded. New images appear before existing ones, newest modification time first within that new batch. To rearrange artwork, reorder entries in `gallery.json`. Each entry can also contain `"alt": "A description of the artwork"` and `"caption": "Optional lightbox description"`; these survive rebuilds. Do not edit generated tiles in `index.html`.

Deleting an original does **not** remove its published artwork. This lets a checkout display all published images even without your local originals. If settings change while originals are absent, those images keep their existing WebP versions until the originals are restored. To deliberately remove artwork, move its original into `_archive/`, delete its entry from `gallery.json`, and delete the two WebP files referenced by that entry. Then rerun the update.

The initial migration preserved the original 30-image gallery order. The three images formerly inside `assets/images/repo/` were already excluded from the gallery and remain excluded in `temp_images/_archive/repo/`.

## Featured video

The reel is the focal point at the top right of the responsive masonry grid: it spans two columns alongside three narrower artwork columns on wide screens, with a soft frame and a serif “Outdoor drawing” title. Tablets use two artwork columns beside the reel. At 640 px and below, the reel is centred above a two-column artwork grid, capped at 360 px wide. Its 9:16 aspect ratio is preserved throughout. Replace `temp_images/video.MP4` and run the same launcher to update it. Source content hashes and video settings detect changes; a matching video/poster pair is skipped. URLs include content fingerprints so a replacement does not reuse an old cached reel.

The web copy is H.264 MP4, capped at 720 × 1280 and 30 fps, with AAC audio and fast-start metadata so playback can begin before the entire file is downloaded. It preserves the full clip and the source aspect ratio without cropping or enlarging. HDR/HLG/PQ sources are tone-mapped to standard BT.709 colour. The original remains untouched and ignored by Git. The first reel was compressed from 35.03 MB to approximately 5.77 MB.

Playback starts muted, loops, and stays inline on phones. Native controls let visitors pause, enable sound or expand the video. Autoplay is subject to browser settings and power-saving modes; the poster and controls remain available when blocked. Automatic playback pauses when the reel leaves view, the tab is hidden or an artwork lightbox opens; a visitor's manual pause is respected. Visitors who request reduced motion get manual playback instead.

Removing the original retains the published reel, as with artwork. To remove it deliberately, archive the original, remove `feature_video` from `gallery.json`, delete `assets/videos/feature.mp4` and `feature.webp`, and run the update again.
