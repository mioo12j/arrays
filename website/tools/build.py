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

Edit PAGES for titles/descriptions, GALLERY for gallery photos, VIDEOS for
video coverage. Change SITE_URL once the custom domain is live.
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
        desc="Arrays Ingenieria is a veteran-led, ISO-certified solar EPC company building ground-mount & rooftop solar plants across India for Tata Power, Tata Steel & more."),
    "about.html": dict(path="/about.html", crumb="About",
        title="About Arrays Ingenieria | Veteran-Led Solar EPC, India",
        desc="Founded in 2018 by ex-servicemen and led by Lt. Gen. A.R. Prasad (Retd), Arrays Ingenieria is an ISO 9001/14001/45001-certified solar EPC company."),
    "projects.html": dict(path="/projects.html", crumb="Projects",
        title="Solar Projects Across India | Arrays Ingenieria Portfolio",
        desc="Solar EPC projects by Arrays Ingenieria: 300 MW SECI piling, 14.36 MW YIAPL, 10 MW DCM Hisar, Assam tea-estate solar plants and industrial rooftops."),
    "gallery.html": dict(path="/gallery.html", crumb="Gallery",
        title="Photo & Video Gallery | Arrays Ingenieria Solar Projects",
        desc="Photos and videos of Arrays Ingenieria solar power plants, inaugurations, awards, certifications and news coverage from Assam to Karnataka."),
    "recognition.html": dict(path="/recognition.html", crumb="Recognition",
        title="News, Media & Recognition | Arrays Ingenieria",
        desc="Arrays Ingenieria in the news: Assam tea-estate solar plants at Orangajuli & Barpatra, TV coverage, and honours from India's national leadership."),
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
SERVICE_PAGES = [p for p in PAGES if p.startswith("service-")]

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

# ------------------------------------------------------------- videos ----
VIDEOS = [
    dict(url="https://www.facebook.com/reel/1678209397245830/", net="Facebook · NE Reports",
         title="Janmashtami launch: 450 kW solar plant at Orangajuli Tea Estate, Udalguri, Assam",
         img="assets/photos/orangajuli-450kw-solar-inauguration-assam.jpg",
         alt="Ribbon-cutting at the Orangajuli Tea Estate solar plant built by Arrays Ingenieria (still from NE Reports video)"),
    dict(url="https://www.facebook.com/100089972142580/videos/1069048716104190/", net="Facebook · Sonari Live",
         title="Sonari Live video report on Arrays Ingenieria's tea-estate solar plants in Assam",
         img="assets/photos/proj-jayshree.jpg",
         alt="Tea-estate ground-mount solar plant in Sonari, Assam built by Arrays Ingenieria"),
    dict(url="https://www.facebook.com/61564147994036/videos/122210117936471599/", net="Facebook · News Axom",
         title="News Axom video report on veteran-led solar power for Assam's tea gardens",
         img="assets/photos/proj-manjushree.jpg",
         alt="Manjushree Tea Estate solar plant in Assam built by Arrays Ingenieria"),
]

PLAY_SVG = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>'
FB_SVG = ('<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 '
          '2.68.24 2.68.24v2.97h-1.5c-1.5 0-1.96.93-1.96 1.89v2.26h3.33l-.53 3.5h-2.8V24C19.62 23.1 24 18.1 24 12.07"/></svg>')
ARROW_SVG = ('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" '
             'stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>')

# ----------------------------------------------------- header / footer ----
NAV = [
    ("About", "about.html", "about"), ("Services", "/#services", "services"),
    ("Projects", "projects.html", "projects"), ("Gallery", "gallery.html", "gallery"),
    ("Recognition", "recognition.html", "recognition"), ("Achievements", "achievements.html", "achievements"),
    ("Insights", "insights.html", "insights"), ("Contact", "/#contact", "contact"),
]
WORDMARK = ('<span class="brand-word"><i style="color:#F4A11E">ING</i><i style="color:#2BA9E0">E</i><i style="color:#1C2A6E">N</i>'
            '<i style="color:#2BA9E0">I</i><i style="color:#1C2A6E">E</i><i style="color:#39A935">R</i><i style="color:#2BA9E0">I</i>'
            '<i style="color:#39A935">A</i></span>')


