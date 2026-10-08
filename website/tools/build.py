#!/usr/bin/env python3
"""
Ingenieria website, SEO build step.

Run from anywhere:   python3 tools/build.py
Re-running is safe (idempotent). It rewrites the .html files in place, then
regenerates gallery.html, sitemap.xml, robots.txt and _redirects, and finally
checks every internal link, image and #anchor. It exits non-zero on a broken link.

What it does to every page:
  * bakes the shared header + footer into the HTML (crawlers see every nav link)
  * sets one consistent <head> block: title, description, canonical, robots,
    Open Graph + Twitter tags, all on SITE_URL
  * normalises internal links to one URL per page ("/" for home, "page.html")
  * adds width/height/decoding/loading to every <img>, eager + high priority
    for the first (hero) image
  * adds a BreadcrumbList where a page has none

Edit PAGES for titles/descriptions, GALLERY for gallery photos, COVERAGE for
news, video and client-post coverage. Change SITE_URL once the custom domain is live.
"""
import html
import json
import os
import re
import struct
import sys
from datetime import date

# The site's public address. Used ONLY where search engines and social networks need a full
# URL: canonical tags, og:/twitter: tags, structured data, sitemap.xml, robots.txt and llms.txt.
# Links between pages are always root-relative ("/about/"), so the site works on any host.
# It must be an address that actually loads: today that is the Cloudflare Pages address. When
# arraysingenieria.com is bought and connected in Cloudflare, change this one line and rebuild.
SITE_URL = "https://arrays-9mj.pages.dev"
# Any of these in existing markup are rewritten to SITE_URL.
KNOWN_HOSTS = re.compile(r"https?://(?:(?:www\.)?arraysingenieria\.(?:com|netlify\.app)|arrays-9mj\.pages\.dev)")

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
JS_SOURCES = ("components", "main", "calculator", "india-map-data", "quote")


def _asset_version():
    """Short hash of the CSS, fonts and JS sources: changes whenever they change, so browsers never reuse stale files."""
    import hashlib
    h = hashlib.sha1()
    for rel in ["assets/css/fonts.css", "assets/css/style.css"] + [f"assets/js/{n}.js" for n in JS_SOURCES]:
        with open(os.path.join(ROOT, rel), "rb") as fh:
            h.update(fh.read())
    return h.hexdigest()[:8]


def write_min_assets():
    """style.min.css (fonts + styles) and *.min.js, minified. Pages load only the minified files."""
    try:
        import rcssmin, rjsmin
        cssmin, jsmin = rcssmin.cssmin, rjsmin.jsmin
    except ImportError:  # pip install rcssmin rjsmin for real minification; this fallback only trims comments/space
        cssmin = lambda c: re.sub(r"\s*([{};:,])\s*", r"\1", re.sub(r"/\*.*?\*/", "", c, flags=re.S))
        jsmin = lambda j: j
    css = "".join(open(os.path.join(ROOT, f"assets/css/{n}.css"), encoding="utf8").read() for n in ("fonts", "style"))
    open(os.path.join(ROOT, "assets/css/style.min.css"), "w", encoding="utf8").write(cssmin(css))
    for n in JS_SOURCES:
        src = open(os.path.join(ROOT, f"assets/js/{n}.js"), encoding="utf8").read()
        open(os.path.join(ROOT, f"assets/js/{n}.min.js"), "w", encoding="utf8").write(jsmin(src))


ASSET_VERSION = _asset_version()
BRAND = "Arrays Ingenieria"
TODAY = date.today().isoformat()

# ---------------------------------------------------------------- pages ----
# path: URL path; title <= 60 chars; desc <= ~158 chars; crumb: breadcrumb name.
PAGES = {
    "index.html": dict(path="/", crumb="Home",
        title="Arrays Ingenieria | Veteran-Led Solar EPC Company in India",
        desc="Veteran-led, ISO-certified solar installation & commissioning, EPC and civil works on the CAPEX model, for Tata Power, Jay Shree Tea and more across India."),
    "about.html": dict(path="/about.html", crumb="About",
        title="About Arrays Ingenieria | Veteran-Led Solar EPC, India",
        desc="Founded in 2018 by ex-servicemen and led by Lt. Gen. A.R. Prasad (Retd), Arrays Ingenieria is an ISO 9001/14001/45001-certified solar EPC company."),
    "projects.html": dict(path="/projects.html", crumb="Projects",
        title="Solar Projects Across India | Arrays Ingenieria Portfolio",
        desc="Solar EPC projects by Arrays Ingenieria: 300 MW SECI piling, 14.36 MW YIAPL, 10 MW DCM Hisar, Assam tea-estate solar plants and industrial rooftops."),
    "gallery.html": dict(path="/gallery.html", crumb="Gallery",
        title="Photo & Video Gallery | Arrays Ingenieria Solar Projects",
        desc="Photos and videos of Arrays Ingenieria solar power plants, inaugurations, awards, certifications and news coverage from Assam to Karnataka."),
    "recognition.html": dict(path="/recognition.html", crumb="News & Media",
        title="Arrays Ingenieria in the News | CM Inauguration, TV & Press",
        desc="Koomber solar plant inaugurated by Assam CM Dr Himanta Biswa Sarma; coverage on CMO Assam, The Sentinel, NE Reports, Prerna Bharati and Dainik Bhaskar."),
    "achievements.html": dict(path="/achievements.html", crumb="Achievements",
        title="Awards, Client Certificates & ISO | Arrays Ingenieria",
        desc="Client appreciation from Jay Shree Tea, Super Smelters & Bharat Petroleum, ISO 9001, 14001 & 45001 certification and work orders won by Arrays Ingenieria."),
    "industries.html": dict(path="/industries.html", crumb="Industries",
        title="Solar for Industry, Tea Estates & Homes | Arrays Ingenieria",
        desc="Solar power for every sector in India: factories, tea estates, commercial buildings, institutions, homes and government/PSU projects by Arrays Ingenieria."),
    "insights.html": dict(path="/insights.html", crumb="Insights",
        title="Solar Insights India 2026 | Arrays Ingenieria Guides",
        desc="India's solar in 2026: 164 GW installed, ALMM List-II, GST cut to 5%, CAPEX vs OPEX, PM Surya Ghar, PM-KUSUM and solar for Assam tea estates."),
    "service-ground-mount.html": dict(path="/service-ground-mount.html", crumb="Ground-Mount Solar",
        title="Ground-Mount Solar Power Plants | Arrays Ingenieria",
        desc="Utility and industrial ground-mount solar plants designed, built and commissioned across India by Arrays Ingenieria, from piling to grid connection."),
    "service-rooftop.html": dict(path="/service-rooftop.html", crumb="Rooftop Solar",
        title="Rooftop Solar EPC for Industry in India | Arrays Ingenieria",
        desc="On-grid RCC and metal-sheet rooftop solar for factories, institutions and businesses across India, installed and commissioned by Arrays Ingenieria."),
    "service-epc.html": dict(path="/service-epc.html", crumb="EPC Turnkey",
        title="Turnkey Solar EPC Contractor in India | Arrays Ingenieria",
        desc="Turnkey solar EPC from Arrays Ingenieria: engineering, procurement and construction under single-window responsibility, including Tata Power EPC projects."),
    "service-piling.html": dict(path="/service-piling.html", crumb="Pile Foundation",
        title="Solar Pile Foundation & Piling | Arrays Ingenieria",
        desc="Specialist solar pile-foundation and piling works by Arrays Ingenieria, proven on the 300 MW SECI park at Koppal and 5.5 MW Tata Motors, Jamshedpur."),
    "service-civil.html": dict(path="/service-civil.html", crumb="Civil & Fencing",
        title="Solar Civil Works, Fencing & Walls | Arrays Ingenieria",
        desc="Solar civil works by Arrays Ingenieria: pre-cast boundary walls, RCC works and chain-link fencing, including the 14.36 MW YIAPL project in Uttar Pradesh."),
    "service-om.html": dict(path="/service-om.html", crumb="O&M & Support",
        title="Solar O&M and Maintenance Services | Arrays Ingenieria",
        desc="Solar plant operations & maintenance, statutory compliance and lifecycle support from Arrays Ingenieria to keep every plant at peak output."),
    "privacy-policy.html": dict(path="/privacy-policy.html", crumb="Privacy Policy",
        title="Privacy Policy (DPDP, GDPR, CCPA) | Arrays Ingenieria",
        desc="How Arrays Ingenieria Pvt. Ltd. handles the details you send through our contact form: what we collect, why, how long we keep it, and your rights."),
    "terms.html": dict(path="/terms.html", crumb="Terms of Use",
        title="Terms of Use and Legal Notices | Arrays Ingenieria Pvt. Ltd.",
        desc="Terms for using the Arrays Ingenieria website: copyright in our brand and content, permitted use, scraping, liability, governing law and legal notices."),
    "404.html": dict(path=None, crumb=None,
        title="Page Not Found (404) | Arrays Ingenieria Solar EPC India",
        desc="Sorry, this page could not be found. Explore Arrays Ingenieria's solar projects, services, case studies and news, or contact our engineering team."),
}
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from content import (PROJECTS, FAQ, GLOSSARY, CLIENTS, LEADER_QUOTES, NATIONAL_FACTS, SCHEMES, TIMELINE,  # noqa: E402
                     PANCHAMRIT, PANCHAMRIT_URL, STATES, KOOMBER_ALBUM, BORPATRA_ALBUM, INSIGHTS)

PAGES.update({
    "capex-solar-epc.html": dict(path="/capex-solar-epc.html", crumb="CAPEX Solar EPC", parent="services",
        title="CAPEX Solar EPC Company in India | Arrays Ingenieria",
        desc="Own your solar plant outright. Arrays Ingenieria designs, supplies, builds and commissions rooftop and ground-mount solar on the CAPEX model."),
    "solar-installation-commissioning.html": dict(path="/solar-installation-commissioning.html", crumb="Installation & Commissioning",
        parent="services", title="Solar Installation & Commissioning (I&C) | Arrays Ingenieria",
        desc="Solar I&C for EPC companies, developers and plant owners: structures, modules, cabling, earthing, testing and commissioning by veteran-led crews."),
    "solar-for-tea-estates.html": dict(path="/solar-for-tea-estates.html", crumb="Solar for Tea Estates", parent="industries",
        title="Solar Power for Tea Estates in Assam | Arrays Ingenieria",
        desc="19 on-grid solar plants built in Assam's tea gardens for Jay Shree Tea and Goodricke: ground-mount solar with DG sync and net-metering."),
    "faq.html": dict(path="/faq.html", crumb="FAQ",
        title="Solar EPC FAQs: CAPEX, I&C & Civil Works | Arrays Ingenieria",
        desc="Answers on CAPEX solar, installation & commissioning, civil works, DG synchronisation, net-metering and working with Arrays Ingenieria."),
    "clients.html": dict(path="/clients.html", crumb="Clients & Partners",
        title="Clients & Partners | Arrays Ingenieria Solar EPC India",
        desc="Arrays Ingenieria's clients and partners: Tata Power, Jay Shree Tea (BK Birla Group), Goodricke, Sustvest, Super Smelters, Tata Motors and more."),
    "solar-glossary.html": dict(path="/solar-glossary.html", crumb="Solar Glossary",
        title="Solar Glossary: EPC, CAPEX, I&C Terms | Arrays Ingenieria",
        desc="Plain-English definitions of solar terms: EPC, I&C, CAPEX vs OPEX, net metering, kWp, ALMM, pile foundations, DG synchronisation and more."),
    "ex-servicemen-led-msme.html": dict(path="/ex-servicemen-led-msme.html", crumb="Ex-Servicemen-Led MSME",
        title="Ex-Servicemen-Led Solar EPC MSME | Arrays Ingenieria",
        desc="Arrays Ingenieria is an ex-servicemen-led MSME founded by Lt. Gen. A.R. Prasad (Retd): Olive Green to Go Green, a second innings of national service."),
    "solar-schemes-india.html": dict(path="/solar-schemes-india.html", crumb="Solar Schemes in India",
        title="Government Solar Schemes in India 2026 | Arrays Ingenieria",
        desc="Solar schemes in India 2026: PM Surya Ghar, PM-KUSUM deadlines, ALMM List-II, GST at 5%, Assam tea-garden solar, depreciation and net metering."),
    "leadership.html": dict(path="/leadership.html", crumb="Message from the Leadership",
        title="Message from the Leadership | Arrays Ingenieria Solar",
        desc="A message from Lt. Gen. A.R. Prasad (Retd), AVSM, VSM, ADC, Ph.D, Chief Executive Officer of Arrays Ingenieria, the ex-servicemen-led solar MSME."),
    "how-it-works.html": dict(path="/how-it-works.html", crumb="How It Works",
        title="How It Works: Your Solar Project | Arrays Ingenieria",
        desc="How a solar project with Arrays Ingenieria works: how solar makes power, CAPEX vs I&C, each step from site survey to commissioning, and who owns what."),
    "quality-safety.html": dict(path="/quality-safety.html", crumb="Quality & Safety",
        title="Quality, Safety & Environment (ISO) | Arrays Ingenieria",
        desc="ISO 9001, ISO 14001 and ISO 45001 certified: how Arrays Ingenieria's veteran-led teams build solar plants safely, to quality and with care for the site."),
    "where-we-work.html": dict(path="/where-we-work.html", crumb="Where We Work",
        title="Where We Work: Solar Projects by State | Arrays Ingenieria",
        desc="Arrays Ingenieria's solar projects across Assam, West Bengal, Bihar, Jharkhand, Uttar Pradesh, Uttarakhand, Haryana and Karnataka, state by state."),
    "free-solar-quote.html": dict(path="/free-solar-quote.html", crumb="Free Solar Quote",
        title="Get a Free Solar Quote | Arrays Ingenieria Solar EPC",
        desc="Free, no-obligation solar quote from Arrays Ingenieria: CAPEX solar EPC, installation & commissioning and civil works. Three quick questions, one engineer."),
    "contact.html": dict(path="/contact.html", crumb="Contact",
        title="Contact Arrays Ingenieria | Solar EPC, Greater Noida",
        desc="Contact Arrays Ingenieria for solar EPC, installation & commissioning or civil works. Corporate office Greater Noida, branch office Madhubani, Bihar."),
})
for _p in PROJECTS:
    PAGES[_p["file"]] = dict(path="/" + _p["file"], crumb=_p["short"], parent="projects", title=_p["title"], desc=_p["desc"])


def write_page(fname, html_text):
    os.makedirs(os.path.dirname(page_path(fname)), exist_ok=True)
    open(page_path(fname), "w", encoding="utf8").write(html_text)


def page_url(fname):
    """Clean, folder-style URL of a page: /about/ (no .html, always a trailing slash)."""
    return "/" if fname == "index.html" else "/" + fname[:-5] + "/"


def page_path(fname):
    """Where a page lives on disk: about.html -> about/index.html, so the server needs no rewrites."""
    if fname in ("index.html", "404.html"):
        return os.path.join(ROOT, fname)
    return os.path.join(ROOT, fname[:-5], "index.html")


for _f, _m in PAGES.items():
    if _m["path"]:
        _m["path"] = page_url(_f)
PARENTS = {"services": ("Services", "/#services"), "projects": ("Projects", "/projects/"),
           "industries": ("Industries", "/industries/")}
SERVICE_PAGES = [p for p in PAGES if p.startswith("service-")]
for _p in SERVICE_PAGES:
    PAGES[_p].setdefault("parent", "services")

