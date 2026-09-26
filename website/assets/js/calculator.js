/* ===========================================================
   INGENIERIA — Solar Savings Calculator + rich 2-page PDF
   =========================================================== */
(function () {
  "use strict";
  const $ = id => document.getElementById(id);
  if (!$("calcBtn")) return;

  // On-page (HTML) money formatting keeps the ₹ glyph
  const inr = n => "₹" + Math.round(n).toLocaleString("en-IN");
  const inrShort = n => {
    if (n >= 1e7) return "₹" + (n / 1e7).toFixed(2) + " Cr";
    if (n >= 1e5) return "₹" + (n / 1e5).toFixed(2) + " L";
    return "₹" + Math.round(n).toLocaleString("en-IN");
  };
  // PDF money formatting uses "Rs" (jsPDF core fonts can't render ₹)
  const rs = n => "Rs " + Math.round(n).toLocaleString("en-IN");
  const rsShort = n => {
    if (n >= 1e7) return "Rs " + (n / 1e7).toFixed(2) + " Cr";
    if (n >= 1e5) return "Rs " + (n / 1e5).toFixed(2) + " L";
    return "Rs " + Math.round(n).toLocaleString("en-IN");
  };

  let last = null;

  function compute() {
    const bill = +$("calcBill").value || 0;
    const tariff = Math.max(1, +$("calcTariff").value || 8);
    const sun = +$("calcSun").value || 4.3;
    const typeEl = $("calcType");
    const costPer = +typeEl.value || 52000;
    const isRes = typeEl.options[typeEl.selectedIndex].dataset.res === "1";
    const subsidyOn = $("calcSubsidy").checked;

    const monthlyUnits = bill / tariff;
    let size = monthlyUnits / (sun * 30);
    size = Math.max(1, Math.round(size * 10) / 10);

    const cost = size * costPer;
    let subsidy = 0, subsidyNote = "";
    if (subsidyOn && isRes) {
      subsidy = Math.min(size, 2) * 30000 + Math.min(Math.max(size - 2, 0), 1) * 18000;
      subsidy = Math.min(subsidy, 78000);
    } else if (subsidyOn && !isRes) {
      subsidyNote = "Govt. subsidy (PM Surya Ghar) applies to residential rooftop only.";
    }
    const netCost = cost - subsidy;

    const annualGen = size * sun * 365;
    const annualSave = annualGen * tariff;
    const monthlySave = annualSave / 12;
    const payback = netCost / annualSave;
    const save25 = annualSave * 25 * 0.92 - netCost;
    const co2 = (annualGen * 0.82) / 1000;
    const trees = Math.round((annualGen * 0.82) / 21);

    last = { bill, tariff, sun, costPer, isRes, subsidyOn, size, cost, subsidy, netCost,
             annualGen, annualSave, monthlySave, payback, save25, co2, trees,
             type: typeEl.options[typeEl.selectedIndex].text };

    $("rSize").textContent = size.toFixed(1) + " kWp";
    $("rCost").textContent = inrShort(cost);
    $("rSave").textContent = inr(monthlySave);
    $("rPayback").textContent = payback.toFixed(1) + " yrs";
    $("rGen").textContent = Math.round(annualGen).toLocaleString("en-IN") + " kWh";
    $("r25").textContent = inrShort(save25);
    $("rCo2").textContent = co2.toFixed(1) + " t";

    const subEl = $("rSubsidy");
    if (subsidy > 0) {
      subEl.hidden = false;
      subEl.innerHTML = "🏛️ Govt. subsidy applied: <b>−" + inr(subsidy) + "</b> &nbsp;→&nbsp; Net investment: <b>" + inr(netCost) + "</b>";
    } else if (subsidyNote) {
      subEl.hidden = false; subEl.textContent = subsidyNote;
    } else { subEl.hidden = true; }

    $("rEco").innerHTML = "🌱 Equivalent to planting <b>" + trees.toLocaleString("en-IN") +
      " trees</b> every year — your clean-energy contribution to the nation.";

    $("calcResults").hidden = false;
  }

  $("calcBtn").addEventListener("click", compute);
  ["calcBill", "calcTariff", "calcSun", "calcType", "calcSubsidy"].forEach(id =>
    $(id).addEventListener("change", () => { if (!$("calcResults").hidden) compute(); }));
  ["calcBill", "calcTariff"].forEach(id =>
    $(id).addEventListener("keydown", e => { if (e.key === "Enter") compute(); }));

  /* ---------------- 2-page PDF report ---------------- */
  function buildPdf() {
    if (!last) compute();
    if (!(window.jspdf && window.jspdf.jsPDF)) return null;
    const d = last;
    const doc = new window.jspdf.jsPDF({ unit: "pt", format: "a4" });
    const W = doc.internal.pageSize.getWidth(), H = doc.internal.pageSize.getHeight();
    const M = 42, CW = W - 2 * M;
    const dateStr = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });

    const C = { headbg: [15, 61, 46], green: [15, 122, 87], gold: [201, 130, 8], ink: [18, 33, 26],
                mut: [120, 135, 126], line: [226, 236, 231], soft: [248, 251, 249], mint: [232, 247, 240], white: [255, 255, 255] };
    const f = c => doc.setFillColor(c[0], c[1], c[2]);
    const t = c => doc.setTextColor(c[0], c[1], c[2]);
    const dc = c => doc.setDrawColor(c[0], c[1], c[2]);
    const font = (s, w) => { doc.setFont("helvetica", w || "normal"); doc.setFontSize(s); };

    function header() {
      f(C.headbg); doc.rect(0, 0, W, 84, "F");
      f(C.gold); doc.rect(0, 84, W, 4, "F");
      // sun + panel mark
      f([245, 165, 30]); doc.circle(M + 11, 38, 10, "F");
      f([38, 60, 120]); doc.triangle(M + 24, 50, M + 50, 50, M + 37, 38, "F");
      t(C.white); font(19, "bold"); doc.text("INGENIERIA", M + 58, 36);
      font(9); t([200, 232, 218]); doc.text("Developing Green Energy for the Nation", M + 58, 51);
      font(8); t([165, 210, 192]); doc.text("Arrays Ingenieria Pvt. Ltd.", M + 58, 65);
      font(9, "bold"); t([253, 224, 71]); doc.text("SOLAR SAVINGS ESTIMATE", W - M, 42, { align: "right" });
      font(8); t([200, 232, 218]); doc.text(dateStr, W - M, 57, { align: "right" });
    }
    function footer(pg) {
      dc(C.line); doc.line(M, H - 40, W - M, H - 40);
      font(8); t(C.mut);
      doc.text("arraysingenieria@gmail.com", M, H - 26);
      doc.text("Ingenieria — Solar Savings Estimate", W / 2, H - 26, { align: "center" });
      doc.text("Page " + pg + " of 2", W - M, H - 26, { align: "right" });
    }

    /* ======== PAGE 1 ======== */
    header();
    let y = 118;
    font(18, "bold"); t(C.ink); doc.text("Your Solar Savings Estimate", M, y);
    font(10); t(C.mut);
    doc.text("A " + d.size.toFixed(1) + " kWp system tailored to your " + d.type.toLowerCase() + " — here's what it delivers.", M, y + 17);
    y += 42;

    // two panels
    const gap = 14, halfW = (CW - gap) / 2, pH = 134;
    f(C.soft); dc(C.line); doc.roundedRect(M, y, halfW, pH, 9, 9, "FD");
    font(10, "bold"); t(C.green); doc.text("YOUR INPUTS", M + 16, y + 24);
    const inputs = [
      ["Monthly bill", rs(d.bill)], ["Electricity tariff", "Rs " + d.tariff + " / unit"],
      ["Regional sunlight", d.sun + " kWh/kWp/day"], ["Property type", d.type],
      ["Govt. subsidy", d.subsidy > 0 ? "Applied (PM Surya Ghar)" : (d.subsidyOn ? "Not applicable" : "Not applied")]
    ];
    let iy = y + 46;
    inputs.forEach(r => {
      font(9.5); t(C.mut); doc.text(r[0], M + 16, iy);
      font(9.5, "bold"); t(C.ink); doc.text(String(r[1]), M + halfW - 16, iy, { align: "right" });
      iy += 17.5;
    });

    const rx = M + halfW + gap;
    f(C.green); doc.roundedRect(rx, y, halfW, pH, 9, 9, "F");
    font(9.5); t([214, 240, 228]); doc.text("RECOMMENDED SYSTEM", rx + 16, y + 26);
    font(30, "bold"); t(C.white); doc.text(d.size.toFixed(1) + " kWp", rx + 16, y + 60);
    font(9); t([214, 240, 228]); doc.text("Estimated net investment", rx + 16, y + 84);
    font(16, "bold"); t(C.white); doc.text(rsShort(d.netCost), rx + 16, y + 103);
    font(9); t([214, 240, 228]); doc.text("Saves about " + rs(d.monthlySave) + " every month", rx + 16, y + 122);
    y += pH + 22;

    // 3 metric cards
    const mc = [["PAYBACK PERIOD", d.payback.toFixed(1) + " years", C.green],
                ["25-YEAR NET SAVINGS", rsShort(d.save25), C.gold],
                ["ANNUAL GENERATION", Math.round(d.annualGen).toLocaleString("en-IN") + " kWh", C.ink]];
    const mcw = (CW - 2 * 12) / 3, mch = 66;
    mc.forEach((c, i) => {
      const x = M + (mcw + 12) * i;
      f([249, 252, 251]); dc(C.line); doc.roundedRect(x, y, mcw, mch, 8, 8, "FD");
      font(8); t(C.mut); doc.text(c[0], x + 13, y + 23);
      font(16, "bold"); t(c[2]); doc.text(String(c[1]), x + 13, y + 47);
    });
    y += mch + 26;

    // breakdown table
    font(12, "bold"); t(C.ink); doc.text("Detailed Breakdown", M, y); y += 12;
    const rows = [["System size", d.size.toFixed(1) + " kWp", 0], ["Gross investment", rs(d.cost), 0]];
    if (d.subsidy > 0) { rows.push(["Govt. subsidy (PM Surya Ghar)", "- " + rs(d.subsidy), 0], ["Net investment", rs(d.netCost), 1]); }
    rows.push(["Annual generation", Math.round(d.annualGen).toLocaleString("en-IN") + " kWh", 0],
              ["Monthly savings", rs(d.monthlySave), 0], ["Annual savings", rs(d.annualSave), 0],
              ["Payback period", d.payback.toFixed(1) + " years", 0],
              ["Net savings over 25 years", rs(d.save25), 1],
              ["CO2 offset per year", d.co2.toFixed(1) + " t  (~ " + d.trees.toLocaleString("en-IN") + " trees)", 0]);
    rows.forEach((r, i) => {
      if (i % 2 === 0) { f([249, 252, 251]); doc.rect(M, y, CW, 21, "F"); }
      font(10.5); t(C.ink); doc.text(r[0], M + 12, y + 14);
      font(10.5, "bold"); t(r[2] ? C.green : C.ink); doc.text(String(r[1]), W - M - 12, y + 14, { align: "right" });
      y += 21;
    });
    footer(1);

    /* ======== PAGE 2 ======== */
    doc.addPage(); header();
    y = 118;
    font(12, "bold"); t(C.ink); doc.text("Cumulative Net Savings Over 25 Years", M, y);
    font(9); t(C.mut); doc.text("After your investment is recovered, savings keep compounding year on year.", M, y + 15);
    y += 34;

    const yrs = [5, 10, 15, 20, 25];
    const vals = yrs.map(yr => d.annualSave * yr * 0.92 - d.netCost);
    const maxV = Math.max.apply(null, vals.map(v => Math.max(v, 0)).concat([1]));
    const labelW = 58, valW = 92, x0 = M + labelW, availW = CW - labelW - valW, rowH = 27;
    yrs.forEach((yr, i) => {
      const cy = y + rowH * i, v = vals[i];
      font(10); t(C.ink); doc.text("Year " + yr, M, cy + 14);
      f([238, 244, 241]); doc.roundedRect(x0, cy + 4, availW, 15, 7, 7, "F");
      const bw = Math.max(8, (Math.max(v, 0) / maxV) * availW);
      f(v >= 0 ? C.green : C.gold); doc.roundedRect(x0, cy + 4, bw, 15, 7, 7, "F");
      font(10, "bold"); t(v >= 0 ? C.green : C.gold);
      doc.text(rsShort(v), x0 + availW + valW - 4, cy + 15, { align: "right" });
    });
    y += rowH * yrs.length + 16;

    // environmental impact panel
    f(C.mint); dc([182, 224, 203]); doc.roundedRect(M, y, CW, 72, 9, 9, "FD");
    f(C.green); doc.circle(M + 30, y + 36, 13, "F");
    t(C.white); font(13, "bold"); doc.text("CO", M + 22, y + 40);
    font(8); doc.text("2", M + 35, y + 43);
    font(11.5, "bold"); t(C.green); doc.text("Environmental Impact", M + 58, y + 28);
    font(10); t(C.ink);
    doc.text("Offsets " + d.co2.toFixed(1) + " tonnes of CO2 every year — equal to planting about", M + 58, y + 46);
    font(10, "bold"); t(C.green); doc.text(d.trees.toLocaleString("en-IN") + " trees annually.", M + 58, y + 61);
    y += 72 + 24;

    // what we deliver
    font(12, "bold"); t(C.ink); doc.text("What Ingenieria Delivers", M, y); y += 20;
    ["Site survey, shadow analysis & detailed engineering",
     "Tier-1 modules, inverters & robust mounting structures",
     "Civil, piling & electrical works to ISO 9001/14001/45001 standards",
     "Net-metering liaison, grid synchronisation & commissioning",
     "Operations & maintenance with live performance monitoring"].forEach(b => {
      f(C.green); doc.circle(M + 4, y - 3, 2.4, "F");
      font(10.5); t(C.ink); doc.text(b, M + 14, y); y += 18;
    });
    y += 10;

    // CTA
    f(C.green); doc.roundedRect(M, y, CW, 54, 9, 9, "F");
    t(C.white); font(13, "bold"); doc.text("Ready to go solar?", M + 18, y + 23);
    font(9.5); t([214, 240, 228]); doc.text("Talk to our veteran-led team for a free site survey & exact quotation.", M + 18, y + 40);
    font(10, "bold"); t([253, 224, 71]); doc.text("arraysingenieria@gmail.com", W - M - 18, y + 33, { align: "right" });
    y += 70;

    font(7.5, "italic"); t(C.mut);
    const disc = "Disclaimer: This is an indicative estimate based on the inputs provided and standard assumptions (generation, tariff, " +
      "component costs and PM Surya Ghar subsidy slabs). Actual system size, cost, subsidy and savings are subject to a detailed site " +
      "survey, shadow analysis, sanctioned load, net-metering policy and final component selection. This document is not a quotation.";
    doc.text(doc.splitTextToSize(disc, CW), M, y);
    footer(2);
    return doc;
  }

  $("calcPdf").addEventListener("click", function () {
    const doc = buildPdf();
    if (!doc) { alert("Preparing report… please click again in a moment."); return; }
    doc.save("Ingenieria-Solar-Estimate.pdf");
  });
  window.__buildPdf = buildPdf;
})();
