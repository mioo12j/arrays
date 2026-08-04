// =============================================================================
//  ARRAYS INGENIERIA — Commercial Quotation & Bill of Quantities (pdfkit)
//  Renders in the same brand identity as the proposal book (see KIT).
//  Exports renderQuotation(doc, data) and renderBOQ(doc, data), each of which
//  appends its pages to a shared doc (first page on the current page, then
//  addPage between its own pages) so they can be combined into one PDF.
// =============================================================================
import { KIT, registerFonts } from './proposal-pdf.service.js';

const { C, M, chrome, heading, para, panel, eyebrow, triTick, drawImg, logo,
        photo, V, num, inr, inrShort, addressLines, titleCaseCover } = KIT;

// ---- shared helpers ---------------------------------------------------------
function money(n) { return n || n === 0 ? '₹' + Math.round(n).toLocaleString('en-IN') : '—'; }

// pull a readable module / inverter description out of the BOQ line items
function hardware(items) {
  const find = (re) => (items.find((i) => re.test(String(i.item))) || {}).item;
  return {
    module: find(/panel|module|wp|mono|topcon|perc/i),
    inverter: find(/inverter/i),
    structure: find(/structure|mounting/i),
  };
}

// commercial figures, resilient to which columns are populated
function commercials(data) {
  const items = Array.isArray(data.line_items) ? data.line_items : [];
  const subtotal = num(data.subtotal, 0) || items.reduce((s, i) => s + num(i.amount, 0), 0);
  const contingency = num(data.contingency_amount, 0);
  const margin = num(data.margin_amount, 0);
  const taxable = num(data.taxable_amount, 0) || subtotal + contingency + margin;
  const gst = num(data.gst_amount, 0) || Math.round(taxable * 0.138);
  const total = num(data.total_amount, 0) || taxable + gst;
  const subsidy = num(data.subsidy_amount, 0);
  const net = num(data.net_cost, 0) || total - subsidy;
  const kwp = num(data.capacity_kw || data.capacity_kwp, 0);
  const perW = num(data.per_watt, 0) || (kwp ? total / (kwp * 1000) : 0);
  return { items, subtotal, contingency, margin, taxable, gst, total, subsidy, net, kwp, perW };
}

function metaCard(doc, data, x, y, w) {
  const addr = (addressLines ? addressLines(data) : []);
  const rows = [
    ['Client', data.client_name || data.client_full_name || data.customer_name],
    ['Address', addr.length ? addr : null],           // array => multi-line, height adjusts
    ['Project', data.project_name || data.site_name],
    ['Capacity', num(data.capacity_kw, 0) ? num(data.capacity_kw, 0) + ' kWp' : null],
    ['Reference', data.quote_number],
    ['Date', new Date(data.issue_date || data.date || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })],
    ['Valid Until', data.valid_until ? new Date(data.valid_until).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '30 days from issue'],
  ].filter((r) => r[1]);
  const rowH = (r) => (Array.isArray(r[1]) ? 12 + r[1].length * 11 : 26);
  let h = 16;
  rows.forEach((r) => { h += rowH(r); });
  panel(doc, x, y, w, h, C.mint, 9, C.line);
  doc.rect(x, y, 4, h).fill(C.gold);
  let yy = y + 12;
  rows.forEach((r, i) => {
    doc.font('ui').fontSize(7.5).fillColor(C.mute).text(String(r[0]).toUpperCase(), x + 18, yy, { characterSpacing: 0.8, width: 84 });
    if (Array.isArray(r[1])) {
      doc.font('uiSB').fontSize(9).fillColor(C.ink);
      r[1].forEach((ln, k) => doc.text(ln, x + 106, yy - 1 + k * 11, { width: w - 122 }));
    } else {
      doc.font('uiSB').fontSize(9.5).fillColor(C.ink).text(V(r[1]), x + 106, yy - 1, { width: w - 122 });
    }
    yy += rowH(r);
    if (i < rows.length - 1) doc.moveTo(x + 18, yy - 6).lineTo(x + w - 16, yy - 6).lineWidth(0.5).strokeColor(C.line).stroke();
  });
  return y + h;
}