# ------------------------------------------------------------ gallery ----
# (src, categories, caption, alt). Captions are visible text; alt describes the image.
GALLERY_CATS = [
    ("cm", "CM Inauguration, Koomber"),
    ("borpatra", "Borpatra Inauguration"),
    ("projects", "Solar Projects"),
    ("events", "Inaugurations & Events"),
    ("media", "News & Media"),
    ("leadership", "Leadership & Honours"),
    ("certificates", "Awards & Certifications"),
    ("orders", "Work Orders"),
]
GALLERY = [
    ("assets/photos/arrays-ingenieria-ex-servicemen-led-orangajuli-tea-estate-450kwp-solar-inauguration-ribbon.jpg", "projects events",
     "Orangajuli Tea Estate, Udalguri (Assam): 450 kW ground-mount solar plant inaugurated on Janmashtami 2026",
     "Ribbon-cutting at the 450 kW Orangajuli Tea Estate solar plant in Udalguri, Assam, built by Arrays Ingenieria (still from NE Reports video)"),
    ("assets/photos/arrays-ingenieria-seci-300mw-koppal-karnataka-solar-pile-foundation.jpg", "projects", "SECI 300 MW solar park: pile-foundation works, Koppal, Karnataka",
     "SECI 300 MW solar park pile-foundation works at Koppal, Karnataka by Arrays Ingenieria"),
    ("assets/photos/arrays-ingenieria-yiapl-14-36mw-solar-civil-works-fencing-uttar-pradesh.jpg", "projects", "YIAPL 14.36 MW solar project: supply, civil works & chain-link fencing, Uttar Pradesh",
     "YIAPL 14.36 MW solar power project civil works and fencing in Uttar Pradesh by Arrays Ingenieria"),
    ("assets/photos/arrays-ingenieria-dcm-hisar-10mw-ground-mount-solar-civil-works.jpg", "projects", "DCM Hisar: 10 MW ground-mount solar & civil works, Haryana",
     "DCM Hisar 10 MW ground-mount solar project in Haryana, Arrays Ingenieria solar EPC"),
    ("assets/photos/arrays-ingenieria-tata-motors-jamshedpur-5-5mw-solar-piling.jpg", "projects", "Tata Motors, Jamshedpur: 5.5 MW solar piling & civil works",
     "Tata Motors 5.5 MW solar piling and civil works in Jamshedpur by Arrays Ingenieria"),
    ("assets/photos/arrays-ingenieria-super-smelters-1980kwp-solar-plant-asansol.jpg", "projects", "Super Smelters Ltd., Asansol: 1980.3 kWp solar plant with Tata Power Solar",
     "Super Smelters 1980.3 kWp industrial solar plant in Asansol by Arrays Ingenieria with Tata Power Solar"),
    ("assets/photos/arrays-ingenieria-jayshree-tea-estate-1mw-ground-mount-solar-sonari-assam.jpg", "projects", "Jayshree Tea Estate, Sonari (Assam): 1 MW ground-mount on-grid solar",
     "Jayshree Tea Estate 1 MW ground-mount solar plant in Sonari, Assam by Arrays Ingenieria"),
    ("assets/photos/arrays-ingenieria-towkok-tea-estate-535kwp-ground-mount-solar-assam.jpg", "projects", "Towkok Tea Estate, Assam: 535 kWp ground-mount on-grid solar",
     "Towkok Tea Estate 535 kWp ground-mount solar plant in Assam by Arrays Ingenieria"),
    ("assets/photos/arrays-ingenieria-manjushree-tea-estate-500kwp-ground-mount-solar-assam.jpg", "projects", "Manjushree Tea Estate, Assam: 500 kWp ground-mount on-grid solar",
     "Manjushree Tea Estate 500 kWp ground-mount solar plant in Assam by Arrays Ingenieria"),
    ("assets/photos/arrays-ingenieria-assam-1711kwp-on-grid-rooftop-solar.jpg", "projects", "1711.66 kWp on-grid rooftop solar PV, Assam",
     "1711.66 kWp on-grid rooftop solar PV plant in Assam by Arrays Ingenieria"),
    ("assets/photos/arrays-ingenieria-jay-shree-tea-1035kwp-grid-connected-solar.jpg", "projects", "1035 kWp grid-connected solar power generation system",
     "1035 kWp grid-connected solar power system by Arrays Ingenieria"),
    ("assets/photos/arrays-ingenieria-appl-kakajan-tea-estate-solar-assam.jpg", "projects", "APPL Kakajan Tea Estate, Assam: solar project",
     "APPL Kakajan Tea Estate solar project in Assam by Arrays Ingenieria"),
    ("assets/photos/arrays-ingenieria-tata-motors-pantnagar-solar-carport.jpg", "projects", "Tata Motors, Pantnagar: solar carport / parking shed",
     "Tata Motors Pantnagar solar carport built by Arrays Ingenieria"),
    ("assets/photos/arrays-ingenieria-balaji-action-tesa-sitarganj-rooftop-solar.jpg", "projects", "Balaji Action Tesa, Sitarganj: rooftop solar",
     "Balaji Action Tesa rooftop solar project in Sitarganj by Arrays Ingenieria"),
    ("assets/photos/arrays-ingenieria-tata-steel-noamundi-jharkhand-solar.jpg", "projects", "Tata Steel, Noamundi (Jharkhand): solar project",
     "Tata Steel solar project at Noamundi, Jharkhand by Arrays Ingenieria"),
    ("assets/photos/arrays-ingenieria-ramnagar-uttarakhand-ground-mount-solar.jpg", "projects", "Ramnagar, Uttarakhand: ground-mount solar project",
     "Ramnagar ground-mount solar project in Uttarakhand by Arrays Ingenieria"),
    ("assets/photos/arrays-ingenieria-utility-scale-ground-mount-solar-power-plant.jpg", "projects", "Utility-scale ground-mount solar power plant",
     "Utility-scale ground-mount solar power plant built by Arrays Ingenieria"),
    ("assets/photos/arrays-ingenieria-industrial-rooftop-solar-array.jpg", "projects", "Large industrial rooftop solar array",
     "Large industrial rooftop solar array installed by Arrays Ingenieria"),
    ("assets/photos/arrays-ingenieria-rooftop-solar-installation-clean-power.jpg", "projects", "Completed rooftop solar installation generating clean power",
     "Completed rooftop solar installation by Arrays Ingenieria generating clean power"),
    ("assets/photos/arrays-ingenieria-tata-motors-jamshedpur-precast-boundary-wall.jpg", "projects", "Pre-cast boundary wall for Tata Motors, Jamshedpur",
     "Pre-cast boundary wall civil works for Tata Motors, Jamshedpur by Arrays Ingenieria"),
    ("assets/photos/arrays-ingenieria-madhepura-bihar-solar-pile-foundation-fencing.jpg", "projects", "Solar pile foundation & chain-link fencing, Madhepura, Bihar",
     "Solar pile foundation and chain-link fencing in Madhepura, Bihar by Arrays Ingenieria"),
    ("assets/photos/arrays-ingenieria-solar-plant-earthing-electrical-safety-works.jpg", "projects", "Earthing & electrical safety works on a solar plant",
     "Solar plant earthing and electrical safety works by Arrays Ingenieria"),
    ("assets/press/arrays-ingenieria-super-smelters-1980kwp-solar-inauguration-tata-power-solar.jpg", "events", "1980.3 kWp solar plant inauguration with Tata Power Solar",
     "Inauguration of the 1980.3 kWp solar plant built by Arrays Ingenieria with Tata Power Solar"),
    ("assets/photos/arrays-ingenieria-solar-power-plant-inauguration-ceremony.jpg", "events", "Solar power plant inauguration ceremony",
     "Solar power plant inauguration ceremony, Arrays Ingenieria"),
    ("assets/press/arrays-ingenieria-solar-plant-commissioning-ceremony.jpg", "events", "Switching on clean power: solar plant commissioning",
     "Solar power plant commissioning ceremony, Arrays Ingenieria"),
    ("assets/press/arrays-ingenieria-solar-project-ground-breaking-ceremony.jpg", "events", "Ground-breaking ceremony for a solar project",
     "Ground-breaking ceremony for an Arrays Ingenieria solar project"),
    ("assets/news/arrays-ingenieria-koomber-595kwp-solar-cm-inauguration-prerna-bharati.jpg", "media cm",
     "Prerna Bharati, 2 Oct 2026: Arrays Ingenieria welcomes the Chief Minister at the Koomber solar plant inauguration",
     "Prerna Bharati Hindi newspaper report on the 595 kWp Koomber Tea Garden solar plant inauguration with Arrays Ingenieria"),
    ("assets/news/arrays-ingenieria-koomber-595kwp-solar-cm-inauguration-azad-sipahi.jpg", "media cm",
     "Azad Sipahi, Ranchi, 3 Oct 2026: solar power plant inaugurated at Assam's Koomber tea garden",
     "Azad Sipahi Hindi newspaper report on the Koomber Tea Garden solar plant inauguration with Arrays Ingenieria"),
    ("assets/news/prerna-bharati-orangajuli-450kw-solar-ingenieria.jpg", "media",
     "Prerna Bharati, 5 Sep 2026: veteran-led Arrays Ingenieria commissions 450 kW solar plant at Orangajuli Tea Estate, Assam",
     "Prerna Bharati Hindi newspaper report on the 450 kW solar plant built by Arrays Ingenieria at Orangajuli Tea Estate, Udalguri, Assam"),
    ("assets/news/barpatra-tea-estate-230kw-solar-ingenieria.jpg", "media",
     "25 Sep 2026: 230 kW on-grid solar plant starts at Barpatra Tea Estate (Goodricke Group), Sonari, Assam",
     "Hindi newspaper report on the 230 kW solar plant built by Arrays Ingenieria at Barpatra Tea Estate, Sonari, Assam"),
    ("assets/news/arrays-ingenieria-borpatra-tea-estate-230kwp-solar-newspaper-print.jpg", "media",
     "Print edition: Barpatra Tea Estate 230 kW solar plant, Dibrugarh/Sonari, 25 Sep 2026",
     "Printed Hindi newspaper page on the Barpatra Tea Estate 230 kW solar plant by Arrays Ingenieria"),
    ("assets/news/arrays-ingenieria-tcpl-vaishali-319kwp-rooftop-solar-dainik-bhaskar.jpg", "media", "Dainik Bhaskar: 319 kWp rooftop solar at TCPL Greenery Agro (Tata Consumer), Vaishali",
     "Dainik Bhaskar report on the 319 kWp rooftop solar plant by Arrays Ingenieria in Vaishali, Bihar"),
    ("assets/news/arrays-ingenieria-super-smelters-1980kwp-solar-inauguration-newspaper.jpg", "media", "1980.3 kWp solar plant inaugurated at Super Smelters with Tata Power Solar",
     "Newspaper report on the 1980.3 kWp Super Smelters solar plant inauguration, Arrays Ingenieria"),
    ("assets/news/arrays-ingenieria-super-smelters-jamuria-rooftop-solar-newspaper.jpg", "media", "Jamuria: 1980.3 kWp rooftop solar plant inaugurated at Super Smelters",
     "Newspaper report on the Super Smelters rooftop solar plant in Jamuria by Arrays Ingenieria"),
    ("assets/press/arrays-ingenieria-lt-gen-ar-prasad-india-today-analysis.jpg", "media", "India Today: expert analysis on the India–China faceoff",
     "Lt. Gen. A.R. Prasad (Retd), founder of Arrays Ingenieria, on India Today"),
    ("assets/press/arrays-ingenieria-lt-gen-ar-prasad-aaj-tak-panel.jpg", "media", "Aaj Tak: prime-time national debate panellist",
     "Lt. Gen. A.R. Prasad (Retd) of Arrays Ingenieria on an Aaj Tak prime-time debate"),
    ("assets/press/arrays-ingenieria-lt-gen-ar-prasad-india-tv-analysis.jpg", "media", "India TV: border & defence coverage",
     "Lt. Gen. A.R. Prasad (Retd) of Arrays Ingenieria on India TV"),
    ("assets/press/arrays-ingenieria-lt-gen-ar-prasad-aaj-tak-breaking-news.jpg", "media", "Aaj Tak: breaking-news analysis",
     "Lt. Gen. A.R. Prasad (Retd) of Arrays Ingenieria on Aaj Tak breaking news"),
    ("assets/press/arrays-ingenieria-ceo-lt-gen-ar-prasad-honoured-by-president-of-india.jpg", "leadership", "Honoured by the President of India",
     "Lt. Gen. A.R. Prasad (Retd), CEO of Arrays Ingenieria, honoured by the President of India"),
    ("assets/press/arrays-ingenieria-ceo-lt-gen-ar-prasad-rashtrapati-bhavan.jpg", "leadership", "Welcomed at Rashtrapati Bhavan",
     "Lt. Gen. A.R. Prasad (Retd) of Arrays Ingenieria welcomed at Rashtrapati Bhavan"),
    ("assets/press/arrays-ingenieria-ceo-lt-gen-ar-prasad-with-pm-narendra-modi.jpg", "leadership", "With Prime Minister Shri Narendra Modi",
     "Lt. Gen. A.R. Prasad (Retd) of Arrays Ingenieria with Prime Minister Shri Narendra Modi"),
    ("assets/press/arrays-ingenieria-ceo-lt-gen-ar-prasad-with-defence-minister-rajnath-singh.jpg", "leadership", "With Defence Minister Shri Rajnath Singh",
     "Lt. Gen. A.R. Prasad (Retd) of Arrays Ingenieria with Defence Minister Shri Rajnath Singh"),
    ("assets/press/arrays-ingenieria-ceo-lt-gen-ar-prasad-national-ceremonial-event.jpg", "leadership", "At a national ceremonial event",
     "Lt. Gen. A.R. Prasad (Retd) of Arrays Ingenieria at a national ceremonial event"),
    ("assets/press/arrays-ingenieria-founder-lt-gen-ar-prasad-defcom-india-keynote.jpg", "leadership", "Keynote at DEFCOM India",
     "Lt. Gen. A.R. Prasad (Retd) of Arrays Ingenieria delivering the keynote at DEFCOM India"),
    ("assets/press/arrays-ingenieria-ceo-lt-gen-ar-prasad-meeting-national-leadership.jpg", "leadership", "Meeting national leadership",
     "Lt. Gen. A.R. Prasad (Retd) of Arrays Ingenieria meeting national leadership"),
    ("assets/press/arrays-ingenieria-founder-ceo-lt-gen-ashish-ranjan-prasad-retd.jpg", "leadership", "A distinguished military career",
     "Lt. Gen. A.R. Prasad (Retd), founder of Arrays Ingenieria, at his command office"),
    ("assets/press/arrays-ingenieria-ceo-lt-gen-ar-prasad-armed-forces-ceremony.jpg", "leadership", "Armed forces ceremony",
     "Lt. Gen. A.R. Prasad (Retd) of Arrays Ingenieria at an armed-forces ceremony"),
    ("assets/press/arrays-ingenieria-ceo-lt-gen-ar-prasad-with-fellow-officers.jpg", "leadership", "With fellow officers",
     "Lt. Gen. A.R. Prasad (Retd) of Arrays Ingenieria with fellow officers"),
    ("assets/press/arrays-ingenieria-ceo-lt-gen-ar-prasad-felicitated.jpg", "leadership", "Felicitation & honours",
     "Lt. Gen. A.R. Prasad (Retd) of Arrays Ingenieria being felicitated"),
    ("assets/press/arrays-ingenieria-leadership-national-celebration.jpg", "leadership", "A national celebration",
     "Arrays Ingenieria leadership at a national celebration"),
    ("assets/press/arrays-ingenieria-leadership-milestone-celebration.jpg", "leadership", "Celebrating a milestone",
     "Arrays Ingenieria leadership celebrating a milestone"),
    ("assets/certs/arrays-ingenieria-iso-9001-certificate.jpg", "certificates", "ISO 9001:2015 Quality Management System",
     "ISO 9001:2015 quality management certificate of Arrays Ingenieria Pvt. Ltd."),
    ("assets/certs/arrays-ingenieria-iso-14001-certificate.jpg", "certificates", "ISO 14001:2015 Environmental Management System",
     "ISO 14001:2015 environmental management certificate of Arrays Ingenieria Pvt. Ltd."),
    ("assets/certs/arrays-ingenieria-iso-45001-certificate.jpg", "certificates", "ISO 45001:2018 Occupational Health & Safety",
     "ISO 45001:2018 occupational health and safety certificate of Arrays Ingenieria Pvt. Ltd."),
    ("assets/certs/arrays-ingenieria-india-5000-msme-award.jpg", "certificates", "India 5000 Best MSME Awards: nomination for quality excellence (2024)",
     "India 5000 Best MSME Award for Quality Excellence nomination, Arrays Ingenieria Pvt. Ltd."),
    ("assets/certs/goodricke-appreciation-koomber-595kwp-arrays-ingenieria.jpg", "certificates cm",
     "Goodricke: Certificate of Appreciation, installation & commissioning of 595 kWp at Koomber Tea Garden",
     "Goodricke certificate of appreciation to Arrays Ingenieria for the 595 kWp Koomber Tea Garden solar plant"),
    ("assets/certs/goodricke-appreciation-borpatra-230kwp-arrays-ingenieria.jpg", "certificates",
     "Goodricke: Certificate of Appreciation, installation & commissioning of 230 kWp at Borpatra Tea Garden",
     "Goodricke certificate of appreciation to Arrays Ingenieria for the 230 kWp Borpatra Tea Garden solar plant"),
    ("assets/certs/arrays-ingenieria-jay-shree-tea-towkok-535kwp-certificate-of-appreciation.jpg", "certificates", "Jay Shree Tea (BK Birla Group): appreciation for 535 kWp Towkok solar",
     "Jay Shree Tea certificate of appreciation to Arrays Ingenieria for the 535 kWp Towkok solar plant"),
    ("assets/certs/arrays-ingenieria-jay-shree-tea-500kwp-certificate-of-appreciation.jpg", "certificates", "Jay Shree Tea: appreciation for 500 kWp ground-mount solar",
     "Jay Shree Tea certificate of appreciation to Arrays Ingenieria for a 500 kWp solar plant"),
    ("assets/certs/arrays-ingenieria-super-smelters-certificate-of-appreciation.jpg", "certificates", "Super Smelters Ltd.: letter of appreciation, 1980.3 kWp solar",
     "Super Smelters Ltd. letter of appreciation to Arrays Ingenieria for the 1980.3 kWp solar plant"),
    ("assets/certs/arrays-ingenieria-bharat-petroleum-certificate-of-appreciation.jpg", "certificates", "Bharat Petroleum: appreciation for RCC rooftop on-grid solar",
     "Bharat Petroleum certificate of appreciation to Arrays Ingenieria for rooftop solar"),
    ("assets/orders/arrays-ingenieria-tata-power-seci-koppal-work-order.jpg", "orders", "Tata Power (TPREL): pile-foundation works, 300 MW SECI, Koppal",
     "Tata Power work order to Arrays Ingenieria for SECI 300 MW solar pile foundation"),
    ("assets/orders/arrays-ingenieria-tata-power-dcm-hisar-work-order.jpg", "orders", "Tata Power: civil works, 10 MW DCM Textile, Hisar",
     "Tata Power work order to Arrays Ingenieria for DCM Hisar 10 MW solar civil works"),
    ("assets/orders/arrays-ingenieria-tata-power-tata-motors-jamshedpur-work-order.jpg", "orders", "Tata Power: piling & civil works, 5.5 MW Tata Motors, Jamshedpur",
     "Tata Power work order to Arrays Ingenieria for Tata Motors 5.5 MW solar"),
    ("assets/orders/arrays-ingenieria-jay-shree-tea-1035kwp-purchase-order.jpg", "orders", "Jay Shree Tea: purchase order for 1035 kWp grid-connected solar",
     "Jay Shree Tea purchase order to Arrays Ingenieria for 1035 kWp grid-connected solar"),
    ("assets/orders/arrays-ingenieria-sustvest-assam-solar-purchase-order.jpg", "orders", "SolarGridX / Sustvest: purchase order for 1711.66 kWp on-grid solar, Assam",
     "Purchase order to Arrays Ingenieria for 1711.66 kWp on-grid solar in Assam"),
]

