#!/usr/bin/env python3
"""
Ingenieria website — SEO build step.

Run from anywhere:   python3 website/tools/build.py
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

# The live address. arraysingenieria.com is not registered yet (DNS NXDOMAIN on
# 2026-09-26); switch this to "https://www.arraysingenieria.com" once it is,
# re-run the build, and add the domain in Netlify.
SITE_URL = "https://arraysingenieria.netlify.app"
# Any of these in existing markup are rewritten to SITE_URL.
KNOWN_HOSTS = re.compile(r"https?://(?:www\.)?arraysingenieria\.(?:com|netlify\.app)")

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ASSET_VERSION = "19"
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
        title="Arrays Ingenieria in the News | TV, Press & Client Posts",
        desc="Arrays Ingenieria on NE Reports, Sonari Live, News Axom, The Sentinel, Prerna Bharati and Dainik Bhaskar, plus client posts and national honours."),
    "achievements.html": dict(path="/achievements.html", crumb="Achievements",
        title="Awards & ISO Certifications | Arrays Ingenieria",
        desc="Client appreciation from Jay Shree Tea, Super Smelters & Bharat Petroleum, ISO 9001, 14001 & 45001 certification and work orders won by Arrays Ingenieria."),
    "industries.html": dict(path="/industries.html", crumb="Industries",
        title="Solar for Industry, Tea Estates & Homes | Arrays Ingenieria",
        desc="Solar power for every sector in India: factories, tea estates, commercial buildings, institutions, homes and government/PSU projects by Arrays Ingenieria."),
    "insights.html": dict(path="/insights.html", crumb="Insights",
        title="Solar Guides & Insights for India | Arrays Ingenieria",
        desc="Guides from Arrays Ingenieria on the PM Surya Ghar subsidy, rooftop vs ground-mount solar, net-metering, solar O&M and solar ROI in India."),
    "service-ground-mount.html": dict(path="/service-ground-mount.html", crumb="Ground-Mount Solar",
        title="Ground-Mount Solar Power Plants | Arrays Ingenieria",
        desc="Utility and industrial ground-mount solar plants designed, built and commissioned across India by Arrays Ingenieria, from piling to grid connection."),
    "service-rooftop.html": dict(path="/service-rooftop.html", crumb="Rooftop Solar",
        title="Rooftop Solar EPC for Industry | Arrays Ingenieria",
        desc="On-grid RCC and metal-sheet rooftop solar for factories, institutions and businesses across India, installed by Arrays Ingenieria."),
    "service-epc.html": dict(path="/service-epc.html", crumb="EPC Turnkey",
        title="Turnkey Solar EPC Contractor in India | Arrays Ingenieria",
        desc="Turnkey solar EPC from Arrays Ingenieria: engineering, procurement and construction under single-window responsibility, including Tata Power EPC projects."),
    "service-piling.html": dict(path="/service-piling.html", crumb="Pile Foundation",
        title="Solar Pile Foundation & Piling | Arrays Ingenieria",
        desc="Specialist solar pile-foundation and piling works by Arrays Ingenieria, proven on the 300 MW SECI park at Koppal and 5.5 MW Tata Motors, Jamshedpur."),
    "service-civil.html": dict(path="/service-civil.html", crumb="Civil & Fencing",
        title="Solar Civil Works & Fencing | Arrays Ingenieria",
        desc="Solar civil works by Arrays Ingenieria: pre-cast boundary walls, RCC works and chain-link fencing, including the 14.36 MW YIAPL project in Uttar Pradesh."),
    "service-om.html": dict(path="/service-om.html", crumb="O&M & Support",
        title="Solar O&M Services in India | Arrays Ingenieria",
        desc="Solar plant operations & maintenance, statutory compliance and lifecycle support from Arrays Ingenieria to keep every plant at peak output."),
    "privacy.html": dict(path="/privacy.html", crumb="Privacy Policy",
        title="Privacy Policy | Arrays Ingenieria Pvt. Ltd.",
        desc="How Arrays Ingenieria Pvt. Ltd. collects, uses and protects the information you share with us through this website."),
    "terms.html": dict(path="/terms.html", crumb="Terms of Use",
        title="Terms of Use | Arrays Ingenieria Pvt. Ltd.",
        desc="The terms governing your use of the Arrays Ingenieria Pvt. Ltd. website and its content."),
    "404.html": dict(path=None, crumb=None,
        title="Page Not Found | Arrays Ingenieria",
        desc="The page you were looking for could not be found. Explore Arrays Ingenieria's solar projects, services and news."),
}
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from content import (PROJECTS, FAQ, GLOSSARY, CLIENTS, LEADER_QUOTES, NATIONAL_FACTS, SCHEMES, TIMELINE,  # noqa: E402
                     PANCHAMRIT, PANCHAMRIT_URL)

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
        title="Clients & Partners | Arrays Ingenieria Solar EPC",
        desc="Arrays Ingenieria's clients and partners: Tata Power, Jay Shree Tea (BK Birla Group), Goodricke, Sustvest, Super Smelters, Tata Motors and more."),
    "solar-glossary.html": dict(path="/solar-glossary.html", crumb="Solar Glossary",
        title="Solar Glossary: EPC, CAPEX, I&C Terms | Arrays Ingenieria",
        desc="Plain-English definitions of solar terms: EPC, I&C, CAPEX vs OPEX, net metering, kWp, pile foundations, DG synchronisation and more."),
    "ex-servicemen-led-msme.html": dict(path="/ex-servicemen-led-msme.html", crumb="Ex-Servicemen-Led MSME",
        title="Ex-Servicemen-Led Solar MSME | Arrays Ingenieria",
        desc="Arrays Ingenieria is an ex-servicemen-led MSME founded by Lt. Gen. A.R. Prasad (Retd): Olive Green to Go Green, a second innings of national service."),
    "solar-schemes-india.html": dict(path="/solar-schemes-india.html", crumb="Solar Schemes in India",
        title="Government Solar Schemes in India 2026 | Arrays Ingenieria",
        desc="PM Surya Ghar, PM-KUSUM, Assam's tea-garden solar policy, accelerated depreciation and net metering, with official sources and leaders' statements."),
    "contact.html": dict(path="/contact.html", crumb="Contact",
        title="Contact Arrays Ingenieria | Solar EPC, Greater Noida",
        desc="Contact Arrays Ingenieria for solar EPC, installation & commissioning or civil works. Corporate office Greater Noida, branch office Madhubani, Bihar."),
})
for _p in PROJECTS:
    PAGES[_p["file"]] = dict(path="/" + _p["file"], crumb=_p["short"], parent="projects", title=_p["title"], desc=_p["desc"])
PARENTS = {"services": ("Services", "/#services"), "projects": ("Projects", "/projects.html"),
           "industries": ("Industries", "/industries.html")}
SERVICE_PAGES = [p for p in PAGES if p.startswith("service-")]
for _p in SERVICE_PAGES:
    PAGES[_p].setdefault("parent", "services")

# ------------------------------------------------------------ gallery ----
# (src, categories, caption, alt). Captions are visible text; alt describes the image.
GALLERY_CATS = [
    ("projects", "Solar Projects"),
    ("events", "Inaugurations & Events"),
    ("media", "News & Media"),
    ("leadership", "Leadership & Honours"),
    ("certificates", "Awards & Certifications"),
    ("orders", "Work Orders"),
]
GALLERY = [
    ("assets/photos/orangajuli-450kw-solar-inauguration-assam.jpg", "projects events",
     "Orangajuli Tea Estate, Udalguri (Assam): 450 kW ground-mount solar plant inaugurated on Janmashtami 2026",
     "Ribbon-cutting at the 450 kW Orangajuli Tea Estate solar plant in Udalguri, Assam, built by Arrays Ingenieria (still from NE Reports video)"),
    ("assets/photos/proj-seci.jpg", "projects", "SECI 300 MW solar park: pile-foundation works, Koppal, Karnataka",
     "SECI 300 MW solar park pile-foundation works at Koppal, Karnataka by Arrays Ingenieria"),
    ("assets/photos/proj-yiapl.jpg", "projects", "YIAPL 14.36 MW solar project: supply, civil works & chain-link fencing, Uttar Pradesh",
     "YIAPL 14.36 MW solar power project civil works and fencing in Uttar Pradesh by Arrays Ingenieria"),
    ("assets/photos/proj-dcm-hisar.jpg", "projects", "DCM Hisar: 10 MW ground-mount solar & civil works, Haryana",
     "DCM Hisar 10 MW ground-mount solar project in Haryana, Arrays Ingenieria solar EPC"),
    ("assets/photos/proj-tml.jpg", "projects", "Tata Motors, Jamshedpur: 5.5 MW solar piling & civil works",
     "Tata Motors 5.5 MW solar piling and civil works in Jamshedpur by Arrays Ingenieria"),
    ("assets/photos/proj-supersmelters.jpg", "projects", "Super Smelters Ltd., Asansol: 1980.3 kWp solar plant with Tata Power Solar",
     "Super Smelters 1980.3 kWp industrial solar plant in Asansol by Arrays Ingenieria with Tata Power Solar"),
    ("assets/photos/proj-jayshree.jpg", "projects", "Jayshree Tea Estate, Sonari (Assam): 1 MW ground-mount on-grid solar",
     "Jayshree Tea Estate 1 MW ground-mount solar plant in Sonari, Assam by Arrays Ingenieria"),
    ("assets/photos/proj-towkok.jpg", "projects", "Towkok Tea Estate, Assam: 535 kWp ground-mount on-grid solar",
     "Towkok Tea Estate 535 kWp ground-mount solar plant in Assam by Arrays Ingenieria"),
    ("assets/photos/proj-manjushree.jpg", "projects", "Manjushree Tea Estate, Assam: 500 kWp ground-mount on-grid solar",
     "Manjushree Tea Estate 500 kWp ground-mount solar plant in Assam by Arrays Ingenieria"),
    ("assets/photos/proj-assam-rooftop.jpg", "projects", "1711.66 kWp on-grid rooftop solar PV, Assam",
     "1711.66 kWp on-grid rooftop solar PV plant in Assam by Arrays Ingenieria"),
    ("assets/photos/proj-grid1035.jpg", "projects", "1035 kWp grid-connected solar power generation system",
     "1035 kWp grid-connected solar power system by Arrays Ingenieria"),
    ("assets/photos/proj-appl.jpg", "projects", "APPL Kakajan Tea Estate, Assam: solar project",
     "APPL Kakajan Tea Estate solar project in Assam by Arrays Ingenieria"),
    ("assets/photos/proj-pantnagar.jpg", "projects", "Tata Motors, Pantnagar: solar carport / parking shed",
     "Tata Motors Pantnagar solar carport built by Arrays Ingenieria"),
    ("assets/photos/proj-balaji.jpg", "projects", "Balaji Action Tesa, Sitarganj: rooftop solar",
     "Balaji Action Tesa rooftop solar project in Sitarganj by Arrays Ingenieria"),
    ("assets/photos/proj-tatasteel.jpg", "projects", "Tata Steel, Noamundi (Jharkhand): solar project",
     "Tata Steel solar project at Noamundi, Jharkhand by Arrays Ingenieria"),
    ("assets/photos/proj-ramnagar.jpg", "projects", "Ramnagar, Uttarakhand: ground-mount solar project",
     "Ramnagar ground-mount solar project in Uttarakhand by Arrays Ingenieria"),
    ("assets/photos/hero-solar-farm.jpg", "projects", "Utility-scale ground-mount solar power plant",
     "Utility-scale ground-mount solar power plant built by Arrays Ingenieria"),
    ("assets/photos/proj-rooftop-pano.jpg", "projects", "Large industrial rooftop solar array",
     "Large industrial rooftop solar array installed by Arrays Ingenieria"),
    ("assets/photos/how-photo.jpg", "projects", "Completed rooftop solar installation generating clean power",
     "Completed rooftop solar installation by Arrays Ingenieria generating clean power"),
    ("assets/photos/proj-precast.jpg", "projects", "Pre-cast boundary wall for Tata Motors, Jamshedpur",
     "Pre-cast boundary wall civil works for Tata Motors, Jamshedpur by Arrays Ingenieria"),
    ("assets/photos/proj-piling-extra.jpg", "projects", "Solar pile foundation & chain-link fencing, Madhepura, Bihar",
     "Solar pile foundation and chain-link fencing in Madhepura, Bihar by Arrays Ingenieria"),
    ("assets/photos/proj-earthing.jpg", "projects", "Earthing & electrical safety works on a solar plant",
     "Solar plant earthing and electrical safety works by Arrays Ingenieria"),
    ("assets/press/event-inauguration.jpg", "events", "1980.3 kWp solar plant inauguration with Tata Power Solar",
     "Inauguration of the 1980.3 kWp solar plant built by Arrays Ingenieria with Tata Power Solar"),
    ("assets/photos/proj-inauguration.jpg", "events", "Solar power plant inauguration ceremony",
     "Solar power plant inauguration ceremony, Arrays Ingenieria"),
    ("assets/press/event-commissioning.jpg", "events", "Switching on clean power: solar plant commissioning",
     "Solar power plant commissioning ceremony, Arrays Ingenieria"),
    ("assets/press/event-pooja.jpg", "events", "Ground-breaking ceremony for a solar project",
     "Ground-breaking ceremony for an Arrays Ingenieria solar project"),
    ("assets/news/prerna-bharati-orangajuli-450kw-solar-ingenieria.jpg", "media",
     "Prerna Bharati, 5 Sep 2026: veteran-led Arrays Ingenieria commissions 450 kW solar plant at Orangajuli Tea Estate, Assam",
     "Prerna Bharati Hindi newspaper report on the 450 kW solar plant built by Arrays Ingenieria at Orangajuli Tea Estate, Udalguri, Assam"),
    ("assets/news/barpatra-tea-estate-230kw-solar-ingenieria.jpg", "media",
     "25 Sep 2026: 230 kW on-grid solar plant starts at Barpatra Tea Estate (Goodricke Group), Sonari, Assam",
     "Hindi newspaper report on the 230 kW solar plant built by Arrays Ingenieria at Barpatra Tea Estate, Sonari, Assam"),
    ("assets/news/barpatra-tea-estate-230kw-solar-newspaper-print.jpg", "media",
     "Print edition: Barpatra Tea Estate 230 kW solar plant, Dibrugarh/Sonari, 25 Sep 2026",
     "Printed Hindi newspaper page on the Barpatra Tea Estate 230 kW solar plant by Arrays Ingenieria"),
    ("assets/news/news-bhaskar-tcpl.jpg", "media", "Dainik Bhaskar: 319 kWp rooftop solar at TCPL Greenery Agro (Tata Consumer), Vaishali",
     "Dainik Bhaskar report on the 319 kWp rooftop solar plant by Arrays Ingenieria in Vaishali, Bihar"),
    ("assets/news/news-supersmelters-inaug.jpg", "media", "1980.3 kWp solar plant inaugurated at Super Smelters with Tata Power Solar",
     "Newspaper report on the 1980.3 kWp Super Smelters solar plant inauguration, Arrays Ingenieria"),
    ("assets/news/news-supersmelters-rooftop.jpg", "media", "Jamuria: 1980.3 kWp rooftop solar plant inaugurated at Super Smelters",
     "Newspaper report on the Super Smelters rooftop solar plant in Jamuria by Arrays Ingenieria"),
    ("assets/press/media-indiatoday.jpg", "media", "India Today: expert analysis on the India–China faceoff",
     "Lt. Gen. A.R. Prasad (Retd), founder of Arrays Ingenieria, on India Today"),
    ("assets/press/media-aajtak-panel.jpg", "media", "Aaj Tak: prime-time national debate panellist",
     "Lt. Gen. A.R. Prasad (Retd) of Arrays Ingenieria on an Aaj Tak prime-time debate"),
    ("assets/press/media-indiatv.jpg", "media", "India TV: border & defence coverage",
     "Lt. Gen. A.R. Prasad (Retd) of Arrays Ingenieria on India TV"),
    ("assets/press/media-aajtak-breaking.jpg", "media", "Aaj Tak: breaking-news analysis",
     "Lt. Gen. A.R. Prasad (Retd) of Arrays Ingenieria on Aaj Tak breaking news"),
    ("assets/press/ceo-president.jpg", "leadership", "Honoured by the President of India",
     "Lt. Gen. A.R. Prasad (Retd), CEO of Arrays Ingenieria, honoured by the President of India"),
    ("assets/press/ceo-president-flowers.jpg", "leadership", "Welcomed at Rashtrapati Bhavan",
     "Lt. Gen. A.R. Prasad (Retd) of Arrays Ingenieria welcomed at Rashtrapati Bhavan"),
    ("assets/press/ceo-modi.jpg", "leadership", "With Prime Minister Shri Narendra Modi",
     "Lt. Gen. A.R. Prasad (Retd) of Arrays Ingenieria with Prime Minister Shri Narendra Modi"),
    ("assets/press/ceo-rajnath.jpg", "leadership", "With Defence Minister Shri Rajnath Singh",
     "Lt. Gen. A.R. Prasad (Retd) of Arrays Ingenieria with Defence Minister Shri Rajnath Singh"),
    ("assets/press/ceo-rajnath-event.jpg", "leadership", "At a national ceremonial event",
     "Lt. Gen. A.R. Prasad (Retd) of Arrays Ingenieria at a national ceremonial event"),
    ("assets/press/ceo-defcom.jpg", "leadership", "Keynote at DEFCOM India",
     "Lt. Gen. A.R. Prasad (Retd) of Arrays Ingenieria delivering the keynote at DEFCOM India"),
    ("assets/press/ceo-official.jpg", "leadership", "Meeting national leadership",
     "Lt. Gen. A.R. Prasad (Retd) of Arrays Ingenieria meeting national leadership"),
    ("assets/press/ceo-office.jpg", "leadership", "A distinguished military career",
     "Lt. Gen. A.R. Prasad (Retd), founder of Arrays Ingenieria, at his command office"),
    ("assets/press/ceo-airforce.jpg", "leadership", "Armed forces ceremony",
     "Lt. Gen. A.R. Prasad (Retd) of Arrays Ingenieria at an armed-forces ceremony"),
    ("assets/press/ceo-event.jpg", "leadership", "With fellow officers",
     "Lt. Gen. A.R. Prasad (Retd) of Arrays Ingenieria with fellow officers"),
    ("assets/press/ceo-handshake.jpg", "leadership", "Felicitation & honours",
     "Lt. Gen. A.R. Prasad (Retd) of Arrays Ingenieria being felicitated"),
    ("assets/press/ceo-govt-event.jpg", "leadership", "A national celebration",
     "Arrays Ingenieria leadership at a national celebration"),
    ("assets/press/ceo-family.jpg", "leadership", "Celebrating a milestone",
     "Arrays Ingenieria leadership celebrating a milestone"),
    ("assets/certs/iso-9001.jpg", "certificates", "ISO 9001:2015 Quality Management System",
     "ISO 9001:2015 quality management certificate of Arrays Ingenieria Pvt. Ltd."),
    ("assets/certs/iso-14001.jpg", "certificates", "ISO 14001:2015 Environmental Management System",
     "ISO 14001:2015 environmental management certificate of Arrays Ingenieria Pvt. Ltd."),
    ("assets/certs/iso-45001.jpg", "certificates", "ISO 45001:2018 Occupational Health & Safety",
     "ISO 45001:2018 occupational health and safety certificate of Arrays Ingenieria Pvt. Ltd."),
    ("assets/certs/award-india5000.jpg", "certificates", "India 5000 Best MSME Awards: nomination for quality excellence (2024)",
     "India 5000 Best MSME Award for Quality Excellence nomination, Arrays Ingenieria Pvt. Ltd."),
    ("assets/certs/appreciation-jayshree-towkok.jpg", "certificates", "Jay Shree Tea (BK Birla Group): appreciation for 535 kWp Towkok solar",
     "Jay Shree Tea certificate of appreciation to Arrays Ingenieria for the 535 kWp Towkok solar plant"),
    ("assets/certs/appreciation-jayshree-500kwp.jpg", "certificates", "Jay Shree Tea: appreciation for 500 kWp ground-mount solar",
     "Jay Shree Tea certificate of appreciation to Arrays Ingenieria for a 500 kWp solar plant"),
    ("assets/certs/appreciation-super-smelters.jpg", "certificates", "Super Smelters Ltd.: letter of appreciation, 1980.3 kWp solar",
     "Super Smelters Ltd. letter of appreciation to Arrays Ingenieria for the 1980.3 kWp solar plant"),
    ("assets/certs/appreciation-bharat-petroleum.jpg", "certificates", "Bharat Petroleum: appreciation for RCC rooftop on-grid solar",
     "Bharat Petroleum certificate of appreciation to Arrays Ingenieria for rooftop solar"),
    ("assets/orders/wo-tatapower-seci.jpg", "orders", "Tata Power (TPREL): pile-foundation works, 300 MW SECI, Koppal",
     "Tata Power work order to Arrays Ingenieria for SECI 300 MW solar pile foundation"),
    ("assets/orders/wo-tatapower-dcm.jpg", "orders", "Tata Power: civil works, 10 MW DCM Textile, Hisar",
     "Tata Power work order to Arrays Ingenieria for DCM Hisar 10 MW solar civil works"),
    ("assets/orders/wo-tatapower-tml.jpg", "orders", "Tata Power: piling & civil works, 5.5 MW Tata Motors, Jamshedpur",
     "Tata Power work order to Arrays Ingenieria for Tata Motors 5.5 MW solar"),
    ("assets/orders/po-jayshree-1035.jpg", "orders", "Jay Shree Tea: purchase order for 1035 kWp grid-connected solar",
     "Jay Shree Tea purchase order to Arrays Ingenieria for 1035 kWp grid-connected solar"),
    ("assets/orders/po-sustvest-assam.jpg", "orders", "SolarGridX / Sustvest: purchase order for 1711.66 kWp on-grid solar, Assam",
     "Purchase order to Arrays Ingenieria for 1711.66 kWp on-grid solar in Assam"),
]

# ----------------------------------------------------------- coverage ----
# Every place Arrays Ingenieria has been reported on. One list drives the
# News & Media page, the home-page "In the News" section, the "featured in"
# strips, the gallery videos and the structured data. Quotes are verbatim from
# the source; keep them that way. kind: tv | online | print | client.
# date: ISO (YYYY-MM-DD or YYYY-MM) or None when the source shows no date.
COVERAGE = [
    dict(id="ne-reports-orangajuli", kind="tv", outlet="NE Reports", place="Dibrugarh, Assam", platform="Facebook",
         date="2026-09",
         headline="Janmashtami launch: 450 kW solar plant at Orangajuli Tea Estate, Udalguri",
         summary="NE Reports filmed the ribbon-cutting at the 450 kW ground-mount solar plant Arrays Ingenieria built for "
                 "Goodricke Group's Orangajuli Tea Estate, commissioned on Janmashtami.",
         url="https://www.facebook.com/reel/1678209397245830/",
         img="assets/photos/orangajuli-450kw-solar-inauguration-assam.jpg",
         alt="Ribbon-cutting at the 450 kW Orangajuli Tea Estate solar plant built by Arrays Ingenieria (still from the NE Reports video)"),
    dict(id="sonari-live", kind="tv", outlet="Sonari Live", place="Sonari, Assam", platform="Facebook", date=None,
         headline="Sonari Live news report on Arrays Ingenieria's tea-estate solar plants",
         summary="Sonari Live's news video on Arrays Ingenieria's solar work in Sonari, where the company has commissioned "
                 "ground-mount plants for tea estates including Jayshree, Towkok and Barpatra.",
         url="https://www.facebook.com/100089972142580/videos/1069048716104190/",
         bg="assets/photos/proj-jayshree.jpg",
         alt="Jayshree Tea Estate solar plant in Sonari, Assam, built by Arrays Ingenieria"),
    dict(id="news-axom", kind="tv", outlet="News Axom", place="Nagaon, Assam", platform="Facebook", date=None,
         headline="News Axom video report on Arrays Ingenieria's solar work in Assam",
         summary="Assamese news channel News Axom's video report on Arrays Ingenieria, the ex-servicemen-run company "
                 "building solar power plants for Assam's tea industry.",
         url="https://www.facebook.com/61564147994036/videos/122210117936471599/",
         bg="assets/photos/proj-manjushree.jpg",
         alt="Manjushree Tea Estate solar plant in Assam built by Arrays Ingenieria"),
    dict(id="sentinel-jayshree", kind="online", outlet="The Sentinel", place="Assam", platform="sentinelassam.com",
         date="2025-05-22",
         headline="Assam: AIPL commissions 1 MW solar power plant at Jayshree Tea Estate",
         summary="Assam's English daily reports that Arrays Ingenieria installed 1 MW of solar at Jayshree Tea Estates in "
                 "Sonari under Tata Power's EPC contract: 535 kWp at Towkok and 500 kWp at Manjushree, the first renewable "
                 "project in the 80-year history of Jayshree Tea & Industries (BK Birla Group).",
         quote="Arrays Ingenieria is a unique MSME founded by ex-servicemen, symbolizing a disciplined, mission-driven "
               "transition from OG (Olive Green-the military uniform) to GG (Go Green-renewable energy).",
         url="https://www.sentinelassam.com/north-east-india-news/assam-news/assam-aipl-commissions-1-mw-solar-power-plant-at-jayshree-tea-estate",
         img="assets/photos/proj-jayshree.jpg",
         alt="Jayshree Tea Estate 1 MW solar plant in Sonari, Assam, reported by The Sentinel"),
    dict(id="hub-network-orangajuli", kind="online", outlet="Hub Network", place="Guwahati, Assam", platform="hubnetwork.in",
         date="2026-09-04",
         headline="Assam tea garden gets 450 kWp solar plant as clean energy push gathers pace",
         summary="Reports the commissioning of the 450 kWp ground-mounted plant at Orangajuli Tea Garden, Panerihaat, Udalguri, by "
                 "Arrays Ingenieria, the installation partner for the 3.11 MW TPREL and SustVest programme covering 18 Goodricke tea "
                 "estates, with the plant inaugurated by garden manager Daljit Singh Maan.",
         quote="For Arrays Ingenieria, the project also reflects its 'Olive Green to Go Green' philosophy.",
         url="https://hubnetwork.in/assam-tea-garden-gets-450-kwp-solar-plant-as-clean-energy-push-gathers-pace/",
         img="assets/photos/orangajuli-450kw-solar-inauguration-assam.jpg",
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
    dict(id="barpatra-230kw", kind="print", outlet="Hindi daily, Dibrugarh–Sonari edition", place="Sonari, Assam", lang="hi",
         date="2026-09-25",
         headline="230 kW solar plant starts at Barpatra Tea Estate",
         original="बरपात्रा टीई में 230 किलोवाट का सौर संयंत्र शुरू",
         summary="Arrays Ingenieria, turnkey implementing partner, commissions a 230 kW on-grid ground-mount plant at "
                 "Goodricke Group's Barpatra Tea Estate, bringing its total to 19 on-grid solar plants in Assam's tea gardens.",
         img="assets/news/barpatra-tea-estate-230kw-solar-ingenieria.jpg",
         extra="assets/news/barpatra-tea-estate-230kw-solar-newspaper-print.jpg",
         alt="Hindi newspaper report on the 230 kW solar plant built by Arrays Ingenieria at Barpatra Tea Estate, Sonari, Assam"),
    dict(id="bhaskar-tcpl", kind="print", outlet="Dainik Bhaskar", place="Hajipur, Bihar", lang="hi",
         date="2024-04-03",
         headline="Bhagwanpur solar plant to generate 319 kW of power",
         original="भगवानपुर में सोलर पावर ग्रिड से 319 किलोवाट बिजली का होगा उत्पादन",
         summary="Dainik Bhaskar reports on the 319 kWp rooftop solar plant built by Arrays Ingenieria for TCPL Greenery "
                 "Agro (Tata Consumer Products) in Vaishali district, Bihar.",
         img="assets/news/news-bhaskar-tcpl.jpg",
         alt="Dainik Bhaskar report on the 319 kWp rooftop solar plant by Arrays Ingenieria in Vaishali, Bihar"),
    dict(id="sanmarg-supersmelters", kind="print", outlet="Sanmarg", place="Jamuria, West Bengal", lang="hi", date=None,
         headline="1980.3 kWp solar plant installed for environmental protection at Super Smelters",
         original="पर्यावरण संरक्षण के लिए लगाया गया 1980.3 केवी का सोलर प्लांट",
         summary="Super Smelters, the largest industrial unit in the area, inaugurates a 1980.3 kWp rooftop solar plant "
                 "built with Tata Power Solar and Arrays Ingenieria (AIPL), about 2 MW of clean power.",
         img="assets/news/news-supersmelters-inaug.jpg",
         alt="Sanmarg newspaper report on the 1980.3 kWp Super Smelters solar plant inauguration, Arrays Ingenieria"),
    dict(id="supersmelters-rooftop", kind="print", outlet="Hindi daily, Jamuria", place="Jamuria, West Bengal", lang="hi", date=None,
         headline="1980.3 kWp rooftop solar power plant inaugurated at Super Smelters",
         original="जामुड़िया : सुपर स्मेलटर्स कारखाना में 1980.3 केडब्ल्यूपी रूफटॉप सोलर पावर प्लांट का हुआ उद्घाटन",
         summary="The inauguration ceremony of the 1980.3 kWp rooftop plant at Super Smelters, with Lt. Gen. Ashish Ranjan "
                 "Prasad (Retd) of Arrays Ingenieria among the guests.",
         img="assets/news/news-supersmelters-rooftop.jpg",
         alt="Newspaper report on the Super Smelters rooftop solar plant in Jamuria built by Arrays Ingenieria"),
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
         img="assets/photos/proj-towkok.jpg",
         alt="Towkok Tea Estate 535 kWp solar plant in Assam built by Arrays Ingenieria"),
    dict(id="jayshree-dewan", kind="client", outlet="Jay Shree Tea & Industries Ltd.", place="BK Birla Group",
         date="2025-11-24",
         headline="Solar for the Dewan Group of Tea Estates: Dewan, Labac & Burtoll",
         quote="The solar power systems were executed by Arrays Ingenieria Private Limited (AIPL), an organisation "
               "established and operated by ex-servicemen, under Tata Power's EPC contract. Their precision, discipline "
               "and commitment to excellence ensured seamless implementation across all three locations.",
         summary="New solar power plants at three Jay Shree Tea gardens in Assam, all executed by Arrays Ingenieria.",
         links=[("Instagram", "https://www.instagram.com/reel/DRcNrhXEyFT/")],
         img="assets/press/event-commissioning.jpg",
         alt="Solar power plant commissioning ceremony, Arrays Ingenieria"),
]
# The founder's appearances as a defence expert on national TV (existing section).
NATIONAL_TV = ["India Today", "Aaj Tak", "India TV"]

KIND_LABEL = {"tv": "News channel", "online": "Online news", "print": "Newspaper", "client": "Client post"}
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
    "Instagram": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>',
    "Facebook": FB_SVG,
    "LinkedIn": '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z"/></svg>',
}

# ----------------------------------------------------- header / footer ----
NAV = [
    ("About", "about.html", "about"), ("Services", "/#services", "services"),
    ("Projects", "projects.html", "projects"), ("Gallery", "gallery.html", "gallery"),
    ("News & Media", "recognition.html", "recognition"), ("Achievements", "achievements.html", "achievements"),
    ("Insights", "insights.html", "insights"), ("Contact", "contact.html", "contact"),
]

def render_header(page_key):
    active = ' class="active" aria-current="page"'
    links = "".join(
        f'<a href="{href}"{active if key == page_key else ""}>{label}</a>'
        for label, href, key in NAV)
    return f"""<header class="header scrolled solid" id="header">
    <div class="container nav">
      <a href="/" class="brand" aria-label="Arrays Ingenieria — home">
        <img src="assets/img/logo-horizontal.png" alt="INGENIERIA — Arrays Ingenieria Pvt. Ltd. logo" class="brand-logo" width="558" height="128" />
      </a>
      <nav class="nav-links" id="navLinks" aria-label="Primary">{links}<a class="nav-quote" href="contact.html">Get a Free Quote</a></nav>
      <div class="nav-cta">
        <a href="projects.html" class="btn btn--outline">Our Work</a>
        <a href="contact.html" class="btn btn--primary">Get a Quote</a>
        <button class="menu-toggle" id="menuToggle" aria-label="Toggle menu" aria-expanded="false" aria-controls="navLinks">
          <span></span><span></span><span></span>
        </button>
      </div>
    </div>
  </header>"""


FOOTER = f"""<footer class="footer">
    <div class="container">
      <div class="footer__top">
        <div class="footer__brand">
          <div class="logo">
            <img src="assets/img/logo-horizontal.png" alt="INGENIERIA — Arrays Ingenieria Pvt. Ltd. logo" class="brand-logo" width="558" height="128" />
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
            <li><a href="ex-servicemen-led-msme.html">Ex-Servicemen-Led MSME</a></li>
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
        <span class="footer-legal"><a href="privacy.html">Privacy Policy</a><a href="terms.html">Terms of Use</a><a href="gallery.html">Gallery</a></span>
        <span class="made">Developing Green Energy for the Nation 🌱</span>
      </div>
    </div>
  </footer>

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


