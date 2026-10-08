/* Free solar quote funnel.
   Six short steps, a live progress bar, a proof point matched to the visitor's choice, an instant savings
   estimate, a summary of their answers, and a lead score in the email subject for the sales team.
   Without JavaScript every step shows and the form posts normally. */
/* A form service can answer HTTP 200 and still refuse the message (FormSubmit sends {"success":"false"}, for example
   before the inbox has been activated). Only an explicit success in the JSON body counts as sent. */
async function formAccepted(res) {
  let data = null;
  try { data = await res.json(); } catch (e) { data = null; }
  const ok = res.ok && data && (data.success === true || data.success === "true" || data.ok === true);
  return { ok: !!ok, message: data && typeof data.message === "string" ? data.message : "" };
}

(function () {
  const form = document.getElementById("quoteForm");
  if (!form) return;
  const $ = (s, el) => (el || form).querySelector(s);
  const $$ = (s, el) => [...(el || form).querySelectorAll(s)];
  const steps = $$(".q-step");
  const fill = $(".q-bar__fill");
  const pct = $(".q-pct");
  const stepTxt = $(".q-steptxt");
  const status = document.getElementById("quoteStatus");
  const done = document.getElementById("quoteDone");
  const inr = (n) => "Rs " + Math.round(n).toLocaleString("en-IN");
  const inrShort = (n) => n >= 1e7 ? "Rs " + (n / 1e7).toFixed(2) + " Cr" : n >= 1e5 ? "Rs " + (n / 1e5).toFixed(1) + " lakh" : inr(n);
  let current = 0;
  let sending = false;

  /* proof point that matches the visitor's segment (social proof + relevance) */
  const PROOF = {
    industry: "Good choice. We have built for Super Smelters (1980 kWp rooftop), DCM Hisar (10 MW civil works) and Tata Motors, Jamshedpur.",
    tea: "Tea estates are our specialty: 19 on-grid plants in Assam's tea gardens, including Koomber, inaugurated by the Chief Minister.",
    commercial: "We build rooftop plants for commercial sites, from TCPL Greenery Agro (319 kWp) to a Bharat Petroleum fuel station.",
    epc: "We are installation partner to Tata Power and Sustvest, from tea-estate plants to pile foundations on the 300 MW SECI park.",
    home: "For homes, PM Surya Ghar gives up to Rs 78,000 subsidy through registered vendors. We focus on business plants, but leave your details and we will guide you.",
    other: "Tell us what you have in mind and the right engineer will get back to you.",
  };
  const COST_PER_KW = { home: 60000, commercial: 52000, industry: 48000, tea: 48000, epc: 48000, other: 52000 };
  const SUN = 4.3;

  function segKey() {
    const r = $('input[name="segment"]:checked');
    if (!r) return "";
    const k = $$("[data-seg-key]").find((h) => h.dataset.segKey === r.value);
    return k ? k.value : "other";
  }

  form.classList.add("is-stepped");

  function show(i, scroll = true) {
    current = i;
    steps.forEach((s, n) => { s.hidden = n !== i; });
    const p = Math.round(10 + (i / (steps.length - 1)) * 80); // starts at 10%: a head start keeps people going
    fill.style.width = p + "%";
    pct.textContent = p + "%";
    stepTxt.textContent = i === steps.length - 1 ? "Last step" : "Step " + (i + 1) + " of " + steps.length;
    if (i === 1) {
      const proof = $("[data-proof]");
      const k = segKey();
      proof.textContent = PROOF[k] || "";
      proof.hidden = !PROOF[k];
    }
    if (i === 3) estimate();
    if (i === steps.length - 1) summary();
    if (!scroll) return;
    const top = form.getBoundingClientRect().top + window.scrollY - 90;
    if (Math.abs(window.scrollY - top) > 40) window.scrollTo({ top, behavior: "smooth" });
  }

  /* "tick at least one service": the error lives on the first box but is re-evaluated from the whole group,
     so ticking ANY box clears it (it used to clear only when the first box itself changed) */
  const svc = $$('input[name="services"]');
  function serviceCheck() {
    const ok = svc.some((b) => b.checked);
    svc[0].setCustomValidity(ok ? "" : "Please tick at least one option.");
    return ok;
  }
  svc.forEach((b) => b.addEventListener("change", serviceCheck));

  function valid(step) {
    if (step.dataset.step === "2" && !serviceCheck()) { svc[0].reportValidity(); return false; }
    for (const el of $$("input, select, textarea", step)) {
      if (!el.checkValidity()) { el.reportValidity(); return false; }
    }
    return true;
  }

  /* instant estimate: the home-page calculator's assumptions (4.3 sun-hours, cost per kWp by segment) */
  function calc() {
    const bill = +$("#q-bill").value || 0;
    if (bill < 1000) return null;
    const tariff = Math.max(1, +$("#q-tariff").value || 8);
    // size the plant to cover about 90% of the units used: realistic for on-grid plants and net metering
    const size = Math.max(1, Math.round((0.9 * bill / tariff / (SUN * 30)) * 10) / 10);
    const cost = size * (COST_PER_KW[segKey()] || 52000);
    const annualSave = size * SUN * 365 * tariff;
    return { size, monthly: annualSave / 12, payback: cost / annualSave, co2: (size * SUN * 365 * 0.82) / 1000 };
  }
  function estimate() {
    const box = document.getElementById("qEstimate");
    const r = calc();
    if (!r) { box.hidden = true; return; }
    $('[data-est="size"]').textContent = r.size.toLocaleString("en-IN") + " kWp";
    $('[data-est="save"]').textContent = inrShort(r.monthly);
    $('[data-est="payback"]').textContent = r.payback.toFixed(1) + " years";
    $('[data-est="co2"]').textContent = r.co2.toFixed(1) + " t";
    $('[data-est="loss"]').textContent = "Every month without solar could be costing you about " + inrShort(r.monthly) + ".";
    box.hidden = false;
    $('input[name="estimate_kwp"]').value = r.size + " kWp";
    $('input[name="estimate_monthly_savings"]').value = inr(r.monthly);
  }
  ["#q-bill", "#q-tariff"].forEach((s) => $(s).addEventListener("input", estimate));
  $$(".q-chip").forEach((c) => c.addEventListener("click", () => {
    $("#q-bill").value = c.dataset.bill;
    $$(".q-chip").forEach((x) => x.classList.toggle("on", x === c));
    estimate();
  }));

  /* the visitor's own answers, played back before they commit */
  function summary() {
    const box = document.getElementById("qSummary");
    const val = (n) => { const el = $('[name="' + n + '"]:checked') || $('[name="' + n + '"]'); return el && el.value ? el.value : ""; };
    const services = $$('input[name="services"]:checked').map((x) => x.value).join(", ");
    const bill = +$("#q-bill").value;
    const r = calc();
    const rows = [
      ["For", val("segment")],
      ["Need", services],
      ["Site", [$("#q-city").value, val("state")].filter(Boolean).join(", ")],
      ["Bill", bill ? inr(bill) + " a month" : ""],
      ["Estimate", r ? r.size + " kWp, saving about " + inrShort(r.monthly) + " a month" : ""],
      ["Start", val("timeline")],
    ].filter((x) => x[1]);
    box.innerHTML = '<p class="q-sum__title">Your request</p><dl>' +
      rows.map(([k, v]) => "<div><dt>" + k + "</dt><dd>" + v.replace(/</g, "&lt;") + "</dd></div>").join("") + "</dl>";
    box.hidden = !rows.length;
  }

  /* lead score for the sales team: bill size, urgency, decision power */
  function score() {
    let s = 0;
    const bill = +$("#q-bill").value || 0;
    s += bill >= 500000 ? 4 : bill >= 200000 ? 3 : bill >= 50000 ? 2 : 1;
    const t = ($('input[name="timeline"]:checked') || {}).value || "";
    s += /1 month/.test(t) ? 4 : /1 to 3/.test(t) ? 3 : /3 to 6/.test(t) ? 2 : /6 to 12/.test(t) ? 1 : 0;
    const role = $("#q-role").value;
    s += /Owner/.test(role) ? 2 : /manager|procurement/i.test(role) ? 1 : 0;
    if (segKey() === "home") s -= 3;
    return s >= 8 ? "HOT" : s >= 5 ? "WARM" : "COLD";
  }

  /* where the lead came from */
  (function source() {
    const q = new URLSearchParams(location.search);
    const parts = ["utm_source", "utm_medium", "utm_campaign"].map((k) => q.get(k) && k.slice(4) + "=" + q.get(k)).filter(Boolean);
    if (document.referrer && !document.referrer.startsWith(location.origin)) parts.push("referrer=" + document.referrer);
    else if (document.referrer) parts.push("from page=" + new URL(document.referrer).pathname);
    $('input[name="source"]').value = parts.join("; ") || "direct";
    // prefill from the home-page calculator: /free-solar-quote/?bill=25000&tariff=8&segment=home
    if (q.get("bill")) $("#q-bill").value = Math.round(+q.get("bill")) || "";
    if (q.get("tariff")) $("#q-tariff").value = +q.get("tariff") || "";
    const seg = q.get("segment");
    if (seg) {
      const h = $$("[data-seg-key]").find((x) => x.value === seg);
      const r = h && $$('input[name="segment"]').find((x) => x.value === h.dataset.segKey);
      if (r) r.checked = true;
    }
  })();

  form.addEventListener("click", (e) => {
    if (e.target.closest("[data-next]")) { if (valid(steps[current])) show(current + 1); }
    if (e.target.closest("[data-back]")) show(current - 1);
  });
  /* tapping a single-choice card moves on by itself on step 1 */
  $$('input[name="segment"]').forEach((r) => r.addEventListener("change", () => setTimeout(() => show(1), 250)));
  form.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && e.target.tagName !== "TEXTAREA" && e.target.tagName !== "BUTTON" && current < steps.length - 1) {
      e.preventDefault();
      if (valid(steps[current])) show(current + 1);
    }
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (sending) return;
    if ($('[name="_honey"]').value) return;
    for (const s of steps) { if (!valid(s)) { show(steps.indexOf(s)); return; } }
    estimate();
    const lead = score();
    $('input[name="lead_score"]').value = lead;
    const who = $("#q-company").value || $("#q-name").value;
    const r = calc();
    $('input[name="_subject"]').value = "[" + lead + "] Solar quote: " + who + ", " + ($("#q-city").value || "") +
      (r ? ", ~" + r.size + " kWp" : "");
    const btn = $('button[type="submit"]');
    const label = btn.innerHTML;
    sending = true;
    btn.disabled = true;
    btn.classList.add("is-loading");
    btn.textContent = "Sending…";
    try {
      const res = await fetch(form.dataset.endpoint, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } });
      const result = await formAccepted(res);
      if (!result.ok) throw new Error(result.message || "send failed");
      steps.forEach((s) => { s.hidden = true; });
      $(".q-top").hidden = true;
      const first = ($("#q-name").value || "").trim().split(" ")[0];
      done.querySelector("[data-done-name]").textContent = first ? ", " + first : "";
      done.hidden = false;
      done.scrollIntoView({ behavior: "smooth", block: "center" });
    } catch (err) {
      status.className = "form-status err";
      status.textContent = "Your request was not sent. Your answers are still here: please try again, or email us at arraysingenieria@gmail.com.";
    } finally {
      sending = false;
      btn.disabled = false;
      btn.classList.remove("is-loading");
      btn.innerHTML = label;
    }
  });

  show(0, false);
})();