# ----------------------------------------------------------- coverage ----
# Every place Arrays Ingenieria has been reported on. One list drives the
# News & Media page, the home-page "In the News" section, the "featured in"
# strips, the gallery videos and the structured data. Quotes are verbatim from
# the source; keep them that way. kind: tv | online | print | client.
# date: ISO (YYYY-MM-DD or YYYY-MM) or None when the source shows no date.
COVERAGE = [
    dict(id="prerana-bharati-koomber-video", kind="tv", outlet="Prerana Bharati Digital (PBNN)", place="Silchar, Assam",
         platform="YouTube", date="2026-10", youtube="XYA1zfqmqlU",
         headline="595 kW solar plant inaugurated at Koomber tea garden",
         original="कूम्बर चाय बागान में 595 किलो वाट सौर संयंत्र का उद्घाटन",
         summary="Prerana Bharati's news video on the Chief Minister of Assam inaugurating the 595 kWp ground-mounted, on-grid "
                 "solar plant at Koomber Tea Garden, installed by Arrays Ingenieria under the 3.11 MW Goodricke Tea Estates Solar "
                 "Programme.",
         url="https://www.youtube.com/watch?v=XYA1zfqmqlU",
         also=[("Facebook", "https://www.facebook.com/story.php?story_fbid=1502310741932902&id=100064619714592", "Video on Facebook"),
               ("YouTube", "https://www.youtube.com/@preranabhartidigital", "Prerana Bharati on YouTube")],
         img="assets/news/arrays-ingenieria-koomber-595kwp-solar-cm-inauguration-prerana-bharati-video.jpg",
         alt="Prerana Bharati news video: 595 kWp Koomber Tea Garden solar plant, built by Arrays Ingenieria, inaugurated by the Chief Minister of Assam"),
    dict(id="ne-reports-orangajuli", kind="tv", outlet="NE Reports", place="Dibrugarh, Assam", platform="Facebook",
         date="2026-09",
         headline="Janmashtami launch: 450 kW solar plant at Orangajuli Tea Estate, Udalguri",
         summary="NE Reports filmed the ribbon-cutting at the 450 kW ground-mount solar plant Arrays Ingenieria built for "
                 "Goodricke Group's Orangajuli Tea Estate, commissioned on Janmashtami.",
         url="https://www.facebook.com/reel/1678209397245830/",
         img="assets/photos/arrays-ingenieria-ex-servicemen-led-orangajuli-tea-estate-450kwp-solar-inauguration-ribbon.jpg",
         alt="Ribbon-cutting at the 450 kW Orangajuli Tea Estate solar plant built by Arrays Ingenieria (still from the NE Reports video)"),
    dict(id="sonari-live", kind="tv", outlet="Sonari Live", place="Sonari, Assam", platform="Facebook", date=None,
         headline="Exclusive: 230 kW solar project launched at Borpatra tea garden",
         summary="Sonari Live's exclusive report on the launch of the 230 kW solar plant Arrays Ingenieria built at "
                 "Goodricke's Borpatra Tea Garden: \"বৰপাত্ৰা চাহ বাগিচাত ২৩০ কিলোৱাট সৌৰ শক্তি প্ৰকল্পৰ শুভাৰম্ভ\".",
         url="https://www.facebook.com/100089972142580/videos/1069048716104190/",
         img="assets/news/arrays-ingenieria-borpatra-230kwp-solar-sonari-live-report.jpg",
         alt="Sonari Live exclusive report on the 230 kW Borpatra solar plant built by Arrays Ingenieria"),
    dict(id="news-axom", kind="tv", outlet="News Axom", place="Nagaon, Assam", platform="Facebook", date=None,
         headline="A new era of solar power at Borpatra tea garden: 230 kW project launched",
         summary="News Axom TV on the 230 kW plant at Borpatra: \"Important step towards decarbonization, 230 kw solar project "
                 "at Barpatra.\"",
         url="https://www.facebook.com/61564147994036/videos/122210117936471599/",
         img="assets/news/arrays-ingenieria-borpatra-230kwp-solar-news-axom-report.jpg",
         alt="News Axom TV report on the 230 kW Borpatra solar plant built by Arrays Ingenieria"),
    dict(id="news-axom-koomber", kind="tv", outlet="News Axom", place="Nagaon, Assam", platform="Facebook", date="2026-10",
         headline="Video report: the Koomber Tea Estate solar plant inauguration",
         summary="News Axom's video report from the inauguration of the 595 kWp solar plant at Koomber Tea Estate, which Arrays "
                 "Ingenieria installed, opened by the Chief Minister of Assam.",
         url="https://www.facebook.com/61564147994036/videos/122210688668471599/",
         img="assets/koomber/arrays-ingenieria-ex-servicemen-led-koomber-tea-estate-595kwp-solar-cm-cuts-ribbon-595kwp-solar-plant.jpg",
         alt="The Chief Minister of Assam cuts the ribbon at the Koomber solar plant built by Arrays Ingenieria, covered by News Axom"),
    dict(id="sentinel-jayshree", kind="online", outlet="The Sentinel", place="Assam", platform="sentinelassam.com",
         date="2025-05-22",
         headline="Assam: AIPL commissions 1 MW solar power plant at Jayshree Tea Estate",
         summary="Assam's English daily reports that Arrays Ingenieria installed 1 MW of solar at Jayshree Tea Estates in "
                 "Sonari under Tata Power's EPC contract: 535 kWp at Towkok and 500 kWp at Manjushree, the first renewable "
                 "project in the 80-year history of Jayshree Tea & Industries (BK Birla Group).",
         quote="Arrays Ingenieria is a unique MSME founded by ex-servicemen, symbolizing a disciplined, mission-driven "
               "transition from OG (Olive Green-the military uniform) to GG (Go Green-renewable energy).",
         url="https://www.sentinelassam.com/north-east-india-news/assam-news/assam-aipl-commissions-1-mw-solar-power-plant-at-jayshree-tea-estate",
         img="assets/photos/arrays-ingenieria-jayshree-tea-estate-1mw-ground-mount-solar-sonari-assam.jpg",
         alt="Jayshree Tea Estate 1 MW solar plant in Sonari, Assam, reported by The Sentinel"),
    dict(id="sentinel-koomber", kind="online", outlet="The Sentinel", place="Guwahati, Assam", platform="sentinelassam.com",
         date="2026-10-01",
         headline="Assam: Himanta Biswa Sarma Inaugurates 595 kWp Solar Plant at Koomber Tea Estate",
         summary="Reports the Chief Minister's inauguration of the 595 kWp ground-mounted, on-grid plant at Koomber Tea Estate, "
                 "Cachar, part of the 3.11 MW Goodricke Tea Estates Solar Programme for which Arrays Ingenieria is the "
                 "installation partner.",
         quote="It also aligns with the government's efforts to promote its Green Assam mission and increase the adoption of "
               "sustainable energy solutions.",
         url="https://www.sentinelassam.com/breakingnews/assam-himanta-biswa-sarma-inaugurates-595-kwp-solar-plant-at-koomber-tea-estate",
         social_text="Assam Chief Minister Dr Himanta Biswa Sarma on Thursday inaugurated a 595 kWp ground-mounted on-grid solar "
                     "power plant at Koomber Tea Estate in Cachar district, marking another step towards promoting clean energy in "
                     "the state's tea industry.",
         also=[("Instagram", "https://www.instagram.com/p/Dd89-ViDQcG/"),
               ("Facebook", "https://www.facebook.com/100066523279937/posts/pfbid05Ug3kevPqUdUBp7ZyFbD8Eix3hYRzu78MVR8yNixHt17o5B3cShMNFXW1o4Mw1Y8l/")],
         img="assets/koomber/arrays-ingenieria-ex-servicemen-led-koomber-tea-estate-595kwp-solar-cm-inaugurates-595kwp-solar-plant-ribbon-cutting.jpg",
         alt="Chief Minister Dr Himanta Biswa Sarma inaugurates the 595 kWp Koomber solar plant, reported by The Sentinel"),
    dict(id="prerna-bharati-koomber", kind="print", outlet="Prerna Bharati", place="Silchar, Assam", lang="hi",
         date="2026-10-02",
         headline="Arrays Ingenieria welcomes Chief Minister Dr Himanta Biswa Sarma at the Koomber tea garden solar plant inauguration",
         original="ऐरेज़ इंजीनिरिया ने कूम्बर चाय बागान सौर संयंत्र उद्घाटन पर माननीय मुख्यमंत्री डॉ. हिमंत विश्वशर्मा का किया स्वागत",
         summary="In print and online: on behalf of CEO Lt. Gen. A.R. Prasad (Retd), Shri Ranveer Singh welcomed the Chief Minister "
                 "with a traditional Assamese gamosa at the 595 kWp plant, which Arrays Ingenieria installed with a team including "
                 "ex-servicemen Shri Birendra and Shri Dinesh. The paper notes the company's motto, \"From Olive Green to Go Green\".",
         url="https://www.preranabharati.com/%E0%A4%90%E0%A4%B0%E0%A5%87%E0%A4%9C%E0%A4%BC-%E0%A4%87%E0%A4%82%E0%A4%9C%E0%A5%80%E0%A4%A8%E0%A4%BF%E0%A4%B0%E0%A4%BF%E0%A4%AF%E0%A4%BE-%E0%A4%A8%E0%A5%87-%E0%A4%95%E0%A5%82%E0%A4%AE%E0%A5%8D%E0%A4%AC%E0%A4%B0-%E0%A4%9A%E0%A4%BE%E0%A4%AF-%E0%A4%AC%E0%A4%BE%E0%A4%97%E0%A4%BE%E0%A4%A8-%E0%A4%B8%E0%A5%8C%E0%A4%B0-%E0%A4%B8%E0%A4%82%E0%A4%AF%E0%A4%82%E0%A4%A4%E0%A5%8D%E0%A4%B0-%E0%A4%89%E0%A4%A6%E0%A5%8D%E0%A4%98%E0%A4%BE%E0%A4%9F%E0%A4%A8-%E0%A4%AA%E0%A4%B0-%E0%A4%AE%E0%A4%BE%E0%A4%A8%E0%A4%A8%E0%A5%80%E0%A4%AF-%E0%A4%AE%E0%A5%81%E0%A4%96%E0%A5%8D%E0%A4%AF%E0%A4%AE%E0%A4%82%E0%A4%A4%E0%A5%8D%E0%A4%B0%E0%A5%80-%E0%A4%A1%E0%A5%89.-%E0%A4%B9%E0%A4%BF%E0%A4%AE%E0%A4%82%E0%A4%A4-%E0%A4%B5%E0%A4%BF%E0%A4%B6%E0%A5%8D%E0%A4%B5%E0%A4%B6%E0%A4%B0%E0%A5%8D%E0%A4%AE%E0%A4%BE-%E0%A4%95%E0%A4%BE-%E0%A4%95%E0%A4%BF%E0%A4%AF%E0%A4%BE-%E0%A4%B8%E0%A5%8D%E0%A4%B5%E0%A4%BE%E0%A4%97%E0%A4%A4/",
         also=[("Facebook", "https://www.facebook.com/preranabharatisilchar", "Prerana Bharati on Facebook")],
         img="assets/news/arrays-ingenieria-koomber-595kwp-solar-cm-inauguration-prerna-bharati.jpg",
         alt="Prerna Bharati report: Arrays Ingenieria welcomes the Chief Minister of Assam at the 595 kWp Koomber solar plant inauguration"),
    dict(id="azad-sipahi-koomber", kind="print", outlet="Azad Sipahi", place="Ranchi, Jharkhand", lang="hi",
         date="2026-10-03",
         headline="Solar power plant inaugurated at Assam's Koomber tea garden",
         original="असम के कूंबर चाय बागान में सौर ऊर्जा संयंत्र का उद्घाटन",
         summary="The Ranchi Hindi daily reports from Guwahati that the Chief Minister of Assam inaugurated the 595 kWp grid-connected "
                 "solar plant at Koomber, that Arrays Ingenieria welcomed him with a traditional gamosa, and that the company, set "
                 "up by ex-servicemen, was the installation partner alongside Tata Power Solar, Goodricke and Sustvest.",
         img="assets/news/arrays-ingenieria-koomber-595kwp-solar-cm-inauguration-azad-sipahi.jpg",
         alt="Azad Sipahi Hindi newspaper report on the 595 kWp Koomber Tea Garden solar plant inauguration with Arrays Ingenieria"),
    dict(id="hindusthan-samachar-koomber", kind="online", outlet="Hindusthan Samachar", place="Cachar, Assam (national news agency)",
         platform="hindusthansamachar.in", lang="hi", date="2026-10-01",
         headline="Chief Minister inaugurates 595 kWp ground-mounted on-grid solar plant in Assam",
         original="असम में 595 केवीपी ग्राउंड -माउंटेड ऑन-ग्रिड सौर ऊर्जा संयंत्र का मुख्यमंत्री ने किया उद्घाटन",
         summary="The national news agency reports the Chief Minister's inauguration at Koomber Tea Garden, Cachar: Arrays Ingenieria "
                 "was the installation partner alongside Tata Power Solar, Goodricke and Sustvest; Shri Ranveer Singh welcomed the "
                 "Chief Minister with a traditional gamosa on behalf of CEO Lt. Gen. A.R. Prasad (Retd); and the plant was built by the "
                 "company's team, including ex-servicemen Birendra and Dinesh.",
         quote="ऐरेज इंजीनिरिया पूर्व सैनिकों द्वारा स्थापित एक एमएसएमई है। कंपनी का ध्येय वाक्य फ्रॉम ऑलिव ग्रीन टू गो ग्रीन है।",
         quote_lang="hi",
         url="https://www.hindusthansamachar.in/Encyc/2026/10/1/ASSAM-KACHHAR-CM-INAUGURATES-SOLAR-POWER-PLANT.php",
         img="assets/koomber/arrays-ingenieria-ex-servicemen-led-koomber-tea-estate-595kwp-solar-welcomes-cm-with-assamese-gamosa.jpg",
         alt="Arrays Ingenieria welcomes the Chief Minister of Assam with a gamosa at Koomber, as reported by Hindusthan Samachar"),
    dict(id="india-today-ne-koomber", kind="online", outlet="India Today NE", place="Guwahati, Assam", platform="indiatodayne.in",
         lang="en", date="2026-10-01",
         headline="Assam CM inaugurates 595 kWp Solar Power Plant at Koomber Tea Estate",
         summary="India Today's North East edition reports the Chief Minister's inauguration of the 595 kWp ground-mounted, on-grid "
                 "plant at Koomber Tea Estate, part of the 3.11 MW Goodricke Tea Estates Solar Programme, the plant Arrays Ingenieria "
                 "installed as installation partner.",
         quote="The initiative is expected to strengthen the use of renewable energy in the tea industry, a key sector of Assam's "
               "economy, while supporting the state's efforts to advance its Green Assam mission.",
         url="https://www.indiatodayne.in/assam/story/assam-cm-inaugurates-595-kwp-solar-power-plant-at-koomber-tea-estate-1457597-2026-10-01",
         img="assets/koomber/arrays-ingenieria-ex-servicemen-led-koomber-tea-estate-595kwp-ground-mount-solar-plant.jpg",
         alt="The 595 kWp Koomber Tea Estate solar plant built by Arrays Ingenieria, reported by India Today NE"),
    dict(id="cmo-assam-koomber", kind="official", outlet="Chief Minister's Office, Assam", handle="@CMOfficeAssam",
         place="Official handle of the Chief Minister of Assam", date="2026-10-01",
         headline="HCM inaugurates 595 kWp solar plant at Koomber Tea Estate",
         quote="HCM Dr @himantabiswa inaugurated a 595 kWp Ground-Mounted On-Grid Solar Power Plant at Koomber Tea Estate today. "
               "Part of the 3.11 MW Goodricke Tea Estates Solar Programme, this initiative empowers iconic tea industry with clean "
               "energy and accelerates the mission towards a Green Assam.",
         summary="The Chief Minister's Office announced the inauguration on X and Facebook, with photos from Koomber.",
         links=[("X", "https://x.com/CMOfficeAssam/status/2105545750054928662"),
                ("Facebook", "https://www.facebook.com/cmofficeassam/photos/d41d8cd9/1422387263413542/?set=a.302403535411926")],
         img="assets/koomber/arrays-ingenieria-ex-servicemen-led-koomber-tea-estate-595kwp-solar-cm-cuts-ribbon-595kwp-solar-plant.jpg",
         alt="The Chief Minister of Assam cuts the ribbon at Koomber Tea Estate"),
    dict(id="kaushik-rai-koomber", kind="official", outlet="Shri Kaushik Rai, MLA, Lakhipur", handle="@iKaushikRai",
         place="Member of the Assam Legislative Assembly", date="2026-10-01",
         headline="\"Glad to see Arrays Ingenieria deliver critical renewable infrastructure\"",
         quote="Glad to see Arrays Ingenieria, an MSME spearheaded by ex-servicemen under Lt Gen AR Prasad (Retd), deliver critical "
               "renewable infrastructure with uncompromising military discipline.",
         summary="Writing after joining the Chief Minister at the inauguration of the 595 kWp plant at Koomber Tea Garden under the "
                 "Goodricke green initiative.",
         links=[("X", "https://x.com/iKaushikRai/status/2105642116089008488"),
                ("Facebook", "https://www.facebook.com/100065189221572/posts/pfbid0MmznkBYfeKxNF66pmnNDk3iEFfGnY1wan7LNwMDm4316vznz3bg86ZkZwAgdjheHl/")],
         img="assets/koomber/arrays-ingenieria-ex-servicemen-led-koomber-tea-estate-595kwp-solar-cm-reviews-solar-plant-with-mlas.jpg",
         alt="The Chief Minister with MLAs at the Koomber solar plant"),
    dict(id="rajdeep-goala-koomber", kind="official", outlet="Shri Rajdeep Goala, MLA, Udharbond", handle="@RajdeepGoala14",
         place="Member of the Assam Legislative Assembly", date="2026-10-01",
         headline="\"Particularly encouraging to witness Arrays Ingenieria\"",
         quote="It is particularly encouraging to witness Arrays Ingenieria, an MSME led by ex-servicemen under the stewardship of "
               "Lt. Gen. A.R. Prasad (Retd.), translating its expertise, precision and institutional discipline into critical "
               "renewable-energy infrastructure.",
         summary="Writing after joining the Chief Minister at the inauguration of the 595 kWp solar plant at Koomber Tea Garden, "
                 "\"a significant milestone under the Goodricke Green Initiative\", and calling it \"a meaningful step towards a "
                 "cleaner, more resilient and future-ready Barak Valley.\"",
         links=[("X", "https://x.com/RajdeepGoala14/status/2105730931860574342"),
                ("Facebook", "https://www.facebook.com/100063684971835/posts/1732055695593913/")],
         img="assets/koomber/arrays-ingenieria-ex-servicemen-led-koomber-tea-estate-595kwp-solar-cm-and-officials-at-solar-site.jpg",
         alt="The Chief Minister of Assam with MLAs at the Koomber solar plant built by Arrays Ingenieria"),
    dict(id="hub-network-orangajuli", kind="online", outlet="Hub Network", place="Guwahati, Assam", platform="hubnetwork.in",
         date="2026-09-04",
         headline="Assam tea garden gets 450 kWp solar plant as clean energy push gathers pace",
         summary="Reports the commissioning of the 450 kWp ground-mounted plant at Orangajuli Tea Garden, Panerihaat, Udalguri, by "
                 "Arrays Ingenieria, the installation partner for the 3.11 MW TPREL and SustVest programme covering 18 Goodricke tea "
                 "estates, with the plant inaugurated by garden manager Daljit Singh Maan.",
         quote="For Arrays Ingenieria, the project also reflects its 'Olive Green to Go Green' philosophy.",
         url="https://hubnetwork.in/assam-tea-garden-gets-450-kwp-solar-plant-as-clean-energy-push-gathers-pace/",
         img="assets/photos/arrays-ingenieria-ex-servicemen-led-orangajuli-tea-estate-450kwp-solar-inauguration-ribbon.jpg",
         alt="Orangajuli Tea Estate 450 kW solar plant inauguration, reported by Hub Network"),
    dict(id="prerna-bharati-orangajuli", kind="print", outlet="Prerna Bharati", place="Silchar, Assam", lang="hi",
         date="2026-09-05",
         headline="New green-energy initiative in Assam on Janmashtami: 450 kW solar plant starts",
         original="जन्माष्टमी पर असम में हरित ऊर्जा की नई पहल, ४५० किलोवाट सौर संयंत्र शुरू",
         summary="Arrays Ingenieria's 450 kW grid-connected ground-mount plant at Orangajuli Tea Estate, Udalguri, is part "
                 "of the 3.11 MW solar programme for Goodricke tea estates by Tata Power Renewable Energy and Sustvest. "
                 "With it, the company has commissioned solar plants at 18 tea gardens in Assam.",
         img="assets/news/prerna-bharati-orangajuli-450kw-solar-ingenieria.jpg",
         alt="Prerna Bharati Hindi newspaper report on the 450 kW solar plant built by Arrays Ingenieria at Orangajuli Tea Estate, Udalguri, Assam"),
    dict(id="barpatra-230kw", kind="print", outlet="Dainik Purvoday", place="Jorhat, Assam", lang="hi",
         date="2026-09-26",
         headline="230 kW solar plant starts at Barpatra Tea Estate",
         original="बरपात्रा टीई में 230 किलोवाट का सौर संयंत्र शुरू",
         summary="Arrays Ingenieria, turnkey implementing partner, commissions a 230 kW on-grid ground-mount plant at "
                 "Goodricke Group's Barpatra Tea Estate, bringing its total to 19 on-grid solar plants in Assam's tea gardens.",
         img="assets/news/dainik-purvoday-borpatra-230kw-solar-arrays-ingenieria.jpg",
         extra="assets/news/arrays-ingenieria-borpatra-tea-estate-230kwp-solar-newspaper-print.jpg",
         alt="Dainik Purvoday report on the 230 kW solar plant built by Arrays Ingenieria at Barpatra Tea Estate, Assam"),
    dict(id="northeast-chronicle-borpatra", kind="print", outlet="Northeast Chronicle", place="Dibrugarh, Assam", lang="en",
         date="2026-09-27",
         headline="230 kWp solar plant successfully commissioned at Borpatra tea estate",
         summary="Clean energy push in Assam's tea sector: Arrays Ingenieria commissions a 230 kWp on-grid ground-mounted plant "
                 "at Goodricke's Borpatra Tea Estate as turnkey implementing partner of the 3.11 MW TPREL and SustVest programme, "
                 "among 19 on-grid plants it has installed across Assam's historic tea estates.",
         quote="Arrays Ingenieria's \"Olive Green to Go Green\" initiative, under which the veteran-led company applies "
               "military-grade discipline and engineering expertise to renewable energy projects.",
         img="assets/news/northeast-chronicle-borpatra-230kwp-solar-arrays-ingenieria.jpg",
         extra="assets/news/arrays-ingenieria-borpatra-230kwp-tata-power-media-monitor.jpg",
         alt="Northeast Chronicle report: 230 kWp solar plant commissioned by Arrays Ingenieria at Borpatra tea estate"),
    dict(id="prerna-bharati-borpatra", kind="print", outlet="Prerna Bharati", place="Silchar, Assam", lang="hi",
         date="2026-09-26",
         headline="230 kW solar plant starts at Borpatra Tea Estate; 19 on-grid solar plants in Assam so far",
         original="बोरपात्रा टी एस्टेट में २३० किलोवाट का सौर संयंत्र शुरू",
         summary="Green energy for Goodricke Group's tea garden: Prerna Bharati reports that Arrays Ingenieria has now "
                 "installed 19 on-grid solar plants in Assam.",
         img="assets/news/prerna-bharati-borpatra-230kw-solar-arrays-ingenieria.jpg",
         alt="Prerna Bharati report on the 230 kW Borpatra solar plant by Arrays Ingenieria"),
    dict(id="purvanchal-prahari-borpatra", kind="print", outlet="Purvanchal Prahari", place="Dibrugarh, Assam", lang="hi",
         date="2026-09-26",
         headline="230 kW solar project starts at Borpatra tea garden",
         original="बोरपात्रा चाय बागान में 230 किलोवाट सौर परियोजना शुरू",
         summary="Arrays Ingenieria starts a 230 kWp on-grid solar project at Borpatra, connected to the grid after APDCL "
                 "permissions and bi-directional net-metering approval.",
         img="assets/news/purvanchal-prahari-borpatra-230kw-solar-arrays-ingenieria.jpg",
         alt="Purvanchal Prahari report on the Borpatra 230 kW solar project by Arrays Ingenieria"),
    dict(id="swarajati-borpatra", kind="print", outlet="Swarajati", place="Sonari, Assam", lang="as",
         date="2026-09-27",
         headline="Arrays Ingenieria starts a 230 kWp on-grid solar project at Assam's Borpatra tea garden",
         original="অসমৰ বৰপাত্ৰা চাহ বাগিচাত এৰেজ ইনজেনিয়েৰিয়াই ২৩০ কিলোৱাট পিকৰ অন-গ্ৰিড সৌৰ শক্তি প্ৰকল্প আৰম্ভ",
         summary="The Assamese daily reports 19 on-grid solar projects installed in Assam's historic tea gardens.",
         img="assets/news/swarajati-borpatra-230kwp-solar-arrays-ingenieria.jpg",
         extra="assets/news/swarajati-borpatra-230kwp-solar-arrays-ingenieria-continued.jpg",
         alt="Swarajati Assamese report on the 230 kWp Borpatra solar project by Arrays Ingenieria"),
    dict(id="dainik-janambhumi-borpatra", kind="print", outlet="Dainik Janambhumi", place="Sonari, Assam", lang="as",
         date="2026-09-27",
         headline="On-grid solar project at Borpatra tea garden: a step towards cutting carbon emissions",
         original="বৰপাত্ৰ চাহ বাগিচাত অন-গ্ৰিড সৌৰশক্তি প্ৰকল্প",
         summary="Front-page report on the 230 kWp solar plant at Borpatra as a step towards reducing carbon emissions.",
         img="assets/news/dainik-janambhumi-borpatra-solar-arrays-ingenieria.jpg",
         alt="Dainik Janambhumi report on the Borpatra on-grid solar project by Arrays Ingenieria"),
    dict(id="janambhumi-online-borpatra", kind="print", outlet="Janambhumi (online)", place="Assam", lang="as",
         date="2026-09-26",
         headline="230 kWp on-grid solar project begins at Borpatra tea garden",
         summary="Janambhumi's online report on the commissioning of the Borpatra plant by the ex-servicemen-led Arrays "
                 "Ingenieria.",
         img="assets/news/janambhumi-borpatra-230kw-solar-arrays-ingenieria.jpg",
         alt="Janambhumi online report on the Borpatra solar plant by Arrays Ingenieria"),
    dict(id="niyomiya-barta-borpatra", kind="print", outlet="Niyomiya Barta", place="Charaideo, Assam", lang="as",
         date="2026-09-27",
         headline="On-grid solar project begins at Borpatra tea garden",
         original="বৰপাত্ৰ বাগিচাত অন-গ্ৰিড সৌৰশক্তি প্ৰকল্প আৰম্ভ",
         summary="Reports the ex-servicemen-led MSME Arrays Ingenieria starting the 230 kWp ground-mounted plant at Borpatra.",
         img="assets/news/niyamiya-barta-borpatra-solar-arrays-ingenieria.jpg",
         alt="Niyomiya Barta Assamese report on the Borpatra solar project by Arrays Ingenieria"),
    dict(id="bhaskar-tcpl", kind="print", outlet="Dainik Bhaskar", place="Hajipur, Bihar", lang="hi",
         date="2024-04-03",
         headline="Bhagwanpur solar plant to generate 319 kW of power",
         original="भगवानपुर में सोलर पावर ग्रिड से 319 किलोवाट बिजली का होगा उत्पादन",
         summary="Dainik Bhaskar reports on the 319 kWp rooftop solar plant built by Arrays Ingenieria for TCPL Greenery "
                 "Agro (Tata Consumer Products) in Vaishali district, Bihar.",
         img="assets/news/arrays-ingenieria-tcpl-vaishali-319kwp-rooftop-solar-dainik-bhaskar.jpg",
         alt="Dainik Bhaskar report on the 319 kWp rooftop solar plant by Arrays Ingenieria in Vaishali, Bihar"),
    dict(id="sanmarg-supersmelters", kind="print", outlet="Sanmarg", place="Jamuria, West Bengal", lang="hi", date=None,
         headline="1980.3 kWp solar plant installed for environmental protection at Super Smelters",
         original="पर्यावरण संरक्षण के लिए लगाया गया 1980.3 केवी का सोलर प्लांट",
         summary="Super Smelters, the largest industrial unit in the area, inaugurates a 1980.3 kWp rooftop solar plant "
                 "built with Tata Power Solar and Arrays Ingenieria (AIPL), about 2 MW of clean power.",
         img="assets/news/arrays-ingenieria-super-smelters-1980kwp-solar-inauguration-newspaper.jpg",
         alt="Sanmarg newspaper report on the 1980.3 kWp Super Smelters solar plant inauguration, Arrays Ingenieria"),
    dict(id="supersmelters-rooftop", kind="print", outlet="Hindi daily, Jamuria", place="Jamuria, West Bengal", lang="hi", date=None,
         headline="1980.3 kWp rooftop solar power plant inaugurated at Super Smelters",
         original="जामुड़िया : सुपर स्मेलटर्स कारखाना में 1980.3 केडब्ल्यूपी रूफटॉप सोलर पावर प्लांट का हुआ उद्घाटन",
         summary="The inauguration ceremony of the 1980.3 kWp rooftop plant at Super Smelters, with Lt. Gen. Ashish Ranjan "
                 "Prasad (Retd) of Arrays Ingenieria among the guests.",
         img="assets/news/arrays-ingenieria-super-smelters-jamuria-rooftop-solar-newspaper.jpg",
         alt="Newspaper report on the Super Smelters rooftop solar plant in Jamuria built by Arrays Ingenieria"),
    dict(id="supersmelters-kwp-rooftop", kind="print", outlet="Hindi daily, Jamuria", place="Jamuria, West Bengal", lang="hi",
         date=None,
         headline="kWp rooftop solar power plant inaugurated at Super Smelters",
         original="केडब्ल्यूपी रूफ टॉप सोलर पावर प्लांट का हुआ उद्घाटन",
         summary="A further report of the 1980.3 kWp rooftop plant inaugurated at Super Smelters with Tata Power Solar and "
                 "Arrays Ingenieria.",
         img="assets/news/arrays-ingenieria-super-smelters-1980kwp-rooftop-inauguration-hindi-daily.jpg",
         alt="Hindi newspaper report on the Super Smelters rooftop solar inauguration, Arrays Ingenieria"),
    dict(id="jayshree-towkok", kind="client", outlet="Jay Shree Tea & Industries Ltd.", place="BK Birla Group",
         date="2025-05-22",
         headline="Jay Shree Tea commissions 1 MW solar plant in Assam",
         quote="Our sincere thanks to Lieutenant General Ashish Ranjan Prasad (Retd) and the team at Arrays Ingenieria "
               "for their partnership in bringing this vision to life.",
         summary="Announcing 535 kWp at Towkok and 500 kWp at Manjushree Tea Estate, installed under Tata Power's EPC "
                 "contract and implemented by Arrays Ingenieria, a veteran-led MSME.",
         links=[("Instagram", "https://www.instagram.com/p/DJ8xow6Sklv/"),
                ("Facebook", "https://www.facebook.com/jayshree.tea/posts/we-are-proud-to-announce-the-commissioning-of-a-1-mw-solar-power-plant-at-our-to/992080983078401/"),
                ("LinkedIn", "https://www.linkedin.com/posts/jayshreetea-sustainability-solarpower-share-7331237620603084800-V592/")],
         img="assets/photos/arrays-ingenieria-towkok-tea-estate-535kwp-ground-mount-solar-assam.jpg",
         alt="Towkok Tea Estate 535 kWp solar plant in Assam built by Arrays Ingenieria"),
    dict(id="jayshree-dewan", kind="client", outlet="Jay Shree Tea & Industries Ltd.", place="BK Birla Group",
         date="2025-11-24",
         headline="Solar for the Dewan Group of Tea Estates: Dewan, Labac & Burtoll",
         quote="The solar power systems were executed by Arrays Ingenieria Private Limited (AIPL), an organisation "
               "established and operated by ex-servicemen, under Tata Power's EPC contract. Their precision, discipline "
               "and commitment to excellence ensured seamless implementation across all three locations.",
         summary="New solar power plants at three Jay Shree Tea gardens in Assam, all executed by Arrays Ingenieria.",
         links=[("Instagram", "https://www.instagram.com/reel/DRcNrhXEyFT/")],
         img="assets/press/arrays-ingenieria-solar-plant-commissioning-ceremony.jpg",
         alt="Solar power plant commissioning ceremony, Arrays Ingenieria"),
]
# The founder's appearances as a defence expert on national TV (existing section).
NATIONAL_TV = ["India Today", "Aaj Tak", "India TV"]

KIND_LABEL = {"tv": "News channel", "online": "Online news", "print": "Newspaper", "client": "Client post", "official": "Official handle"}
MONTHS = "January February March April May June July August September October November December".split()


def fmt_date(iso):
    if not iso:
        return ""
    parts = [int(p) for p in iso.split("-")]
    return f"{MONTHS[parts[1] - 1]} {parts[0]}" if len(parts) == 2 else f"{parts[2]} {MONTHS[parts[1] - 1][:3]} {parts[0]}"


def time_tag(iso):
    return f'<time datetime="{iso}">{fmt_date(iso)}</time>' if iso else ""


def cov(kind):
    return [c for c in COVERAGE if c["kind"] == kind]


