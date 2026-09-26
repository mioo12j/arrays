# Arrays Ingenieria — company website

Source for https://arraysingenieria.netlify.app/ (planned domain: www.arraysingenieria.com).

The original source was lost; this copy was recovered on 2026-09-26 by mirroring the
live deployment. It is plain static HTML/CSS/JS, so the files here are what gets served.

## Pages
- Core: `index.html`, `about.html`, `projects.html`, `gallery.html`, `recognition.html` (News & Media),
  `achievements.html`, `industries.html`, `insights.html`, `contact.html`, `privacy.html`, `terms.html`, `404.html`
- Services: `capex-solar-epc.html`, `solar-installation-commissioning.html`, `service-*.html`,
  `solar-for-tea-estates.html`
- Generated on every build (edit `tools/content.py`, not the HTML): the ten `project-*.html` case studies,
  `faq.html`, `clients.html`, `solar-glossary.html`, and `gallery.html` (from `tools/build.py`)

## What we are (keep all copy consistent with this)
Installation & commissioning (I&C), EPC and all civil works, on the CAPEX model (the client owns the plant).
We do not manufacture modules or inverters and do not offer OPEX/RESCO financing; for OPEX programmes
we work as the developer's I&C/EPC partner.

## After any edit: run the build
    python3 tools/build.py

It needs only Python 3 and rewrites the pages in place. It:
- bakes the shared header/footer into every page (edit them in `tools/build.py`, not in the pages)
- sets each page's title, description, canonical, Open Graph and Twitter tags (`PAGES` in `tools/build.py`)
- regenerates `gallery.html` from the `GALLERY` list and the video cards from `VIDEOS`
- adds image width/height and lazy-loading, regenerates `sitemap.xml` (with every image),
  `robots.txt` and `_redirects`
- checks every internal link, image and `#anchor`, and fails if anything is broken

### Adding a photo
1. Save it under `assets/photos/` (projects/events), `assets/news/` (clippings) or `assets/press/`
   with a descriptive file name, e.g. `barpatra-tea-estate-230kw-solar-plant.jpg`.
2. Add a line to `GALLERY` in `tools/build.py` with a caption and a descriptive alt text
   that names the place, the capacity and "Arrays Ingenieria".
3. Run `python3 tools/build.py`.

### Adding a case study
Add an entry to `PROJECTS` in `tools/content.py` (facts only, from the order, certificate or news report),
then run the build. It creates the page, adds it to the sitemap, the clients page and the related service pages.

### Adding a video or news link
Add an entry to `COVERAGE` in `tools/build.py`. It appears on the News & Media page, the home page,
the "featured in" strips and the structured data. Then run the build.

## Domain
`SITE_URL` at the top of `tools/build.py` is the address used in canonical tags, the
sitemap and social previews. **arraysingenieria.com is not registered yet.** Once it is
registered and added in Netlify, set `SITE_URL = "https://www.arraysingenieria.com"`,
run the build, and submit the new sitemap in Google Search Console.

## Run locally
    python3 -m http.server 8000     # from this folder, then open http://localhost:8000

## Deploy (Netlify)
Point the site at this repo with Base directory `website` (see `netlify.toml`). No build command.
