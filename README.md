# Dispatch Blog — Symfony demo for Upsun

A small Symfony 7 application that simulates the **Dispatch** blog: an index of
articles and individual article pages. Articles are authored as **Markdown files
committed to this repository** — there is no database and no admin. It exists as
a clean demo project for Upsun internal users.

- **Backend:** Symfony 7 (PHP 8.5), Twig — no front-end framework. The only
  JavaScript is a small vanilla script that powers the light/dark switcher.
- **Content:** Markdown + YAML front matter under [`content/articles/`](content/articles/), rendered with [league/commonmark](https://commonmark.thephpleague.com/).
- **Design:** Tailwind CSS, themed with the Upsun / Dispatch design system (dark indigo hero, lime + blue accents, `Space Grotesk` / `Inter`).
- **Theming:** Light and dark modes. The site follows the visitor's OS
  `prefers-color-scheme` on first load; a switcher (top-right) lets them
  override it, and the choice is persisted in `localStorage`.

## Routes

| Method | Path                  | Page                          |
|--------|-----------------------|-------------------------------|
| GET    | `/`                   | Blog index (featured + grid)  |
| GET    | `/articles/{slug}`    | A single article              |

The `{slug}` is the Markdown filename without its extension.

## Project layout

```
content/articles/*.md          Articles (front matter + Markdown body)
src/Blog/Article.php           Immutable article DTO
src/Blog/ArticleRepository.php Reads & parses the Markdown files
src/Controller/BlogController.php
templates/                     Twig: base, partials, blog/index, blog/article
assets/styles/app.css          Tailwind source
assets/js/theme.js             Light/dark switcher source
public/build/app.css           Compiled stylesheet (committed)
public/build/theme.js          Served copy of the switcher script (committed)
tailwind.config.js             Design tokens
```

## Adding an article

Create `content/articles/my-slug.md` with front matter:

```markdown
---
title: "My article title"
description: "One-sentence summary shown on cards and meta tags."
author: "Jane Doe"
role: "Staff Engineer"
date: "2026-06-30"
category: "Platform Engineering"   # AI Engineering | Cloud Economics | Architecture | ...
tags: ["tag-one", "tag-two"]
featured: false                    # at most one featured article
---

Your Markdown body. Headings, lists, code blocks, blockquotes and tables
are all supported (GitHub-flavored Markdown).
```

Reading time is computed automatically from the body.

## Run locally

```bash
composer install

# Compile the stylesheet (downloads the standalone Tailwind CLI; no Node needed).
# A precompiled public/build/app.css is already committed, so this is only
# needed after changing templates or assets/styles/app.css.
curl -sSL -o tools/tailwindcss \
  https://github.com/tailwindlabs/tailwindcss/releases/download/v3.4.17/tailwindcss-macos-arm64
chmod +x tools/tailwindcss
./tools/tailwindcss -c tailwind.config.js -i assets/styles/app.css -o public/build/app.css --minify

# The switcher script needs no compilation — copy the source to the web root
# after editing it (a committed copy is already in place).
cp assets/js/theme.js public/build/theme.js

# Serve
symfony serve                                  # if the Symfony CLI is installed
php -S 127.0.0.1:8000 -t public public/router.php   # otherwise (clean URLs + static assets)
```

Then open <http://127.0.0.1:8000>.

> `public/router.php` is a dev-only helper so the built-in PHP server serves
> static assets and routes everything else through the front controller.

## Deploy on Upsun

[`.upsun/config.yaml`](.upsun/config.yaml) defines a single stateless PHP app
(no services required). The build hook runs `symfony-build` and then compiles
the Tailwind stylesheet with the standalone CLI, falling back to the committed
`public/build/app.css` if the binary can't be downloaded.