PLAY_SVG = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>'
FB_SVG = ('<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 '
          '2.68.24 2.68.24v2.97h-1.5c-1.5 0-1.96.93-1.96 1.89v2.26h3.33l-.53 3.5h-2.8V24C19.62 23.1 24 18.1 24 12.07"/></svg>')
EXT_SVG = ('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" '
           'stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg>')
ARROW_SVG = ('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" '
             'stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>')
PLATFORM_ICON = {
    "X": '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.66l-5.21-6.82-5.97 6.82H1.68l7.73-8.84L1.25 2.25h6.83l4.71 6.23zm-1.16 17.52h1.83L7.08 4.13H5.12z"/></svg>',
    "Instagram": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>',
    "Facebook": FB_SVG,
    "YouTube": '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8zM9.6 15.6V8.4l6.2 3.6z"/></svg>',
    "LinkedIn": '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z"/></svg>',
}

# ----------------------------------------------------- header / footer ----
# Top-level menu: (label, href, page keys that light it up, dropdown items or None)
NAV = [
    ("About", "about.html", {"about", "clients", "achievements"}, [
        ("About Us", "about.html"), ("Message from the Leadership", "leadership.html"), ("Ex-Servicemen-Led MSME", "ex-servicemen-led-msme.html"),
        ("Quality & Safety", "quality-safety.html"), ("Clients & Partners", "clients.html"), ("Achievements", "achievements.html")]),
    ("Services", "/#services", {"services", "industries"}, [
        ("CAPEX Solar EPC", "capex-solar-epc.html"), ("Installation & Commissioning", "solar-installation-commissioning.html"),
        ("EPC Turnkey", "service-epc.html"), ("Ground-Mount Solar", "service-ground-mount.html"), ("Rooftop Solar", "service-rooftop.html"),
        ("Pile Foundations", "service-piling.html"), ("Civil Works & Fencing", "service-civil.html"), ("O&M & Support", "service-om.html"),
        ("Solar for Tea Estates", "solar-for-tea-estates.html"), ("Industries We Serve", "industries.html")]),
    ("How It Works", "how-it-works.html", {"how"}, None),
    ("Projects", "projects.html", {"projects", "gallery"}, [
        ("All Projects", "projects.html"), ("Case Studies", "projects.html#case-studies"),
        ("Where We Work", "where-we-work.html"), ("Photo & Video Gallery", "gallery.html")]),
    ("News & Media", "recognition.html", {"recognition"}, None),
    ("Resources", "insights.html", {"insights", "faq"}, [
        ("Solar Insights", "insights.html"), ("Government Solar Schemes", "solar-schemes-india.html"),
        ("Solar Glossary", "solar-glossary.html"), ("FAQ", "faq.html")]),
    ("Contact", "contact.html", {"contact"}, None),
]
CARET = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>'


def render_header(page_key, fname=""):
    items = ['<a class="nav-home" href="/">Home</a>']
    for i, (label, href, keys, sub) in enumerate(NAV):
        on = page_key in keys
        cls = ' class="active"' if on else ""
        cur = ' aria-current="page"' if href == fname else ""
        if not sub:
            items.append(f'<a href="{href}"{cls}{cur}>{esc(label)}</a>')
            continue
        wide = " sub--wide" if len(sub) > 6 else ""
        subs = "".join(f'<a href="{h}"{" aria-current=" + chr(34) + "page" + chr(34) if h == fname else ""}>{esc(t)}</a>' for t, h in sub)
        items.append(f'<div class="nav-item has-sub{" active" if on else ""}">'
                     f'<a href="{href}" class="nav-top{" active" if on else ""}"{cur}>{esc(label)}</a>'
                     f'<button class="sub-toggle" type="button" aria-expanded="false" aria-controls="sub-{i}" aria-label="Show {esc(label)} menu">{CARET}</button>'
                     f'<div class="sub{wide}" id="sub-{i}">{subs}</div></div>')
    links = "".join(items)
    return f"""<header class="header scrolled solid" id="header">
    <div class="container nav">
      <a href="/" class="brand" aria-label="Arrays Ingenieria, home">
        <img src="assets/img/logo-wordmark.svg" alt="INGENIERIA, Arrays Ingenieria Pvt. Ltd." class="brand-logo" width="690" height="72" />
      </a>
      <nav class="nav-links" id="navLinks" aria-label="Primary">{links}<a class="nav-quote" href="free-solar-quote.html">Get a Free Quote</a></nav>
      <div class="nav-cta">
        <a href="projects.html" class="btn btn--outline">Our Work</a>
        <a href="free-solar-quote.html" class="btn btn--primary">Get a Quote</a>
        <button class="menu-toggle" id="menuToggle" aria-label="Toggle menu" aria-expanded="false" aria-controls="navLinks">
          <span></span><span></span><span></span>
        </button>
      </div>
    </div>
  </header>"""


FOOTER = f"""<section class="cta-strip" aria-label="Contact Arrays Ingenieria">
    <div class="container cta-strip__in">
      <div class="cta-strip__txt"><span class="eyebrow">Talk to an engineer</span><h2>Planning a solar plant? <span class="text-sun">Let's build it together.</span></h2>
        <p>CAPEX solar EPC, installation &amp; commissioning and civil works, delivered by an ex-servicemen-led team across India. Tell us about your site and an engineer will get back to you.</p></div>
      <div class="cta-strip__btns">
        <a class="btn btn--sun" href="free-solar-quote.html">Get a Free Quote {ARROW_SVG}</a>
        <a class="btn btn--ghost" href="mailto:arraysingenieria@gmail.com?subject=Solar%20project%20enquiry">Email arraysingenieria@gmail.com</a>
      </div>
    </div>
  </section>
  <footer class="footer">
    <div class="container">
      <div class="footer__top">
        <div class="footer__brand">
          <div class="logo">
            <img src="assets/img/logo-wordmark.svg" alt="INGENIERIA, Arrays Ingenieria Pvt. Ltd." class="brand-logo" width="690" height="72" />
          </div>
          <p>Developing Green Energy for the Nation. Arrays Ingenieria is an ex-servicemen-led, ISO-certified MSME delivering solar installation, EPC and civil works across India.</p>
          <a href="mailto:arraysingenieria@gmail.com" class="footer-email">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px;margin-right:8px;" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>arraysingenieria@gmail.com
          </a>
        </div>
        <div>
          <h2 class="footer__h">Explore</h2>
          <ul>
            <li><a href="about.html">About Us</a></li>
            <li><a href="leadership.html">Message from the Leadership</a></li>
            <li><a href="ex-servicemen-led-msme.html">Ex-Servicemen-Led MSME</a></li>
            <li><a href="how-it-works.html">How It Works</a></li>
            <li><a href="quality-safety.html">Quality &amp; Safety</a></li>
            <li><a href="where-we-work.html">Where We Work</a></li>
            <li><a href="industries.html">Industries</a></li>
            <li><a href="solar-for-tea-estates.html">Solar for Tea Estates</a></li>
            <li><a href="projects.html">Projects &amp; Case Studies</a></li>
            <li><a href="clients.html">Clients &amp; Partners</a></li>
            <li><a href="gallery.html">Photo &amp; Video Gallery</a></li>
            <li><a href="recognition.html">News &amp; Media</a></li>
            <li><a href="achievements.html">Achievements</a></li>
            <li><a href="insights.html">Insights</a></li>
            <li><a href="solar-schemes-india.html">Government Solar Schemes</a></li>
            <li><a href="solar-glossary.html">Solar Glossary</a></li>
            <li><a href="faq.html">FAQ</a></li>
            <li><a href="contact.html">Contact</a></li>
          </ul>
        </div>
        <div>
          <h2 class="footer__h">Services</h2>
          <ul>
            <li><a href="capex-solar-epc.html">CAPEX Solar EPC</a></li>
            <li><a href="solar-installation-commissioning.html">Installation &amp; Commissioning</a></li>
            <li><a href="service-ground-mount.html">Ground-Mount Solar</a></li>
            <li><a href="service-rooftop.html">Rooftop Solar</a></li>
            <li><a href="service-epc.html">EPC Turnkey</a></li>
            <li><a href="service-piling.html">Pile Foundation</a></li>
            <li><a href="service-civil.html">Civil &amp; Fencing</a></li>
            <li><a href="service-om.html">O&amp;M &amp; Support</a></li>
          </ul>
        </div>
        <div class="footer__reg">
          <h2 class="footer__h">Registrations</h2>
          <p>
            <b>CIN:</b> U45309DL2018PTC340544<br/>
            <b>PAN:</b> AARCA4610L<br/>
            <b>GST (UP):</b> 09AARCA4610L1ZC<br/>
            <b>GST (Bihar):</b> 10AARCA4610L1ZT<br/>
            <b>Udyam:</b> UDYAM-DL-03-0023905
          </p>
        </div>
      </div>
      <div class="footer__bottom">
        <span>© <span id="year">{date.today().year}</span> Arrays Ingenieria Pvt. Ltd. All rights reserved.</span>
        <span class="footer-legal"><a href="privacy-policy.html">Privacy Policy</a><a href="terms.html">Terms of Use</a><a href="gallery.html">Gallery</a></span>
        <span class="made">Developing Green Energy for the Nation 🌱</span>
      </div>
    </div>
  </footer>

  <nav class="contact-dock" aria-label="Quick contact">
    <a class="cd-mail" href="mailto:arraysingenieria@gmail.com?subject=Solar%20project%20enquiry" aria-label="Email Arrays Ingenieria"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg><span>Email us</span></a>
    <a class="cd-quote" href="free-solar-quote.html"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg><span>Free solar quote</span></a>
  </nav>
  <button class="to-top" id="toTop" aria-label="Back to top">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
  </button>"""


# ----------------------------------------------------- coverage blocks ----
def esc(s):
    return html.escape(s, quote=True)


def initials(name):
    return "".join(w[0] for w in re.findall(r"[A-Za-z]+", name) if w[0].isupper())[:3]


def by_date(items):
    return sorted(items, key=lambda c: c["date"] or "0000", reverse=True)


def yt_card(c, lead=False, with_id=True):
    """A YouTube report as a lightweight facade: a local thumbnail and a play button. YouTube's player (and its cookies)
    loads only when the visitor presses play, from the privacy-enhanced youtube-nocookie.com domain."""
    ident = f' id="{c["id"]}"' if with_id else ""
    cls = "tv-card tv-card--yt reveal" + (" tv-card--lead" if lead else "")
    links = "".join(f'<a href="{u}" target="_blank" rel="noopener">{PLATFORM_ICON[n]} {esc(item[2] if len(item) > 2 else n)}</a>'
                    for item in c.get("also", []) for n, u in [item[:2]])
    orig = f'<span class="tv-orig" lang="hi">{esc(c["original"])}</span>' if c.get("original") else ""
    return f"""<article class="{cls}"{ident}>
        <button type="button" class="tv-thumb yt-facade" data-yt="{c['youtube']}" aria-label="Play the video: {esc(c['headline'])} ({esc(c['outlet'])}, loads YouTube)">
          <img src="{c['img']}" alt="{esc(c['alt'])}" /><span class="tv-onair"><i></i>News video</span><span class="vc-play">{PLAY_SVG}</span><span class="yt-note">Plays from YouTube</span>
        </button>
        <span class="tv-body">
          <span class="tv-outlet"><span class="tv-mono">PB</span><span><b>{esc(c['outlet'])}</b><small>{esc(c['place'])} · on {c['platform']}</small></span></span>
          <h3 class="tv-title">{esc(c['headline'])}</h3>{orig}
          <span class="tv-sum">{esc(c['summary'])}</span>
          <span class="tv-foot">{time_tag(c['date'])}<a class="tv-go" href="{c['url']}" target="_blank" rel="noopener">Watch on YouTube {EXT_SVG}</a></span>
          <span class="tv-more">{links}</span>
        </span>
      </article>"""


def yt_block(ids):
    vids = [c for c in COVERAGE if c["id"] in ids and c.get("youtube")]
    if not vids:
        return ""
    return ('\n    <div class="kv-head reveal"><span class="cm-kicker">In the news</span><b>On YouTube</b></div>\n    <div class="tv-grid tv-grid--yt">'
            + "".join(yt_card(c, with_id=False) for c in vids) + "</div>")


def tv_card(c, lead=False, with_id=True):
    if c.get("youtube"):
        return yt_card(c, lead, with_id)
    img = c.get("img") or c["bg"]
    tile = "" if c.get("img") else f'<span class="tv-tile"><b>{esc(c["outlet"])}</b><small>News report · {esc(c["place"])}</small></span>'
    cls = "tv-card reveal" + (" tv-card--lead" if lead else "") + ("" if c.get("img") else " tv-card--tile")
    ident = f' id="{c["id"]}"' if with_id else ""
    return f"""<a class="{cls}"{ident} href="{c['url']}" target="_blank" rel="noopener">
        <span class="tv-thumb"><img src="{img}" alt="{esc(c['alt'])}" />{tile}<span class="tv-onair"><i></i>News channel</span><span class="vc-play">{PLAY_SVG}</span></span>
        <span class="tv-body">
          <span class="tv-outlet"><span class="tv-mono">{initials(c['outlet'])}</span><span><b>{esc(c['outlet'])}</b><small>{esc(c['place'])} · on {c['platform']}</small></span></span>
          <h3 class="tv-title">{esc(c['headline'])}</h3>
          <span class="tv-sum">{esc(c['summary'])}</span>
          <span class="tv-foot">{time_tag(c['date'])}<span class="tv-go">Watch the report {EXT_SVG}</span></span>
        </span>
      </a>"""


def render_tv(with_ids=True):
    items = cov("tv")
    cards = [tv_card(c, lead=(i == 0), with_id=with_ids) for i, c in enumerate(items)]
    return '<div class="tv-grid">\n      ' + "\n      ".join(cards) + "\n    </div>"


def press_item(c):
    cap = esc(f"{c['outlet']}{', ' + fmt_date(c['date']) if c['date'] else ''}: {c['headline']}")
    if c.get("url"):
        thumb = (f'<a class="press-thumb" href="{c["url"]}" target="_blank" rel="noopener" tabindex="-1">'
                 f'<img src="{c["img"]}" alt="{esc(c["alt"])}" /></a>')
    else:
        thumb = (f'<div class="press-thumb" data-full="{c["img"]}" data-gallery="press" data-caption="{cap}" tabindex="0" role="button" '
                 f'aria-label="View the {esc(c["outlet"])} clipping full size"><img src="{c["img"]}" alt="{esc(c["alt"])}" />'
                 f'<span class="press-zoom">View clipping</span></div>')
    orig = f'\n          <p class="press-orig" lang="{c.get("lang", "hi")}">{esc(c["original"])}</p>' if c.get("original") else ""
    qlang = f' lang="{c["quote_lang"]}"' if c.get("quote_lang") else ""
    quote = (f'\n          <blockquote class="press-quote"{qlang}><p>“{esc(c["quote"])}”</p><cite>{esc(c["outlet"])}</cite></blockquote>'
             if c.get("quote") else "")
    actions = []
    if c.get("url"):
        actions.append(f'<a class="press-link" href="{c["url"]}" target="_blank" rel="noopener">Read on {esc(c["outlet"])} {EXT_SVG}</a>')
    else:
        actions.append(f'<span class="press-link" data-full="{c["img"]}" data-gallery="press-read" data-caption="{cap}" tabindex="0" role="button">Read the clipping</span>')
    for item in c.get("also", []):
        n, u, label = item[0], item[1], (item[2] if len(item) > 2 else item[0])
        actions.append(f'<a class="press-link" href="{u}" target="_blank" rel="noopener">{PLATFORM_ICON[n]} {esc(label)}</a>')
    if c.get("extra"):
        actions.append(f'<span class="press-link" data-full="{c["extra"]}" data-gallery="press-read" data-caption="{cap} (print edition)" tabindex="0" role="button">See the printed page</span>')
    src = f'<span class="press-kind">{KIND_LABEL[c["kind"]]}</span><b>{esc(c["outlet"])}</b><span>{esc(c["place"])}</span>{time_tag(c["date"])}'
    return f"""<article class="press-item reveal" id="{c['id']}">
        {thumb}
        <div class="press-body">
          <div class="press-src">{src}</div>
          <h3>{esc(c['headline'])}</h3>{orig}
          <p>{esc(c['summary'])}</p>{quote}
          <div class="press-actions">{''.join(actions)}</div>
        </div>
      </article>"""


def render_press():
    items = by_date(cov("online") + cov("print"))
    return '<div class="press-list">\n      ' + "\n      ".join(press_item(c) for c in items) + "\n    </div>"


def client_post(c, with_id=True, tag="our client"):
    links = "".join(f'<a class="cp-link cp-{n.lower()}" href="{u}" target="_blank" rel="noopener">{PLATFORM_ICON[n]}{n}</a>'
                    for n, u in c["links"])
    ident = f' id="{c["id"]}"' if with_id else ""
    return f"""<article class="client-post reveal"{ident}>
        <div class="cp-head"><span class="cp-mono">{initials(c['outlet'])}</span><div><b>{esc(c['outlet'])}</b><span>{esc(c['place'])}{" · " + tag if tag else ""}</span></div>{time_tag(c['date'])}</div>
        <h3>{esc(c['headline'])}</h3>
        <blockquote class="cp-quote"><p>“{esc(c['quote'])}”</p></blockquote>
        <p class="cp-sum">{esc(c['summary'])}</p>
        <div class="cp-links"><span>Read the original post on</span>{links}</div>
      </article>"""


EMBED_SCRIPTS = {
    "X": '<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>',
    "Facebook": '<div id="fb-root"></div><script async defer crossorigin="anonymous" src="https://connect.facebook.net/en_US/sdk.js#xfbml=1&amp;version=v19.0"></script>',
    "Instagram": '<script async src="https://www.instagram.com/embed.js"></script>',
}
PLATFORM_NAME = {"X": "X", "Facebook": "Facebook", "Instagram": "Instagram"}


def social_embed(platform, url, name, handle, text, iso):
    """The platform's official embed; the inner markup is a post-style card shown until (or if) the embed loads."""
    when = fmt_date(iso)
    card = (f'<span class="se-head"><span class="se-ava">{initials(name)}</span><span class="se-who"><b>{esc(name)}</b>'
            f'<small>{esc(handle)}</small></span><span class="se-logo se-logo--{platform.lower()}">{PLATFORM_ICON[platform]}</span></span>'
            f'<span class="se-text">{esc(text)}</span>'
            f'<span class="se-foot"><time datetime="{iso}">{when}</time><a href="{url}" target="_blank" rel="noopener">View on {PLATFORM_NAME[platform]}</a></span>')
    if platform == "X":
        tw = url.replace("https://x.com/", "https://twitter.com/") + "?ref_src=twsrc%5Etfw"
        inner = f'<blockquote class="se-card" data-embed-class="twitter-tweet" data-dnt="true" data-conversation="none"><p lang="en" dir="ltr">{card}</p><a href="{tw}"></a></blockquote>'
    elif platform == "Facebook":
        inner = (f'<div data-embed-class="fb-post" data-href="{url}" data-width="500" data-show-text="true">'
                 f'<blockquote cite="{url}" class="fb-xfbml-parse-ignore se-card">{card}</blockquote></div>')
    else:
        inner = (f'<blockquote class="se-card" data-embed-class="instagram-media" data-instgrm-permalink="{url}" data-instgrm-version="14" '
                 f'data-instgrm-captioned>{card}</blockquote>')
    # components.js swaps the card for the platform's official embed as the visitor scrolls near it.
    return f'<div class="se reveal" data-platform="{platform.lower()}">{inner}</div>'


def embed_items(ids=None):
    out = []
    for c in COVERAGE:
        if ids and c["id"] not in ids:
            continue
        if c["kind"] == "official":
            for platform, url in c["links"]:
                out.append((platform, url, c["outlet"], c["handle"], c["quote"], c["date"]))
        elif c.get("social_text"):
            for platform, url, *_ in c.get("also", []):
                if platform not in ("X", "Facebook", "Instagram") or "/story.php" in url or url.count("/") <= 3:
                    continue
                out.append((platform, url, c["outlet"], "thesentineldigital" if platform == "Instagram" else c["outlet"], c["social_text"], c["date"]))
    return out


def render_official(ids=None, with_ids=True):
    ids = ids or [c["id"] for c in COVERAGE if c["kind"] == "official" or c.get("social_text")]
    items = embed_items(ids)
    return '<div class="se-wall">\n      ' + "\n      ".join(social_embed(*i) for i in items) + "\n    </div>"


def render_clients():
    return ('<div class="client-posts">\n      ' + "\n      ".join(client_post(c) for c in by_date(cov("client")))
            + "\n    </div>")


def featured_list():
    seen, out = set(), []
    for c in cov("tv") + by_date(cov("online") + cov("print")):
        if c["outlet"] in seen or c["outlet"].startswith("Hindi daily"):
            continue
        seen.add(c["outlet"])
        tag = '<span class="fi-tv">TV</span>' if c["kind"] == "tv" else ""
        out.append(f'<li><a href="recognition.html#{c["id"]}">{tag}{esc(c["outlet"])}</a></li>')
    return "".join(out)


def render_featured_inner():
    national = "".join(f'<li><a href="recognition.html#national-tv"><span class="fi-tv">TV</span>{n}</a></li>' for n in NATIONAL_TV)
    return f"""<div class="featured-in reveal">
      <div class="fi-row"><span class="fi-label">Our work in the news</span><ul class="fi-list">{featured_list()}</ul></div>
      <div class="fi-row"><span class="fi-label">Shared by official handles</span><ul class="fi-list">{"".join(f'<li><a href="recognition.html#official-handles"><span class="fi-tv fi-off">OFFICIAL</span>{esc(c["outlet"])}</a></li>' for c in cov("official"))}</ul></div>
      <div class="fi-row"><span class="fi-label">Our founder on national TV</span><ul class="fi-list">{national}</ul></div>
    </div>"""


def render_press_band():
    return f"""<section class="featured-band" aria-label="Media coverage of Arrays Ingenieria">
  <div class="container">
    {render_featured_inner()}
  </div>
</section>"""


def render_home_news():
    lead = cov("tv")[0]
    sentinel = next(c for c in COVERAGE if c["kind"] == "online")
    client = by_date(cov("client"))[-1]
    def quote_card(c, label, d):
        return (f'<a class="quote-card reveal" data-d="{d}" href="recognition.html#{c["id"]}">'
                f'<span class="qc-src"><span class="press-kind">{label}</span><b>{esc(c["outlet"])}</b>{time_tag(c["date"])}</span>'
                f'<span class="qc-head">{esc(c["headline"])}</span>'
                f'<blockquote><p>“{esc(c["quote"])}”</p></blockquote><span class="qc-go">Read the coverage {ARROW_SVG}</span></a>')
    return f"""{render_featured_inner()}
    <div class="home-news">
      {tv_card(lead, lead=False, with_id=False)}
      {quote_card(sentinel, KIND_LABEL['online'], 1)}
      {quote_card(client, KIND_LABEL['client'], 2)}
    </div>"""


