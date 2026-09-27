/* ===========================================================
   ARRAYS INGENIERIA, page interactions
   =========================================================== */
(function () {
  "use strict";
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Auto-stagger: sibling reveals without data-d cascade in ---------- */
  const staggerGroups = new Map();
  $$(".reveal:not([data-d])").forEach(el => {
    const list = staggerGroups.get(el.parentElement) || [];
    list.push(el);
    staggerGroups.set(el.parentElement, list);
  });
  staggerGroups.forEach(list => {
    if (list.length > 1) list.forEach((el, i) => { el.style.transitionDelay = Math.min(i, 6) * 80 + "ms"; });
  });

  /* ---------- Page titles rise in word by word ---------- */
  if (!reduceMotion) {
    $$(".page-hero h1").forEach(h1 => {
      let i = 0;
      const wrap = node => {
        const outer = document.createElement("span");
        outer.className = "rise-w";
        const inner = document.createElement("span");
        inner.style.setProperty("--i", i++);
        inner.appendChild(node);
        outer.appendChild(inner);
        return outer;
      };
      Array.from(h1.childNodes).forEach(node => {
        if (node.nodeType === 3) {
          const frag = document.createDocumentFragment();
          node.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            frag.appendChild(/^\s+$/.test(part) ? document.createTextNode(part) : wrap(document.createTextNode(part)));
          });
          h1.replaceChild(frag, node);
        } else if (node.nodeType === 1 && node.tagName !== "BR") {
          // a styled phrase (e.g. the gold gradient) rises as one unit so its gradient stays intact
          h1.replaceChild(wrap(node.cloneNode(true)), node);
        }
      });
    });
  }

  /* ---------- Scroll progress, hero parallax, timeline fill ---------- */
  const progress = document.createElement("div");
  progress.className = "scroll-progress";
  progress.setAttribute("aria-hidden", "true");
  document.body.appendChild(progress);
  const heroBg = $(".page-hero__bg");
  const timelines = $$("[data-timeline]");
  let ticking = false;
  const onScrollFx = () => {
    ticking = false;
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.setProperty("--sp", max > 0 ? (scrollY / max).toFixed(4) : 0);
    if (heroBg && !reduceMotion && scrollY < innerHeight) heroBg.style.setProperty("--py", (scrollY * 0.25).toFixed(1) + "px");
    timelines.forEach(tl => {
      const r = tl.getBoundingClientRect();
      const p = Math.min(Math.max((innerHeight * 0.7 - r.top) / r.height, 0), 1);
      tl.style.setProperty("--tl", reduceMotion ? 1 : p.toFixed(3));
    });
  };
  window.addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(onScrollFx); } }, { passive: true });
  window.addEventListener("resize", onScrollFx);
  onScrollFx();

  /* ---------- Leaders' quote slider ---------- */
  $$(".lq-slider").forEach(sl => {
    const slides = $$(".lq-slide", sl);
    const dotsWrap = $(".lq-dots", sl);
    if (!slides.length) return;
    let idx = 0, timer;
    const dots = slides.map((s, i) => {
      const d = document.createElement("button");
      d.setAttribute("aria-label", "Show quote " + (i + 1));
      d.addEventListener("click", () => go(i, true));
      dotsWrap.appendChild(d);
      return d;
    });
    const go = (n, manual) => {
      slides[idx].classList.remove("active"); dots[idx].classList.remove("active");
      idx = (n + slides.length) % slides.length;
      slides[idx].classList.add("active"); dots[idx].classList.add("active");
      if (manual) restart();
    };
    const start = () => { if (!reduceMotion) timer = setInterval(() => go(idx + 1), parseInt(sl.dataset.interval || "7000", 10)); };
    const restart = () => { clearInterval(timer); start(); };
    $(".lq-prev", sl).addEventListener("click", () => go(idx - 1, true));
    $(".lq-next", sl).addEventListener("click", () => go(idx + 1, true));
    sl.addEventListener("mouseenter", () => clearInterval(timer));
    sl.addEventListener("mouseleave", restart);
    slides[0].classList.add("active"); dots[0].classList.add("active");
    start();
  });

  /* ---------- Scroll reveal ---------- */
  const reveals = $$(".reveal");
  if ("IntersectionObserver" in window && reveals.length) {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const el = e.target;
          el.classList.add("in");
          obs.unobserve(el);
          // once the entrance has played, drop its delay so hover effects respond instantly
          setTimeout(() => { el.style.transitionDelay = "0s"; }, 1400);
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach(el => io.observe(el));
  } else {
    reveals.forEach(el => el.classList.add("in"));
  }

  /* ---------- Counters ---------- */
  const counters = $$("[data-count]");
  const animateCount = el => {
    const target = parseFloat(el.dataset.count);
    const decimals = (el.dataset.count.split(".")[1] || "").length;
    const suffix = el.dataset.suffix || "";
    const dur = 1600, start = performance.now();
    const step = now => {
      const p = Math.min((now - start) / dur, 1);
      const val = (target * (1 - Math.pow(1 - p, 3))).toFixed(decimals);
      el.textContent = val + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if ("IntersectionObserver" in window && counters.length) {
    const cio = new IntersectionObserver((entries, obs) => {
      entries.forEach(e => { if (e.isIntersecting) { animateCount(e.target); obs.unobserve(e.target); } });
    }, { threshold: 0.5 });
    counters.forEach(c => cio.observe(c));
  }

  /* ---------- Animated bar charts ---------- */
  const bars = $$(".bar-fill");
  if ("IntersectionObserver" in window && bars.length) {
    const bio = new IntersectionObserver((entries, obs) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.style.width = (e.target.dataset.pct || "0") + "%"; obs.unobserve(e.target); }
      });
    }, { threshold: 0.4 });
    bars.forEach(b => bio.observe(b));
  } else {
    bars.forEach(b => (b.style.width = (b.dataset.pct || "0") + "%"));
  }

  /* ---------- Project / gallery filtering ---------- */
  $$("[data-filters]").forEach(group => {
    const targetSel = group.dataset.filters;
    const items = $$(targetSel);
    group.querySelectorAll(".filter").forEach(btn =>
      btn.addEventListener("click", () => {
        group.querySelectorAll(".filter").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        const f = btn.dataset.filter;
        items.forEach(it => it.classList.toggle("hide", !(f === "all" || (it.dataset.cat || "").split(" ").includes(f))));
      })
    );
  });

  /* ---------- Slideshows (auto-rotating) ---------- */
  $$(".slideshow").forEach(sw => {
    const slides = $$(".slide", sw);
    if (!slides.length) return;
    let idx = 0;
    const interval = parseInt(sw.dataset.interval || "2000", 10);
    const dotsWrap = $(".slide-dots", sw);
    let dots = [];
    if (dotsWrap) {
      dots = slides.map((_, i) => {
        const d = document.createElement("button");
        d.className = "slide-dot" + (i === 0 ? " active" : "");
        d.setAttribute("aria-label", "Go to slide " + (i + 1));
        d.addEventListener("click", () => go(i, true));
        dotsWrap.appendChild(d);
        return d;
      });
    }
    let timer;
    const go = (n, manual) => {
      slides[idx].classList.remove("active");
      if (dots[idx]) dots[idx].classList.remove("active");
      idx = (n + slides.length) % slides.length;
      slides[idx].classList.add("active");
      if (dots[idx]) dots[idx].classList.add("active");
      if (manual) restart();
    };
    const next = () => go(idx + 1);
    const start = () => { timer = setInterval(next, interval); };
    const stop = () => clearInterval(timer);
    const restart = () => { stop(); start(); };
    $(".slide-prev", sw)?.addEventListener("click", () => go(idx - 1, true));
    $(".slide-next", sw)?.addEventListener("click", () => go(idx + 1, true));
    sw.addEventListener("mouseenter", stop);
    sw.addEventListener("mouseleave", start);
    slides[0].classList.add("active");
    start();
  });

  /* ---------- Lightbox ---------- */
  const triggers = $$("[data-full]");
  if (triggers.length) {
    const lb = document.createElement("div");
    lb.className = "lightbox";
    lb.innerHTML = `
      <button class="lb-close" aria-label="Close">&times;</button>
      <button class="lb-nav lb-prev" aria-label="Previous">&#8249;</button>
      <figure class="lb-stage"><img alt="" /><figcaption></figcaption></figure>
      <button class="lb-nav lb-next" aria-label="Next">&#8250;</button>`;
    document.body.appendChild(lb);
    const img = $("img", lb), cap = $("figcaption", lb);
    let group = [], pos = 0;
    const render = () => {
      const t = group[pos];
      img.src = t.dataset.full;
      const thumb = t.tagName === "IMG" ? t : $("img", t);
      img.alt = (thumb && thumb.alt) || "";
      cap.textContent = t.dataset.caption || img.alt;
    };
    const open = t => {
      const g = t.dataset.gallery;
      // only step through items the current filter is showing
      group = g ? triggers.filter(x => x.dataset.gallery === g && x.offsetParent !== null) : [t];
      pos = group.indexOf(t);
      render();
      lb.classList.add("open");
      document.body.style.overflow = "hidden";
    };
    const close = () => { lb.classList.remove("open"); document.body.style.overflow = ""; };
    const move = d => { pos = (pos + d + group.length) % group.length; render(); };
    triggers.forEach(t => {
      t.style.cursor = "zoom-in";
      t.addEventListener("click", e => {
        if (e.target.closest("a") && e.target.closest("a") !== t) return; // a link inside the card navigates
        if (t.tagName !== "A") e.preventDefault();
        open(t);
      });
      // keyboard access for non-link triggers (clippings marked role="button")
      if (t.getAttribute("role") === "button") t.addEventListener("keydown", e => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(t); }
      });
    });
    $(".lb-close", lb).addEventListener("click", close);
    $(".lb-prev", lb).addEventListener("click", () => move(-1));
    $(".lb-next", lb).addEventListener("click", () => move(1));
    lb.addEventListener("click", e => { if (e.target === lb) close(); });
    document.addEventListener("keydown", e => {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") move(-1);
      if (e.key === "ArrowRight") move(1);
    });
  }

  /* ---------- India presence map ---------- */
  const mapHost = $("#indiaMap");
  if (mapHost && window.INDIA_MAP) {
    const data = window.INDIA_MAP;
    const presence = new Set(["hr","dl","rj","ut","up","br","jh","wb","or","as","ka"]);
    const offices = [
      { x: 193, y: 215, type: "hq",     title: "Corporate Office", place: "Greater Noida, UP", side: "left" },
      { x: 373, y: 261, type: "branch", title: "Branch Office",    place: "Madhubani, Bihar",  side: "right" }
    ];
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", data.viewBox);
    svg.setAttribute("class", "india-svg");
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", "Map of Arrays Ingenieria's presence across India");

    data.states.forEach(s => {
      const p = document.createElementNS(ns, "path");
      p.setAttribute("d", s.d);
      p.setAttribute("class", "st" + (presence.has(s.id) ? " on" : ""));
      const title = document.createElementNS(ns, "title");
      title.textContent = s.name;
      p.appendChild(title);
      svg.appendChild(p);
    });

    // office connectors + 3D pins
    offices.forEach(o => {
      const baseY = o.y, topY = o.y - 46;
      const line = document.createElementNS(ns, "line");
      line.setAttribute("x1", o.x); line.setAttribute("y1", baseY);
      line.setAttribute("x2", o.x); line.setAttribute("y2", topY);
      line.setAttribute("class", "office-line");
      svg.appendChild(line);

      const ring = document.createElementNS(ns, "circle");
      ring.setAttribute("cx", o.x); ring.setAttribute("cy", baseY);
      ring.setAttribute("r", 6); ring.setAttribute("class", "office-ring office-ring--" + o.type);
      svg.appendChild(ring);
      const dot = document.createElementNS(ns, "circle");
      dot.setAttribute("cx", o.x); dot.setAttribute("cy", baseY);
      dot.setAttribute("r", 3.2); dot.setAttribute("class", "office-dot");
      svg.appendChild(dot);
    });
    mapHost.appendChild(svg);

    // HTML floating labels (for crisp text + 3D look)
    const vb = data.viewBox.split(" ").map(Number);
    offices.forEach(o => {
      const tag = document.createElement("div");
      tag.className = "office-tag office-tag--" + o.type + " " + o.side;
      tag.innerHTML = `<span class="ot-badge">${o.type === "hq" ? "Corporate" : "Branch"}</span>
        <b>${o.title}</b><span class="ot-place">${o.place}</span>`;
      tag.style.left = ((o.x / vb[2]) * 100) + "%";
      tag.style.top = (((o.y - 50) / vb[3]) * 100) + "%";
      mapHost.appendChild(tag);
    });
  }

  /* ---------- Contact form (Formspree → email, mailto fallback) ---------- */
  const form = $("#contactForm");
  if (form) {
    const status = $("#formStatus");
    const COMPANY_EMAIL = "arraysingenieria@gmail.com";
    form.addEventListener("submit", async e => {
      e.preventDefault();
      const hp = form.querySelector('[name="_honey"], [name="_gotcha"]');
      if (hp && hp.value) return; // honeypot
      const name = $("#name").value.trim();
      const phone = $("#phone").value.trim();
      const email = $("#email").value.trim();
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!name || !phone || !emailOk) {
        status.className = "form-status err";
        status.textContent = "Please enter your name, a valid email and phone number.";
        return;
      }
      const type = $("#type").value, loc = $("#location").value.trim(), msg = $("#message").value.trim();
      const endpoint = form.dataset.endpoint || "";
      const btn = form.querySelector('button[type="submit"]');

      // If an email endpoint is configured, submit server-side (real email, no client needed)
      if (/^https:\/\/(formspree\.io|formsubmit\.co)\//.test(endpoint)) {
        try {
          btn.disabled = true;
          status.className = "form-status ok";
          status.textContent = "Sending your enquiry…";
          const res = await fetch(endpoint, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } });
          if (res.ok) {
            status.textContent = "Thank you, " + name + "! Your enquiry has been sent. We'll be in touch shortly.";
            form.reset();
          } else {
            throw new Error("send failed");
          }
        } catch (err) {
          status.className = "form-status err";
          status.textContent = "Couldn't send right now. Please email us at " + COMPANY_EMAIL + ".";
        } finally {
          btn.disabled = false;
        }
        return;
      }

      // Fallback: open the visitor's email client pre-addressed to the company
      const subject = encodeURIComponent("Solar Enquiry from " + name);
      const body = encodeURIComponent(`Name: ${name}\nPhone: ${phone}\nEmail: ${email}\nProject Type: ${type || "-"}\nLocation: ${loc || "-"}\n\nMessage:\n${msg || "-"}`);
      status.className = "form-status ok";
      status.textContent = "Thank you, " + name + "! Opening your email app to send the enquiry…";
      window.location.href = `mailto:${COMPANY_EMAIL}?subject=${subject}&body=${body}`;
      form.reset();
    });
  }
})();
