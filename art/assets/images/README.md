# art/assets/images

Drop saved artwork images here (exported from Instagram posts or highlights — both are treated the same, since highlights have no public embeddable URL).

- `.jpg` / `.jpeg` / `.png` / `.webp`.
- Any filename works — IG screenshot filenames are unpredictable, so the gallery doesn't rely on them for anything except sort order.

Then, from the repo root:

```
python3 art/update_gallery.py
```

This scans this folder, sorts images **newest-first by file modified time**, and regenerates the gallery tiles in `art/index.html` (between the `GALLERY:START`/`GALLERY:END` markers) automatically — one tile per image, no manual HTML editing. No captions are generated (unreliable filenames), just generic alt text (`"Artwork N"`) — hand-edit an individual tile's `alt` afterward if you want a nicer description, though rerunning the script will regenerate that tile and drop the edit.

If this folder is empty, the script falls back to 8 placeholder tiles instead.