def coverage_ld():
    org = {"@id": SITE_URL + "/#organization"}
    items = []
    for c in COVERAGE:
        publisher = {"@type": "Organization", "name": c["outlet"]}
        if c["kind"] in ("client", "official"):
            node = {"@type": "SocialMediaPosting", "headline": c["headline"], "url": c["links"][0][1],
                    "sameAs": [u for _, u in c["links"][1:]] or None, "author": {"@type": "Organization", "name": c["outlet"]},
                    "articleBody": c["quote"], "about": org}
        elif c.get("youtube"):
            node = {"@type": "VideoObject", "name": c.get("original") or c["headline"], "alternativeHeadline": c["headline"],
                    "description": c["summary"], "url": c["url"], "embedUrl": f"https://www.youtube-nocookie.com/embed/{c['youtube']}",
                    "thumbnailUrl": f"{SITE_URL}/{c['img']}", "uploadDate": c["date"], "publisher": publisher, "about": org,
                    "inLanguage": "hi"}
        elif c["kind"] == "tv":
            node = {"@type": "CreativeWork", "genre": "News report (video)", "name": c["headline"], "url": c["url"],
                    "publisher": publisher, "description": c["summary"], "about": org}
        else:
            node = {"@type": "NewsArticle", "headline": c.get("original") or c["headline"], "publisher": publisher,
                    "description": c["summary"], "about": org, "inLanguage": c.get("lang", "en")}
            if c.get("original"):
                node["alternativeHeadline"] = c["headline"]
            node["url"] = c.get("url")
            node["image"] = f"{SITE_URL}/{c['img']}" if not c.get("url") else None
        if c["date"]:
            node["datePublished"] = c["date"]
        items.append({k: v for k, v in node.items() if v is not None})
    return {"@context": "https://schema.org", "@type": "CollectionPage",
            "name": "Arrays Ingenieria in the news", "url": SITE_URL + "/recognition/",
            "about": org, "mainEntity": {"@type": "ItemList", "numberOfItems": len(items),
            "itemListElement": [{"@type": "ListItem", "position": i + 1, "item": it} for i, it in enumerate(items)]}}


# ------------------------------------------- quotes, schemes, timeline ----
QUOTE_NOTE = ("Public statements on India's clean-energy and veterans' agenda, quoted from the official sources linked. "
              "They are national context for our work, not endorsements of Arrays Ingenieria. Official portraits used under the "
              "Government Open Data License – India; the Government of India does not endorse this website.")


def quote_figure(q, cls="lq-card"):
    words = f'“{esc(q["quote"])}”'
    reported = '<span class="lq-rep">As reported by PIB</span>' if q.get("reported") else ""
    photo = (f'<span class="lq-photo"><img src="{q["photo"]}" alt="{esc(q["photo_alt"])}" width="240" height="240" />'
             f'<span class="lq-tag">{q["mono"]}</span></span>')
    credit = (f'<span class="lq-credit">Photo: <a href="{q["photo_url"]}" target="_blank" rel="noopener">{esc(q["photo_credit"])}, '
              f'GODL-India</a></span>')
    return (f'<figure class="{cls}" id="quote-{q["id"]}">{photo}'
            f'<blockquote><p>{words}</p></blockquote>'
            f'<figcaption><b>{esc(q["who"])}</b><span>{esc(q["role"])}</span>'
            f'<small>{esc(q["context"])} · {time_tag(q["date"])}{reported}</small>'
            f'<a href="{q["url"]}" target="_blank" rel="noopener">Source: {esc(q["source"])} {EXT_SVG}</a>{credit}</figcaption></figure>')


def render_leader_quotes():
    slides = "".join(quote_figure(q, "lq-card lq-slide") for q in LEADER_QUOTES)
    return f"""<div class="lq-slider reveal" data-interval="7000">
      <div class="lq-track">{slides}</div>
      <div class="lq-nav"><button class="lq-prev" aria-label="Previous quote">&#8249;</button><div class="lq-dots"></div><button class="lq-next" aria-label="Next quote">&#8250;</button></div>
    </div>
    <p class="lq-note">{QUOTE_NOTE}</p>"""


def render_leader_grid():
    return ('<div class="lq-grid">' + "".join(quote_figure(q, "lq-card reveal") for q in LEADER_QUOTES)
            + f'</div>\n    <p class="lq-note">{QUOTE_NOTE}</p>')


def render_national_facts():
    cards = []
    for i, f in enumerate(NATIONAL_FACTS):
        cards.append(f'<a class="nf-card reveal" data-d="{i}" href="{f["url"]}" target="_blank" rel="noopener">'
                     f'<span class="nf-num"><span data-count="{f["num"]}">{f["num"]}</span><small>{f["suffix"]}</small></span>'
                     f'<span class="nf-lbl">{esc(f["label"])}</span><span class="nf-src">Source: {"MNRE data" if "solarquarter" in f["url"] else "PIB"} {EXT_SVG}</span></a>')
    return '<div class="nf-grid">' + "".join(cards) + "</div>"


def render_schemes():
    cards = []
    for i, (title, who, points, fit, src, url) in enumerate(SCHEMES):
        pts = "".join(f"<li>{esc(p)}</li>" for p in points)
        source = (f'<a class="sc-src" href="{url}" target="_blank" rel="noopener">Source: {esc(src)} {EXT_SVG}</a>' if url
                  else f'<span class="sc-src">Source: {esc(src)}</span>')
        cards.append(f'<article class="scheme-card reveal" data-d="{i % 3}"><span class="sc-who">{esc(who)}</span><h3>{esc(title)}</h3>'
                     f'<ul>{pts}</ul><p class="sc-fit"><b>Where we fit:</b> {esc(fit)}</p>{source}</article>')
    return '<div class="scheme-grid">' + "".join(cards) + "</div>"


def render_panchamrit():
    items = "".join(f'<li class="pa-item reveal" data-d="{i % 5}"><span class="pa-n">{i + 1}</span><p>{esc(t)}</p></li>'
                    for i, t in enumerate(PANCHAMRIT))
    return (f'<ol class="panchamrit">{items}</ol><p class="lq-note">The five commitments in the Prime Minister\'s words, from his '
            f'national statement at COP26, Glasgow, 1 November 2021 (<a href="{PANCHAMRIT_URL}" target="_blank" rel="noopener">PIB</a>).</p>')


def render_timeline():
    items = []
    for i, (label, iso, title, text, link) in enumerate(TIMELINE):
        side = "l" if i % 2 == 0 else "r"
        items.append(f'<li class="tl-item tl-{side} reveal"><span class="tl-dot" aria-hidden="true"></span>'
                     f'<div class="tl-card"><time datetime="{iso}">{label}</time><h3>{esc(title)}</h3><p>{esc(text)}</p>'
                     f'<a href="{link}">Read more →</a></div></li>')
    return '<ol class="timeline" data-timeline>' + "".join(items) + "</ol>"


KOOMBER_VIDEOS = [
    ("assets/video/arrays-ingenieria-ex-servicemen-led-koomber-tea-estate-595kwp-solar-assam-cm-inauguration-video-1.mp4", "assets/video/arrays-ingenieria-ex-servicemen-led-koomber-tea-estate-595kwp-solar-assam-cm-inauguration-video-1.jpg",
     "The Chief Minister of Assam cuts the ribbon at the 595 kWp Koomber Tea Estate solar plant installed by Arrays Ingenieria", "PT12S", "portrait"),
    ("assets/video/arrays-ingenieria-ex-servicemen-led-koomber-tea-estate-595kwp-solar-assam-cm-inauguration-video-2.mp4", "assets/video/arrays-ingenieria-ex-servicemen-led-koomber-tea-estate-595kwp-solar-assam-cm-inauguration-video-2.jpg",
     "The inauguration ceremony at the Koomber Tea Estate 595 kWp solar plant, 1 October 2026, Arrays Ingenieria installation partner", "PT12S", "landscape"),
]


def render_koomber_videos():
    dims = {poster: image_size(os.path.join(ROOT, poster)) or (16, 9) for _, poster, _, _, _ in KOOMBER_VIDEOS}
    items = "".join(f'<figure class="kv kv--{o} reveal" data-d="{i}"><video poster="{poster}" width="{dims[poster][0]}" height="{dims[poster][1]}" muted loop playsinline autoplay preload="metadata" '
                    f'aria-label="{esc(cap)}"><source src="{src}" type="video/mp4" /><source src="{src[:-4]}.webm" type="video/webm" /></video><figcaption>{esc(cap)}</figcaption></figure>'
                    for i, (src, poster, cap, _, o) in enumerate(KOOMBER_VIDEOS))
    return f'<div class="kv-grid">{items}</div>'


VIDEO_DESC = (" Part of the 3.11 MW Goodricke Tea Estates Solar Programme developed by Tata Power Renewable Energy and Sustvest. "
              "Arrays Ingenieria (Ingenieria) is an ex-servicemen-led solar EPC and installation MSME.")


def koomber_video_ld():
    return [{"@context": "https://schema.org", "@type": "VideoObject", "name": cap, "description": cap + "." + VIDEO_DESC,
             "embedUrl": f"{SITE_URL}/project-koomber-tea-estate-595kwp-solar-cm-inauguration.html#videos",
             "contentLocation": {"@type": "Place", "name": "Koomber Tea Estate, Cachar, Assam"},
             "contentUrl": f"{SITE_URL}/{src}", "thumbnailUrl": f"{SITE_URL}/{poster}", "uploadDate": "2026-10-01",
             "duration": dur, "publisher": {"@id": SITE_URL + "/#organization"}} for src, poster, cap, dur, _ in KOOMBER_VIDEOS]


def render_cm_showcase(videos=True):
    case = "project-koomber-tea-estate-595kwp-solar-cm-inauguration.html"
    pics = KOOMBER_ALBUM[:4]
    mosaic = "".join(f'<div class="cm-pic cm-pic--{i}" data-full="{src}" data-gallery="cm-show" data-caption="{esc(alt)}"><img src="{src}" alt="{esc(alt)}" /></div>'
                     for i, (src, alt) in enumerate(pics))
    chips = "".join(f'<a class="cm-chip" href="{u}" target="_blank" rel="noopener">{PLATFORM_ICON.get(n, "")}<span>{esc(lbl)}</span></a>' for lbl, n, u in [
        ("CM's Office on X", "X", "https://x.com/CMOfficeAssam/status/2105545750054928662"),
        ("CM's Office on Facebook", "Facebook", "https://www.facebook.com/cmofficeassam/photos/d41d8cd9/1422387263413542/?set=a.302403535411926"),
        ("MLA Kaushik Rai on X", "X", "https://x.com/iKaushikRai/status/2105642116089008488"),
        ("MLA Kaushik Rai on Facebook", "Facebook", "https://www.facebook.com/100065189221572/posts/pfbid0MmznkBYfeKxNF66pmnNDk3iEFfGnY1wan7LNwMDm4316vznz3bg86ZkZwAgdjheHl/"),
        ("MLA Rajdeep Goala on X", "X", "https://x.com/RajdeepGoala14/status/2105730931860574342"),
        ("MLA Rajdeep Goala on Facebook", "Facebook", "https://www.facebook.com/100063684971835/posts/1732055695593913/"),
        ("The Sentinel", "", "https://www.sentinelassam.com/breakingnews/assam-himanta-biswa-sarma-inaugurates-595-kwp-solar-plant-at-koomber-tea-estate"),
        ("The Sentinel on Instagram", "Instagram", "https://www.instagram.com/p/Dd89-ViDQcG/"),
        ("The Sentinel on Facebook", "Facebook", "https://www.facebook.com/100066523279937/posts/pfbid05Ug3kevPqUdUBp7ZyFbD8Eix3hYRzu78MVR8yNixHt17o5B3cShMNFXW1o4Mw1Y8l/")])
    rai = next(c for c in COVERAGE if c["id"] == "kaushik-rai-koomber")
    goala = next(c for c in COVERAGE if c["id"] == "rajdeep-goala-koomber")
    return f"""<div class="cm-show">
      <div class="cm-mosaic reveal">{mosaic}<span class="cm-badge"><b>1 Oct 2026</b>Koomber Tea Estate, Assam</span></div>
      <div class="cm-text reveal" data-d="1">
        <span class="cm-kicker">Inaugurated by the Hon'ble Chief Minister of Assam</span>
        <h3>Dr Himanta Biswa Sarma opens the 595 kWp solar plant we installed at Koomber Tea Estate</h3>
        <p>Part of the 3.11 MW Goodricke Tea Estates Solar Programme with Tata Power Renewable Energy and Sustvest, with Arrays Ingenieria as installation partner.</p>
        <blockquote class="cm-quote"><p>“{esc(rai['quote'])}”</p><cite>{esc(rai['outlet'])}, on X and Facebook</cite></blockquote>
        <blockquote class="cm-quote"><p>“{esc(goala['quote'])}”</p><cite>{esc(goala['outlet'])}, on X and Facebook</cite></blockquote>
        <div class="cm-chips"><span>Shared and reported by</span>{chips}</div>
        <div class="cm-cta"><a class="btn btn--sun" href="{case}">See the inauguration {ARROW_SVG}</a><a class="btn btn--ghost" href="{case}#album">Photo album ({len(KOOMBER_ALBUM)})</a></div>
      </div>
    </div>""" + (f"""
    <div class="kv-head reveal"><span class="cm-kicker">Watch</span><b>The inauguration on video</b></div>
    {render_koomber_videos()}""" if videos else "")


BLOCKS = {
    "press-tv": lambda: render_tv(),
    "press-print": render_press,
    "press-clients": render_clients,
    "press-home": render_home_news,
    "press-band": render_press_band,
    "videos": lambda: render_tv(with_ids=False),
    "leader-quotes": render_leader_quotes,
    "leader-grid": render_leader_grid,
    "national-facts": render_national_facts,
    "schemes": render_schemes,
    "timeline": render_timeline,
    "cm-showcase": render_cm_showcase,
    "cm-showcase-home": lambda: render_cm_showcase(videos=False),
    "koomber-videos": render_koomber_videos,
    "press-official": render_official,
    "panchamrit": render_panchamrit,
}


# ------------------------------------------------------ generated pages ----
def page_shell(page_key, body, og_image, og_alt, ld=None, extra_head=""):
    """A complete page; the build fills in title, meta, canonical and header/footer."""
    ld_html = "".join('<script type="application/ld+json">\n' + json.dumps(x, ensure_ascii=False, indent=2) + "\n</script>\n"
                      for x in (ld or []))
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="theme-color" content="#0f7a57" />
<title>x</title>
<meta property="og:image" content="{SITE_URL}/{og_image}" />
<meta property="og:image:alt" content="{esc(og_alt)}" />
<link rel="icon" type="image/png" sizes="32x32" href="assets/img/favicon-32.png" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Poppins:wght@500;600;700;800&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="assets/css/style.css?v={ASSET_VERSION}" />
{extra_head}{ld_html}</head>
<body data-page="{page_key}">
<!-- build:header --><!-- /build:header -->

{body}

<!-- build:footer --><!-- /build:footer -->
<script src="assets/js/components.js?v={ASSET_VERSION}"></script>
<script src="assets/js/main.js?v={ASSET_VERSION}"></script>
</body>
</html>
"""


def page_hero(img, alt, eyebrow, h1, lead, crumbs):
    trail = '<a href="/">Home</a>' + "".join(
        f'<span>/</span><a href="{href}">{esc(name)}</a>' if href else f"<span>/</span>{esc(name)}" for name, href in crumbs)
    return f"""<section class="page-hero">
  <div class="page-hero__bg"><img src="{img}" alt="{esc(alt)}" /></div>
  <div class="container">
    <span class="eyebrow">{eyebrow}</span>
    <h1>{h1}</h1>
    <p>{lead}</p>
    <nav class="breadcrumb" aria-label="Breadcrumb">{trail}</nav>
  </div>
</section>"""


PAGE_TITLES = {}  # filled lazily: file -> short label used for related links


def page_label(fname):
    return {"service-ground-mount.html": "Ground-Mount Solar", "service-rooftop.html": "Rooftop Solar",
            "service-epc.html": "EPC Turnkey", "service-piling.html": "Pile Foundations",
            "service-civil.html": "Civil Works & Fencing", "service-om.html": "O&M & Support",
            "capex-solar-epc.html": "CAPEX Solar EPC", "solar-installation-commissioning.html": "Installation & Commissioning",
            "solar-for-tea-estates.html": "Solar for Tea Estates"}.get(fname, PAGES[fname]["crumb"])


def case_card(p, d=0):
    img, alt = p["photos"][0]
    return (f'<a class="case-card reveal" data-d="{d % 3}" href="{p["file"]}"><span class="cc-img"><img src="{img}" alt="{esc(alt)}" /></span>'
            f'<span class="cc-body"><span class="cc-tag">{esc(p["tag"])}</span><b>{esc(p["name"])}</b>'
            f'<span class="cc-meta">{esc(p["capacity"])} · {esc(p["location"])}</span>'
            f'<span class="cc-go">Read the case study {ARROW_SVG}</span></span></a>')


def render_case_cards(service=None, exclude=None, limit=None):
    items = [p for p in PROJECTS if (not service or service in p["services"]) and p["file"] != exclude]
    items = items[:limit] if limit else items
    return '<div class="case-grid">\n      ' + "\n      ".join(case_card(p, i) for i, p in enumerate(items)) + "\n    </div>"


def coverage_mini(ids):
    out = []
    for c in COVERAGE:
        if c["id"] in ids:
            out.append(f'<a class="cov-mini" href="recognition.html#{c["id"]}"><span class="press-kind">{KIND_LABEL[c["kind"]]}</span>'
                       f'<b>{esc(c["outlet"])}</b>{time_tag(c["date"])}<span class="cov-h">{esc(c["headline"])}</span></a>')
    return "".join(out)


def render_project_page(p):
    facts = [("Capacity", p["capacity"]), ("Plant type", p["kind"]), ("Location", p["location"]), ("Client", p["client"]),
             ("Partner / programme", p["partner"]), ("Our role", p["role"]), ("Year", p["year"])]
    specs = "".join(f'<div class="spec"><span>{k}</span><b>{esc(v)}</b></div>' for k, v in facts if v)
    body = "".join(f"\n      <p>{esc(x)}</p>" for x in p["body"])
    scope = "".join(f'\n        <li><span class="tick"></span>{esc(x)}</li>' for x in p["scope"])
    photos = ""
    if p["photos"]:
        photos = '\n      <h3>Photos</h3>\n      <div class="detail-photos">' + "".join(
            f'<div class="ph" data-full="{src}" data-gallery="case" data-caption="{esc(alt)}"><img src="{src}" alt="{esc(alt)}" /></div>'
            for src, alt in p["photos"]) + "</div>"
    docs = ""
    if p["docs"]:
        docs = f"""
<section class="section section--soft">
  <div class="container">
    <div class="section-head center reveal"><span class="eyebrow">Documents</span><h2>Orders, Certificates &amp; <span class="text-grad">Press</span></h2><p>The documents behind this case study. Tap to view full size.</p></div>
    <div class="clip-grid">""" + "".join(
            f'\n      <div class="clip reveal" data-full="{src}" data-gallery="docs" data-caption="{esc(cap)}"><img src="{src}" alt="{esc(cap)}, Arrays Ingenieria" /><div class="ccap">{esc(cap)}</div></div>'
            for src, cap in p["docs"]) + "\n    </div>\n  </div>\n</section>"
    cov = ""
    if p["coverage"]:
        cov = f'\n      <h3>In the news</h3>\n      <div class="cov-list">{coverage_mini(p["coverage"])}</div>'
    impact = ""
    if p.get("impact"):
        im = p["impact"]
        paras = "".join(f"<p>{esc(x)}</p>" for x in im["paras"])
        srcs = "; ".join(f'<a href="{u}" target="_blank" rel="noopener">{esc(n)}</a>' for n, u in im["sources"])
        impact = f"""
<section class="section section--news impact-band">
  <div class="container">
    <div class="impact reveal"><span class="eyebrow">Why It Matters</span><h2>{esc(im['heading'])}</h2>{paras}<p class="src-note">Sources: {srcs}.</p></div>
  </div>
</section>"""
    extra = ""
    if p.get("official"):
        extra += f"""
<section class="section section--news" id="official">
  <div class="container">
    <div class="section-head center reveal"><span class="eyebrow">On Official Handles</span><h2>As Posted on <span class="text-sun">Official Handles</span></h2><p>The inauguration as posted by the Chief Minister's Office, MLAs Kaushik Rai and Rajdeep Goala, and The Sentinel, shown as the original posts.</p></div>
    {render_official(p["official"] + p["coverage"], with_ids=False)}
  </div>
</section>"""
    if p.get("people"):
        ppl = "".join(f'<li><span class="tick"></span>{esc(x)}</li>' for x in p["people"])
        extra += f"""
<section class="section">
  <div class="container">
    <div class="section-head center reveal"><span class="eyebrow">Present at the Inauguration</span><h2>Leaders Who <span class="text-grad">Joined the Chief Minister</span></h2></div>
    <ul class="detail-list people-list reveal">{ppl}</ul>
  </div>
</section>"""
    if p.get("videos"):
        extra += f"""
<section class="section section--news" id="videos">
  <div class="container">
    <div class="section-head center reveal"><span class="eyebrow">Video</span><h2>The Inauguration <span class="text-sun">on Video</span></h2><p>The Chief Minister of Assam inaugurates the plant, 1 October 2026.</p></div>
    {render_koomber_videos()}{yt_block(p["coverage"])}
  </div>
</section>"""
    if p.get("album"):
        figs = "\n".join(f'      <figure class="g-item reveal" data-full="{src}" data-gallery="album" data-caption="{esc(alt)}"><img src="{src}" alt="{esc(alt)}" /><figcaption>{esc(alt)}</figcaption></figure>' for src, alt in p["album"])
        extra += f"""
<section class="section section--soft" id="album">
  <div class="container">
    <div class="section-head center reveal"><span class="eyebrow">Photo Album</span><h2>The Inauguration <span class="text-grad">in Pictures</span></h2><p>{esc(p.get("album_lead", ""))} Tap any photo to view it full size.</p></div>
    <div class="gallery-grid captioned">
{figs}
    </div>
  </div>
</section>"""
    related = "".join(f'<a href="{f}">{esc(page_label(f))}</a>' for f in p["services"])
    others = [q for q in PROJECTS if q["file"] != p["file"]]
    same = [q for q in others if q["cat"] == p["cat"]] + [q for q in others if q["cat"] != p["cat"]]
    hero_alt = p.get("hero_alt") or next((a for s, a in p["photos"] if s == p["hero"]), p["name"])
    body_html = page_hero(p["hero"], hero_alt, f"Case Study · {esc(p['tag'])}", esc(p["name"]), esc(p["intro"]),
                          [("Projects", "projects.html"), (p["short"], None)]) + f"""

<section class="section">
  <div class="container detail-grid">
    <div class="detail-body reveal">
      <span class="eyebrow">The Project</span>
      <h2>About the {esc(p['short'].split(' · ')[0])} project</h2>{body}
      <h3>Our scope of work</h3>
      <ul class="detail-list">{scope}
      </ul>{cov}{photos}
    </div>
    <aside class="detail-aside reveal" data-d="1">
      <div class="aside-card">
        <h2 class="aside-h">Project facts</h2>
        {specs}
      </div>
      <div class="aside-card cta">
        <h2 class="aside-h">Planning a similar project?</h2>
        <p>Talk to our veteran-led team about EPC, installation &amp; commissioning or civil works.</p>
        <a class="btn btn--sun" href="free-solar-quote.html" style="width:100%;">Get a Free Quote</a>
      </div>
    </aside>
  </div>
