# Poster gallery images

These WebP files are website copies of the user's originals in ignored `showcase/temp_assets/`. Originals are unchanged. Dates and event labels follow the user's supplied descriptions.

| Website basename | Original | Context |
| --- | --- | --- |
| `uzh-open-day-2025` | `design1.png` | 2025 UZH open day; research-group recruitment |
| `quantum-century-2025` | `design2.png` | 2025 Quantum Century Symposium |
| `uzh-open-day-2024` | `design3.jpg` | 2024 UZH open day; research-group recruitment |
| `sps-2025` | `design4.png` | 2025 SPS conference |
| `manep-2025` | `design5.png` | 2025 MaNEP conference |

Each poster has a `-preview.webp` version (long edge 1200 px, WebP quality 90) for the gallery and a larger `.webp` version (long edge at most 3200 px, quality 94) for reading fine text. Images are EXIF-oriented, transparency is composited onto white, and aspect ratios are preserved. Resizing uses Pillow's Lanczos filter; WebP uses method 6. Images are never cropped or upscaled. The large 2024 JPEG is a known 9930 × 14040 px image; a converter needs to allow this size explicitly.

Event context: https://www.physik.uzh.ch/de/Quantum25/Symposium.html
