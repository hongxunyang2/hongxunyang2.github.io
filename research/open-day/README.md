# Student-project pages for the UZH open day

Start with `research/open-day/index.html`. This is the short chooser intended as a single destination for a poster QR code.

## Pages

| Page | Folder | Focus |
| --- | --- | --- |
| Project chooser | `research/open-day/` | Three ways into the group; shared office invitation |
| Laue automation | `research/laue-automation/` | Robot control, sample photographs, computer vision and diffraction images |
| X-ray scattering | `research/x-ray-scattering/` | RIXS, diffraction, international experiments and structure refinement |
| Superconductors | `research/superconductors/` | Zero resistance, charge order, magnetic excitations, strain and field |

Each project folder contains `index.html`, `styles.css`, `script.js` and `assets/`. The project pages also use shared CSS from `open-day/`: `mobile.css`, `entrance.css`, and, where applicable, `interactive.css`. There are no frameworks, build steps, external fonts or CDN requirements. Text, images and demos work locally; external links lead to further reading or email. Navigation between projects assumes the sibling folder names above.

## Preview and publish

- Open any `index.html` directly in a browser, or serve the repository with a static HTTP server.
- Publish the four folders together under `research/` using the site's existing publishing process. The Research portal already links to the chooser and all three pages.
- If using the repository's GitHub Pages host, the intended chooser address is `https://hongxunyang2.github.io/research/open-day/`. Use the equivalent `/research/open-day/` path on the preferred custom domain if applicable.
- **Publishing was not performed as part of this change.** Verify the actual public chooser URL on a phone before encoding it into the poster QR code. A local file path cannot be used by visitors.
- If hosting in a different directory, change cross-page navigation and the QR target accordingly. The project content and local assets do not depend on their host.

## Editing

- Edit the copy in each page's `index.html`. The Bachelor’s and Master’s suggestions are ordinary HTML `<details>` elements.
- The base CSS and JavaScript live in each project folder. Shared phone layouts live in `mobile.css`; the interactive openings, compact project headers and mobile banner overlays live in `entrance.css`. Keep the `open-day/` folder alongside the project folders when publishing.
- Each project opens with its main interactive demo, followed by the banner, project facts and introduction. The lab brand in the header links back to the project chooser. Use ordinary document order rather than CSS ordering or scripted scrolling to preserve keyboard and screen-reader navigation.
- The X-ray page uses its own `labs.css` and `demos.js` for three playgrounds: animated collective motions at the top, a calculated 2D diffraction pattern after the introduction, and a synthetic spectrum-fitting puzzle before the measured LESCO example. The diffraction calculation runs when its section approaches the viewport; the opening animation pauses offscreen and honours reduced-motion preferences. The temporary comparison gallery remains in `research/temp-interactive/`.
- Laue screenshots and recordings are local copies of the existing showcase media. These show operator-driven controls; autonomous recognition and workflow coordination are prospective student work.
- The temperature demo is an idealised model with an example transition at 90 K. It is not measured data. Its normal-state resistance scale is arbitrary.
- EuAl₄ is identified as a magnetic comparison material, not a superconductor. Beamtime and travel are possibilities, not promises.
- Source/credit notes are in each project's `assets/README.md`. Optimized WebP images are the publishable assets; full-resolution generated originals are excluded from Git.

## Checks completed

- Local file references, image `srcset` candidates, anchors, unique IDs and accessible label references.
- JavaScript syntax and interaction logic: all Laue workflow buttons, all three excitation views, exclusive selected states, temperature range endpoints and the transition boundary.
- Fallback HTML explanations when JavaScript is unavailable; controls are keyboard accessible and reduced-motion preferences are respected.

Browser rendering and phone-layout inspection remain unverified: this session's browser and native screenshot preview tools failed, and local server binding was unavailable. No external publishing or Git push was performed.