</section>
{impact}{extra}{docs}
<section class="section">
  <div class="container">
    <div class="section-head center reveal"><span class="eyebrow">Related</span><h2>Services Used on <span class="text-grad">This Project</span></h2></div>
    <div class="svc-other reveal">{related}<a href="projects.html">All Projects &rarr;</a></div>
  </div>
</section>

<section class="section section--soft">
  <div class="container">
    <div class="section-head center reveal"><span class="eyebrow">More Case Studies</span><h2>Other Projects by <span class="text-grad">Arrays Ingenieria</span></h2></div>
    <div class="case-grid">{"".join(case_card(q, i) for i, q in enumerate(same[:3]))}</div>
  </div>
</section>"""
    ld = [{"@context": "https://schema.org", "@type": "WebPage", "name": p["name"], "url": SITE_URL + "/" + p["file"],
           "description": p["desc"], "primaryImageOfPage": f"{SITE_URL}/{p['hero']}",
           "about": {"@type": "Place", "name": p["location"]},
           "mentions": [{"@type": "Organization", "name": x} for x in (p["client"], p["partner"]) if x],
           "publisher": {"@id": SITE_URL + "/#organization"}}]
    links = [c for c in COVERAGE if c["id"] in p["coverage"] + p.get("official", [])]
    if links:
        ld[0]["citation"] = [c.get("url") or c["links"][0][1] for c in links if c.get("url") or c.get("links")]
        ld[0]["subjectOf"] = [u for c in links for _, u, *_ in (c.get("links") or []) + (c.get("also") or [])]
    if p.get("album"):
        ld.append({"@context": "https://schema.org", "@type": "ImageGallery", "name": f"{p['name']}: inauguration photos",
                   "url": f"{SITE_URL}{page_url(p['file'])}#album", "creator": {"@id": SITE_URL + "/#organization"},
                   "image": [{"@type": "ImageObject", "contentUrl": f"{SITE_URL}/{src}", "caption": alt,
                              "creator": {"@id": SITE_URL + "/#organization"}} for src, alt in p["album"]]})
    if p.get("videos"):
        ld.extend(koomber_video_ld())
        ld.append({"@context": "https://schema.org", "@type": "Event", "name": p["name"],
                   "startDate": "2026-10-01", "eventStatus": "https://schema.org/EventScheduled",
                   "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
                   "location": {"@type": "Place", "name": "Koomber Tea Estate",
                                "address": {"@type": "PostalAddress", "addressRegion": "Assam", "addressLocality": "Cachar", "addressCountry": "IN"}},
                   "description": p["intro"], "image": [f"{SITE_URL}/{src}" for src, _ in p["album"][:6]],
                   "performer": {"@type": "Person", "name": "Dr Himanta Biswa Sarma", "jobTitle": "Chief Minister of Assam"},
                   "attendee": [
                       {"@type": "Person", "name": "Shri Kaushik Rai", "jobTitle": "MLA, Lakhipur",
                        "sameAs": ["https://x.com/iKaushikRai"],
                        "subjectOf": "https://x.com/iKaushikRai/status/2105642116089008488"},
                       {"@type": "Person", "name": "Shri Rajdeep Goala", "jobTitle": "MLA, Udharbond",
                        "sameAs": ["https://x.com/RajdeepGoala14"],
                        "subjectOf": "https://x.com/RajdeepGoala14/status/2105730931860574342"},
                       {"@type": "Person", "name": "Shri Krishnendu Paul", "jobTitle": "Minister of Public Health Engineering and MLA, Patharkandi"},
                       {"@type": "Person", "name": "Dr Rajdeep Roy", "jobTitle": "MLA, Silchar"}],
                   "organizer": {"@type": "Organization", "name": "Goodricke Group"},
                   "contributor": {"@id": SITE_URL + "/#organization"}})
    return page_shell("projects", body_html, p["hero"], hero_alt, ld)


def render_faq_page():
    items = "".join(f'\n      <details class="faq"{" open" if i == 0 else ""}><summary>{esc(q)}</summary><div class="faq-a">{esc(a)}</div></details>'
                    for i, (q, a) in enumerate(FAQ))
    ld = [{"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [
        {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in FAQ]}]
    body = page_hero("assets/photos/arrays-ingenieria-towkok-tea-estate-535kwp-ground-mount-solar-assam.jpg", "Towkok Tea Estate solar plant in Assam built by Arrays Ingenieria",
                     "Frequently Asked Questions", 'Solar EPC, <span class="text-sun">Answered</span>',
                     "What we do, how the CAPEX model works, what installation &amp; commissioning covers, and how to start a project with us.",
                     [("FAQ", None)]) + f"""

<section class="section">
  <div class="container">
    <div class="faq-list reveal">{items}
    </div>
    <div class="section-cta reveal"><a class="btn btn--primary" href="contact.html">Ask Us Anything {ARROW_SVG}</a><a class="btn btn--outline" href="solar-glossary.html">Solar Glossary</a></div>
  </div>
</section>"""
    return page_shell("faq", body, "assets/photos/arrays-ingenieria-towkok-tea-estate-535kwp-ground-mount-solar-assam.jpg", "Towkok Tea Estate solar plant by Arrays Ingenieria", ld)


def render_insights_page():
    img = "assets/photos/arrays-ingenieria-industrial-rooftop-solar-array.jpg"
    cards, arts, posts = [], [], []
    for i, a in enumerate(INSIGHTS):
        words = len(re.sub(r"<[^>]+>", " ", " ".join(a["paras"])).split())
        mins = max(2, round(words / 200))
        cards.append(f'<a class="ins-card reveal" data-d="{i % 3}" href="#{a["id"]}"><span class="ins-tag">{esc(a["tag"])}</span>'
                     f'<b>{esc(a["title"])}</b><span class="ins-sum">{esc(a["summary"])}</span><span class="ins-meta">{mins} min read {ARROW_SVG}</span></a>')
        keys = "".join(f"<li>{esc(t)}</li>" for t in a["takeaways"])
        srcs = ("<p class=\"src-note\">Sources: " + "; ".join(f'<a href="{u}" target="_blank" rel="noopener">{esc(n)}</a>' for n, u in a["sources"]) + ".</p>") if a["sources"] else ""
        paras = "".join(f"<p>{x}</p>" for x in a["paras"])
        soft = " section--soft" if i % 2 else ""
        arts.append(f"""
<section class="section{soft}">
  <article class="container prose ins-article reveal" id="{a["id"]}">
    <span class="eyebrow">Guide {i + 1:02d} · {esc(a["tag"])}</span>
    <h2>{esc(a["title"])}</h2>
    <p class="ins-byline">By the Arrays Ingenieria engineering team · <time datetime="{a["date"]}">Updated {date.fromisoformat(a["date"]).strftime("%d %b %Y").lstrip("0")}</time> · {mins} min read</p>
    <div class="ins-keys"><b>Key takeaways</b><ul>{keys}</ul></div>
    {paras}{srcs}
    <p class="ins-cta"><a class="btn btn--primary" href="contact.html">Talk to our engineers {ARROW_SVG}</a><a class="ins-top" href="#guides">All guides ↑</a></p>
  </article>
</section>""")
        posts.append({"@type": "BlogPosting", "headline": a["title"], "description": a["summary"],
                      "url": f"{SITE_URL}/insights.html#{a['id']}", "datePublished": a["date"], "dateModified": a["date"],
                      "inLanguage": "en-IN", "image": f"{SITE_URL}/{img}", "keywords": a["tag"],
                      "author": {"@id": SITE_URL + "/#organization"}, "publisher": {"@id": SITE_URL + "/#organization"},
                      "mainEntityOfPage": f"{SITE_URL}/insights.html"})
    ld = [{"@context": "https://schema.org", "@type": "Blog", "name": "Arrays Ingenieria Solar Insights",
           "url": SITE_URL + "/insights.html", "publisher": {"@id": SITE_URL + "/#organization"}, "blogPost": posts}]
    body = page_hero(img, "Industrial rooftop solar array installed by Arrays Ingenieria", "Solar Insights 2026",
                     'Solar Power in India, <span class="text-sun">Explained</span>',
                     "Clear, sourced guides from our ex-servicemen-led engineering team: India's 2026 solar numbers, ALMM List-II, GST at 5%, "
                     "CAPEX vs OPEX, PM Surya Ghar, PM-KUSUM and solar for tea estates.", [("Insights", None)]) + f"""

<section class="section" id="guides">
  <div class="container">
    <div class="section-head center reveal"><span class="eyebrow">{len(INSIGHTS)} Guides</span><h2>What's New in <span class="text-grad">Indian Solar</span></h2><p>Every figure is linked to its source. Updated for October 2026.</p></div>
    <div class="ins-grid">{"".join(cards)}</div>
  </div>
</section>
{"".join(arts)}

<section class="section section--soft">
  <div class="container">
    <div class="section-head center reveal"><span class="eyebrow">Keep Learning</span><h2>Schemes, Glossary &amp; <span class="text-grad">Case Studies</span></h2><p>Plain-English definitions, straight answers and real projects.</p></div>
    <div class="svc-other reveal"><a href="solar-schemes-india.html">Government Solar Schemes</a><a href="solar-glossary.html">Solar Glossary</a><a href="faq.html">FAQ</a><a href="capex-solar-epc.html">CAPEX vs OPEX</a><a href="solar-installation-commissioning.html">What is I&amp;C?</a><a href="projects.html#case-studies">Case Studies &rarr;</a></div>
  </div>
</section>"""
    return page_shell("insights", body, img, "Industrial rooftop solar array installed by Arrays Ingenieria", ld)


def render_glossary_page():
    terms = sorted(GLOSSARY, key=lambda t: t[0].lower())
    def slug(t):
        return re.sub(r"[^a-z0-9]+", "-", t.lower()).strip("-")
    letters = sorted({t[0][0].upper() for t in terms})
    index = "".join(f'<a href="#letter-{l}">{l}</a>' for l in letters)
    blocks, cur = [], None
    for term, definition in terms:
        l = term[0].upper()
        if l != cur:
            if cur:
                blocks.append("</dl>")
            blocks.append(f'<h2 class="gl-letter" id="letter-{l}">{l}</h2><dl class="gl-list">')
            cur = l
        blocks.append(f'<div class="gl-item" id="{slug(term)}"><dt>{esc(term)}</dt><dd>{esc(definition)}</dd></div>')
    blocks.append("</dl>")
    ld = [{"@context": "https://schema.org", "@type": "DefinedTermSet", "name": "Solar glossary",
           "url": SITE_URL + "/solar-glossary.html", "publisher": {"@id": SITE_URL + "/#organization"},
           "hasDefinedTerm": [{"@type": "DefinedTerm", "name": t, "description": d,
                               "url": f"{SITE_URL}/solar-glossary.html#{slug(t)}"} for t, d in terms]}]
    body = page_hero("assets/photos/arrays-ingenieria-industrial-rooftop-solar-array.jpg", "Industrial rooftop solar array installed by Arrays Ingenieria",
                     "Solar Glossary", 'Solar Terms, <span class="text-sun">in Plain English</span>',
                     "The words you will meet when planning a solar plant, from CAPEX and I&amp;C to kWp and net metering.",
                     [("Insights", "insights.html"), ("Solar Glossary", None)]) + f"""

<section class="section">
  <div class="container gl-wrap">
    <nav class="gl-index reveal" aria-label="Glossary index">{index}</nav>
    {"".join(blocks)}
    <div class="section-cta reveal"><a class="btn btn--primary" href="faq.html">Read the FAQ {ARROW_SVG}</a><a class="btn btn--outline" href="insights.html">Solar Guides</a></div>
  </div>
</section>"""
    return page_shell("insights", body, "assets/photos/arrays-ingenieria-industrial-rooftop-solar-array.jpg", "Rooftop solar array by Arrays Ingenieria", ld)


def render_clients_page():
    cards = []
    for i, (name, rel, what, files) in enumerate(CLIENTS):
        links = "".join(f'<a href="{f}">{esc(PAGES[f]["crumb"])} →</a>' for f in files)
        cards.append(f'<article class="client-card reveal" data-d="{i % 3}"><span class="cl-rel">{esc(rel)}</span><h3>{esc(name)}</h3>'
                     f'<p>{esc(what)}</p>{f"<div class=cl-links>{links}</div>" if links else ""}</article>')
    ld = [{"@context": "https://schema.org", "@type": "CollectionPage", "name": "Clients and partners of Arrays Ingenieria",
           "url": SITE_URL + "/clients.html", "about": {"@id": SITE_URL + "/#organization"},
           "mentions": [{"@type": "Organization", "name": n} for n, *_ in CLIENTS]}]
    body = page_hero("assets/photos/arrays-ingenieria-super-smelters-1980kwp-solar-plant-asansol.jpg", "Super Smelters rooftop solar plant built by Arrays Ingenieria with Tata Power Solar",
                     "Clients &amp; Partners", 'Trusted by <span class="text-sun">India\'s Leading Names</span>',
                     "EPC majors, developers and plant owners who have engaged our veteran-led team for installation, EPC and civil works.",
                     [("Clients & Partners", None)]) + f"""

<section class="section">
  <div class="container">
    <div class="section-head center reveal"><span class="eyebrow">Who We Work With</span><h2>Our Clients &amp; <span class="text-grad">What We Built for Them</span></h2><p>Each engagement is backed by a work order, purchase order, certificate or news report. Follow the links for the full case studies.</p></div>
    <div class="client-grid">
      {"".join(cards)}
    </div>
  </div>
</section>

<!-- build:press-band --><!-- /build:press-band -->

<section class="section section--soft">
  <div class="container">
    <div class="section-head center reveal"><span class="eyebrow">Case Studies</span><h2>Projects in <span class="text-grad">Detail</span></h2></div>
    <!-- build:cases --><!-- /build:cases -->
  </div>
</section>"""
    return page_shell("clients", body, "assets/photos/arrays-ingenieria-super-smelters-1980kwp-solar-plant-asansol.jpg", "Super Smelters solar plant by Arrays Ingenieria", ld)


QUOTE_SEGMENTS = [
    ("industry", "Factory or industry", "Plants, warehouses, smelters, processing units",
     '<path d="M3 21V10l6 4V10l6 4V6l6 4v11z"/><path d="M7 17h2M13 17h2"/>'),
    ("tea", "Tea estate", "Tea gardens and factories in Assam and beyond",
     '<path d="M12 21c-5-3-8-7-8-11 4 0 7 2 8 5 1-3 4-5 8-5 0 4-3 8-8 11z"/><path d="M12 21v-6"/>'),
    ("commercial", "Commercial building", "Offices, hospitals, schools, hotels, fuel stations",
     '<path d="M4 21V4h10v17M14 9h6v12"/><path d="M8 8h2M8 12h2M8 16h2"/>'),
    ("epc", "EPC company or developer", "You need an installation, civil or piling partner",
     '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>'),
    ("home", "Home", "A rooftop system for your house",
     '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/>'),
    ("other", "Something else", "Government, institution or anything else",
     '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.7M12 17h.01"/>'),
]
QUOTE_SERVICES = ["Complete solar plant (design, supply, build, commission)", "Installation & commissioning only",
                  "Pile foundations & civil works", "Fencing, roads & drainage", "O&M for an existing plant", "Advice: not sure yet"]
QUOTE_STATES = ["Assam", "Arunachal Pradesh", "Meghalaya", "Tripura", "Mizoram", "Manipur", "Nagaland", "Sikkim", "West Bengal",
                "Bihar", "Jharkhand", "Odisha", "Uttar Pradesh", "Uttarakhand", "Delhi", "Haryana", "Punjab", "Himachal Pradesh",
                "Jammu & Kashmir", "Ladakh", "Rajasthan", "Gujarat", "Maharashtra", "Goa", "Madhya Pradesh", "Chhattisgarh",
                "Karnataka", "Kerala", "Tamil Nadu", "Andhra Pradesh", "Telangana", "Puducherry", "Chandigarh",
                "Andaman & Nicobar Islands", "Dadra & Nagar Haveli and Daman & Diu", "Lakshadweep"]


def render_quote_page():
    hero = "assets/koomber/arrays-ingenieria-ex-servicemen-led-koomber-tea-estate-595kwp-solar-cm-inaugurates-595kwp-solar-plant-ribbon-cutting.jpg"

    def cards(name, items, cls="q-opt", typ="radio", req=True):
        return "".join(
            f'<label class="{cls}"><input type="{typ}" name="{name}" value="{esc(v)}"{" required" if req and typ == "radio" else ""} />'
            f'<span class="q-opt__box">{b}</span></label>' for v, b in items)

    def sel(name, label, opts, req=False, hint=""):
        o = "".join(f"<option>{esc(x)}</option>" for x in opts)
        return (f'<div class="field"><label for="q-{name}">{label}{" *" if req else ""}</label><select id="q-{name}" name="{name}"'
                f'{" required" if req else ""}><option value="">Select…</option>{o}</select>{hint}</div>')

    seg_cards = cards("segment", [(t, f'<span class="q-ic" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" '
                                     f'stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">{ic}</svg></span>'
                                     f'<b>{esc(t)}</b><small>{esc(d)}</small>') for k, t, d, ic in QUOTE_SEGMENTS], "q-opt q-seg")
    seg_keys = "".join(f'<input type="hidden" disabled data-seg-key="{esc(t)}" value="{k}" />' for k, t, _, _ in QUOTE_SEGMENTS)
    svc_cards = cards("services", [(x, f"<b>{esc(x)}</b>") for x in QUOTE_SERVICES], "q-opt q-chk", "checkbox")
    own = cards("ownership", [
        ("Buy and own it (CAPEX)", "<b>Buy and own it</b><small>Lowest lifetime cost; all savings and tax benefits are yours.</small>"),
        ("Pay per unit, no investment (OPEX)", "<b>No upfront investment</b><small>A developer owns the plant; you buy power at a fixed tariff. We connect you with our partners.</small>"),
        ("Not sure, advise me", "<b>Not sure yet</b><small>Our engineer will compare both for you.</small>")])
    timeline = cards("timeline", [(x, f"<b>{esc(x)}</b>") for x in
                                  ["Within 1 month", "In 1 to 3 months", "In 3 to 6 months", "In 6 to 12 months", "Just exploring"]], "q-opt q-pill")
    chips = "".join(f'<button type="button" class="q-chip" data-bill="{v}">{l}</button>'
                    for v, l in [(50000, "Rs 50k"), (200000, "Rs 2 lakh"), (500000, "Rs 5 lakh"), (1000000, "Rs 10 lakh+")])
    rai = next(c for c in COVERAGE if c["id"] == "kaushik-rai-koomber")
    tick = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>'

    body = page_hero(hero, "The Chief Minister of Assam inaugurates the 595 kWp Koomber solar plant installed by Arrays Ingenieria",
                     "Free Solar Quote · Takes about 1 minute",
                     'See What Solar Can <span class="text-sun">Save You</span>',
                     "Answer a few quick questions, see an instant savings estimate, and get a free, no-obligation proposal from "
                     "the ex-servicemen-led team trusted by Tata Power, Goodricke and Jay Shree Tea.", [("Free Solar Quote", None)]) + f"""

