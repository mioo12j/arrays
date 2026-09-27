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

  /* ---------- dropdown menus (hover on desktop; tap the arrow on touch and mobile) ---------- */
  const items = Array.from(document.querySelectorAll(".nav-item.has-sub"));
  const closeAll = except => items.forEach(it => {
    if (it === except) return;
    it.classList.remove("open");
    const b = it.querySelector(".sub-toggle");
    if (b) b.setAttribute("aria-expanded", "false");
  });
  items.forEach(it => {
    const btn = it.querySelector(".sub-toggle");
    if (!btn) return;
    btn.addEventListener("click", e => {
      e.stopPropagation();
      const open = !it.classList.contains("open");
      closeAll(it);
      it.classList.toggle("open", open);
      btn.setAttribute("aria-expanded", String(open));
    });
  });
  document.addEventListener("click", e => { if (!e.target.closest(".nav-item")) closeAll(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeAll(); });

  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