def tv_card(c, lead=False, with_id=True):
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
    quote = (f'\n          <blockquote class="press-quote"><p>“{esc(c["quote"])}”</p><cite>{esc(c["outlet"])}</cite></blockquote>'
             if c.get("quote") else "")
    actions = []
    if c.get("url"):
        actions.append(f'<a class="press-link" href="{c["url"]}" target="_blank" rel="noopener">Read on {esc(c["outlet"])} {EXT_SVG}</a>')
    else:
        actions.append(f'<span class="press-link" data-full="{c["img"]}" data-gallery="press-read" data-caption="{cap}" tabindex="0" role="button">Read the clipping</span>')
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


def client_post(c, with_id=True):
    links = "".join(f'<a class="cp-link cp-{n.lower()}" href="{u}" target="_blank" rel="noopener">{PLATFORM_ICON[n]}{n}</a>'
                    for n, u in c["links"])
    ident = f' id="{c["id"]}"' if with_id else ""
    return f"""<article class="client-post reveal"{ident}>
        <div class="cp-head"><span class="cp-mono">{initials(c['outlet'])}</span><div><b>{esc(c['outlet'])}</b><span>{esc(c['place'])} · our client</span></div>{time_tag(c['date'])}</div>
        <h3>{esc(c['headline'])}</h3>
        <blockquote class="cp-quote"><p>“{esc(c['quote'])}”</p></blockquote>
        <p class="cp-sum">{esc(c['summary'])}</p>
        <div class="cp-links"><span>Read the original post on</span>{links}</div>
      </article>"""


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
        if c["kind"] == "client":
            node = {"@type": "SocialMediaPosting", "headline": c["headline"], "url": c["links"][0][1],
                    "sameAs": [u for _, u in c["links"][1:]] or None, "author": {"@type": "Organization", "name": c["outlet"]},
                    "articleBody": c["quote"], "about": org}
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
            "name": "Arrays Ingenieria in the news", "url": SITE_URL + "/recognition.html",
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
                     f'<span class="nf-lbl">{esc(f["label"])}</span><span class="nf-src">Source: PIB {EXT_SVG}</span></a>')
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
            f'\n      <div class="clip reveal" data-full="{src}" data-gallery="docs" data-caption="{esc(cap)}"><img src="{src}" alt="{esc(cap)} — Arrays Ingenieria" /><div class="ccap">{esc(cap)}</div></div>'
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
      <h2>About the {esc(p['short'].split(' — ')[0])} project</h2>{body}
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
        <a class="btn btn--sun" href="contact.html" style="width:100%;">Get a Free Quote</a>
      </div>
    </aside>
  </div>
