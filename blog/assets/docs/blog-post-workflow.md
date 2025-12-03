# Blog Post Workflow Instructions

This document describes the workflow for converting markdown blog posts to HTML pages.

## Overview

1. User creates a markdown file in `blog/assets/md/`
2. AI converts it to HTML and places it in `blog/`
3. AI updates `blog/index.html` to include the new post

---

## Step 1: Read the Markdown File

Markdown files are located in `blog/assets/md/`. They follow this format:

```markdown
---
title: "Post Title"
date: YYYY-MM-DD
tags: [Tag1, Tag2]
---

Content goes here...
```

### Front Matter Fields
- `title`: The blog post title
- `date`: Publication date in YYYY-MM-DD format
- `tags`: Array of tags (used for categorization, e.g., `[AI]`, `[Physics]`, `[Academia]`)

### Inline Instructions
Look for `^guide for cursor` markers in the markdown. These are inline instructions for the AI, such as:
- Wrapping content in collapsible blocks
- Special formatting requests
- Remove these markers from the final HTML

---

## Step 2: Create the HTML File

Create the HTML file in `blog/` with the same base name as the markdown (e.g., `ai-restructure-code.md` → `ai-restructure-code.html`).

### HTML Template Structure

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>[Post Title] - Xun's Blog</title>
    <link rel="stylesheet" href="../assets/css/main.css">
    <link rel="stylesheet" href="assets/css/blog-portal.css">
    <link href="https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@400;500;600;700&family=Source+Sans+3:wght@400;500;600&display=swap" rel="stylesheet">
</head>
<body>
    <header>
        <nav>
            <div class="logo">Xun's Blog</div>
            <div class="nav-links">
                <a href="../index.html">Home</a>
                <a href="index.html">Blog</a>
            </div>
        </nav>
    </header>

    <!-- Banner Image -->
    <div class="article-banner">
        <img src="assets/images/[banner-image].png" alt="[Post Title]">
    </div>

    <main class="container">
        <section class="article-header">
            <h1>[Post Title]</h1>
            <div class="article-meta">
                <span class="post-tag">[Primary Tag]</span>
                <time datetime="YYYY-MM-DD">[Formatted Date]</time>
            </div>
        </section>

        <article class="article-content">
            <!-- Content goes here -->
        </article>
    </main>

    <footer>
        <div class="container">
            <div class="footer-content">
                <p>&copy; 2024 Xun's Blog</p>
                <div class="footer-links">
                    <a href="index.html">Back to Blog</a>
                </div>
            </div>
        </div>
    </footer>
</body>
</html>
```

---

## Step 3: Content Conversion Rules

### Text Content
- Paragraphs: Wrap in `<p>` tags
- Fix typos and grammar mistakes while maintaining content fidelity
- Do NOT change the meaning or add/remove information

### Code Elements
- Inline code (backticks): Use `<code>` tags
- Code blocks: Use `<pre class="code-block"><code>...</code></pre>`

### Images
- Referenced as `![](path)` in markdown
- Convert to: `<img src="path" alt="description" class="article-image">`
- Multiple images: Wrap in `<div class="image-gallery">...</div>`
- Image paths should be relative to the HTML file location

### Collapsible Blocks
For content that should be collapsible (often indicated by `^guide for cursor`):

```html
<details class="collapsible-block">
    <summary>
        Title of the Block
        <span class="collapsible-preview">— "Preview text..."</span>
    </summary>
    <div class="collapsible-content">
        <p>Content paragraphs here...</p>
    </div>
</details>
```

### Links
- Convert `[text](url)` to `<a href="url">text</a>`

### Headers
- `## Heading` → `<h2>Heading</h2>`
- `### Subheading` → `<h3>Subheading</h3>`

### Lists
- Ordered lists: `<ol class="numbered-list"><li>...</li></ol>`
- Unordered lists: `<ul><li>...</li></ul>`

### Horizontal Rules
- `---` in markdown → `<hr>` in HTML

---

## Step 4: Update blog/index.html

### Featured Post Section
If this is the newest/featured post, update the featured section:

```html
<section id="featured" class="blog-featured">
    <article class="featured-post">
        <div class="featured-post-meta">
            <span class="post-tag">[Tag]</span>
            <time datetime="YYYY-MM-DD">[Month Year]</time>
        </div>
        <h2>[Post Title]</h2>
        <p class="featured-excerpt">[First 2-3 sentences as excerpt]</p>
        <a href="[filename].html" class="read-more">Read more →</a>
    </article>
</section>
```

### Recent Thoughts Grid
Add the new post as a clickable card (use `<a>` tag, not `<article>`):

```html
<a href="[filename].html" class="blog-post-card">
    <div class="post-meta">
        <span class="post-tag">[Tag]</span>
        <time datetime="YYYY-MM-DD">[Month Year]</time>
    </div>
    <h3>[Post Title]</h3>
    <p>[Short description/excerpt]</p>
</a>
```

---

## Available CSS Classes

### Article Structure
- `.article-banner` - Full-width banner container
- `.article-header` - Centered header with title
- `.article-meta` - Tag and date container
- `.article-content` - Main content wrapper (max-width: 800px)

### Content Elements
- `.post-tag` - Magenta tag badge
- `.code-block` - Dark-themed code block
- `.image-gallery` - Container for multiple images
- `.article-image` - Styled image with hover effect
- `.collapsible-block` - Expandable content section
- `.collapsible-preview` - Italic preview text in summary
- `.collapsible-content` - Hidden content area
- `.numbered-list` - Styled ordered list

### Blog Index
- `.featured-post` - Featured article card
- `.blog-post-card` - Grid card for posts
- `.blog-grid` - Grid container

---

## File Locations Summary

| Type | Location |
|------|----------|
| Markdown source | `blog/assets/md/[name].md` |
| HTML output | `blog/[name].html` |
| Images | `blog/assets/images/` |
| CSS styles | `blog/assets/css/blog-portal.css` |
| Blog index | `blog/index.html` |

---

## Checklist

- [ ] Read markdown file and note front matter (title, date, tags)
- [ ] Look for `^guide for cursor` instructions
- [ ] Create HTML file with proper template
- [ ] Convert all content (paragraphs, code, images, etc.)
- [ ] Fix typos and grammar (maintain fidelity)
- [ ] Update `blog/index.html` featured section (if newest)
- [ ] Add post card to Recent Thoughts grid
- [ ] Verify image paths are correct