// =============================================================================
//  QUOTATION
// =============================================================================
export function renderQuotation(doc, data = {}, opts = {}) {
  if (!opts.shared) { registerFonts(doc); doc.page.margins.bottom = 0; doc.on('pageAdded', () => { doc.page.margins.bottom = 0; }); }
  const W = doc.page.width, w = W - 2 * M;
  const c = commercials(data);
  const hw = hardware(c.items);

  // ---- PAGE 1 — commercial summary ----
  chrome(doc, 'Commercial Quotation');
  heading(doc, 'Priced Offer', 'Commercial Quotation');
  let y = doc.y + 2;

  // left: meta card ; right: system config
  const colW = (w - 22) / 2;
  const metaBottom = metaCard(doc, data, M, y, colW);
  // system config card
  const scX = M + colW + 22;
  const titleCase = (s) => String(s).replace(/\b\w/g, (m) => m.toUpperCase());
  const cfg = [
    ['Solar Modules', hw.module || 'Tier-1 Mono-PERC / TOPCon'],
    ['Inverter', hw.inverter || 'On-grid string / central inverter'],
    ['Mounting', hw.structure || 'Hot-dip galvanised GI structure'],
    ['System Type', data.grid_type ? titleCase(data.grid_type) : (data.project_type ? titleCase(data.project_type) : 'On-Grid, Net-Metered')],
    ['Configuration', c.kwp ? c.kwp + ' kWp Grid-Connected Solar PV' : 'Grid-Connected Solar PV'],
  ];
  const cRowH = 30, cH = cfg.length * cRowH + 34;
  panel(doc, scX, y, colW, cH, C.paper, 9, C.line);
  doc.rect(scX, y, colW, 3).fill(C.emer);
  doc.font('uiSB').fontSize(8.5).fillColor(C.emer).text('SYSTEM CONFIGURATION', scX + 16, y + 14, { characterSpacing: 1 });
  cfg.forEach((r, i) => {
    const yy = y + 34 + i * cRowH;
    doc.font('ui').fontSize(7.5).fillColor(C.mute).text(String(r[0]).toUpperCase(), scX + 16, yy, { characterSpacing: 0.6 });
    doc.font('bodyM').fontSize(9.4).fillColor(C.ink).text(V(r[1]), scX + 16, yy + 10, { width: colW - 32 });
  });
  y = Math.max(metaBottom, y + cH) + 18;

  // commercial summary table
  eyebrow(doc, 'Commercial Summary', M, y, C.gold); y += 18;
  const line = (label, val, opt = {}) => {
    const rh = opt.big ? 40 : 26;
    if (opt.fill) panel(doc, M, y, w, rh, opt.fill, 6);
    doc.font(opt.big ? 'uiSB' : 'ui').fontSize(opt.big ? 11 : 10).fillColor(opt.big ? '#fff' : C.body)
       .text(label, M + 16, y + (opt.big ? 15 : 8), { width: w - 220 });
    doc.font(opt.big ? 'uiB' : 'uiSB').fontSize(opt.big ? 16 : 10.5).fillColor(opt.big ? '#fff' : (opt.accent || C.ink))
       .text(money(val), M + w - 200, y + (opt.big ? 13 : 7), { width: 184, align: 'right' });
    if (!opt.fill && !opt.big) doc.moveTo(M, y + rh).lineTo(M + w, y + rh).lineWidth(0.5).strokeColor(C.line).stroke();
    y += rh;
  };
  line('System Package (Supply + Installation)', c.subtotal);
  if (c.contingency) line('Contingency', c.contingency);
  if (c.margin) line('Overheads & Margin', c.margin);
  line('Taxable Value', c.taxable);
  line(`GST${c.taxable ? ` (${Math.round((c.gst / c.taxable) * 100)}%)` : ''}`, c.gst);
  y += 4;
  line('Total Investment (incl. GST)', c.total, { big: true, fill: C.emer });
  y += 6;
  if (c.subsidy) { line('Less: Government Subsidy', -c.subsidy, { accent: C.emer }); }
  if (c.subsidy) { line('Net Investment After Subsidy', c.net, { big: true, fill: C.emerD }); }
  if (c.kwp && c.perW) {
    y += 8;
    panel(doc, M, y, w, 34, C.cream, 8);
    doc.rect(M, y, 4, 34).fill(C.gold);
    doc.font('uiSB').fontSize(9).fillColor(C.gold).text('EFFECTIVE PRICE', M + 18, y + 13, { characterSpacing: 0.6 });
    doc.font('uiSB').fontSize(10.5).fillColor(C.ink)
       .text(`₹${c.perW.toFixed(2)} per Watt   ·   ${money(Math.round(c.total / c.kwp))} per kWp installed`, M + 130, y + 12);
    y += 34;
  }
  doc.font('bodyI').fontSize(8).fillColor(C.mute)
     .text('All figures in Indian Rupees. This quotation is subject to the terms, validity and exclusions set out on the following pages.', M, y + 10, { width: w });
  y += 30;

  // savings teaser band (full detail on page 2)
  const tAnnual = num(data.annual_savings, 0) || (c.kwp ? c.kwp * 1500 * 8.5 : 0);
  const tPayback = num(data.payback_years, 0) || (c.net && tAnnual ? c.net / tAnnual : 0);
  const tLife = num(data.lifetime_savings, 0) || tAnnual * 22;
  if (tAnnual) {
    panel(doc, M, y, w, 70, C.emerD, 9);
    doc.rect(M, y, 4, 70).fill(C.gold);
    doc.font('uiSB').fontSize(8.5).fillColor(C.goldB).text('WHAT THIS INVESTMENT RETURNS', M + 20, y + 12, { characterSpacing: 1 });
    const teas = [[inrShort(tAnnual), 'Saved / year'], [(tPayback ? tPayback.toFixed(1) : '—') + ' yrs', 'Payback'], [inrShort(tLife), 'Over 25 years'], ['25+ yrs', 'System life']];
    const tw = (w - 40) / teas.length;
    teas.forEach((t, i) => {
      const x = M + 20 + i * tw;
      doc.font('uiB').fontSize(16).fillColor('#fff').text(t[0], x, y + 30, { width: tw - 10 });
      doc.font('ui').fontSize(7.3).fillColor('#bfe7d6').text(String(t[1]).toUpperCase(), x, y + 51, { width: tw - 10, characterSpacing: 0.5 });
    });
  }

  // ---- PAGE 2 — payment, savings, acceptance ----
  doc.addPage(); chrome(doc, 'Commercial Quotation');
  heading(doc, 'Terms of Business', 'Payment & Returns');
  y = doc.y + 2;

  // payment schedule — from the software if provided, else a sensible default
  eyebrow(doc, 'Payment Schedule', M, y, C.gold); y += 18;
  const pay = (Array.isArray(data.payment_schedule) && data.payment_schedule.length)
    ? data.payment_schedule.slice(0, 3).map((p) => [String(p.pct || p.percent || ''), p.label || p.stage || '', p.note || p.against || ''])
    : [
      ['30%', 'Advance', 'On order confirmation & mobilisation'],
      ['60%', 'On Supply', 'Against delivery of modules, inverters & BOS at site'],
      ['10%', 'On Commissioning', 'After successful grid synchronisation & handover'],
    ];
  const pw = (w - 2 * 14) / 3;
  pay.forEach((p, i) => {
    const x = M + i * (pw + 14);
    panel(doc, x, y, pw, 96, C.mint, 9, C.line);
    doc.rect(x, y, pw, 3).fill(i === 0 ? C.gold : C.emer);
    doc.font('uiB').fontSize(26).fillColor(C.emer).text(p[0], x + 16, y + 16);
    doc.font('uiSB').fontSize(11).fillColor(C.ink).text(p[1], x + 16, y + 54);
    doc.font('body').fontSize(8.6).fillColor(C.mute).text(p[2], x + 16, y + 70, { width: pw - 32, lineGap: 1.5 });
  });
  y += 96 + 22;

  // savings snapshot
  eyebrow(doc, 'Your Return on Investment', M, y, C.gold); y += 18;
  const annual = num(data.annual_savings, 0) || (c.kwp ? c.kwp * 1500 * 8.5 : 0);
  const payback = num(data.payback_years, 0) || (c.net && annual ? c.net / annual : 0);
  const lifetime = num(data.lifetime_savings, 0) || annual * 22;
  const roi = [
    ['Annual Savings', inrShort(annual), C.emer],
    ['Payback Period', (payback ? payback.toFixed(1) : '—') + ' yrs', C.gold],
    ['25-Year Savings', inrShort(lifetime), C.emerM],
    ['System Life', '25+ yrs', C.navy],
  ];
  const rw = (w - 3 * 12) / 4;
  roi.forEach((r, i) => {
    const x = M + i * (rw + 12);
    panel(doc, x, y, rw, 62, C.paper, 9, C.line);
    doc.rect(x, y, 4, 62).fill(r[2]);
    doc.font('ui').fontSize(7.3).fillColor(C.mute).text(String(r[0]).toUpperCase(), x + 14, y + 12, { characterSpacing: 0.5 });
    doc.font('uiB').fontSize(15).fillColor(C.ink).text(r[1], x + 14, y + 27);
  });
  y += 62 + 20;

  // makes & suppliers (from the BOQ line items where available)
  const hw2 = hardware(c.items);
  const sup = [['Solar Modules', hw2.module], ['Inverter', hw2.inverter], ['Mounting', hw2.structure]].filter((s) => s[1]);
  if (sup.length) {
    eyebrow(doc, 'Makes & Suppliers', M, y, C.gold); y += 16;
    const sw = (w - 2 * 12) / 3;
    sup.forEach((s, i) => {
      const x = M + i * (sw + 12);
      panel(doc, x, y, sw, 46, C.paper, 8, C.line);
      doc.rect(x, y, 4, 46).fill(C.emer);
      doc.font('ui').fontSize(7).fillColor(C.mute).text(String(s[0]).toUpperCase(), x + 12, y + 9, { characterSpacing: 0.6 });
      doc.font('uiSB').fontSize(8.8).fillColor(C.ink).text(s[1], x + 12, y + 20, { width: sw - 20, height: 22 });
    });
    y += 46 + 18;
  }

  // inclusions band
  panel(doc, M, y, w, 82, C.mint, 9, C.line);
  doc.font('uiSB').fontSize(8.5).fillColor(C.emer).text('SCOPE INCLUDES', M + 18, y + 14, { characterSpacing: 1 });
  const incl = 'Detailed engineering & drawings · Tier-1 modules & inverters · GI mounting structure · DC/AC cabling & earthing · Piling / civil foundations · Net-meter liaison & DISCOM approvals · Testing, commissioning & grid synchronisation · Handover documentation & O&M orientation.';
  doc.font('body').fontSize(9.4).fillColor(C.body).text(incl, M + 18, y + 30, { width: w - 36, lineGap: 3 });
  y += 82 + 16;

  // acceptance
  const half = (w - 24) / 2;
  panel(doc, M, y, w, 96, C.paper, 9, C.line);
  doc.font('uiSB').fontSize(8.5).fillColor(C.gold).text('ACCEPTANCE', M + 18, y + 14, { characterSpacing: 1 });
  doc.font('body').fontSize(9.4).fillColor(C.body).text('Kindly sign and return a copy of this quotation to confirm your acceptance and initiate the project.', M + 18, y + 28, { width: half - 20 });
  doc.moveTo(M + w - half + 10, y + 60).lineTo(M + w - 20, y + 60).lineWidth(0.8).strokeColor(C.ink).stroke();
  doc.font('ui').fontSize(8).fillColor(C.mute).text('Authorised Signature & Company Seal', M + w - half + 10, y + 66);
  doc.font('script').fontSize(18).fillColor(C.gold).text('For Arrays Ingenieria Pvt. Ltd.', M + 18, y + 58);

  // ---- PAGE 3 — terms & exclusions ----
  doc.addPage(); chrome(doc, 'Commercial Quotation');
  heading(doc, 'The Fine Print', 'Terms & Conditions');
  y = doc.y + 2;
  const terms = (data.terms && String(data.terms).trim()) ? String(data.terms).split(/\n+/) : [
    'Validity: This quotation is valid for 30 days from the date of issue, unless expressly extended in writing. Prices are firm for the validity period and exclusive of any subsequent escalation in module, inverter, steel or statutory-levy rates.',
    'Taxes: GST and any other applicable statutory taxes, cess or duties are charged at prevailing rates as on the date of invoicing, over and above the quoted value.',
    'Payment: As per the Payment Schedule overleaf. Materials remain the property of Arrays Ingenieria until payment is received in full. Delayed payments attract interest at 18% p.a.',
    'Timelines: Delivery and commissioning schedules commence from the receipt of advance, a technically clear order, and continuous unobstructed access to a ready site.',
    'Client scope: The client shall provide clear and secure site access, a shadow-free installation area, grid/DG power and water for construction, safe covered storage for materials, and statutory space for inverters and metering.',
    'Civil & electrical: Any civil works, foundations, transformer, HT/LT lines, DG synchronisation or DISCOM infrastructure beyond the stated scope are chargeable at actuals unless expressly included in the BOQ.',
    'Warranties: Solar modules carry a 25-year linear performance warranty and 12-year product warranty; inverters 5–10 years as per OEM; workmanship 5 years — each subject to the respective manufacturer’s and our standard warranty terms.',
    'Insurance & safety: Works are executed to ISO 45001 safety standards. Transit and erection-all-risk cover, where required, is arranged at actuals. The client shall insure the plant post-handover.',
    'Net metering & approvals: DISCOM liaison and net-metering application are undertaken by us; however, sanction timelines, feasibility and any deposits/charges levied by the DISCOM are beyond our control and billed at actuals.',
    'Force majeure: Neither party shall be liable for delay or non-performance due to events beyond reasonable control — weather, strikes, regulatory change, grid unavailability, or acts of God.',
    'Jurisdiction & confidentiality: This quotation is confidential, remains the property of Arrays Ingenieria Pvt. Ltd., and any dispute is subject to the jurisdiction of the courts at our registered office.',
  ];
  terms.forEach((t) => {
    doc.circle(M + 4, y + 6, 2.4).fill(C.gold);
    y = para(doc, t, M + 18, y, w - 20, { size: 9.2, lineGap: 2.6 }) + 7;
  });

  const exc = (data.exclusions && String(data.exclusions).trim()) ? String(data.exclusions).split(/\n+/) : [
    'Approach roads, boundary walls and land development beyond the demarcated area.',
    'DISCOM deposit, metering charges and any HT infrastructure unless stated.',
    'Statutory approvals fees, if any, are reimbursed at actuals.',
  ];
  y += 6;
  panel(doc, M, y, w, 20 + exc.length * 16, C.mint, 9, C.line);
  doc.rect(M, y, 4, 20 + exc.length * 16).fill(C.emer);
  doc.font('uiSB').fontSize(8.5).fillColor(C.emer).text('EXCLUSIONS', M + 18, y + 12, { characterSpacing: 1 });
  let ey = y + 28;
  exc.forEach((e) => { doc.font('body').fontSize(9).fillColor(C.body).text('•  ' + e, M + 18, ey, { width: w - 36 }); ey = doc.y + 3; });

  return doc;
}