<section class="section quote-section">
  <div class="container quote-grid">
    <form class="form-card quote-form reveal" id="quoteForm" action="https://formsubmit.co/arraysingenieria@gmail.com" method="POST"
          data-endpoint="https://formsubmit.co/ajax/arraysingenieria@gmail.com">
      <input type="text" name="_honey" style="display:none" tabindex="-1" autocomplete="off" aria-hidden="true" />
      <input type="hidden" name="_subject" value="Free solar quote request, Arrays Ingenieria website" />
      <input type="hidden" name="_captcha" value="false" />
      <input type="hidden" name="_template" value="table" />
      <input type="hidden" name="lead_score" value="" />
      <input type="hidden" name="estimate_kwp" value="" />
      <input type="hidden" name="estimate_monthly_savings" value="" />
      <input type="hidden" name="source" value="" />
      {seg_keys}

      <div class="q-top">
        <div class="q-bar" aria-hidden="true"><span class="q-bar__fill"></span></div>
        <p class="q-count" aria-live="polite"><b class="q-pct">10%</b> done · <span class="q-steptxt">Step 1 of 6</span></p>
      </div>

      <fieldset class="q-step" data-step="1">
        <legend>Who is the solar plant for?</legend>
        <p class="q-sub">Pick one. It helps us send the right engineer.</p>
        <div class="q-opts q-opts--3">{seg_cards}</div>
        <div class="q-nav"><span></span><button type="button" class="btn btn--primary" data-next>Continue {ARROW_SVG}</button></div>
      </fieldset>

      <fieldset class="q-step" data-step="2">
        <legend>What do you need from us?</legend>
        <p class="q-proof" data-proof hidden></p>
        <p class="q-sub">Tick all that apply.</p>
        <div class="q-opts">{svc_cards}</div>
        <p class="q-label">How would you like to pay for it?</p>
        <div class="q-opts q-opts--3">{own}</div>
        <div class="q-nav"><button type="button" class="btn btn--outline" data-back>Back</button><button type="button" class="btn btn--primary" data-next>Continue {ARROW_SVG}</button></div>
      </fieldset>

      <fieldset class="q-step" data-step="3">
        <legend>Where is the site?</legend>
        <div class="field-row">
          {sel("state", "State", QUOTE_STATES, True)}
          <div class="field"><label for="q-city">City / district *</label><input type="text" id="q-city" name="city" placeholder="e.g. Sonari, Charaideo" maxlength="80" required /></div>
        </div>
        <div class="field-row">
          {sel("site_type", "Where will the panels go?", ["RCC (concrete) rooftop", "Metal-sheet rooftop", "Open land (ground-mount)", "Carport / parking", "Not sure yet"])}
          <div class="field"><label for="q-area">Free area available</label><div class="q-inline"><input type="number" id="q-area" name="area" min="0" step="any" inputmode="decimal" placeholder="e.g. 20000" /><select name="area_unit" aria-label="Area unit"><option>sq ft</option><option>sq m</option><option>acres</option><option>bigha</option></select></div></div>
        </div>
        <div class="field"><label for="q-capacity">Capacity in mind (optional)</label><div class="q-inline"><input type="number" id="q-capacity" name="capacity_kw" min="0" step="any" inputmode="decimal" placeholder="If you already know it" /><span class="q-unit">kWp</span></div></div>
        <div class="q-nav"><button type="button" class="btn btn--outline" data-back>Back</button><button type="button" class="btn btn--primary" data-next>Continue {ARROW_SVG}</button></div>
      </fieldset>

      <fieldset class="q-step" data-step="4">
        <legend>How much power do you use?</legend>
        <p class="q-sub">Your bill lets us size the plant and estimate your savings right now.</p>
        <div class="field"><label for="q-bill">Average monthly electricity bill *</label><div class="q-inline q-money"><span class="q-unit">Rs</span><input type="number" id="q-bill" name="monthly_bill" min="1000" step="any" inputmode="numeric" placeholder="e.g. 200000" required /></div>
          <div class="q-chips" aria-label="Quick picks">{chips}</div></div>
        <div class="field-row">
          <div class="field"><label for="q-tariff">Tariff per unit (if known)</label><div class="q-inline q-money"><span class="q-unit">Rs</span><input type="number" id="q-tariff" name="tariff" min="1" max="30" step="0.1" inputmode="decimal" placeholder="8" /></div></div>
          {sel("connection", "Grid connection", ["LT (low tension)", "HT (high tension)", "Not sure"])}
        </div>
        <div class="field-row">
          <div class="field"><label for="q-load">Sanctioned load (optional)</label><div class="q-inline"><input type="number" id="q-load" name="sanctioned_load" min="0" step="any" inputmode="decimal" placeholder="e.g. 500" /><select name="load_unit" aria-label="Load unit"><option>kW</option><option>kVA</option></select></div></div>
          {sel("dg", "Do you run diesel generators?", ["Yes, regularly", "Only as backup", "No"])}
        </div>
        <div class="q-estimate" id="qEstimate" hidden>
          <p class="q-est__kicker">Your instant estimate</p>
          <div class="q-est__grid">
            <div><b data-est="size">-</b><span>Plant size</span></div>
            <div><b data-est="save">-</b><span>Savings per month</span></div>
            <div><b data-est="payback">-</b><span>Payback</span></div>
            <div><b data-est="co2">-</b><span>CO2 avoided a year</span></div>
          </div>
          <p class="q-est__loss" data-est="loss"></p>
          <p class="q-est__note">Indicative only, from standard assumptions. Your free proposal will be based on your actual site.</p>
        </div>
        <div class="q-nav"><button type="button" class="btn btn--outline" data-back>Back</button><button type="button" class="btn btn--primary" data-next>Continue {ARROW_SVG}</button></div>
      </fieldset>

      <fieldset class="q-step" data-step="5">
        <legend>When would you like to start?</legend>
        <div class="q-opts q-opts--pills">{timeline}</div>
        <div class="field-row">
          {sel("funding", "How will it be funded?", ["Own funds", "Bank or green loan", "Need financing options", "Not decided yet"])}
          {sel("role", "Your role", ["Owner / Director", "Plant or energy manager", "Engineer / consultant", "Purchase / procurement", "Other"])}
        </div>
        <div class="q-nav"><button type="button" class="btn btn--outline" data-back>Back</button><button type="button" class="btn btn--primary" data-next>Last step {ARROW_SVG}</button></div>
      </fieldset>

      <fieldset class="q-step" data-step="6">
        <legend>Where should we send your free quote?</legend>
        <div class="q-summary" id="qSummary" hidden></div>
        <div class="field-row">
          <div class="field"><label for="q-name">Full name *</label><input type="text" id="q-name" name="name" autocomplete="name" maxlength="100" required /></div>
          <div class="field"><label for="q-company">Company / estate</label><input type="text" id="q-company" name="company" autocomplete="organization" maxlength="120" /></div>
        </div>
        <div class="field-row">
          <div class="field"><label for="q-phone">Mobile number *</label><input type="tel" id="q-phone" name="phone" placeholder="+91 " autocomplete="tel" inputmode="tel" pattern="[0-9+\\(\\)\\s\\-]{{7,20}}" title="Phone number: 7 to 20 digits, spaces, +, - or brackets" maxlength="20" required /></div>
          <div class="field"><label for="q-email">Work email *</label><input type="email" id="q-email" name="email" autocomplete="email" maxlength="254" required /></div>
        </div>
        <div class="field-row">
          {sel("contact_by", "Best way to reach you", ["Phone call", "WhatsApp", "Email"])}
          {sel("best_time", "Best time to call", ["Morning (9 to 12)", "Afternoon (12 to 4)", "Evening (4 to 7)", "Any time"])}
        </div>
        <div class="field"><label for="q-message">Anything else? (optional)</label><textarea id="q-message" name="message" maxlength="2000" placeholder="Existing plant, roof condition, deadlines, preferred module makes…"></textarea></div>
        {sel("heard_from", "How did you hear about us?", ["Google search", "News or TV", "Facebook / X / Instagram", "LinkedIn", "A client or colleague", "Event or exhibition", "Other"])}
        <p class="form-consent">By submitting this form, you agree to our <a href="/privacy-policy/">Privacy Policy</a>. We use your details only to prepare your quote and never add you to a mailing list.</p>
        <div class="q-nav"><button type="button" class="btn btn--outline" data-back>Back</button><button type="submit" class="btn btn--sun q-submit">Send Me My Free Quote {ARROW_SVG}</button></div>
        <ul class="q-assure"><li>{tick}Free</li><li>{tick}No obligation</li><li>{tick}Your number is never shared</li></ul>
        <div class="form-status" id="quoteStatus" role="status"></div>
      </fieldset>

      <div class="q-done" id="quoteDone" hidden>
        <span class="q-done__ic" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg></span>
        <h2>Thank you<span data-done-name></span>! Your request is in.</h2>
        <p>An engineer from our team will study your details and contact you to plan the next step. Meanwhile, see what we have built for others.</p>
        <ol class="q-done__next"><li><b>Review</b>We study your site, load and goals.</li><li><b>Call &amp; survey</b>We talk, and survey the site where needed.</li><li><b>Proposal</b>Plant size, scope and price, with no obligation.</li></ol>
        <div class="q-nav q-nav--center"><a class="btn btn--outline" href="/projects/">See our projects</a><a class="btn btn--primary" href="/project-koomber-tea-estate-595kwp-solar-cm-inauguration/">Koomber: inaugurated by the CM</a></div>
      </div>
    </form>

    <aside class="quote-trust reveal" data-d="1">
      <figure class="qt-photo"><img src="{hero}" alt="Chief Minister Dr Himanta Biswa Sarma inaugurates the 595 kWp Koomber Tea Estate solar plant installed by Arrays Ingenieria" />
        <figcaption><b>Inaugurated by the Chief Minister of Assam</b>595 kWp at Koomber Tea Estate, 1 October 2026</figcaption></figure>
      <ul class="qt-points">
        <li><b>Ex-servicemen-led MSME</b>Military discipline on every site, led by Lt. Gen. A.R. Prasad (Retd).</li>
        <li><b>ISO 9001 · 14001 · 45001</b>Quality, environment and safety systems, certified.</li>
        <li><b>Trusted by industry</b>Tata Power, Goodricke, Jay Shree Tea, Sustvest, Super Smelters.</li>
        <li><b>19 on-grid plants in Assam's tea gardens</b>Including Koomber, Orangajuli and Borpatra in 2026.</li>
      </ul>
      <blockquote class="cm-quote qt-quote"><p>“{esc(rai['quote'])}”</p><cite>{esc(rai['outlet'])}</cite></blockquote>
    </aside>
  </div>
</section>

<section class="section section--soft">
  <div class="container">
    <div class="section-head center reveal"><span class="eyebrow">What Happens Next</span><h2>From Request to <span class="text-grad">Proposal</span></h2></div>
    <ol class="proc-steps q-next">
      <li class="reveal" data-d="0"><span class="st-n">1</span><div><b>We review your request</b><p>An engineer studies your site, load and goals.</p></div></li>
      <li class="reveal" data-d="1"><span class="st-n">2</span><div><b>We talk and survey</b><p>A call to understand your needs, then a site survey where needed.</p></div></li>
      <li class="reveal" data-d="2"><span class="st-n">3</span><div><b>You get a clear proposal</b><p>Plant size, scope of work and price, with no obligation.</p></div></li>
    </ol>
    <div class="section-cta reveal"><a class="btn btn--outline" href="/how-it-works/">How a project runs</a><a class="btn btn--outline" href="/faq/">Questions? Read the FAQ</a></div>
  </div>
</section>
<script src="assets/js/quote.js?v={ASSET_VERSION}"></script>"""
    ld = [{"@context": "https://schema.org", "@type": "ContactPage", "name": "Get a free solar quote",
           "url": SITE_URL + page_url("free-solar-quote.html"), "about": {"@id": SITE_URL + "/#organization"},
           "potentialAction": {"@type": "QuoteAction", "agent": {"@type": "Person"}, "object": {"@id": SITE_URL + "/#organization"}}}]
    return page_shell("quote", body, hero, "Arrays Ingenieria: the 595 kWp Koomber solar plant inaugurated by the Chief Minister of Assam", ld)


def write_generated_pages():
    for p in PROJECTS:
        write_page(p["file"], render_project_page(p))
    for fname, render in (("free-solar-quote.html", render_quote_page), ("faq.html", render_faq_page), ("solar-glossary.html", render_glossary_page), ("insights.html", render_insights_page),
                          ("clients.html", render_clients_page)):
        write_page(fname, render())


# -------------------------------------------------------------- gallery ----
GALLERY[:0] = [(src, "borpatra events projects" if ("modules" in src or "team" in src) else "borpatra events", alt, alt)
               for src, alt in BORPATRA_ALBUM] + [
    ("assets/photos/arrays-ingenieria-ex-servicemen-led-orangajuli-tea-estate-450kwp-solar-inauguration-team.jpg", "projects events",
     "Orangajuli Tea Garden, Udalguri: inauguration of the 450 kWp ground-mounted on-grid solar plant, Janmashtami, 4 Sep 2026",
     "Inauguration of the 450 kWp solar plant at Orangajuli Tea Garden, Panerihaat, Udalguri, Assam, 4 September 2026, Arrays Ingenieria (ex-servicemen-led MSME), installation partner")]
GALLERY[:0] = [(src, "cm events projects" if "ground-mount" in src or "inaugurates" in src else "cm events", alt, alt)
               for src, alt in KOOMBER_ALBUM]


def render_gallery_page():
    filters = '<button class="filter active" data-filter="all">All</button>' + "".join(
        f'<button class="filter" data-filter="{k}">{html.escape(v)}</button>' for k, v in GALLERY_CATS)
    items = "\n".join(
        f'      <figure class="g-item reveal" data-cat="{cats}" data-full="{src}" data-gallery="all" data-caption="{html.escape(cap)}">'
        f'<img src="{src}" alt="{html.escape(alt)}" /><figcaption>{html.escape(cap)}</figcaption></figure>'
        for src, cats, cap, alt in GALLERY)
    ld = {
        "@context": "https://schema.org", "@type": "ImageGallery",
        "name": "Arrays Ingenieria photo & video gallery",
        "url": SITE_URL + "/gallery.html",
        "description": PAGES["gallery.html"]["desc"],
        "publisher": {"@id": SITE_URL + "/#organization"},
        "associatedMedia": [{
            "@type": "ImageObject", "contentUrl": f"{SITE_URL}/{src}", "name": cap, "caption": alt,
            "creditText": "Arrays Ingenieria", "copyrightNotice": "© Arrays Ingenieria Pvt. Ltd.",
            "creator": {"@type": "Organization", "name": "Arrays Ingenieria Pvt. Ltd."},
        } for src, cats, cap, alt in GALLERY],
    }
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="theme-color" content="#0f7a57" />
<title>x</title>
<meta name="keywords" content="Arrays Ingenieria gallery, Ingenieria solar photos, solar plant photos India, Assam tea estate solar, Orangajuli solar plant, Barpatra solar plant, solar EPC projects" />
<meta property="og:image" content="{SITE_URL}/assets/photos/arrays-ingenieria-ex-servicemen-led-orangajuli-tea-estate-450kwp-solar-inauguration-ribbon.jpg" />
<meta property="og:image:alt" content="Orangajuli Tea Estate 450 kW solar plant inauguration, Assam, by Arrays Ingenieria" />
<link rel="icon" type="image/png" sizes="32x32" href="assets/img/favicon-32.png" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Poppins:wght@500;600;700;800&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="assets/css/style.css?v={ASSET_VERSION}" />
<script type="application/ld+json">
{json.dumps(ld, ensure_ascii=False, indent=2)}
</script>
</head>
<body data-page="gallery">
<!-- build:header --><!-- /build:header -->

<section class="page-hero">
  <div class="page-hero__bg"><img src="assets/photos/arrays-ingenieria-jayshree-tea-estate-1mw-ground-mount-solar-sonari-assam.jpg" alt="Jayshree Tea Estate 1 MW solar plant in Sonari, Assam by Arrays Ingenieria" /></div>
  <div class="container">
    <span class="eyebrow">Photo &amp; Video Gallery</span>
    <h1>Our Solar Work, <span class="text-sun">In Pictures</span></h1>
    <p>Solar plants we have built from Assam's tea gardens to Karnataka's solar parks, the ceremonies that switched them on, and the news coverage that followed.</p>
    <nav class="breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span>Gallery</nav>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="section-head center reveal"><span class="eyebrow">Photos</span><h2>{len(GALLERY)} Photos from <span class="text-grad">Our Projects &amp; Milestones</span></h2><p>Filter by category and tap any photo to view it full size.</p></div>
    <div class="filters reveal" data-filters=".gallery-grid .g-item">{filters}</div>
    <div class="gallery-grid captioned">
{items}
    </div>
  </div>
</section>

<section class="section section--soft" id="videos">
  <div class="container">
    <div class="section-head center reveal"><span class="eyebrow">Videos</span><h2>Our Work <span class="text-grad">on Video</span></h2><p>News video coverage of our solar power plants in Assam.</p></div>
    <h3 class="kv-sub reveal">The Chief Minister's inauguration at Koomber</h3>
    {render_koomber_videos()}
    <h3 class="kv-sub reveal">News channel reports</h3>
    <!-- build:videos --><!-- /build:videos -->
    <div class="section-cta reveal"><a class="btn btn--primary" href="recognition.html">All News &amp; Recognition {ARROW_SVG}</a></div>
  </div>
</section>

<!-- build:footer --><!-- /build:footer -->
<script src="assets/js/components.js?v={ASSET_VERSION}"></script>
<script src="assets/js/main.js?v={ASSET_VERSION}"></script>
</body>
</html>
"""


# ------------------------------------------------------------- helpers ----
def image_size(path):
    """(width, height) for JPEG/PNG/SVG without third-party libraries."""
    with open(path, "rb") as fh:
        data = fh.read()
    if data[:8] == b"\x89PNG\r\n\x1a\n":
        return struct.unpack(">II", data[16:24])
    if data[:2] == b"\xff\xd8":
        i = 2
        while i < len(data):
            if data[i] != 0xFF:
                i += 1
                continue
            marker = data[i + 1]
            if marker in (0xC0, 0xC1, 0xC2, 0xC3, 0xC5, 0xC6, 0xC7, 0xC9, 0xCA, 0xCB, 0xCD, 0xCE, 0xCF):
                h, w = struct.unpack(">HH", data[i + 5:i + 9])
                return w, h
            i += 2 + struct.unpack(">H", data[i + 2:i + 4])[0]
    if path.endswith(".svg"):
        t = data.decode("utf8", "ignore")
        vb = re.search(r'viewBox="[\d.\s-]*?([\d.]+)\s+([\d.]+)"', t)
        if vb:
            return round(float(vb.group(1))), round(float(vb.group(2)))
    return None


def set_attr(tag, name, value):
    if re.search(rf'\s{name}="', tag):
        return re.sub(rf'\s{name}="[^"]*"', f' {name}="{value}"', tag)
    return re.sub(r"\s*/?>$", f' {name}="{value}" />', tag)


def del_attr(tag, name):
    return re.sub(rf'\s{name}="[^"]*"', "", tag)


BRAND_DIRS = ("assets/koomber/", "assets/borpatra/", "assets/photos/", "assets/press/", "assets/news/", "assets/certs/",
              "assets/orders/", "assets/video/")
PLANT_NAMES = [("koomber", "Koomber Tea Estate 595 kWp solar plant"), ("borpatra", "Borpatra Tea Estate 230 kWp solar plant"),
               ("orangajuli", "Orangajuli Tea Estate 450 kWp solar plant")]


BRAND_SUFFIX = "; solar work by Arrays Ingenieria (Ingenieria), ex-servicemen-led MSME"


def brand_alt(tag, src):
    """Every photo of our work names the company, so image search leads back to us."""
    tag = tag.replace(", by Arrays Ingenieria (Ingenieria), ex-servicemen-led MSME", "")
    src = src.lstrip("/")
    alt = re.search(r'\salt="([^"]*)"', tag)
    if not alt or not src.startswith(BRAND_DIRS) or "Ingenieria" in alt.group(1) or not alt.group(1):
        return tag
    plant = next((n for k, n in PLANT_NAMES if k in src and k not in alt.group(1).lower()), "")
    extra = f", {plant}" if plant else ""
    return tag.replace(alt.group(0), f' alt="{alt.group(1).rstrip(".")}{extra}{BRAND_SUFFIX}"', 1)


def fix_heading_levels(body_html):
    """Headings never skip a level (h2 -> h4). A skipped heading is demoted to the next level and keeps
    its look through the .hs class, so the outline is correct without changing the design."""
    prev = [1]

    def fix(m):
        lvl, attrs = int(m.group(1)), m.group(2)
        if lvl > prev[0] + 1:
            new = prev[0] + 1
            attrs = re.sub(r'class="([^"]*)"', r'class="\1 hs"', attrs) if 'class="' in attrs else attrs + ' class="hs"'
            prev[0] = new
            return f"<h{new}{attrs}>", new, lvl
        prev[0] = lvl
        return m.group(0), lvl, lvl

    out, stack = [], []
    pos = 0
    for m in re.finditer(r"<h([1-6])(\s[^>]*)?>|</h([1-6])>", body_html):
        out.append(body_html[pos:m.start()])
        if m.group(1):
            tag, new, old = fix(re.match(r"<h([1-6])((?:\s[^>]*)?)>", m.group(0)))
            stack.append(new)
            out.append(tag)
        else:
            out.append(f"</h{stack.pop() if stack else m.group(3)}>")
        pos = m.end()
    out.append(body_html[pos:])
    return "".join(out)


def add_main(body_html):
    """Wrap the page content between the header and footer in <main>, with a skip link."""
    body_html = re.sub(r'<main id="main">\n?', "", body_html)
    body_html = re.sub(r"\n*</main>\n", "\n", body_html)
    body_html = body_html.replace('<a class="skip-link" href="#main">Skip to content</a>\n', "")
    body_html = body_html.replace("<!-- /build:header -->", '<!-- /build:header -->\n<main id="main">', 1)
    body_html = re.sub(r"(<main id=\"main\">)\n+", r"\1\n", body_html)
    body_html = re.sub(r"\n*<!-- build:footer -->", "\n</main>\n<!-- build:footer -->", body_html, count=1)
    return body_html.replace("<!-- build:header -->", '<a class="skip-link" href="#main">Skip to content</a>\n<!-- build:header -->', 1)


WEBP_DIRS = ("assets/photos/", "assets/koomber/", "assets/borpatra/", "assets/press/", "assets/news/", "assets/certs/",
             "assets/orders/", "assets/leaders/", "assets/video/")
WEBP_WIDTHS = (480, 960, 1600)
SIZES_FULL = "100vw"
SIZES_CARD = "(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw"


def webp_set(rel):
    """Responsive WebP copies of a photo under assets/opt/ (made once, refreshed when the source changes).
    Returns [(url, width)] or [] when the image is not a photo we optimise."""
    rel = rel.lstrip("/").split("?")[0]
    if not rel.startswith(WEBP_DIRS) or not rel.lower().endswith((".jpg", ".jpeg", ".png")):
        return []
    src = os.path.join(ROOT, rel)
    if not os.path.isfile(src):
        return []
    size = image_size(src)
    if not size:
        return []
    widths = [w for w in WEBP_WIDTHS if w < size[0]] + [min(size[0], WEBP_WIDTHS[-1])]
    out = []
    for w in sorted(set(widths)):
        dst_rel = "assets/opt/" + rel[len("assets/"):].rsplit(".", 1)[0] + f"-{w}.webp"
        dst = os.path.join(ROOT, dst_rel)
        if not os.path.isfile(dst) or os.path.getmtime(dst) < os.path.getmtime(src):
            from PIL import Image, ImageOps
            os.makedirs(os.path.dirname(dst), exist_ok=True)
            im = ImageOps.exif_transpose(Image.open(src)).convert("RGB")
            if im.width > w:
                im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
            im.save(dst, "WEBP", quality=78, method=6)
        out.append(("/" + dst_rel, w))
    return out


def process_images(body_html):
    """Every local <img>: width/height (no layout shift), async decoding, lazy loading below the fold,
    and a WebP srcset in a <picture>. The first content image is the LCP: eager, high priority."""
    first = [True]
    body_html = re.sub(r'<picture class="rp">(?:<source[^>]*>)*(<img\b[^>]*>)</picture>', r"\1", body_html)

    def fix(m):
        tag = m.group(0)
        src = re.search(r'src="([^"]+)"', tag)
        if not src:
            return tag
        path = os.path.join(ROOT, src.group(1).lstrip("/").split("?")[0])
        in_chrome = "brand-mark" in tag or "brand-logo" in tag
        if os.path.isfile(path) and not re.search(r'\swidth="', tag):
            size = image_size(path)
            if size:
                tag = set_attr(tag, "width", size[0])
                tag = set_attr(tag, "height", size[1])
        if in_chrome:
            return tag
        tag = brand_alt(tag, src.group(1))
        tag = set_attr(tag, "decoding", "async")
        hero = first[0]
        if hero:
            first[0] = False
            tag = set_attr(tag, "loading", "eager")
            tag = set_attr(tag, "fetchpriority", "high")
        else:
            tag = del_attr(tag, "fetchpriority")
            tag = set_attr(tag, "loading", "lazy")
        variants = webp_set(src.group(1))
        if not variants:
            return tag
        full = hero or 'class="slide' in body_html[max(0, m.start() - 120):m.start()]
        srcset = ", ".join(f"{u} {w}w" for u, w in variants)
        sizes = SIZES_FULL if full else SIZES_CARD
        return f'<picture class="rp"><source type="image/webp" srcset="{srcset}" sizes="{sizes}" />{tag}</picture>'

    return re.sub(r"<img\b[^>]*>", fix, body_html)


def hero_preload(body_html):
    """<link rel=preload> for the LCP image, matching the srcset the browser will pick."""
    m = re.search(r'<picture class="rp"><source type="image/webp" srcset="([^"]+)" sizes="([^"]+)" /><img[^>]*fetchpriority="high"', body_html)
    if m:
        return f'<link rel="preload" as="image" type="image/webp" imagesrcset="{m.group(1)}" imagesizes="{m.group(2)}" fetchpriority="high" />'
    m = re.search(r'<img[^>]*fetchpriority="high"[^>]*>', body_html)
    if m:
        src = re.search(r'src="([^"]+)"', m.group(0)).group(1)
        return f'<link rel="preload" as="image" href="{src}" fetchpriority="high" />'
    return ""


FONT_PRELOADS = ('<link rel="preload" href="/assets/fonts/plus-jakarta-sans-var-latin.woff2" as="font" type="font/woff2" crossorigin />\n'
                 '<link rel="preload" href="/assets/fonts/poppins-700-latin.woff2" as="font" type="font/woff2" crossorigin />\n')


