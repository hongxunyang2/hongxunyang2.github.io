# JohanWeb manual-entry demo

Source: the **last video**, “Option 2: Manual Entry”, on the
[group website maintainer instructions](https://www.physik.uzh.ch/groups/chang/content_sub.php?p=website_maintainer).

Original URL: https://www.physik.uzh.ch/groups/chang/content/python/demo_johanweb_preprint_manual.mov

The original is retained locally at the ignored path
`showcase/temp_assets/website-maintainer/manual-entry.mov`.

| | Original | Web copy |
| --- | --- | --- |
| Format | QuickTime MOV / H.264 | MP4 / H.264, yuv420p |
| Dimensions | 2266 × 1402 | 1440 × 890, full frame |
| Duration | 38.543 seconds | 12.867 seconds (3× speed) |
| File size | 15,515,790 bytes | 651,383 bytes |
| Audio | None | None |
| Frame rate | Variable | 30 fps |

Fast-start metadata allows playback before the entire MP4 downloads. Speed is
baked into the file; the browser does not need to set a playback rate. The same
MP4 is reused on the overview and detail page. The overview starts muted when
25% visible, loops, pauses out of view and preserves manual pauses. Reduced
motion disables automatic playback. The detail page uses manual native controls.

Run from the repository root to regenerate the video and poster:

```sh
ffmpeg -i showcase/temp_assets/website-maintainer/manual-entry.mov \
  -an -vf 'setpts=(PTS-STARTPTS)/3,scale=1440:-2:flags=lanczos,fps=30' \
  -c:v libx264 -preset slow -crf 24 -pix_fmt yuv420p \
  -movflags +faststart -map_metadata -1 \
  showcase/assets/videos/website-maintainer/manual-entry-3x.mp4

ffmpeg -ss 12 -i showcase/temp_assets/website-maintainer/manual-entry.mov \
  -frames:v 1 -vf 'scale=1440:-2:flags=lanczos' -c:v libwebp -quality 85 \
  showcase/assets/videos/website-maintainer/poster.webp
```

The poster shows the populated form and figure before the update is submitted.
