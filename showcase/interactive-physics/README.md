# Interactive physics

Open `index.html` for an interactive introduction to Xunyang Hong’s research.
The three topic pages cover Laue automation, X-ray scattering and superconductors.

This entire folder is self-contained: HTML, CSS, JavaScript, illustrations,
research figures, screenshots and videos are local copies. No files from
`research/`, the parent showcase, a CDN or an external font service are required.
It can be served at any static path or opened directly without a build step.
Links to the main showcase, publications and the group’s publication list are
optional external navigation.

Adapted from the UZH open-day pages, preserving their design and interactive
models while removing student recruitment and contact sections. The original
research pages remain independent. Shared responsive and demo styles live at
this folder’s root; topic-specific code and media live inside each topic folder.
Edits to the research originals do not automatically update these copies.

The superconductors opening couples the resistance graph and Meissner field
picture to one temperature slider. Its synthetic spectrum-fitting puzzle sits
before the measured LESCO example. Their code and styles are independent local
copies in `superconductors/`; the X-ray page links to the relocated puzzle.
