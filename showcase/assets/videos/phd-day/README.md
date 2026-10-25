# PhD Day introduction

Source: `showcase/temp_assets/phd_day.mov` (ignored by Git; original unchanged).

The silent Mental Canvas animation introduces Xunyang through an illustrated timeline, the lab, synchrotron visits and an X-ray scattering experiment. Its opening self-portrait is used as the poster. The full-width player appears below the Lab control and Paintings & drawings panels on `showcase/index.html`.

| Property | Original | Website copy |
|---|---|---|
| Container / codec | MOV / H.264 | MP4 / H.264 |
| Dimensions / ratio | 1920 × 1080 / 16:9 | 1600 × 900 / 16:9 |
| Frame rate | 60 fps | 30 fps |
| Duration | 62.65 seconds | 62.67 seconds (frame rounding) |
| Size | 181,747,265 bytes (181.75 MB) | 6,906,885 bytes (6.91 MB) |
| Audio | Silent 24-bit PCM stereo track | Removed |

Encoding uses libx264, CRF 23, the slow preset, Lanczos resizing, 8-bit yuv420p and BT.709 colour. Fast-start metadata permits playback before the whole MP4 has downloaded. The film is not cropped, trimmed or sped up. The poster is a 1600 × 900 WebP at quality 90, taken at 1 second (20,742 bytes).

Both generated assets are committed. The page uses native controls and `preload="none"`; `showcase/assets/js/creative-video.js` starts muted playback when at least 25% of the player scrolls into view. It pauses below that threshold or when the tab is hidden, resumes from the same position on return, and respects a manual pause and reduced-motion preferences. A completed film is not automatically restarted. Before reaching the video, only its poster is loaded. If autoplay is blocked or scroll observation is unavailable, visitors can still press Play.

To regenerate from the repository root with FFmpeg:

```sh
ffmpeg -hide_banner -loglevel error -nostdin -y \
  -i showcase/temp_assets/phd_day.mov \
  -map 0:v:0 -map_metadata -1 -map_chapters -1 -an \
  -vf 'scale=1600:900:flags=lanczos,fps=30,setsar=1' \
  -c:v libx264 -preset slow -crf 23 -pix_fmt yuv420p \
  -color_primaries bt709 -color_trc bt709 -colorspace bt709 \
  -movflags +faststart showcase/assets/videos/phd-day/introduction.mp4

ffmpeg -hide_banner -loglevel error -nostdin -y -ss 1 \
  -i showcase/assets/videos/phd-day/introduction.mp4 \
  -frames:v 1 -c:v libwebp -quality 90 -compression_level 6 \
  showcase/assets/videos/phd-day/poster.webp
```
