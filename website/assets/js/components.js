/* ===========================================================
   ARRAYS INGENIERIA — shared header & footer (injected)
   =========================================================== */
(function () {
  "use strict";

  const page = document.body.dataset.page || "home";

  const NAV = [
    { label: "Home", href: "index.html", key: "home" },
    { label: "About", href: "about.html", key: "about" },
    { label: "Services", href: "index.html#services", key: "services" },
    { label: "Projects", href: "projects.html", key: "projects" },
    { label: "Achievements", href: "achievements.html", key: "achievements" },
    { label: "Recognition", href: "recognition.html", key: "recognition" },
    { label: "Insights", href: "insights.html", key: "insights" },
    { label: "Contact", href: "index.html#contact", key: "contact" }
  ];

  const navLinks = NAV.map(
    n => `<a href="${n.href}" class="${n.key === page ? "active" : ""}">${n.label}</a>`
  ).join("");

  const header = `
  <header class="header" id="header">
    <div class="container nav">
      <a href="index.html" class="brand" aria-label="Ingenieria — home">
        <img src="assets/img/logo-mark.svg" alt="Ingenieria logo" class="brand-mark" />
        <span class="brand-word"><i style="color:#F4A11E">ING</i><i style="color:#2BA9E0">E</i><i style="color:#1C2A6E">N</i><i style="color:#2BA9E0">I</i><i style="color:#1C2A6E">E</i><i style="color:#39A935">R</i><i style="color:#2BA9E0">I</i><i style="color:#39A935">A</i></span>
      </a>
      <nav class="nav-links" id="navLinks" aria-label="Primary">${navLinks}<a class="nav-quote" href="index.html#contact">Get a Free Quote</a></nav>
      <div class="nav-cta">
        <a href="projects.html" class="btn btn--outline">Our Work</a>
        <a href="index.html#contact" class="btn btn--primary">Get a Quote</a>
        <button class="menu-toggle" id="menuToggle" aria-label="Toggle menu" aria-expanded="false">
          <span></span><span></span><span></span>
        </button>
      </div>
    </div>
  </header>`;

  const footer = `
  <footer class="footer">
    <div class="container">
      <div class="footer__top">
        <div class="footer__brand">
          <div class="logo">
            <img src="assets/img/logo-mark.svg" alt="Ingenieria logo" class="brand-mark" />
            <span class="brand-word"><i style="color:#F4A11E">ING</i><i style="color:#2BA9E0">E</i><i style="color:#1C2A6E">N</i><i style="color:#2BA9E0">I</i><i style="color:#1C2A6E">E</i><i style="color:#39A935">R</i><i style="color:#2BA9E0">I</i><i style="color:#39A935">A</i></span>
          </div>
          <p>Developing Green Energy for the Nation. A veteran-led, ISO-certified solar EPC company delivering ground-mount &amp; rooftop solar across India.</p>
          <a href="mailto:arraysingenieria@gmail.com" class="footer-email">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px;margin-right:8px;"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>arraysingenieria@gmail.com
          </a>
        </div>
        <div>
          <h5>Explore</h5>
          <ul>
            <li><a href="about.html">About Us</a></li>
            <li><a href="industries.html">Industries</a></li>
            <li><a href="projects.html">Projects</a></li>
            <li><a href="achievements.html">Achievements</a></li>
            <li><a href="recognition.html">Recognition</a></li>
            <li><a href="insights.html">Insights</a></li>
            <li><a href="index.html#faq">FAQ</a></li>
          </ul>
        </div>
        <div>
          <h5>Services</h5>
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
          <h5>Registrations</h5>
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
        <span>© <span id="year">2026</span> Arrays Ingenieria Pvt. Ltd. All rights reserved.</span>
        <span class="footer-legal"><a href="privacy.html">Privacy Policy</a><a href="terms.html">Terms of Use</a><a href="insights.html">Insights</a></span>
        <span class="made">Developing Green Energy for the Nation 🌱</span>
      </div>
    </div>
  </footer>

  <button class="to-top" id="toTop" aria-label="Back to top">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
  </button>`;

  const h = document.getElementById("site-header");
  const f = document.getElementById("site-footer");
  if (h) h.outerHTML = header;
  if (f) f.outerHTML = footer;

  /* ---------- header behaviour ---------- */
  const headerEl = document.getElementById("header");
  const toTop = document.getElementById("toTop");
  const onScroll = () => {
    // header is always solid/frosted so the colour logo stays legible everywhere
    if (headerEl) headerEl.classList.add("scrolled");
    if (toTop) toTop.classList.toggle("show", window.scrollY > 600);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  if (headerEl) headerEl.classList.add("scrolled", "solid");
  onScroll();

  if (toTop) toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  /* ---------- mobile menu ---------- */
  const toggle = document.getElementById("menuToggle");
  const links = document.getElementById("navLinks");
  if (toggle && links) {
    toggle.addEventListener("click", () => {
      const open = links.classList.toggle("open");
      toggle.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", String(open));
    });
    links.querySelectorAll("a").forEach(a =>
      a.addEventListener("click", () => {
        links.classList.remove("open");
        toggle.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      })
    );
  }

  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
