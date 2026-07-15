# Aditya Bhusal — Portfolio

> Personal portfolio website built with vanilla HTML, CSS, and JavaScript. Production-ready, fully responsive, and optimised for Lighthouse performance, accessibility, and SEO.

---

## Project Overview

A professional portfolio showcasing Aditya Bhusal's skills, projects, and contact information as a Full Stack Web Developer. The site is a single-page application with smooth scroll navigation, a mobile-first responsive layout, and dark-mode-first design using a custom design system.

---

## Features

- **Responsive design** — Tested at 320 px, 375 px, 425 px, 768 px, 1024 px, and 1440 px
- **Dark theme** — Curated colour palette with glassmorphism and glow accents
- **Smooth scroll navigation** — Section-based SPA with active-link highlighting
- **Mobile drawer** — Hamburger menu with `aria-expanded` and body-scroll lock
- **Skip-to-content link** — Keyboard accessibility best practice
- **Contact form** — Client-side validation with real-time inline errors and success feedback
- **Optimised transitions** — Explicit CSS property transitions (no `all`) for lower paint cost
- **SEO ready** — Full `<head>` meta, Open Graph, Twitter Card, canonical URL, sitemap, robots.txt
- **Lighthouse ready** — Semantic HTML5, ARIA labels, `focus-visible` states, `aria-hidden` on decoratives

---

## Tech Stack

| Layer | Technology |
|---|---|
| Markup | HTML5 (semantic) |
| Styling | Vanilla CSS (CSS Custom Properties, Grid, Flexbox, `clamp()`) |
| Interactivity | Vanilla JavaScript (ES2020+, no dependencies) |
| Icons | Font Awesome 6.4 (CDN) |
| Typography | Plus Jakarta Sans (Google Fonts) |
| Deployment | GitHub Pages / Vercel (static) |

---

## Folder Structure

```
level-1/portfolio/
├── index.html          # Single-page entry point
├── 404.html            # Custom 404 error page
├── robots.txt          # Crawler instructions
├── sitemap.xml         # XML sitemap
├── favicon.ico         # Browser tab icon (add before deploy)
├── apple-touch-icon.png# Apple touch icon (add before deploy)
├── og-image.png        # Open Graph share image (add before deploy)
├── css/
│   └── style.css       # All styles (1 file, organised by section)
├── js/
│   └── script.js       # All interactivity (nav, form validation)
├── images/             # Project screenshots and assets
└── fonts/              # Self-hosted font files (optional)
```

---

## Installation

No build step required. Clone and open directly.

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO/level-1/portfolio
```

---

## Running Locally

**Option 1 — VS Code Live Server (recommended)**
1. Install the [Live Server extension](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)
2. Right-click `index.html` → **Open with Live Server**

**Option 2 — Python HTTP server**
```bash
python -m http.server 5500
```
Then open `http://localhost:5500` in your browser.

**Option 3 — Node.js `serve`**
```bash
npx serve .
```

> ⚠️ Do **not** open `index.html` directly as a `file://` URL — some browser security policies may block CDN fonts and icons.

---

## Deployment

### GitHub Pages

1. Push the repository to GitHub.
2. Go to **Settings → Pages**.
3. Set **Source** to `main` branch, `/level-1/portfolio` folder (or root if you copy files there).
4. Your site will be live at `https://YOUR_USERNAME.github.io/YOUR_REPO/`.

### Vercel

1. Import the repository at [vercel.com/new](https://vercel.com/new).
2. Set **Root Directory** to `level-1/portfolio`.
3. Framework preset: **Other** (static).
4. Click **Deploy**.

> Before deploying, replace all `your-domain.com` placeholders in `index.html`, `robots.txt`, and `sitemap.xml` with your actual domain.

---

## Before Going Live — Checklist

- [ ] Replace `https://your-domain.com/` in `index.html`, `robots.txt`, `sitemap.xml`
- [ ] Replace `YOUR_USERNAME` GitHub/LinkedIn links with real handles
- [ ] Replace `your@email.com` with real email
- [ ] Add `favicon.ico` (32×32 px)
- [ ] Add `apple-touch-icon.png` (180×180 px)
- [ ] Add `og-image.png` (1200×630 px) for social sharing
- [ ] Add real resume PDF and update the Resume button `href`
- [ ] Update project GitHub links with real repo URLs
- [ ] Update `sitemap.xml` `<lastmod>` date

---

## Screenshots

> Replace placeholders with actual screenshots after deployment.

| Section | Preview |
|---|---|
| Hero | _screenshot pending_ |
| About | _screenshot pending_ |
| Skills | _screenshot pending_ |
| Projects | _screenshot pending_ |
| Contact | _screenshot pending_ |

---

## Future Improvements

- Add a real backend for the contact form (e.g., EmailJS, Formspree, or a Node.js API)
- Add project live-demo links once deployed
- Add a blog section
- Add dark/light mode toggle
- Add scroll-triggered entrance animations with `IntersectionObserver`
- Add a downloadable PDF resume

---

## Author

**Aditya Bhusal**
- GitHub: [@Rozer402](https://github.com/Rozer402)
- LinkedIn: [aditya-bhusal-baa2b6391](https://www.linkedin.com/in/aditya-bhusal-baa2b6391/)
- Email: adibhusal01@gmail.com

---

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).

```
MIT License

Copyright (c) 2026 Aditya Bhusal

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```
