# Arrays Ingenieria, company website

Source for https://arraysingenieria.netlify.app/ (planned domain: www.arraysingenieria.com).

The original source was lost; this copy was recovered on 2026-09-26 by mirroring the
live deployment. It is plain static HTML/CSS/JS, so the files here are what gets served.

## Pages and URLs
Every page lives in its own folder and is served at a clean URL: `about/index.html` is `/about/`.
Inside `tools/build.py` pages are still named by their old file name (`"about.html"`); the build maps
that to the folder, writes every internal link as `/about/`, and writes `_redirects` so old
addresses (`/about.html`, `/privacy.html`) 301 to the new ones.
- Core: `/` (`index.html`), `about/`, `projects/`, `gallery/`, `recognition/` (News & Media), `achievements/`,
  `industries/`, `insights/`, `contact/`, `privacy-policy/`, `terms/`, and `404.html` (served with a real 404 status)
- Services: `capex-solar-epc/`, `solar-installation-commissioning/`, `service-*/`, `solar-for-tea-estates/`
- Generated on every build (edit `tools/content.py`, not the HTML): the `project-*/` case studies,
  `faq/`, `clients/`, `solar-glossary/`, `insights/` and `gallery/`

## What the build enforces (it fails if any of these break)
Clean internal links and anchors, one `<h1>` per page, no skipped heading levels, a `<main>` landmark,
one canonical tag, titles of 50 to 60 characters, descriptions of 135 to 155, alt text on every image
and valid JSON-LD. It also writes `assets/css/style.min.css` (self-hosted fonts + styles) and
`assets/js/*.min.js`, makes WebP copies of photos under `assets/opt/` with `srcset`/`sizes`, preloads the
hero image and main fonts, and defers every script. Edit `style.css` and the `.js` sources, never the
`.min` files. Minification needs `pip install rcssmin rjsmin` (without them the build still works,
with lighter minification).

## What we are (keep all copy consistent with this)
Installation & commissioning (I&C), EPC and all civil works, on the CAPEX model (the client owns the plant).
We do not manufacture modules or inverters and do not offer OPEX/RESCO financing; for OPEX programmes
we work as the developer's I&C/EPC partner.

## After any edit: run the build
    python3 tools/build.py

It needs only Python 3 and rewrites the pages in place. It:
- bakes the shared header/footer into every page (edit them in `tools/build.py`, not in the pages)
- sets each page's title, description, canonical, Open Graph and Twitter tags (`PAGES` in `tools/build.py`)
- regenerates `gallery/` from the `GALLERY` list and the video cards from `VIDEOS`
- adds image width/height and lazy-loading, regenerates `sitemap.xml` (with every image),
  `robots.txt` and `_redirects`
- checks every internal link, image and `#anchor`, and fails if anything is broken

### Adding a photo
1. Save it under `assets/photos/` (projects/events), `assets/news/` (clippings) or `assets/press/`
   (or a per-event folder like `assets/borpatra/`) with an SEO file name that starts with the brand and
   names the plant, e.g. `arrays-ingenieria-ex-servicemen-led-borpatra-tea-estate-230kwp-solar-modules.jpg`.
   The build appends "Arrays Ingenieria (Ingenieria), ex-servicemen-led MSME" to any photo alt text that
   does not already name the company.
2. Add a line to `GALLERY` in `tools/build.py` with a caption and a descriptive alt text
   that names the place, the capacity and "Arrays Ingenieria".
3. Run `python3 tools/build.py`.

### Adding an insight (essay)
Add an entry to `INSIGHTS` in `tools/content.py` (title, summary, takeaways, paragraphs, sources with links).
The build regenerates `insights/` with BlogPosting structured data. Every number needs a source.

### Search engines and AI assistants
The build writes `sitemap.xml` (pages, images and videos), `robots.txt` (welcomes Google, Bing and AI
crawlers such as GPTBot, ClaudeBot and PerplexityBot) and `llms.txt` (a plain-language summary of the
company and every page, for AI assistants). Update the "Key facts" in `write_llms()` when facts change.

### Adding a case study
Add an entry to `PROJECTS` in `tools/content.py` (facts only, from the order, certificate or news report),
then run the build. It creates the page, adds it to the sitemap, the clients page and the related service pages.

### Adding a video or news link
Add an entry to `COVERAGE` in `tools/build.py`. It appears on the News & Media page, the home page,
the "featured in" strips and the structured data. Then run the build.

## Domain
`SITE_URL` at the top of `tools/build.py` is the address used in canonical tags, the
sitemap and social previews. **arraysingenieria.com is not registered yet.** Once it is
registered and added in Netlify, choose one primary form (for example `https://arraysingenieria.com`);
Netlify then 301-redirects the other form (www or non-www) and HTTP to it automatically. Set `SITE_URL`
to the same primary URL, run the build, and submit the new sitemap in Google Search Console.

## Run locally
    python3 tools/serve.py          # then open http://localhost:8766/

`serve.py` behaves like Netlify: clean URLs, the `_redirects` rules, the headers from `netlify.toml`
(including the Content-Security-Policy) and a real 404 page.

## Headers, privacy and forms
- `netlify.toml` sets HSTS, Content-Security-Policy, `X-Content-Type-Options: nosniff`,
  `X-Frame-Options: SAMEORIGIN`, Referrer-Policy and Permissions-Policy, plus long-term caching for
  CSS, JS and fonts. Netlify itself forces HTTPS and compresses with Brotli/Gzip.
- The site sets **no cookies** and loads nothing from other sites on page load. Posts from X, Facebook
  and Instagram are shown as cards; the platform's script loads only when a visitor clicks
  "Show the original post". If you add a new third-party service, add its host to the CSP and
  describe it in `privacy-policy/index.html`.
- The contact form posts to FormSubmit, which forwards it to arraysingenieria@gmail.com. The first
  submission from the live site triggers a one-time activation email from FormSubmit to that inbox:
  click the link in it, or enquiries will not arrive.

## Google Search Console
1. Add the property (`https://arraysingenieria.netlify.app/`, or the custom domain once live).
2. Verify by DNS, or paste the `content` value of the `google-site-verification` tag into
   `GSC_VERIFICATION` in `tools/build.py` and run the build.
3. Under Sitemaps, submit `sitemap.xml`.

## Deploy (Netlify)
Point the site at this repo with Base directory `website` (see `netlify.toml`). No build command:
run `python3 tools/build.py` and commit the result.
