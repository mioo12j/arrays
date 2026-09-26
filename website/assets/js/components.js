/* ===========================================================
   ARRAYS INGENIERIA — shared header & footer behaviour
   =========================================================== */
(function () {
  "use strict";

  // The header and footer markup is baked into every page by tools/build.py
  // (so crawlers see the navigation); this file only wires up behaviour.

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