// =============================================================================
//  BILL OF QUANTITIES
// =============================================================================
export function renderBOQ(doc, data = {}, opts = {}) {
  if (!opts.shared) { registerFonts(doc); doc.page.margins.bottom = 0; doc.on('pageAdded', () => { doc.page.margins.bottom = 0; }); }
  const W = doc.page.width, w = W - 2 * M;
  const c = commercials(data);

  chrome(doc, 'Bill of Quantities');
  heading(doc, 'Detailed Scope', 'Bill of Quantities');
  para(doc, `A component-level breakdown for the proposed ${c.kwp ? c.kwp + ' kWp ' : ''}grid-connected solar PV system — every item, quantity and rate, in full transparency.`, M, doc.y, w, { size: 10.4 });
  let y = doc.y + 14;

  // column geometry
  const cNo = M + 8, cDesc = M + 40, cUnit = M + w - 250, cQty = M + w - 190, cRate = M + w - 120, cAmt = M + w - 6;
  const headerRow = (yy) => {
    panel(doc, M, yy, w, 24, C.emer, 5);
    doc.font('uiSB').fontSize(8).fillColor('#fff');
    doc.text('#', cNo, yy + 8);
    doc.text('DESCRIPTION', cDesc, yy + 8);
    doc.text('UNIT', cUnit, yy + 8, { width: 50 });
    doc.text('QTY', cQty, yy + 8, { width: 56, align: 'right' });
    doc.text('RATE', cRate, yy + 8, { width: 56, align: 'right' });
    doc.text('AMOUNT', cAmt - 90, yy + 8, { width: 90, align: 'right' });
    return yy + 24;
  };
  y = headerRow(y);

  const items = c.items.length ? c.items : [{ item: 'System package', qty: 1, unit: 'Lot', rate: c.subtotal, amount: c.subtotal }];
  items.forEach((it, i) => {
    // measure description height
    doc.font('bodyM').fontSize(9.6);
    const descH = doc.heightOfString(String(it.item || '—'), { width: cUnit - cDesc - 10, lineGap: 1.5 });
    const rh = Math.max(30, descH + 16);
    if (y + rh > 792) { doc.addPage(); chrome(doc, 'Bill of Quantities'); y = headerRow(100); }
    if (i % 2) doc.save().rect(M, y, w, rh).fill(C.mint).restore();
    doc.font('uiSB').fontSize(9).fillColor(C.gold).text(String(i + 1), cNo, y + 9, { width: 24 });
    doc.font('bodyM').fontSize(9.6).fillColor(C.ink).text(String(it.item || '—'), cDesc, y + 8, { width: cUnit - cDesc - 10, lineGap: 1.5 });
    doc.font('ui').fontSize(9).fillColor(C.mute).text(V(it.unit, '—'), cUnit, y + 9, { width: 50 });
    doc.font('ui').fontSize(9).fillColor(C.body).text(num(it.qty, 0).toLocaleString('en-IN'), cQty, y + 9, { width: 56, align: 'right' });
    doc.font('ui').fontSize(9).fillColor(C.body).text(money(num(it.rate, 0)), cRate, y + 9, { width: 56, align: 'right' });
    doc.font('uiSB').fontSize(9.4).fillColor(C.ink).text(money(num(it.amount, 0)), cAmt - 90, y + 9, { width: 90, align: 'right' });
    doc.moveTo(M, y + rh).lineTo(M + w, y + rh).lineWidth(0.5).strokeColor(C.line).stroke();
    y += rh;
  });

  // totals
  y += 8;
  const totRow = (label, val, fill) => {
    const rh = fill ? 34 : 24;
    if (fill) panel(doc, M + w - 300, y, 300, rh, fill, 6);
    doc.font(fill ? 'uiSB' : 'ui').fontSize(fill ? 10.5 : 9.6).fillColor(fill ? '#fff' : C.body)
       .text(label, M + w - 288, y + (fill ? 11 : 6), { width: 150 });
    doc.font('uiB').fontSize(fill ? 14 : 10).fillColor(fill ? '#fff' : C.ink)
       .text(money(val), M + w - 130, y + (fill ? 10 : 6), { width: 120, align: 'right' });
    y += rh + 4;
  };
  if (y + 120 > 792) { doc.addPage(); chrome(doc, 'Bill of Quantities'); y = 110; }
  totRow('Sub-Total (Supply + Install)', c.subtotal);
  if (c.contingency) totRow('Contingency', c.contingency);
  if (c.margin) totRow('Overheads & Margin', c.margin);
  totRow('Taxable Value', c.taxable);
  totRow('GST', c.gst);
  totRow('Grand Total (incl. GST)', c.total, C.emer);

  doc.font('bodyI').fontSize(8).fillColor(C.mute)
     .text('Quantities are indicative and finalised after the detailed site survey. Tier-1 makes as per approved vendor list. E&OE.', M, Math.min(y + 6, 792), { width: w });
  return doc;
}