def render_header(page_key):
    active = ' class="active" aria-current="page"'
    links = "".join(
        f'<a href="{href}"{active if key == page_key else ""}>{label}</a>'
        for label, href, key in NAV)
    return f"""<header class="header scrolled solid" id="header">
    <div class="container nav">
      <a href="/" class="brand" aria-label="Arrays Ingenieria — home">
        <img src="assets/img/logo-mark.svg" alt="Arrays Ingenieria logo" class="brand-mark" />
        {WORDMARK}
      </a>
      <nav class="nav-links" id="navLinks" aria-label="Primary">{links}<a class="nav-quote" href="/#contact">Get a Free Quote</a></nav>
      <div class="nav-cta">
        <a href="projects.html" class="btn btn--outline">Our Work</a>
        <a href="/#contact" class="btn btn--primary">Get a Quote</a>
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
            <img src="assets/img/logo-mark.svg" alt="Arrays Ingenieria logo" class="brand-mark" />
            {WORDMARK}
          </div>
          <p>Developing Green Energy for the Nation. Arrays Ingenieria is a veteran-led, ISO-certified solar EPC company delivering ground-mount &amp; rooftop solar across India.</p>
          <a href="mailto:arraysingenieria@gmail.com" class="footer-email">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px;margin-right:8px;" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>arraysingenieria@gmail.com
          </a>
        </div>
        <div>
          <h2 class="footer__h">Explore</h2>
          <ul>
            <li><a href="about.html">About Us</a></li>
            <li><a href="industries.html">Industries</a></li>
            <li><a href="projects.html">Projects</a></li>
            <li><a href="gallery.html">Photo &amp; Video Gallery</a></li>
            <li><a href="recognition.html">News &amp; Recognition</a></li>
            <li><a href="achievements.html">Achievements</a></li>
            <li><a href="insights.html">Insights</a></li>
            <li><a href="/#faq">FAQ</a></li>
          </ul>
        </div>
        <div>
          <h2 class="footer__h">Services</h2>
          <ul>
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


def render_videos():
    cards = []
    for i, v in enumerate(VIDEOS):
        d = f' data-d="{i}"' if i else ""
        cards.append(f"""<a class="video-card reveal"{d} href="{v['url']}" target="_blank" rel="noopener">
        <div class="vc-thumb"><img src="{v['img']}" alt="{html.escape(v['alt'])}" /><span class="vc-play">{PLAY_SVG}</span><span class="vc-badge">{FB_SVG}</span></div>
        <div class="vc-body"><span class="vc-net">{v['net']}</span><b>{html.escape(v['title'])}</b><span class="vc-go">Watch on Facebook →</span></div>
      </a>""")
    return '<div class="video-grid">\n      ' + "\n      ".join(cards) + "\n    </div>"


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
<link rel="icon" type="image/svg+xml" href="assets/img/favicon.svg" />
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
    if fname in SERVICE_PAGES:
        items.append({"@type": "ListItem", "position": 2, "name": "Services", "item": SITE_URL + "/#services"})
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
    if "<!-- build:videos -->" in text:
        text = replace_block(text, "videos", render_videos())

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
    head = head.replace("/assets/img/logo.svg", "/assets/img/logo-mark.svg")
    if PAGES[fname]["path"] and '"BreadcrumbList"' not in head:
        head += '<script type="application/ld+json">\n' + json.dumps(breadcrumb_ld(fname), ensure_ascii=False, indent=2) + "\n</script>\n"
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
        for m in re.findall(r'<script type="application/ld\+json">(.*?)</script>', t, re.S):
            try:
                json.loads(m)
            except ValueError as err:
                problems.append(f"{fname}: invalid JSON-LD ({err})")
    return problems


def main():
    open(os.path.join(ROOT, "gallery.html"), "w", encoding="utf8").write(render_gallery_page())
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
