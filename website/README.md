# Ingenieria — company website

Source for https://arraysingenieria.netlify.app/ (canonical: https://www.arraysingenieria.com/).

The original source was lost; this copy was recovered on 2026-09-26 by mirroring the
live deployment. The site is plain static HTML/CSS/JS with no build step, so the
deployed files are the source.

- Pages: `index.html`, `about.html`, `service-*.html`, `projects.html`, `industries.html`,
  `achievements.html`, `recognition.html`, `insights.html`, `privacy.html`, `terms.html`, `404.html`
- Shared header/footer: `assets/js/components.js`; styles: `assets/css/style.css`
- Solar calculator: `assets/js/calculator.js` (PDF export via bundled `jspdf.umd.min.js`)

## Run locally
    cd website && python3 -m http.server 8000

## Deploy (Netlify)
Point the site at this repo with Base directory `website` (see `netlify.toml`).
