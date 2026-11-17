# Standalone showcase

Deploy this entire folder as a static website. Set the hosting publish directory
to `showcase` when deploying from the parent repository. No build command,
package installation, or sibling project folder is required.

The overview, project pages, styles, JavaScript, images, videos, and CV are all
contained here. The pages use system serif and sans-serif fonts, so rendering
does not require Google Fonts or another font service.

The interactive crystal demo uses independent copies of its files:

- `assets/css/laue-demo.css`
- `assets/js/laue-model.js`
- `assets/js/laue-demo.js`

These copies do not load code from the research pages or GitHub Pages. Update
them here when changing the showcase demo; edits to the separate research demo
do not automatically change this version.

Links to the open-day website, art gallery, PyPI, publications, and course
materials intentionally open external destinations. They are navigation links,
not dependencies needed to display or run the showcase.