def optimise_head_and_scripts(text):
    """Self-hosted fonts and minified assets; every script deferred; LCP image and fonts preloaded."""
    head, body = text.split("</head>", 1)
    head = re.sub(r'<link rel="preconnect" href="https://fonts\.(?:googleapis|gstatic)\.com"[^>]*>\n', "", head)
    head = re.sub(r'<link href="https://fonts\.googleapis\.com/[^"]*" rel="stylesheet" />\n', "", head)
    head = re.sub(r'<link rel="preload"[^>]*>\n', "", head)
    head = re.sub(r'(<link rel="stylesheet" href="/?assets/css/style(?:\.min)?\.css[^"]*" />\n)',
                  lambda m: hero_preload(body) + "\n" + FONT_PRELOADS + m.group(1) if hero_preload(body) else FONT_PRELOADS + m.group(1), head, count=1)
    head = head.replace("\n\n<link rel=\"preload\"", "\n<link rel=\"preload\"")
    text = head + "</head>" + body
    text = re.sub(r"assets/css/style(?:\.min)?\.css", "assets/css/style.min.css", text)
    text = re.sub(r"assets/js/(" + "|".join(JS_SOURCES) + r")(?:\.min)?\.js", r"assets/js/\1.min.js", text)
    text = re.sub(r'<script src="(/assets/js/[^"]+)"(?![^>]*\bdefer)([^>]*)></script>', r'<script src="\1"\2 defer></script>', text)
    return text


def replace_block(text, name, content):
    pat = re.compile(rf"<!-- build:{name} -->.*?<!-- /build:{name} -->", re.S)
    block = f"<!-- build:{name} -->\n{content}\n<!-- /build:{name} -->"
    if pat.search(text):
        return pat.sub(lambda _: block, text)
    placeholder = f'<div id="site-{name}"></div>'
    return text.replace(placeholder, block)


def normalise_links(text):
    """Every internal link points at the clean URL (/about/#x); every asset path is root-absolute."""
    pages = {p[:-5] for p in PAGES if p not in ("404.html",)}
    def page_link(m):
        q, name, frag = m.group(1), m.group(2), m.group(3) or ""
        if name == "index":
            return f'href="/{frag}"'
        return f'href="/{name}/{frag}"' if name in pages else m.group(0)
    # about.html, /about.html, ./about.html, /about, /about/  (+ #fragment)
    text = re.sub(r'href=(["\'])(?:\./|/)?([a-z0-9-]+)(?:\.html|/)?(#[^"\']*)?\1',
                  lambda m: page_link(m) if (m.group(2) in pages or m.group(2) == "index") else m.group(0), text)
    # absolute site URLs in structured data and meta
    text = re.sub(re.escape(SITE_URL) + r'/([a-z0-9-]+)\.html', lambda m: f"{SITE_URL}/" if m.group(1) == "index" else (f"{SITE_URL}/{m.group(1)}/" if m.group(1) in pages else m.group(0)), text)
    # relative asset paths -> root-absolute, so they work from /about/
    text = re.sub(r'(\s(?:src|href|data-full|poster|srcset)=")(assets/|site\.webmanifest|llms\.txt|sitemap\.xml)', r'\1/\2', text)
    text = re.sub(r"url\((['\"]?)assets/", r"url(\1/assets/", text)
    text = re.sub(r"href='([^']*)'", r'href="\1"', text)
    return text


def breadcrumb_ld(fname):
    items = [{"@type": "ListItem", "position": 1, "name": "Home", "item": SITE_URL + "/"}]
    meta = PAGES[fname]
    if meta.get("parent"):
        name, path = PARENTS[meta["parent"]]
        items.append({"@type": "ListItem", "position": 2, "name": name, "item": SITE_URL + path})
    if fname != "index.html":
        items.append({"@type": "ListItem", "position": len(items) + 1, "name": meta["crumb"], "item": SITE_URL + meta["path"]})
    return {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": items}


# Google Search Console: paste the content="..." value of the google-site-verification meta tag here
# (or verify by DNS instead and leave it empty), then submit /sitemap.xml in Search Console.
GSC_VERIFICATION = ""


def head_block(fname, og_image, og_alt):
    meta = PAGES[fname]
    e = lambda s: html.escape(s, quote=True)
    lines = [f"<title>{e(meta['title'])}</title>",
             f'<meta name="description" content="{e(meta["desc"])}" />']
    if meta["path"] is None:
        lines.append('<meta name="robots" content="noindex, follow" />')
        return "\n".join(lines)
    url = SITE_URL + meta["path"]
    lines += [
        '<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />',
        *([f'<meta name="google-site-verification" content="{GSC_VERIFICATION}" />'] if GSC_VERIFICATION and fname == "index.html" else []),
        f'<link rel="canonical" href="{url}" />',
        f'<link rel="alternate" hreflang="en-IN" href="{url}" />',
        f'<link rel="alternate" hreflang="x-default" href="{url}" />',
        '<meta property="og:type" content="website" />',
        f'<meta property="og:site_name" content="{BRAND}" />',
        '<meta property="og:locale" content="en_IN" />',
        f'<meta property="og:url" content="{url}" />',
        f'<meta property="og:title" content="{e(meta["title"])}" />',
        f'<meta property="og:description" content="{e(meta["desc"])}" />',
        f'<meta property="og:image" content="{og_image}" />',
    ]
    size = image_size(os.path.join(ROOT, og_image.replace(SITE_URL + "/", "").lstrip("/")))
    if size:
        lines += [f'<meta property="og:image:width" content="{size[0]}" />',
                  f'<meta property="og:image:height" content="{size[1]}" />']
    lines += [
        f'<meta property="og:image:alt" content="{e(og_alt)}" />',
        '<meta name="twitter:card" content="summary_large_image" />',
        f'<meta name="twitter:title" content="{e(meta["title"])}" />',
        f'<meta name="twitter:description" content="{e(meta["desc"])}" />',
        f'<meta name="twitter:image" content="{og_image}" />',
        f'<meta name="twitter:image:alt" content="{e(og_alt)}" />',
    ]
    return "\n".join(lines)


HEAD_TAG_RE = re.compile(
    r'^[ \t]*(?:<title>.*?</title>|<meta (?:property|name)="(?:og:[^"]+|twitter:[^"]+|description|robots)"[^>]*>'
    r'|<meta name="google-site-verification"[^>]*>|<link rel="canonical"[^>]*>|<link rel="alternate" hreflang="[^"]*"[^>]*>)[ \t]*\n', re.M | re.S)


def process_page(fname):
    path = page_path(fname)
    text = open(path, encoding="utf8").read()
    text = KNOWN_HOSTS.sub(SITE_URL, text)
    page_key = re.search(r'<body data-page="([^"]+)"', text).group(1)

    # header / footer / videos baked in
    text = replace_block(text, "header", render_header(page_key, fname))
    text = replace_block(text, "footer", FOOTER)
    text = re.sub(r"<!-- build:cases(?::([\w.-]+))? -->.*?<!-- /build:cases -->",
                  lambda m: f"<!-- build:cases{':' + m.group(1) if m.group(1) else ''} -->\n"
                            f"{render_case_cards(service=m.group(1))}\n<!-- /build:cases -->", text, flags=re.S)
    for name, render in BLOCKS.items():
        if f"<!-- build:{name} -->" in text:
            text = replace_block(text, name, render())

    # head
    head, body = text.split("</head>", 1)
    og_img = re.search(r'<meta property="og:image" content="([^"]+)"', head)
    og_alt = re.search(r'<meta property="og:image:alt" content="([^"]*)"', head)
    hero = re.search(r'<img[^>]*src="([^"]+)"[^>]*alt="([^"]*)"', body.split("</header>", 1)[-1])
    og_image = og_img.group(1) if og_img else f"{SITE_URL}/{hero.group(1).lstrip('/')}"
    alt = html.unescape(og_alt.group(1)) if og_alt else ""
    if not alt or alt.startswith("Ingenieria, veteran-led solar EPC"):
        alt = html.unescape(hero.group(2)) if hero and hero.group(1) in og_image else f"{BRAND}, veteran-led solar EPC company in India"
    head = HEAD_TAG_RE.sub("", head)
    head = re.sub(r'(<meta name="viewport"[^>]*>\n)', lambda m: m.group(1) + head_block(fname, og_image, alt) + "\n", head, count=1)
    head = head.replace("/assets/img/logo.svg", "/assets/img/logo.png").replace("/assets/img/logo-mark.svg", "/assets/img/logo.png")
    head = re.sub(r'(?:<link rel="(?:icon|apple-touch-icon|manifest)"[^>]*>\n)+',
                  '<link rel="icon" href="/favicon.ico" sizes="48x48" />\n'
                  '<link rel="icon" href="/favicon.svg" type="image/svg+xml" />\n'
                  '<link rel="apple-touch-icon" href="/assets/img/apple-touch-icon.png" />\n'
                  '<link rel="manifest" href="/site.webmanifest" />\n', head, count=1)

    def link_provider(m):
        data = json.loads(m.group(2))
        if isinstance(data, dict) and data.get("@type") == "Service" and "@id" not in data.get("provider", {}):
            data["provider"] = {"@id": SITE_URL + "/#organization"}
            return m.group(1) + "\n" + json.dumps(data, ensure_ascii=False, indent=2) + "\n</script>"
        return m.group(0)
    head = re.sub(r'(<script type="application/ld\+json">)\s*(.*?)\s*</script>', link_provider, head, flags=re.S)
    if PAGES[fname]["path"] and '"BreadcrumbList"' not in head:
        head += '<script type="application/ld+json">\n' + json.dumps(breadcrumb_ld(fname), ensure_ascii=False, indent=2) + "\n</script>\n"
    head = re.sub(r'<script type="application/ld\+json" data-build="coverage">.*?</script>\n', "", head, flags=re.S)
    if "<!-- build:press-tv -->" in body:
        head += ('<script type="application/ld+json" data-build="coverage">\n'
                 + json.dumps(coverage_ld(), ensure_ascii=False, indent=2) + "\n</script>\n")
    text = head + "</head>" + body

    # official social embeds: load each platform's script once, only where needed
    text = re.sub(r'<!-- embeds -->.*?<!-- /embeds -->\n', '', text, flags=re.S)
    # (platform scripts are loaded on demand by components.js: see social_embed)

    # links, asset versions, scripts
    text = normalise_links(text)
    text = re.sub(r"\?v=[0-9a-f]+", f"?v={ASSET_VERSION}", text)
    if 'id="indiaMap"' not in text:
        text = re.sub(r'<script src="/?assets/js/india-map-data(?:\.min)?\.js[^"]*"[^>]*></script>\n', "", text)

    # images
    head, body = text.split("</head>", 1)
    # the header logo is chrome; the hero is the first image after </header>
    pre, sep, post = body.partition("</header>")
    body = pre + sep + fix_heading_levels(process_images(post)) if sep else process_images(body)
    body = add_main(body)
    text = optimise_head_and_scripts(head + "</head>" + body)

    # 404 is served at arbitrary depths: make its URLs root-absolute
    if fname == "404.html":
        text = re.sub(r'(src|href)="(?!https?:|mailto:|tel:|/|#|data:)([^"]+)"', r'\1="/\2"', text)

    open(path, "w", encoding="utf8").write(text)


# -------------------------------------------------------- site files ----
def write_sitemap():
    out = ['<?xml version="1.0" encoding="UTF-8"?>',
           '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" '
           'xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">']
    for fname, meta in PAGES.items():
        if not meta["path"]:
            continue
        text = open(page_path(fname), encoding="utf8").read()
        body = text.split("</header>", 1)[-1]
        imgs = []
        for src in re.findall(r'(?:src|data-full)="/?(assets/[^"]+\.(?:jpe?g|png|webp))"', body):
            if src not in imgs:
                imgs.append(src)
        out.append(f"  <url>\n    <loc>{SITE_URL}{meta['path']}</loc>\n    <lastmod>{TODAY}</lastmod>")
        for src in imgs:
            out.append(f"    <image:image><image:loc>{SITE_URL}/{src}</image:loc></image:image>")
        for c in COVERAGE:
            if c.get("youtube") and f'data-yt="{c["youtube"]}"' in body:
                out.append(f"    <video:video><video:thumbnail_loc>{SITE_URL}/{c['img']}</video:thumbnail_loc>"
                           f"<video:title>{esc(c.get('original') or c['headline'])}</video:title><video:description>{esc(c['summary'])}</video:description>"
                           f"<video:player_loc>https://www.youtube-nocookie.com/embed/{c['youtube']}</video:player_loc>"
                           f"<video:family_friendly>yes</video:family_friendly></video:video>")
        for vsrc, poster, cap, dur, _ in KOOMBER_VIDEOS:
            if vsrc in body:
                secs = int(dur.strip("PTS"))
                out.append(f"    <video:video><video:thumbnail_loc>{SITE_URL}/{poster}</video:thumbnail_loc>"
                           f"<video:title>{esc(cap)}</video:title><video:description>{esc(cap + '.' + VIDEO_DESC)}</video:description>"
                           f"<video:content_loc>{SITE_URL}/{vsrc}</video:content_loc><video:duration>{secs}</video:duration>"
                           f"<video:publication_date>2026-10-01</video:publication_date><video:family_friendly>yes</video:family_friendly></video:video>")
        out.append("  </url>")
    out.append("</urlset>\n")
    open(os.path.join(ROOT, "sitemap.xml"), "w", encoding="utf8").write("\n".join(out))


def write_robots():
    """Every crawler is welcome, search engines and AI assistants alike: being found and cited is the point."""
    open(os.path.join(ROOT, "robots.txt"), "w", encoding="utf8").write(
        "# Arrays Ingenieria (Ingenieria): search engines and AI assistants may crawl and cite this site.\n"
        "User-agent: *\nAllow: /\nDisallow: /tools/\n\n"
        f"Sitemap: {SITE_URL}/sitemap.xml\n# Plain-language summary of the site: {SITE_URL}/llms.txt\n")


def write_llms():
    """llms.txt: a plain-language map of the site for AI assistants (llmstxt.org)."""
    def line(f):
        m = PAGES[f]
        return f"- [{m['title'].split(' | ')[0]}]({SITE_URL}{m['path']}): {m['desc']}"
    groups = [
        ("Company", ["about.html", "leadership.html", "ex-servicemen-led-msme.html", "quality-safety.html", "where-we-work.html",
                     "clients.html", "achievements.html", "recognition.html", "contact.html"]),
        ("Services", ["capex-solar-epc.html", "solar-installation-commissioning.html", "service-ground-mount.html", "service-rooftop.html",
                      "service-epc.html", "service-piling.html", "service-civil.html", "service-om.html", "solar-for-tea-estates.html",
                      "industries.html", "how-it-works.html"]),
        ("Projects and case studies", ["projects.html"] + [p["file"] for p in PROJECTS] + ["gallery.html"]),
        ("Resources", ["insights.html", "solar-schemes-india.html", "solar-glossary.html", "faq.html"]),
    ]
    out = ["# Arrays Ingenieria Pvt. Ltd. (INGENIERIA)", "",
           "> Ex-servicemen-led, ISO-certified Indian MSME that delivers solar installation & commissioning (I&C), CAPEX solar EPC "
           "and all solar civil works (pile foundations, fencing, roads, drainage) for ground-mount and rooftop plants. "
           "Motto: \"Olive Green to Go Green\". Founder and CEO: Lt. Gen. Ashish Ranjan Prasad (Retd). Corporate office in Greater Noida (Uttar Pradesh), branch office in Madhubani (Bihar); "
           "projects across Assam, Bihar, Jharkhand, West Bengal, Uttar Pradesh, Uttarakhand, Haryana and Karnataka.", "",
           "Key facts:",
           "- Does NOT manufacture solar modules or inverters, and does not run OPEX/RESCO models; it builds plants the client owns (CAPEX) "
           "and works as installation partner to developers such as Tata Power Renewable Energy and Sustvest.",
           "- Installation partner for the 3.11 MW Goodricke Tea Estates Solar Programme (TPREL and Sustvest) in Assam: Koomber 595 kWp "
           "(inaugurated by Assam Chief Minister Dr Himanta Biswa Sarma on 1 October 2026), Orangajuli 450 kWp (4 September 2026) and "
           "Borpatra 230 kWp (25 September 2026).",
           "- At the Koomber inauguration, MLAs Kaushik Rai (Lakhipur) and Rajdeep Goala (Udharbond) publicly praised Arrays Ingenieria "
           "as an MSME led by ex-servicemen under Lt. Gen. A.R. Prasad (Retd) delivering critical renewable-energy infrastructure.",
           "- Registrations: CIN U45309DL2018PTC340544; Udyam UDYAM-DL-03-0023905; ISO 9001, ISO 14001, ISO 45001.",
           "- Contact: arraysingenieria@gmail.com, or the form at " + SITE_URL + "/contact/", ""]
    for title, files in groups:
        out.append(f"## {title}")
        out += [line(f) for f in files if f in PAGES]
        out.append("")
    out += ["## Optional", f"- [Sitemap]({SITE_URL}/sitemap.xml): every page, image and video", ""]
    open(os.path.join(ROOT, "llms.txt"), "w", encoding="utf8").write("\n".join(out))


def write_headers():
    """Cloudflare Pages reads _headers, Netlify reads netlify.toml: write _headers from netlify.toml so the
    security and caching headers stay identical on both hosts."""
    import tomllib
    cfg = tomllib.load(open(os.path.join(ROOT, "netlify.toml"), "rb"))
    out = ["# Generated by tools/build.py from netlify.toml (Cloudflare Pages format). Edit netlify.toml, not this file."]
    for rule in cfg.get("headers", []):
        out.append(rule["for"])
        out += [f"  {k}: {v}" for k, v in rule["values"].items()]
    open(os.path.join(ROOT, "_headers"), "w", encoding="utf8").write("\n".join(out) + "\n")


def write_redirects():
    """Old .html and extensionless addresses 301 to the one clean URL. The .html files no longer
    exist, so these rules never shadow real content and cannot loop."""
    lines = ["# Generated by tools/build.py: every old address 301s to the page's one clean URL (/about/)."]
    for fname, meta in PAGES.items():
        if meta["path"] and fname != "index.html":
            lines.append(f"/{fname}  {meta['path']}  301")
    # Only 301 rules: they work the same on Cloudflare Pages and Netlify (Cloudflare ignores 404/forced rules).
    lines += ["/index.html  /  301", "/index  /  301",
              "/privacy.html  /privacy-policy/  301", "/privacy  /privacy-policy/  301", "/privacy/  /privacy-policy/  301",
              "/tools/*  /  301"]
    open(os.path.join(ROOT, "_redirects"), "w", encoding="utf8").write("\n".join(lines) + "\n")


# --------------------------------------------------------- link check ----
def check_links():
    ids, problems = {}, []
    for fname in PAGES:
        t = open(page_path(fname), encoding="utf8").read()
        ids[fname] = set(re.findall(r'\sid="([^"]+)"', open(page_path(fname), encoding="utf8").read()))
    for fname in PAGES:
        t = open(page_path(fname), encoding="utf8").read()
        t = re.sub(r"<script\b(?![^>]*\bsrc=)[^>]*>.*?</script>", "", t, flags=re.S)
        for attr, url in re.findall(r'\s(href|src|data-full)="([^"]*)"', t):
            if re.match(r"(https?:|mailto:|tel:|data:|javascript:)", url) or url == "":
                continue
            base, _, frag = url.partition("#")
            base = base.split("?")[0]
            if base.endswith(".html") or (base and not base.startswith("/")):
                problems.append(f"{fname}: link not in clean form {url}")
                continue
            if base in ("", "/") or base.endswith("/"):
                target = fname if url.startswith("#") else ("index.html" if base in ("", "/") else base.strip("/") + ".html")
                if target not in PAGES:
                    problems.append(f"{fname}: page not in PAGES {url}")
                elif frag and frag not in ids.get(target, set()):
                    problems.append(f"{fname}: missing anchor {url}")
            elif not os.path.isfile(os.path.join(ROOT, base.lstrip("/"))):
                problems.append(f"{fname}: missing file {url}")
    css = open(os.path.join(ROOT, "assets/css/style.css"), encoding="utf8").read()
    for url in re.findall(r"url\(['\"]?([^'\")]+)", css):
        if not url.startswith(("data:", "http")) and not os.path.isfile(os.path.join(ROOT, "assets/css", url)):
            problems.append(f"style.css: missing {url}")
    # stylesheet sanity: catch mangled colour values such as rgba(6, 78, 59.08)
    for m in re.finditer(r"rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\.\d+\s*\)", css):
        problems.append(f"style.css: malformed colour {m.group(0)}")
    for fname in PAGES:
        t = open(page_path(fname), encoding="utf8").read()
        for tag in re.findall(r"<img\b[^>]*>", t):
            if not re.search(r'\salt="[^"]+"', tag):
                problems.append(f"{fname}: <img> without alt: {tag[:90]}")
        if len(re.findall(r"<h1\b", t)) != 1:
            problems.append(f"{fname}: expected exactly one <h1>")
        title = html.unescape(re.search(r"<title>(.*?)</title>", t).group(1))
        desc = html.unescape(re.search(r'<meta name="description" content="([^"]*)"', t).group(1))
        if not 50 <= len(title) <= 60:
            problems.append(f"{fname}: title is {len(title)} chars (want 50-60)")
        if not 135 <= len(desc) <= 155:
            problems.append(f"{fname}: description is {len(desc)} chars (want 135-155)")
        prev = 1
        for lvl in re.findall(r"<h([1-6])\b", t.split("</header>", 1)[-1]):
            if int(lvl) > prev + 1:
                problems.append(f"{fname}: heading jumps from h{prev} to h{lvl}")
            prev = int(lvl)
        if t.count('<link rel="canonical"') != (1 if PAGES[fname]["path"] else 0):
            problems.append(f"{fname}: canonical tag count")
        if "<main" not in t:
            problems.append(f"{fname}: no <main> landmark")
        body = re.sub(r'<script type="application/ld\+json".*?</script>', "", t.split("</head>", 1)[-1], flags=re.S)
        if KNOWN_HOSTS.search(re.sub(r"\s(?:href|src)=\"https?://[^\"]*\"", lambda m: m.group(0) if KNOWN_HOSTS.search(m.group(0)) else "", body)):
            problems.append(f"{fname}: a link or image uses the full domain; internal links must be root-relative (/about/)")
        for m in re.findall(r'<script type="application/ld\+json"[^>]*>(.*?)</script>', t, re.S):
            try:
                json.loads(m)
            except ValueError as err:
                problems.append(f"{fname}: invalid JSON-LD ({err})")
    return problems


def main():
    write_min_assets()
    write_page("gallery.html", render_gallery_page())
    write_generated_pages()
    for fname in PAGES:
        process_page(fname)
    write_sitemap()
    write_llms()
    write_robots()
    write_redirects()
    write_headers()
    problems = check_links()
    for p in problems:
        print("PROBLEM:", p)
    print(f"Built {len(PAGES)} pages for {SITE_URL}, {len(problems)} problem(s).")
    sys.exit(1 if problems else 0)


if __name__ == "__main__":
    main()