</section>
{impact}{docs}
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
    return page_shell("projects", body_html, p["hero"], hero_alt, ld)


def render_faq_page():
    items = "".join(f'\n      <details class="faq"{" open" if i == 0 else ""}><summary>{esc(q)}</summary><div class="faq-a">{esc(a)}</div></details>'
                    for i, (q, a) in enumerate(FAQ))
    ld = [{"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [
        {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in FAQ]}]
    body = page_hero("assets/photos/proj-towkok.jpg", "Towkok Tea Estate solar plant in Assam built by Arrays Ingenieria",
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
    return page_shell("faq", body, "assets/photos/proj-towkok.jpg", "Towkok Tea Estate solar plant by Arrays Ingenieria", ld)


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
    body = page_hero("assets/photos/proj-rooftop-pano.jpg", "Industrial rooftop solar array installed by Arrays Ingenieria",
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
    return page_shell("insights", body, "assets/photos/proj-rooftop-pano.jpg", "Rooftop solar array by Arrays Ingenieria", ld)


def render_clients_page():
    cards = []
    for i, (name, rel, what, files) in enumerate(CLIENTS):
        links = "".join(f'<a href="{f}">{esc(PAGES[f]["crumb"])} →</a>' for f in files)
        cards.append(f'<article class="client-card reveal" data-d="{i % 3}"><span class="cl-rel">{esc(rel)}</span><h3>{esc(name)}</h3>'
                     f'<p>{esc(what)}</p>{f"<div class=cl-links>{links}</div>" if links else ""}</article>')
    ld = [{"@context": "https://schema.org", "@type": "CollectionPage", "name": "Clients and partners of Arrays Ingenieria",
           "url": SITE_URL + "/clients.html", "about": {"@id": SITE_URL + "/#organization"},
           "mentions": [{"@type": "Organization", "name": n} for n, *_ in CLIENTS]}]
    body = page_hero("assets/photos/proj-supersmelters.jpg", "Super Smelters rooftop solar plant built by Arrays Ingenieria with Tata Power Solar",
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
    return page_shell("clients", body, "assets/photos/proj-supersmelters.jpg", "Super Smelters solar plant by Arrays Ingenieria", ld)


def write_generated_pages():
    for p in PROJECTS:
        open(os.path.join(ROOT, p["file"]), "w", encoding="utf8").write(render_project_page(p))
    for fname, render in (("faq.html", render_faq_page), ("solar-glossary.html", render_glossary_page),
                          ("clients.html", render_clients_page)):
        open(os.path.join(ROOT, fname), "w", encoding="utf8").write(render())


# -------------------------------------------------------------- gallery ----
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
<meta property="og:image" content="{SITE_URL}/assets/photos/orangajuli-450kw-solar-inauguration-assam.jpg" />
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
  <div class="page-hero__bg"><img src="assets/photos/proj-jayshree.jpg" alt="Jayshree Tea Estate 1 MW solar plant in Sonari, Assam by Arrays Ingenieria" /></div>
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


def process_images(body_html):
    """width/height/decoding on every local <img>; first content image is the LCP."""
    first = [True]

    def fix(m):
        tag = m.group(0)
        src = re.search(r'src="([^"]+)"', tag)
        if not src:
            return tag
        path = os.path.join(ROOT, src.group(1).lstrip("/").split("?")[0])
        in_chrome = "brand-mark" in tag
        if os.path.isfile(path) and not in_chrome and not re.search(r'\swidth="', tag):
            size = image_size(path)
            if size:
                tag = set_attr(tag, "width", size[0])
                tag = set_attr(tag, "height", size[1])
        if in_chrome:
            return tag
        tag = set_attr(tag, "decoding", "async")
        if first[0]:
            first[0] = False
            tag = del_attr(tag, "loading")
            tag = set_attr(tag, "fetchpriority", "high")
        else:
            tag = del_attr(tag, "fetchpriority")
            tag = set_attr(tag, "loading", "lazy")
        return tag

    return re.sub(r"<img\b[^>]*>", fix, body_html)


def replace_block(text, name, content):
    pat = re.compile(rf"<!-- build:{name} -->.*?<!-- /build:{name} -->", re.S)
    block = f"<!-- build:{name} -->\n{content}\n<!-- /build:{name} -->"
    if pat.search(text):
        return pat.sub(lambda _: block, text)
    placeholder = f'<div id="site-{name}"></div>'
    return text.replace(placeholder, block)


def normalise_links(text):
    pages = {p[:-5] for p in PAGES}
    # index.html / index.html#x -> / and /#x
    text = re.sub(r'href=(["\'])(?:\./)?index\.html(#[^"\']*)?\1', lambda m: f'href="/{m.group(2) or ""}"', text)
    # /about, /about#x -> about.html
    def ext(m):
        name, frag = m.group(2), m.group(3) or ""
        return f'href="{name}.html{frag}"' if name in pages and name != "index" else m.group(0)
    text = re.sub(r'href=(["\'])/([a-z0-9-]+)(#[^"\']*)?\1', ext, text)
    # remaining single-quoted internal hrefs -> double quotes (consistency)
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
    size = image_size(os.path.join(ROOT, og_image.replace(SITE_URL + "/", "")))
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
    r'|<link rel="canonical"[^>]*>)[ \t]*\n', re.M | re.S)


def process_page(fname):
    path = os.path.join(ROOT, fname)
    text = open(path, encoding="utf8").read()
    text = KNOWN_HOSTS.sub(SITE_URL, text)
    page_key = re.search(r'<body data-page="([^"]+)"', text).group(1)

    # header / footer / videos baked in
    text = replace_block(text, "header", render_header(page_key))
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
    og_image = og_img.group(1) if og_img else f"{SITE_URL}/{hero.group(1)}"
    alt = html.unescape(og_alt.group(1)) if og_alt else ""
    if not alt or alt.startswith("Ingenieria — veteran-led solar EPC"):
        alt = html.unescape(hero.group(2)) if hero and hero.group(1) in og_image else f"{BRAND} — veteran-led solar EPC company in India"
    head = HEAD_TAG_RE.sub("", head)
    head = re.sub(r'(<meta name="viewport"[^>]*>\n)', lambda m: m.group(1) + head_block(fname, og_image, alt) + "\n", head, count=1)
    head = head.replace("/assets/img/logo.svg", "/assets/img/logo.png").replace("/assets/img/logo-mark.svg", "/assets/img/logo.png")
    head = re.sub(r'<link rel="icon"[^>]*>\n(?:<link rel="apple-touch-icon"[^>]*>\n)?',
                  '<link rel="icon" type="image/png" sizes="32x32" href="assets/img/favicon-32.png" />\n'
                  '<link rel="apple-touch-icon" href="assets/img/apple-touch-icon.png" />\n', head, count=1)

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

    # links, asset versions, scripts
    text = normalise_links(text)
    text = re.sub(r"\?v=\d+", f"?v={ASSET_VERSION}", text)
    if 'id="indiaMap"' not in text:
        text = re.sub(r'<script src="assets/js/india-map-data\.js[^"]*"></script>\n', "", text)

    # images
    head, body = text.split("</head>", 1)
    # the header logo is chrome; the hero is the first image after </header>
    pre, sep, post = body.partition("</header>")
    body = pre + sep + process_images(post) if sep else process_images(body)
    text = head + "</head>" + body

    # 404 is served at arbitrary depths: make its URLs root-absolute
    if fname == "404.html":
        text = re.sub(r'(src|href)="(?!https?:|mailto:|tel:|/|#|data:)([^"]+)"', r'\1="/\2"', text)

    open(path, "w", encoding="utf8").write(text)


# -------------------------------------------------------- site files ----
def write_sitemap():
    out = ['<?xml version="1.0" encoding="UTF-8"?>',
           '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">']
    for fname, meta in PAGES.items():
        if not meta["path"]:
            continue
        text = open(os.path.join(ROOT, fname), encoding="utf8").read()
        body = text.split("</header>", 1)[-1]
        imgs = []
        for src in re.findall(r'(?:src|data-full)="(assets/[^"]+\.(?:jpe?g|png|webp))"', body):
            if src not in imgs:
                imgs.append(src)
        out.append(f"  <url>\n    <loc>{SITE_URL}{meta['path']}</loc>\n    <lastmod>{TODAY}</lastmod>")
        for src in imgs:
            out.append(f"    <image:image><image:loc>{SITE_URL}/{src}</image:loc></image:image>")
        out.append("  </url>")
    out.append("</urlset>\n")
    open(os.path.join(ROOT, "sitemap.xml"), "w", encoding="utf8").write("\n".join(out))


def write_robots():
    open(os.path.join(ROOT, "robots.txt"), "w", encoding="utf8").write(
        f"User-agent: *\nAllow: /\nDisallow: /tools/\n\nSitemap: {SITE_URL}/sitemap.xml\n")


def write_redirects():
    lines = ["# One URL per page: extensionless paths 301 to the canonical .html URL (generated by tools/build.py)"]
    for fname, meta in PAGES.items():
        if meta["path"] and fname != "index.html":
            lines.append(f"/{fname[:-5]}  {meta['path']}  301")
    lines.append("/index  /  301")
    lines.append("/tools/*  /404.html  404!")
    open(os.path.join(ROOT, "_redirects"), "w", encoding="utf8").write("\n".join(lines) + "\n")


# --------------------------------------------------------- link check ----
def check_links():
    ids, problems = {}, []
    for fname in PAGES:
        t = open(os.path.join(ROOT, fname), encoding="utf8").read()
        ids[fname] = set(re.findall(r'\sid="([^"]+)"', t))
    for fname in PAGES:
        t = open(os.path.join(ROOT, fname), encoding="utf8").read()
        t = re.sub(r"<script\b(?![^>]*\bsrc=)[^>]*>.*?</script>", "", t, flags=re.S)
        for attr, url in re.findall(r'\s(href|src|data-full)="([^"]*)"', t):
            if re.match(r"(https?:|mailto:|tel:|data:|javascript:)", url) or url == "":
                continue
            base, _, frag = url.partition("#")
            base = base.split("?")[0].lstrip("/")
            target = base or (fname if url.startswith("#") else "index.html")
            if not os.path.isfile(os.path.join(ROOT, target)):
                problems.append(f"{fname}: missing file {url}")
            elif frag and target.endswith(".html") and frag not in ids.get(target, set()):
                problems.append(f"{fname}: missing anchor {url}")
            if base.endswith(".html") and base not in PAGES:
                problems.append(f"{fname}: page not in PAGES {url}")
    css = open(os.path.join(ROOT, "assets/css/style.css"), encoding="utf8").read()
    for url in re.findall(r"url\(['\"]?([^'\")]+)", css):
        if not url.startswith(("data:", "http")) and not os.path.isfile(os.path.join(ROOT, "assets/css", url)):
            problems.append(f"style.css: missing {url}")
    for fname in PAGES:
        t = open(os.path.join(ROOT, fname), encoding="utf8").read()
        for tag in re.findall(r"<img\b[^>]*>", t):
            if not re.search(r'\salt="[^"]+"', tag):
                problems.append(f"{fname}: <img> without alt: {tag[:90]}")
        if len(re.findall(r"<h1\b", t)) != 1:
            problems.append(f"{fname}: expected exactly one <h1>")
        for m in re.findall(r'<script type="application/ld\+json"[^>]*>(.*?)</script>', t, re.S):
            try:
                json.loads(m)
            except ValueError as err:
                problems.append(f"{fname}: invalid JSON-LD ({err})")
    return problems


def main():
    open(os.path.join(ROOT, "gallery.html"), "w", encoding="utf8").write(render_gallery_page())
    write_generated_pages()
    for fname in PAGES:
        process_page(fname)
    write_sitemap()
    write_robots()
    write_redirects()
    problems = check_links()
    for p in problems:
        print("PROBLEM:", p)
    print(f"Built {len(PAGES)} pages for {SITE_URL} — {len(problems)} problem(s).")
    sys.exit(1 if problems else 0)


if __name__ == "__main__":
    main()
