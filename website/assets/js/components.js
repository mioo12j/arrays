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
      // keyboard users land on the first menu link (the panel comes before the button in the page)
      if (open) requestAnimationFrame(() => { const f = links.querySelector("a"); if (f) f.focus({ preventScroll: true }); });
    });
    // Escape closes the open menu and returns focus to the menu button
    document.addEventListener("keydown", e => {
      if (e.key !== "Escape" || !links.classList.contains("open")) return;
      links.classList.remove("open");
      toggle.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.focus();
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

/* ---------- key numbers: shrink a number to fit its card (large accessibility text, narrow phones) ---------- */
(function () {
  const nums = document.querySelectorAll(".stat-card .num");
  if (!nums.length) return;
  function fit() {
    nums.forEach((n) => {
      n.style.fontSize = "";
      const box = n.parentElement;
      const room = box.clientWidth - 16;
      let size = parseFloat(getComputedStyle(n).fontSize);
      while (n.scrollWidth > room && size > 14) { size -= 1; n.style.fontSize = size + "px"; }
    });
  }
  window.addEventListener("load", fit);
  window.addEventListener("resize", fit);
  // the count-up animation changes the digits; refit once it has finished
  setTimeout(fit, 2500);
})();

/* ---------- One solar estimate model, shared by the home calculator and the quote funnel ----------
   Every assumption is named here and shown to the visitor:
   - 90% of the bill is treated as energy charges (fixed charges, duty and taxes are not reduced by solar);
   - the plant is sized to cover 90% of those units, so output is used on site and nothing is counted for export;
   - generation = kWp x peak sun-hours x 365 x 0.80 (wiring, inverter, heat and dust losses);
   - savings are capped at the energy units actually bought, so they can never exceed the bill;
   - lifetime: modules lose 0.7% output a year, O&M costs 1% of the plant cost a year, the tariff is held flat. */
window.SolarModel = {
  ENERGY_SHARE: 0.9, COVERAGE: 0.9, PR: 0.8, DEGRADATION: 0.007, OM_RATE: 0.01, MIN_KWP: 1, YEARS: 25,
  estimate(o) {
    const m = this;
    const tariff = o.tariff > 0 ? o.tariff : 8;
    const sun = o.sun > 0 ? o.sun : 4.3;
    const unitsMonth = (o.bill * m.ENERGY_SHARE) / tariff;            // energy units bought each month
    const unitsYear = unitsMonth * 12;
    const ideal = (unitsYear * m.COVERAGE) / (sun * 365 * m.PR);
    const size = Math.max(m.MIN_KWP, Math.round(ideal * 10) / 10);
    const gen1 = size * sun * 365 * m.PR;                             // first-year generation, kWh
    const used1 = Math.min(gen1, unitsYear);                          // only units you would otherwise buy count
    const save1 = used1 * tariff;
    const cost = size * (o.costPerKw || 52000);
    const netCost = Math.max(0, cost - (o.subsidy || 0));
    const om = cost * m.OM_RATE;
    const flows = [];
    let cum = -netCost, payback = null;
    for (let y = 1; y <= m.YEARS; y++) {
      const gen = gen1 * Math.pow(1 - m.DEGRADATION, y - 1);
      const save = Math.min(gen, unitsYear) * tariff - om;
      const before = cum;
      cum += save;
      if (payback === null && cum >= 0) payback = y - 1 + (save > 0 ? -before / save : 0);
      flows.push({ year: y, saving: save, cumulative: cum });
    }
    return { tariff, sun, unitsMonth, unitsYear, size, capped: size > ideal + 0.05, gen1, used1, save1,
             monthly: save1 / 12, cost, netCost, om, payback, flows, net25: cum,
             co2: (gen1 * 0.82) / 1000 };
  },
  assumptions: "Assumes 90% of your bill is energy charges, a plant sized to cover 90% of those units, 80% system " +
    "efficiency, 0.7% yearly module degradation, O&M at 1% of plant cost a year and a flat tariff. Only units you would " +
    "otherwise buy are counted; export, fixed charges, financing and taxes are not included.",
};

/* ---------- Phone numbers: a real number, not just punctuation (contact and quote forms) ----------
   Spaces, dashes, dots and brackets are ignored. Accepted: an Indian mobile or landline (10 digits, optionally with
   +91, 91 or 0 in front) or an international number written with + and 8 to 15 digits. */
window.phoneProblem = function (raw) {
  const v = (raw || "").trim();
  if (!v) return "Please enter your phone number.";
  if (!/\d/.test(v)) return "Enter your phone number using digits.";
  if (/[^0-9+\s().\-]/.test(v)) return "Use digits only (spaces, dashes and brackets are fine).";
  if ((v.match(/\+/g) || []).length > 1 || (v.includes("+") && v.trim()[0] !== "+")) return "Put + only at the start of the number.";
  const d = v.replace(/\D/g, "");
  if (v.trim()[0] === "+" && !d.startsWith("91")) return d.length >= 8 && d.length <= 15 ? "" : "Enter the full international number (8 to 15 digits).";
  const local = d.replace(/^(91|0)(?=\d{10}$)/, "");
  if (local.length !== 10) return "Enter a 10-digit phone number.";
  if (/^(\d)\1{9}$/.test(local)) return "That number does not look real.";
  return "";
};
(function () {
  document.querySelectorAll('input[type="tel"]').forEach((el) => {
    el.removeAttribute("pattern");
    let msg = el.parentElement.querySelector(".field-error");
    if (!msg) {
      msg = document.createElement("span");
      msg.className = "field-error";
      msg.id = el.id + "-error";
      msg.setAttribute("aria-live", "polite");
      el.insertAdjacentElement("afterend", msg);
      el.setAttribute("aria-describedby", msg.id);
    }
    const check = (show) => {
      const p = window.phoneProblem(el.value);
      el.setCustomValidity(p);
      if (show) { msg.textContent = p; el.setAttribute("aria-invalid", p ? "true" : "false"); }
      return !p;
    };
    el.addEventListener("input", () => check(msg.textContent !== ""));
    el.addEventListener("blur", () => { if (el.value.trim()) check(true); });
    el.addEventListener("invalid", () => check(true));
    check(false);
  });
})();

/* ---------- Looping inauguration videos: play only without reduced motion, always with a Pause / Play button ---------- */
(function () {
  const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)");
  document.querySelectorAll("video[data-autoplay]").forEach((v) => {
    const fig = v.closest("figure") || v.parentElement;
    fig.style.position = "relative";
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "video-toggle";
    const paint = () => {
      const playing = !v.paused;
      btn.setAttribute("aria-pressed", playing ? "false" : "true");
      btn.setAttribute("aria-label", (playing ? "Pause video: " : "Play video: ") + (v.getAttribute("aria-label") || ""));
      btn.innerHTML = playing
        ? '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 5h4v14H7zM13 5h4v14h-4z"/></svg>'
        : '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>';
    };
    btn.addEventListener("click", () => { if (v.paused) v.play(); else v.pause(); });
    v.addEventListener("play", paint);
    v.addEventListener("pause", paint);
    fig.appendChild(btn);
    paint();
    if (!(reduce && reduce.matches)) { const p = v.play(); if (p && p.catch) p.catch(() => paint()); }
    if (reduce && reduce.addEventListener) reduce.addEventListener("change", (e) => { if (e.matches) v.pause(); });
  });
})();