// =============================================================================
//  SCOPE OF WORK  (responsibilities — ours vs the client's)
//  Operator can override via data.scope_ours / data.scope_client (arrays or
//  newline-separated strings); otherwise a comprehensive default is used.
// =============================================================================
function asList(v) {
  if (Array.isArray(v)) return v.filter(Boolean).map(String);
  if (v && String(v).trim()) return String(v).split(/\n+/).map((s) => s.replace(/^[-•*]\s*/, '').trim()).filter(Boolean);
  return null;
}

export function renderScope(doc, data = {}, opts = {}) {
  if (!opts.shared) { registerFonts(doc); doc.page.margins.bottom = 0; doc.on('pageAdded', () => { doc.page.margins.bottom = 0; }); }
  const W = doc.page.width, w = W - 2 * M;
  const c = commercials(data);

  chrome(doc, 'Scope of Work');
  heading(doc, 'Responsibilities, Defined', 'Scope of Work');
  para(doc, `A clear division of responsibilities for the ${c.kwp ? c.kwp + ' kWp ' : ''}solar power plant — what Arrays Ingenieria delivers, and what we request from you — so there are no surprises on site.`, M, doc.y, w, { size: 10.4 });
  let y = doc.y + 16;

  const ours = asList(data.scope_ours) || [
    'Detailed engineering, structural & electrical design and shop drawings',
    'Geo-technical survey, shadow analysis and system sizing',
    'Supply of Tier-1 modules, inverters and BIS-grade balance-of-system',
    'Hydraulic piling, RCC foundations and hot-dip galvanised mounting structures',
    'Module mounting, DC/AC cabling, earthing and lightning protection',
    'LT/HT works, inverter & metering panel installation and terminations',
    'DISCOM liaison, net-metering application and inspection coordination',
    'Testing, grid synchronisation, commissioning and performance demonstration',
    'As-built documentation, O&M manuals and operator orientation',
    'Safety management to ISO 45001 throughout execution',
  ];
  const client = asList(data.scope_client) || [
    'Clear, secure and continuous access to a ready, level site',
    'Shadow-free installation area (roof or land) with structural adequacy',
    'Construction power and water at site free of cost',
    'Safe covered storage space for materials and equipment',
    'Statutory space and provision for inverters, panels and metering',
    'Sanctioned load details, latest electricity bill and KYC documents',
    'Any internal approvals, society/landlord NOCs or permissions',
    'DISCOM deposits, feasibility charges and statutory fees (at actuals)',
    'Timely release of payments as per the agreed schedule',
    'Insurance of the commissioned plant post-handover',
  ];

  const colW = (w - 20) / 2;
  const drawCol = (x, title, list, accent, chip) => {
    const rowH = (t) => { doc.font('body').fontSize(9.4); return doc.heightOfString(t, { width: colW - 52, lineGap: 2 }) + 12; };
    let total = 44; list.forEach((t) => { total += rowH(t); });
    panel(doc, x, y, colW, total, C.paper, 10, C.line);
    doc.roundedRect(x, y, colW, 34, 10).fill(accent);
    doc.rect(x, y + 24, colW, 10).fill(accent);
    doc.font('uiSB').fontSize(11).fillColor('#ffffff').text(title, x + 16, y + 11, { width: colW - 32 });
    let yy = y + 44;
    list.forEach((t) => {
      // check-mark chip
      doc.save().roundedRect(x + 14, yy, 16, 16, 4).fill(chip).restore();
      doc.save().lineWidth(1.6).strokeColor(accent)
         .moveTo(x + 18, yy + 8).lineTo(x + 21.5, yy + 11.5).lineTo(x + 26, yy + 5).stroke().restore();
      const h = rowH(t);
      doc.font('body').fontSize(9.4).fillColor(C.body).text(t, x + 40, yy + 1, { width: colW - 52, lineGap: 2 });
      yy += h;
    });
    return y + total;
  };
  const b1 = drawCol(M, 'Arrays Ingenieria Scope', ours, C.emer, C.mint2);
  const b2 = drawCol(M + colW + 20, 'Client Scope', client, C.gold, C.cream);
  y = Math.max(b1, b2) + 16;

  if (y < 760) {
    panel(doc, M, y, w, Math.min(48, 790 - y), C.mint, 9, C.line);
    doc.rect(M, y, 4, Math.min(48, 790 - y)).fill(C.emer);
    doc.font('bodyI').fontSize(9.5).fillColor(C.body)
       .text('Anything not expressly listed under Arrays Ingenieria Scope is deemed to be in the Client Scope or chargeable at actuals. This division may be tailored to your project by mutual written agreement.', M + 18, y + 12, { width: w - 36, lineGap: 2.5 });
  }
  return doc;
}

export default { renderQuotation, renderBOQ, renderScope };
