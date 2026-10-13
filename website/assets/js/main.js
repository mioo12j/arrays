/* A form service can answer HTTP 200 and still refuse the message (FormSubmit sends {"success":"false"}, for example
   before the inbox has been activated). Only an explicit success in the JSON body counts as sent. */
async function formAccepted(res) {
  let data = null;
  try { data = await res.json(); } catch (e) { data = null; }
  const ok = res.ok && data && (data.success === true || data.success === "true" || data.ok === true);
  return { ok: !!ok, message: data && typeof data.message === "string" ? data.message : "" };
}

/* ===========================================================
   ARRAYS INGENIERIA, page interactions
   =========================================================== */
(function () {
  "use strict";
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Automatic rotation with a persistent Pause / Play button: hover or keyboard focus pauses it for a moment,
     the button stops it for good, and with reduced motion it never starts by itself. */
  function autoRotate(box, step, interval) {
    let timer = null, userPaused = reduceMotion, hold = false;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "rotate-toggle";
    const paint = () => {
      btn.setAttribute("aria-pressed", userPaused ? "true" : "false");
      btn.setAttribute("aria-label", userPaused ? "Play the automatic slideshow" : "Pause the automatic slideshow");
      btn.innerHTML = userPaused
        ? '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>'
        : '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 5h4v14H7zM13 5h4v14h-4z"/></svg>';
    };
    const stop = () => { clearInterval(timer); timer = null; };
    const start = () => { stop(); if (!userPaused && !hold) timer = setInterval(step, interval); };
    btn.addEventListener("click", () => { userPaused = !userPaused; paint(); start(); });
    box.addEventListener("mouseenter", () => { hold = true; stop(); });
    box.addEventListener("mouseleave", () => { hold = false; start(); });
    box.addEventListener("focusin", () => { hold = true; stop(); });
    box.addEventListener("focusout", (e) => { if (!box.contains(e.relatedTarget)) { hold = false; start(); } });
    box.appendChild(btn);
    paint();
    start();
    return { restart: start };
  }

  /* ---------- Scrolling strips: press and hold to stop them, or pause them for good with the button ---------- */
  // press and hold stops a scrolling strip under the finger; it moves on when released (no buttons, by request)
  $$(".marquee, .testi-marquee").forEach(m => {
    m.addEventListener("pointerdown", () => m.classList.add("is-held"));
    ["pointerup", "pointercancel", "pointerleave"].forEach(ev => m.addEventListener(ev, () => m.classList.remove("is-held")));
  });

  /* ---------- Auto-stagger: sibling reveals without data-d cascade in ---------- */
  const staggerGroups = new Map();
  $$(".reveal:not([data-d])").forEach(el => {
    const list = staggerGroups.get(el.parentElement) || [];
    list.push(el);
    staggerGroups.set(el.parentElement, list);
  });
  staggerGroups.forEach(list => {
    // a short cascade only: no item waits more than 0.15s (no artificial delays)
    if (list.length > 1) list.forEach((el, i) => { el.style.transitionDelay = Math.min(i, 5) * 30 + "ms"; });
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
    let idx = 0;
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
    let rot = null;
    const restart = () => rot && rot.restart();
    $(".lq-prev", sl).addEventListener("click", () => go(idx - 1, true));
    $(".lq-next", sl).addEventListener("click", () => go(idx + 1, true));
    slides[0].classList.add("active"); dots[0].classList.add("active");
    rot = autoRotate(sl, () => go(idx + 1), parseInt(sl.dataset.interval || "7000", 10));
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
    if (reduceMotion) { el.textContent = target.toFixed(decimals) + suffix; return; }
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
    // the selected filter and the number of results are announced, not only shown
    group.setAttribute("role", "group");
    if (!group.getAttribute("aria-label")) group.setAttribute("aria-label", "Filter by category");
    const live = document.createElement("p");
    live.className = "sr-only";
    live.setAttribute("aria-live", "polite");
    group.insertAdjacentElement("afterend", live);
    const btns = [...group.querySelectorAll(".filter")];
    btns.forEach(b => b.setAttribute("aria-pressed", b.classList.contains("active") ? "true" : "false"));
    btns.forEach(btn =>
      btn.addEventListener("click", () => {
        btns.forEach(b => { b.classList.remove("active"); b.setAttribute("aria-pressed", "false"); });
        btn.classList.add("active");
        btn.setAttribute("aria-pressed", "true");
        const f = btn.dataset.filter;
        let shown = 0;
        items.forEach(it => {
          const on = f === "all" || (it.dataset.cat || "").split(" ").includes(f);
          it.classList.toggle("hide", !on);
          if (on) shown++;
        });
        live.textContent = btn.textContent.trim() + ": " + shown + (shown === 1 ? " result" : " results");
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
    let rot = null;
    const go = (n, manual) => {
      slides[idx].classList.remove("active");
      if (dots[idx]) dots[idx].classList.remove("active");
      idx = (n + slides.length) % slides.length;
      slides[idx].classList.add("active");
      if (dots[idx]) dots[idx].classList.add("active");
      if (manual && rot) rot.restart();
    };
    $(".slide-prev", sw)?.addEventListener("click", () => go(idx - 1, true));
    $(".slide-next", sw)?.addEventListener("click", () => go(idx + 1, true));
    slides[0].classList.add("active");
    rot = autoRotate(sw, () => go(idx + 1), interval);
    // swipe: the photo tracks the finger, a flick decides next/previous by its direction and speed
    const S = window.Spring;
    if (S && slides.length > 1) {
      let down = null, axis = null, samples = [], dx = 0, spring = null, dragged = false;
      const setDx = (el, v) => el.style.setProperty("--dx", v.toFixed(1) + "px");
      sw.addEventListener("pointerdown", e => {
        if (e.button !== 0 || e.target.closest("button, a")) return;
        if (spring) { spring.stop(); spring = null; }
        down = { x: e.clientX, y: e.clientY, id: e.pointerId, base: dx }; axis = null; dragged = false;
        samples = [{ t: performance.now(), x: e.clientX }];
      });
      sw.addEventListener("pointermove", e => {
        if (!down || e.pointerId !== down.id) return;
        const mx = e.clientX - down.x, my = e.clientY - down.y;
        if (!axis) {
          if (Math.hypot(mx, my) < 10) return;
          axis = Math.abs(mx) > Math.abs(my) ? "x" : "y";
          if (axis === "y") { down = null; return; } // a vertical move is the page scrolling
          sw.setPointerCapture(e.pointerId); sw.classList.add("is-dragging"); dragged = true;
        }
        samples.push({ t: performance.now(), x: e.clientX }); if (samples.length > 8) samples.shift();
        dx = down.base + mx; setDx(slides[idx], dx);
      });
      const end = e => {
        if (!down || e.pointerId !== down.id) return;
        down = null; sw.classList.remove("is-dragging");
        if (axis !== "x") return;
        samples.push({ t: performance.now(), x: e.clientX });
        const v = S.velocity(samples, "x"), W = sw.clientWidth;
        const landing = dx + S.project(v);
        const out = slides[idx];
        const dir = landing < -W * 0.25 ? 1 : landing > W * 0.25 ? -1 : 0;
        if (dir) go(idx + dir, true);
        const from = dx; dx = 0;
        if (reduceMotion) { setDx(out, 0); return; }
        // the outgoing photo keeps the finger's velocity as it leaves (or springs home if not committed)
        spring = S.to({ from, to: dir ? -dir * W * 0.5 : 0, velocity: v, damping: dir ? 1 : 0.85, response: 0.35,
          onUpdate: x => setDx(out, x), onRest: () => { setDx(out, 0); spring = null; } });
      };
      sw.addEventListener("pointerup", end);
      sw.addEventListener("pointercancel", end);
      sw.addEventListener("click", e => { if (dragged) { e.preventDefault(); e.stopImmediatePropagation(); dragged = false; } }, true);
    }
  });

  /* ---------- Lightbox (accessible photo viewer) ---------- */
  const triggers = $$("[data-full]");
  if (triggers.length) {
    const lb = document.createElement("div");
    lb.className = "lightbox";
    lb.setAttribute("role", "dialog");
    lb.setAttribute("aria-modal", "true");
    lb.setAttribute("aria-label", "Photo viewer");
    lb.setAttribute("aria-describedby", "lbCaption");
    lb.innerHTML = `
      <button type="button" class="lb-close" aria-label="Close photo viewer">&times;</button>
      <button type="button" class="lb-nav lb-prev" aria-label="Previous photo">&#8249;</button>
      <figure class="lb-stage"><img alt="" /><figcaption id="lbCaption" aria-live="polite"></figcaption></figure>
      <button type="button" class="lb-nav lb-next" aria-label="Next photo">&#8250;</button>`;
    lb.inert = true; // closed: nothing inside can be focused
    document.body.appendChild(lb);
    const img = $("img", lb), cap = $("figcaption", lb);
    const buttons = () => $$("button", lb).filter(b => !b.hidden);
    let group = [], pos = 0, opener = null;
    const render = () => {
      const t = group[pos];
      img.src = t.dataset.full;
      const thumb = t.tagName === "IMG" ? t : $("img", t);
      img.alt = (thumb && thumb.alt) || "";
      cap.textContent = t.dataset.caption || img.alt;
      const many = group.length > 1;
      $(".lb-prev", lb).hidden = !many;
      $(".lb-next", lb).hidden = !many;
    };
    const stage = $(".lb-stage", lb);
    const S = window.Spring;
    const physics = !!S && !reduceMotion;
    let sx = 0, sy = 0, anims = [];
    const stopAll = () => { anims.forEach(a => a.stop()); anims = []; };
    const paint = () => {
      stage.style.transform = (sx || sy) ? `translate3d(${sx}px, ${sy}px, 0)` : "";
      lb.style.backgroundColor = sy ? `rgba(4,20,14,${(0.94 * Math.max(0.15, 1 - Math.abs(sy) / (innerHeight * 0.6))).toFixed(3)})` : "";
    };
    // the photo grows out of the thumbnail that was tapped, and shrinks back into it (same path in and out)
    const thumbOf = t => (t && (t.tagName === "IMG" ? t : $("img", t))) || null;
    const flip = (thumb, opening, after) => {
      img.style.opacity = "";
      const r = thumb && thumb.getBoundingClientRect();
      const ir = img.getBoundingClientRect();
      if (!physics || !r || !r.width || !ir.width || r.bottom < 0 || r.top > innerHeight) { lb.style.backgroundColor = ""; after && after(); return; }
      const dx = (r.left + r.width / 2) - (ir.left + ir.width / 2), dy = (r.top + r.height / 2) - (ir.top + ir.height / 2);
      const sc = Math.max(0.05, r.width / ir.width);
      const set = p => {
        img.style.transform = `translate3d(${dx * (1 - p)}px, ${dy * (1 - p)}px, 0) scale(${sc + (1 - sc) * p})`;
        lb.style.backgroundColor = `rgba(4,20,14,${(0.94 * p).toFixed(3)})`;
        cap.style.opacity = String(Math.max(0, p * 2 - 1));
      };
      stopAll();
      const from = opening ? 0 : 1, to = opening ? 1 : 0;
      set(from);
      anims.push(S.to({ from, to, damping: 1, response: 0.35, onUpdate: set,
        onRest: () => { img.style.transform = ""; cap.style.opacity = ""; lb.style.backgroundColor = ""; after && after(); } }));
    };
    const open = t => {
      const g = t.dataset.gallery;
      // only step through items the current filter is showing
      group = g ? triggers.filter(x => x.dataset.gallery === g && x.offsetParent !== null) : [t];
      if (!group.includes(t)) group = [t];
      pos = group.indexOf(t);
      opener = t;
      render();
      stopAll(); sx = sy = 0; paint();
      lb.inert = false;
      lb.classList.add("open");
      if (physics) { lb.classList.add("lb-physics"); lb.style.backgroundColor = "rgba(4,20,14,0)"; img.style.opacity = "0"; }
      document.body.style.overflow = "hidden";
      $(".lb-close", lb).focus();
      const go = () => flip(thumbOf(t), true);
      if (img.complete && img.naturalWidth) go(); else img.addEventListener("load", go, { once: true });
    };
    const finish = () => {
      lb.classList.remove("open", "lb-physics");
      lb.inert = true;
      stopAll(); sx = sy = 0; paint();
      img.style.transform = ""; cap.style.opacity = ""; lb.style.backgroundColor = "";
      document.body.style.overflow = "";
      const back = opener && (opener.matches("[tabindex], a, button") ? opener : opener.querySelector("[tabindex]"));
      if (back && document.contains(back)) back.focus(); // back to the photo the visitor opened
    };
    const close = () => {
      // shrink back into the thumbnail of the photo now showing, if it is on screen
      if (physics && !sx && !sy) flip(thumbOf(group[pos]), false, finish); else finish();
    };
    const move = d => { pos = (pos + d + group.length) % group.length; render(); };

    /* Direct manipulation: the photo follows the finger 1:1 (respecting where it was grabbed), a flick is projected
       forward to decide the outcome, release velocity is handed to the spring, and any motion can be grabbed again. */
    if (S) {
      let down = null, axis = null, samples = [], dragged = false;
      lb.addEventListener("pointerdown", e => {
        if (e.button !== 0 || e.target.closest("button")) return;
        stopAll(); // grab it mid-flight: continue from where it is on screen
        img.style.transform = ""; cap.style.opacity = "";
        down = { x: e.clientX, y: e.clientY, sx, sy, id: e.pointerId };
        axis = null; samples = [{ t: performance.now(), x: e.clientX, y: e.clientY }]; dragged = false;
      });
      lb.addEventListener("pointermove", e => {
        if (!down || e.pointerId !== down.id) return;
        const dx = e.clientX - down.x, dy = e.clientY - down.y;
        if (!axis) {
          if (Math.hypot(dx, dy) < 10) return; // hysteresis before committing to a direction
          axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
          lb.setPointerCapture(e.pointerId);
          lb.classList.add("is-dragging"); dragged = true;
        }
        samples.push({ t: performance.now(), x: e.clientX, y: e.clientY });
        if (samples.length > 8) samples.shift();
        if (axis === "x") {
          const raw = down.sx + dx;
          sx = group.length > 1 ? raw : S.rubberband(raw, innerWidth); // one photo: soft edge, nothing beyond
        } else sy = down.sy + dy;
        paint();
      });
      const release = e => {
        if (!down || (e.pointerId !== down.id)) return;
        lb.classList.remove("is-dragging");
        samples.push({ t: performance.now(), x: e.clientX, y: e.clientY }); // velocity is measured at the moment of release
        const ax = axis; down = null; axis = null;
        if (!ax) return;
        const W = innerWidth, H = innerHeight;
        const spring = (key, to, velocity, damping, response, onRest) => anims.push(S.to({
          from: key === "x" ? sx : sy, to, velocity, damping, response,
          onUpdate: v => { if (key === "x") sx = v; else sy = v; paint(); }, onRest }));
        if (ax === "x") {
          const vx = S.velocity(samples, "x");
          const landing = sx + S.project(vx);
          const dir = landing < -W * 0.3 ? 1 : landing > W * 0.3 ? -1 : 0;
          if (dir && group.length > 1) {
            if (!physics) { sx = 0; paint(); move(dir); return; }
            // out along the swipe, the next photo comes in from the other side on the same path
            spring("x", -dir * W, vx, 1, 0.3, () => {
              move(dir); sx = dir * W * 0.6; paint();
              spring("x", 0, 0, 1, 0.35);
            });
          } else if (physics) spring("x", 0, vx, 0.8, 0.35); else { sx = 0; paint(); }
        } else {
          const vy = S.velocity(samples, "y");
          const landing = sy + S.project(vy, 0.99);
          if (Math.abs(landing) > H * 0.2) {
            if (!physics) { finish(); return; }
            spring("y", Math.sign(landing) * H, vy, 1, 0.3, finish); // dismissed in the direction it was thrown
          } else if (physics) spring("y", 0, vy, 0.8, 0.35); else { sy = 0; paint(); }
        }
      };
      lb.addEventListener("pointerup", release);
      lb.addEventListener("pointercancel", release);
      // a drag must not also count as a tap on the backdrop
      lb.addEventListener("click", e => { if (dragged) { e.stopImmediatePropagation(); dragged = false; } }, true);
    }
    triggers.forEach(t => {
      t.style.cursor = "zoom-in";
      // photos that are not links or buttons become keyboard-operable buttons
      // ...unless the card already holds its own link (e.g. "Read the case study"): a button may not contain links
      if (!t.matches("a, button") && !t.querySelector("a[href], button, [tabindex]")) {
        // a <figure> may not take a button role: the photo inside it becomes the button
        const thumb = t.tagName === "IMG" ? t : $("img", t);
        const btn = t.tagName === "FIGURE" && thumb ? thumb : t;
        if (!btn.hasAttribute("tabindex")) btn.tabIndex = 0;
        if (!btn.getAttribute("role")) btn.setAttribute("role", "button");
        if (!btn.getAttribute("aria-label")) {
          const label = (thumb && thumb.alt) || t.dataset.caption || "photo";
          btn.setAttribute("aria-label", "View larger: " + label);
        }
        btn.addEventListener("keydown", e => {
          if (e.target !== btn) return;
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(t); }
        });
      }
      t.addEventListener("click", e => {
        if (e.target.closest("a") && e.target.closest("a") !== t) return; // a link inside the card navigates
        if (t.tagName !== "A") e.preventDefault();
        open(t);
      });
    });
    $(".lb-close", lb).addEventListener("click", close);
    $(".lb-prev", lb).addEventListener("click", () => move(-1));
    $(".lb-next", lb).addEventListener("click", () => move(1));
    lb.addEventListener("click", e => { if (e.target === lb) close(); });
    document.addEventListener("keydown", e => {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") { e.preventDefault(); close(); return; }
      if (e.key === "ArrowLeft" && group.length > 1) move(-1);
      if (e.key === "ArrowRight" && group.length > 1) move(1);
      if (e.key === "Tab") { // keep focus inside the dialog
        const b = buttons();
        if (!b.length) return;
        const first = b[0], last = b[b.length - 1];
        const inside = lb.contains(document.activeElement);
        if (e.shiftKey && (document.activeElement === first || !inside)) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && (document.activeElement === last || !inside)) { e.preventDefault(); first.focus(); }
      }
    });
  }

  /* ---------- India presence map ---------- */
  const mapHost = $("#indiaMap");
  // the map outline (~180 KB) is fetched only when the map is about to scroll into view
  if (mapHost && !window.INDIA_MAP && window.loadScript) {
    const mio = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      mio.disconnect();
      window.loadScript("india-map-data.min.js").then(drawMap, () => {});
    }, { rootMargin: "900px 0px" });
    mio.observe(mapHost);
  } else if (mapHost) drawMap();
  function drawMap() {
  if (!window.INDIA_MAP) return;
  {
    const data = window.INDIA_MAP;
    const presence = new Set(["hr","dl","rj","ut","up","br","jh","wb","or","as","ka"]);
    const offices = [
      { x: 193, y: 215, type: "hq",     title: "Corporate Office", place: "Greater Noida, UP", side: "left" },
      { x: 373, y: 261, type: "branch", title: "Branch Office",    place: "Madhubani, Bihar",  side: "right" }
    ];
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    // headroom above the map: the office cards float there, so they never cover North India
    const vb0 = data.viewBox.split(" ").map(Number), HEAD = 175;
    const vb = [vb0[0], vb0[1] - HEAD, vb0[2], vb0[3] + HEAD];
    const cardY = vb0[1] - 22; // bottom edge of the cards, just above the top of Ladakh
    svg.setAttribute("viewBox", vb.join(" "));
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
      const baseY = o.y, topY = cardY;
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

    // HTML labels (crisp text), above the map and joined to their pins by the dotted lines
    offices.forEach(o => {
      const tag = document.createElement("div");
      tag.className = "office-tag office-tag--" + o.type + " " + o.side;
      tag.innerHTML = `<span class="ot-badge">${o.type === "hq" ? "Corporate" : "Branch"}</span>
        <b>${o.title}</b><span class="ot-place">${o.place}</span>`;
      tag.style.left = (((o.x - vb[0]) / vb[2]) * 100) + "%";
      tag.style.top = (((cardY - vb[1]) / vb[3]) * 100) + "%";
      mapHost.appendChild(tag);
    });
  }
  }

  /* ---------- Contact form (Formspree → email, mailto fallback) ---------- */
  const form = $("#contactForm");
  if (form) {
    const status = $("#formStatus");
    const COMPANY_EMAIL = "arraysingenieria@gmail.com";
    let sending = false;
    form.addEventListener("submit", async e => {
      e.preventDefault();
      if (sending) return; // no duplicate submissions
      const hp = form.querySelector('[name="_honey"], [name="_gotcha"]');
      if (hp && hp.value) return; // honeypot
      const name = $("#name").value.trim();
      const phone = $("#phone").value.trim();
      const email = $("#email").value.trim();
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      const phoneBad = window.phoneProblem ? window.phoneProblem(phone) : (phone ? "" : "Please enter your phone number.");
      if (phoneBad) {
        status.className = "form-status err";
        status.textContent = phoneBad;
        $("#phone").focus();
        return;
      }
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
        const label = btn.innerHTML;
        try {
          sending = true;
          btn.disabled = true;
          btn.classList.add("is-loading");
          btn.setAttribute("aria-busy", "true");
          btn.textContent = "Sending…";
          status.className = "form-status";
          status.textContent = "Sending your enquiry…";
          const res = await fetch(endpoint, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } });
          const result = await formAccepted(res);
          if (!result.ok) throw new Error(result.message || "send failed");
          status.className = "form-status ok";
          status.textContent = "✓ Thank you, " + name + "! Your enquiry has been sent. We'll be in touch shortly.";
          form.reset(); // only once the service has confirmed it; on failure the visitor's details stay in the form
        } catch (err) {
          status.className = "form-status err";
          status.textContent = "Your enquiry was not sent. Your details are still in the form: please try again, or email us at " + COMPANY_EMAIL + ".";
        } finally {
          sending = false;
          btn.disabled = false;
          btn.classList.remove("is-loading");
          btn.removeAttribute("aria-busy");
          btn.innerHTML = label;
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

/* ---------- Long-form guides: reading progress, active contents link, topic filter ---------- */
(function () {
  const body = document.querySelector(".art-body");
  if (body) {
    const bar = document.querySelector(".read-progress span");
    const onScroll = () => {
      const r = body.getBoundingClientRect();
      const total = r.height - window.innerHeight * 0.6;
      const done = Math.min(1, Math.max(0, -r.top / (total > 0 ? total : 1)));
      if (bar) bar.style.width = (done * 100).toFixed(1) + "%";
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    const links = [...document.querySelectorAll(".art-toc a")];
    const map = new Map(links.map((a) => [a.getAttribute("href").slice(1), a]));
    if ("IntersectionObserver" in window && links.length) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          links.forEach((a) => { a.classList.remove("is-active"); a.removeAttribute("aria-current"); });
          const a = map.get(e.target.id);
          if (a) { a.classList.add("is-active"); a.setAttribute("aria-current", "true"); }
        });
      }, { rootMargin: "-20% 0px -70% 0px" });
      document.querySelectorAll(".art-sec[id]").forEach((s) => io.observe(s));
    }
    // on phones the contents list starts folded so the article comes first
    const det = document.querySelector(".art-toc details");
    if (det && window.matchMedia("(max-width: 1024px)").matches) det.open = false;
  }
  const grid = document.querySelector("[data-art-grid]");
  if (grid) {
    const btns = [...document.querySelectorAll("[data-art-filter]")];
    btns.forEach((b) => b.addEventListener("click", () => {
      const f = b.dataset.artFilter;
      btns.forEach((x) => { x.classList.toggle("active", x === b); x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      // "All" shows the featured guide above and the rest below; a topic shows every matching guide in the grid
      const feature = document.querySelector("[data-art-feature]");
      if (feature) feature.hidden = f !== "all";
      let shown = 0;
      grid.querySelectorAll(".art-card").forEach((c) => {
        const on = c.dataset.lead ? f !== "all" && c.dataset.tag === f : f === "all" || c.dataset.tag === f;
        c.classList.toggle("is-hidden", !on);
        if (on) shown++;
      });
      if (f === "all") shown += 1;
      const empty = document.querySelector("[data-art-empty]");
      if (empty) empty.hidden = shown > 0;
      const count = document.querySelector("[data-art-count]");
      if (count) count.textContent = b.textContent.trim() + ": " + shown + (shown === 1 ? " guide" : " guides");
    }));
    btns.forEach((x) => x.setAttribute("aria-pressed", x.classList.contains("active") ? "true" : "false"));
  }
})();
