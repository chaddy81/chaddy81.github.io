# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static personal blog/portfolio site deployed via GitHub Pages. The site presents blog posts about AI systems, MLOps, and software engineering.

## Development

**Local preview:** Open `index.html` directly in a browser - no build step required.

**Deployment:** Push to `main` branch triggers GitHub Pages deployment automatically.

## Architecture

Single-page static site with:
- `index.html` - Complete page structure with inline CSS variables and Tailwind classes
- `style.css` - Minimal custom styles (Tailwind handles most styling)
- `script.js` - Currently empty, reserved for future interactivity

**Styling approach:**
- Tailwind CSS via CDN (`https://cdn.tailwindcss.com`)
- CSS custom properties defined in `:root` for theming (colors: `--bg`, `--surface`, `--fg`, `--muted`, `--accent`, `--accent-2`, `--border`)
- Three custom font families: `.font-display` (Space Grotesk), `.font-body` (Plus Jakarta Sans), `.font-tech` (IBM Plex Mono)

**Interactive elements:**
- Filter buttons (`data-filter` attributes) for post categories (AI, Systems, MLOps, Frontend)
- `data-reveal` attributes on elements for scroll-triggered animations
- Post cards with `data-category` for filtering

## Git Branches

- `main` - Production (GitHub Pages source)
- `gh-pages` - Deployment target
- `go-api` - Separate branch with Go backend (not part of main site)
