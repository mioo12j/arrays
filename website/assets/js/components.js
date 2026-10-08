/* ===========================================================
   ARRAYS INGENIERIA, shared header & footer behaviour
   =========================================================== */
(function () {
  "use strict";

  // The header and footer markup is baked into every page by tools/build.py
  // (so crawlers see the navigation); this file only wires up behaviour.

  /* ---------- header behaviour ---------- */
  const headerEl = document.getElementById("header");
  const toTop = document.getElementById("toTop");
  const dock = document.querySelector(".contact-dock");
  const onScroll = () => {
    // header is always solid/frosted so the colour logo stays legible everywhere
    if (headerEl) headerEl.classList.add("scrolled");
    if (toTop) toTop.classList.toggle("show", window.scrollY > 600);
    if (dock) dock.classList.toggle("show", window.scrollY > 400);
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

/* ---------- social posts: the platforms' official embeds ----------
   Each post is first shown as a post-style card (so the page is never empty). As the visitor scrolls
   near it, the platform's script loads once and the card is replaced by the original post from
   X, Facebook or Instagram. If the platform is blocked or offline, the card simply stays. */
(function () {
  const SRC = {
    x: "https://platform.twitter.com/widgets.js",
    facebook: "https://connect.facebook.net/en_US/sdk.js",
    instagram: "https://www.instagram.com/embed.js",
  };
  const loading = {};
  function load(p) {
    if (loading[p]) return loading[p];
    loading[p] = new Promise((resolve, reject) => {
      if (p === "facebook") {
        if (!document.getElementById("fb-root")) { const r = document.createElement("div"); r.id = "fb-root"; document.body.prepend(r); }
        window.fbAsyncInit = () => { window.FB.init({ xfbml: false, version: "v19.0" }); resolve(); };
      }
      const s = document.createElement("script");
      s.src = SRC[p]; s.async = true; s.crossOrigin = "anonymous";
      if (p !== "facebook") s.onload = () => resolve();
      s.onerror = reject;
      document.body.appendChild(s);
    });
    return loading[p];
  }
  function render(p, wrap) {
    if (p === "x" && window.twttr && window.twttr.widgets) window.twttr.widgets.load(wrap);
    if (p === "facebook" && window.FB) window.FB.XFBML.parse(wrap);
    if (p === "instagram" && window.instgrm) window.instgrm.Embeds.process();
  }
  function show(wrap) {
    const p = wrap.dataset.platform;
    if (!SRC[p] || wrap.dataset.embedded) return;
    wrap.dataset.embedded = "1";
    wrap.querySelectorAll("[data-embed-class]").forEach((el) => el.classList.add(el.dataset.embedClass));
    load(p).then(() => render(p, wrap)).catch(() => {});
  }
  const posts = document.querySelectorAll(".se[data-platform]");
  if (!posts.length) return;
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { io.unobserve(en.target); show(en.target); } });
    }, { rootMargin: "600px 0px" });
    posts.forEach((el) => io.observe(el));
  } else {
    posts.forEach(show);
  }
})();

/* ---------- YouTube facade: the player loads only when the visitor presses play ---------- */
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".yt-facade");
  if (!btn) return;
  const id = btn.dataset.yt;
  if (!/^[\w-]{11}$/.test(id)) return;
  const frame = document.createElement("iframe");
  frame.src = "https://www.youtube-nocookie.com/embed/" + id + "?autoplay=1&rel=0";
  frame.title = btn.getAttribute("aria-label") || "YouTube video";
  frame.allow = "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share";
  frame.allowFullscreen = true;
  frame.referrerPolicy = "strict-origin-when-cross-origin";
  frame.className = "yt-frame";
  btn.replaceWith(frame);
  frame.focus();
});
