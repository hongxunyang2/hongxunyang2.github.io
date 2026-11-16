# A4 landscape open-day print sheets

Four independent HTML files, each with embedded CSS, JavaScript, full banner artwork and an exact vector QR code. No server, internet connection, external fonts or asset folders are required to display or print them. Website links and QR destinations naturally require internet access.

- `index.html`: light overview of all three projects, with the full Rococo painting visible beneath a translucent white mask, dark text and a glass-style QR card; QR opens the open-day chooser.
- `laue-automation.html`: Laue automation project.
- `x-ray-scattering.html`: X-ray scattering project.
- `superconductors.html`: superconductor project.

Open an HTML file in a browser and choose “Print this sheet”. Use A4, landscape, scale 100%, no extra margins, headers/footers off and background graphics on. The CSS already includes an 8 mm white safe border inside the physical 297 × 210 mm sheet. The print rules hide the toolbar and reserve one landscape page. The screen preview scales to the available window width; printing restores the physical dimensions.

All QRs use the simpler 33 × 33 pattern with medium error correction and a four-module quiet zone. For reliable printed contrast, the modules are dark green (#183b38) on a solid warm-white vector plate (#fffdf5), wrapped in the glass-style card. They open the same project URLs as the earlier coloured QRs. The overview code opens https://hongxunyang2.github.io/research/open-day/.

The overview retains the full-page Rococo painting. A translucent white gradient (68% on the left, 58% in the middle and 38% on the right) lightens it while preserving the artwork; a gentle white veil also softens the top and bottom. The QR remains dark green on pure white inside the translucent glass-style panel. The other three project sheets retain their original dark designs.

Banner paintings are the AI-generated artworks already made for the project landing pages. Liquid-glass styling uses a vector highlight/veil fallback, so the card remains visible when a print engine does not preserve backdrop blur. Text and QR geometry remain vector content when the browser saves to PDF.

Each file is self-contained and can be copied or hosted separately. Sources for exact QR destinations and print sizes are in destinations.json. Browser print-preview verification was unavailable in the creation session; check the preview and scan a printed proof before the final print.

The print artwork and white/dark masks use non-negative stacking layers, with the page content explicitly above them, to avoid browsers placing a negative layer behind the page background. Enable “Background graphics” / “Print backgrounds” in the browser print dialog to preserve the full styling.
