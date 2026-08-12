// =============================================================================
//  ARRAYS INGENIERIA — Commercial Quotation & Bill of Quantities (pdfkit)
//  Renders in the same brand identity as the proposal book (see KIT).
//  Exports renderQuotation(doc, data) and renderBOQ(doc, data), each of which
//  appends its pages to a shared doc (first page on the current page, then
//  addPage between its own pages) so they can be combined into one PDF.
// =============================================================================
import { KIT, registerFonts } from './proposal-pdf.service.js';

const { C, M, chrome, heading, para, panel, eyebrow, triTick, drawImg, logo,
        photo, V, num, inr, inrShort, addressLines, titleCaseCover, model } = KIT;

// ---- shared helpers ---------------------------------------------------------
function money(n) { return n || n === 0 ? '₹' + Math.round(n).toLocaleString('en-IN') : '—'; }

// Split "Title: body" into parts; no colon => body only.
function parseTitleBody(s) {
  const str = String(s).trim();
  const m = str.match(/^([^:\n]{2,44}):\s*([\s\S]+)$/);
  return m ? { title: m[1].trim(), body: m[2].trim() } : { title: '', body: str };
}
// Accept structured [{title,body}], ["Title: body"], or a newline string.
function normalizeTerms(t) {
  if (Array.isArray(t)) {
    const a = t.map((x) => (typeof x === 'string' ? parseTitleBody(x)
      : { title: String(x.title || '').trim(), body: String(x.body || x.text || x.description || '').trim() }))
      .filter((x) => x.body || x.title);
    return a.length ? a : null;
  }
  if (t && String(t).trim()) {
    const a = String(t).split(/\n{1,}/).map((l) => l.trim()).filter(Boolean).map(parseTitleBody);
    return a.length ? a : null;
  }
  return null;
}
// Payment milestones: [{pct,stage,against}] in any common key spelling.
function normalizeSchedule(s) {
  if (!Array.isArray(s) || !s.length) return null;
  const a = s.map((p) => ({
    pct: String(p.pct ?? p.percent ?? p.percentage ?? '').replace(/%*$/, '') + '%',
    stage: String(p.stage ?? p.label ?? p.milestone ?? '').trim(),
    against: String(p.against ?? p.note ?? p.description ?? '').trim(),
  })).filter((p) => p.stage || p.against);
  return a.length ? a : null;
}

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

  // commercial offer table
  eyebrow(doc, 'Commercial Offer', M, y, C.gold); y += 18;
  const line = (label, val, opt = {}) => {
    // row height grows with the (possibly multi-line) label
    doc.font(opt.big ? 'uiSB' : 'ui').fontSize(opt.big ? 11 : 10);
    const lh = doc.heightOfString(String(label), { width: w - 230 });
    const rh = opt.big ? Math.max(40, lh + 22) : Math.max(26, lh + 14);
    if (opt.fill) panel(doc, M, y, w, rh, opt.fill, 6);
    const tv = y + (rh - lh) / 2;                    // vertically centre the text
    doc.font(opt.big ? 'uiSB' : 'ui').fontSize(opt.big ? 11 : 10).fillColor(opt.big ? '#fff' : C.body)
       .text(String(label), M + 16, tv, { width: w - 230 });
    doc.font(opt.big ? 'uiB' : 'uiSB').fontSize(opt.big ? 16 : 10.5).fillColor(opt.big ? '#fff' : (opt.accent || C.ink))
       .text(money(val), M + w - 200, y + (rh - (opt.big ? 16 : 11)) / 2, { width: 184, align: 'right' });
    if (!opt.fill && !opt.big) doc.moveTo(M, y + rh).lineTo(M + w, y + rh).lineWidth(0.5).strokeColor(C.line).stroke();
    y += rh;
  };
  // Client-facing: a single system price (never expose internal contingency/margin).
  // The offer description is operator-defined.
  line(data.commercial_scope || data.supply_description || 'Design, Engineering, Supply, Installation, Testing & Commissioning of Solar PV System', c.taxable);
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
       .text(`₹ ${c.perW.toFixed(2)} per Watt  (inclusive of GST)`, M + 130, y + 12);
    y += 34;
  }
  doc.font('bodyI').fontSize(8).fillColor(C.mute)
     .text('All figures in Indian Rupees. This quotation is subject to the terms, validity and exclusions set out on the following pages.', M, y + 10, { width: w });
  y += 30;

  // savings teaser band (full detail on page 2) — shares the proposal's model
  const mm = model(data);
  if (mm.save1) {
    panel(doc, M, y, w, 70, C.emerD, 9);
    doc.rect(M, y, 4, 70).fill(C.gold);
    doc.font('uiSB').fontSize(8.5).fillColor(C.goldB).text('WHAT THIS INVESTMENT RETURNS', M + 20, y + 12, { characterSpacing: 1 });
    const teas = [[inrShort(mm.save1), 'Saved / year'], [mm.paybackYrs.toFixed(1) + ' yrs', 'Payback'], [inrShort(mm.cum25), 'Over 25 years'], ['25+ yrs', 'System life']];
    const tw = (w - 40) / teas.length;
    teas.forEach((t, i) => {
      const x = M + 20 + i * tw;
      doc.font('uiB').fontSize(16).fillColor('#fff').text(t[0], x, y + 30, { width: tw - 10 });
      doc.font('ui').fontSize(7.3).fillColor('#bfe7d6').text(String(t[1]).toUpperCase(), x, y + 51, { width: tw - 10, characterSpacing: 0.5 });
    });
  }

  // page-flow guard — starts a fresh page (with chrome) when a block won't fit
  const bottom = doc.page.height - 46;
  const flowY = (yy, need) => (yy + need > bottom ? (doc.addPage(), chrome(doc, 'Commercial Quotation'), 110) : yy);

  // ---- PAGE 2 — payment schedule, returns, acceptance ----
  doc.addPage(); chrome(doc, 'Commercial Quotation');
  heading(doc, 'Terms of Business', 'Payment & Returns');
  y = doc.y + 2;

  // payment schedule — operator-defined milestones (any number)
  eyebrow(doc, 'Payment Schedule', M, y, C.gold); y += 18;
  const sched = normalizeSchedule(data.payment_schedule) || [
    { pct: '30%', stage: 'Advance', against: 'Along with the confirmed Purchase Order' },
    { pct: '60%', stage: 'On Material Readiness', against: 'Against readiness of modules, inverter & balance-of-system for dispatch (prior to delivery)' },
    { pct: '5%', stage: 'On Installation', against: 'On completion of mechanical installation at site' },
    { pct: '5%', stage: 'On Commissioning', against: 'On successful testing, commissioning & handover' },
  ];
  sched.forEach((s) => {
    doc.font('body').fontSize(9);
    const bodyH = doc.heightOfString(s.against || '', { width: w - 120, lineGap: 1.6 });
    const rh = Math.max(42, bodyH + 30);
    y = flowY(y, rh + 8);
    panel(doc, M, y, w, rh, C.mint, 8, C.line);
    doc.rect(M, y, 4, rh).fill(C.gold);
    doc.font('uiB').fontSize(19).fillColor(C.emer).text(s.pct, M + 16, y + (rh - 19) / 2, { width: 66 });
    doc.font('uiSB').fontSize(10.5).fillColor(C.ink).text(s.stage, M + 92, y + 10, { width: w - 108 });
    doc.font('body').fontSize(9).fillColor(C.body).text(s.against, M + 92, y + 25, { width: w - 108, lineGap: 1.6 });
    y += rh + 8;
  });
  // proforma-invoice note
  const piText = 'All payments are strictly against our Proforma Invoice (PI). The GST tax invoice is issued only after the corresponding payment is realised in our account. Materials remain our property until paid in full.';
  doc.font('body').fontSize(9.2);
  const piTextH = doc.heightOfString(piText, { width: w - 36, lineGap: 2 });
  const piH = piTextH + 40;                          // eyebrow (24) + text + bottom pad
  y = flowY(y, piH + 8);
  panel(doc, M, y, w, piH, C.cream, 8);
  doc.rect(M, y, 4, piH).fill(C.gold);
  doc.font('uiSB').fontSize(8).fillColor(C.gold).text('PAYMENT AGAINST PROFORMA INVOICE', M + 18, y + 13, { characterSpacing: 0.8 });
  doc.font('body').fontSize(9.2).fillColor(C.body).text(piText, M + 18, y + 26, { width: w - 36, lineGap: 2 });
  y += piH + 18;

  // return on investment + disclaimer
  y = flowY(y, 120);
  eyebrow(doc, 'Your Return on Investment', M, y, C.gold); y += 18;
  const roi = [
    ['Annual Savings', inrShort(mm.save1), C.emer],
    ['Payback Period', mm.paybackYrs.toFixed(1) + ' yrs', C.gold],
    ['25-Year Savings', inrShort(mm.cum25), C.emerM],
    ['Net Investment', inrShort(mm.netInvest), C.navy],
  ];
  const rw = (w - 3 * 12) / 4;
  roi.forEach((r, i) => {
    const x = M + i * (rw + 12);
    panel(doc, x, y, rw, 62, C.paper, 9, C.line);
    doc.rect(x, y, 4, 62).fill(r[2]);
    doc.font('ui').fontSize(7.3).fillColor(C.mute).text(String(r[0]).toUpperCase(), x + 14, y + 12, { characterSpacing: 0.5 });
    doc.font('uiB').fontSize(15).fillColor(C.ink).text(r[1], x + 14, y + 27);
  });
  y += 62 + 8;
  doc.font('bodyI').fontSize(7.6).fillColor(C.mute)
     .text(`Indicative only — calculated at ₹${mm.tariff}/unit with ~${Math.round(mm.gen1).toLocaleString('en-IN')} units/year (3.5% tariff escalation, 0.6%/yr degradation). Not a guarantee; actual savings vary with consumption, weather, tariff revisions and DISCOM policy.`, M, y, { width: w, lineGap: 1.5 });
  y = doc.y + 14;

  // scope of work (Arrays + client) — the only place scope appears
  y = scopeAndExclusions(doc, data, y, flowY);

  // acceptance
  y = flowY(y, 100);
  const half = (w - 24) / 2;
  panel(doc, M, y, w, 96, C.paper, 9, C.line);
  doc.font('uiSB').fontSize(8.5).fillColor(C.gold).text('ACCEPTANCE', M + 18, y + 14, { characterSpacing: 1 });
  doc.font('body').fontSize(9.4).fillColor(C.body).text('Kindly sign and return a copy of this quotation to confirm your acceptance and initiate the project.', M + 18, y + 28, { width: half - 20 });
  doc.moveTo(M + w - half + 10, y + 60).lineTo(M + w - 20, y + 60).lineWidth(0.8).strokeColor(C.ink).stroke();
  doc.font('ui').fontSize(8).fillColor(C.mute).text('Authorised Signature & Company Seal', M + w - half + 10, y + 66);
  doc.font('script').fontSize(18).fillColor(C.gold).text('For Arrays Ingenieria Pvt. Ltd.', M + 18, y + 58);

  // ---- PAGE 3 — terms, exclusions, company & bank details ----
  doc.addPage(); chrome(doc, 'Commercial Quotation');
  heading(doc, 'Please Read Carefully', 'Terms & Conditions');
  y = doc.y + 2;
  const terms = normalizeTerms(data.terms) || defaultTerms(data);
  terms.forEach((t) => {
    doc.font('body').fontSize(9.2);
    const bodyH = doc.heightOfString(t.body, { width: w - 24, lineGap: 2.6 });
    const need = (t.title ? 15 : 0) + bodyH + 12;
    y = flowY(y, need);
    doc.circle(M + 4, y + 6, 2.4).fill(C.gold);
    if (t.title) { doc.font('uiSB').fontSize(9.8).fillColor(C.ink).text(t.title, M + 18, y, { width: w - 24 }); y = doc.y + 2; }
    doc.font('body').fontSize(9.2).fillColor(C.body).text(t.body, M + 18, y, { width: w - 24, lineGap: 2.6 });
    y = doc.y + 9;
  });

  // company GST + bank + delay-payment details (exclusions now sit with scope)
  y = companyBankBlock(doc, data, y, flowY);
  autoGenNote(doc, Math.min(y + 8, doc.page.height - 54), 'quotation');

  return doc;
}

// Default, PI-centric terms (used until the operator supplies their own).
function defaultTerms(data) {
  const delay = data.delay_interest || '18% per annum';
  return [
    { title: 'Payment', body: 'All payments shall be made strictly against the Proforma Invoice (PI) issued by us. The GST tax invoice is raised only after the corresponding payment is realised in our account. Materials remain our property until payment is received in full.' },
    { title: 'Delay in Payment', body: `Payments delayed beyond the due date attract interest at ${delay}, and may lead to suspension of works and revision of the delivery schedule.` },
    { title: 'GST & Taxes', body: 'GST is charged extra at prevailing rates as applicable on the date of invoicing, over and above the quoted value.' },
    { title: 'Module & Inverter Warranty', body: 'Solar modules and inverters carry the warranty of the respective manufacturer / brand; the performance warranty applicable is that of the modules supplied. Modules and inverter are supplied as per the requirement of the client.' },
    { title: 'Workmanship Warranty', body: 'Our installation carries a workmanship warranty as mutually agreed, subject to normal use and the manufacturer’s terms.' },
    { title: 'Delivery & Timeline', body: 'Delivery and commissioning commence from receipt of the advance, a technically clear order and continuous unobstructed access to a ready site.' },
    { title: 'Client Scope', body: 'The client shall provide secure site access, a shadow-free installation area, construction power & water, safe covered storage, and statutory space for inverters and metering.' },
    { title: 'Force Majeure', body: 'Neither party shall be liable for delay or non-performance due to events beyond reasonable control — weather, strikes, regulatory change, grid unavailability or acts of God.' },
    { title: 'Jurisdiction & Confidentiality', body: 'This quotation is confidential, remains our property, and any dispute is subject to the jurisdiction of the courts at our registered office.' },
  ];
}

// Scope of Work (Arrays + client) followed by Exclusions — rendered inside the
// Commercial Quotation. This is the only place scope appears.
function scopeAndExclusions(doc, data, y, flowY) {
  const W = doc.page.width, w = W - 2 * M;
  const ours = asList(data.scope_ours) || [
    'Design, engineering, drawings & single-line diagram (SLD)',
    'Supply of solar modules, inverter & balance-of-system as per client requirement',
    'Module mounting structure, DC/AC cabling, earthing & lightning protection',
    'Installation, testing & commissioning',
    'DISCOM liaison & net-metering application',
    'Datasheets, test certificates & O&M orientation',
  ];
  const clientScope = asList(data.scope_client) || [
    'Clear, secure, shadow-free site with structural adequacy',
    'Construction power & water and safe storage at site',
    'Sanctioned load details, latest electricity bill & KYC',
    'DISCOM deposits, feasibility & statutory fees (at actuals)',
    'Timely release of payments as per the agreed schedule',
  ];
  const colW = (w - 16) / 2;
  const measure = (list) => { let h = 42; list.forEach((t) => { doc.font('body').fontSize(9); h += Math.max(18, doc.heightOfString(t, { width: colW - 52, lineGap: 1.8 }) + 10); }); return h; };
  const scopeH = Math.max(measure(ours), measure(clientScope));
  y = flowY(y, scopeH + 40);
  eyebrow(doc, 'Scope of Work', M, y, C.gold); y += 16;
  const col = (x, title, list, accent, chip) => {
    panel(doc, x, y, colW, scopeH, C.paper, 10, C.line);
    doc.save().roundedRect(x, y, colW, 30, 10).fill(accent).restore();
    doc.rect(x, y + 20, colW, 10).fill(accent);
    doc.font('uiSB').fontSize(10).fillColor('#ffffff').text(title, x + 14, y + 9, { width: colW - 28 });
    let yy = y + 40;
    list.forEach((t) => {
      doc.save().roundedRect(x + 12, yy, 14, 14, 4).fill(chip).restore();
      doc.save().lineWidth(1.5).strokeColor(accent).moveTo(x + 15.5, yy + 7).lineTo(x + 18.5, yy + 10).lineTo(x + 23, yy + 3.5).stroke().restore();
      const h = doc.font('body').fontSize(9).heightOfString(t, { width: colW - 52, lineGap: 1.8 });
      doc.font('body').fontSize(9).fillColor(C.body).text(t, x + 34, yy, { width: colW - 52, lineGap: 1.8 });
      yy += Math.max(18, h + 10);
    });
  };
  col(M, 'Arrays Ingenieria Scope', ours, C.emer, C.mint2);
  col(M + colW + 16, 'Client Scope', clientScope, C.gold, C.cream);
  y += scopeH + 14;

  const exc = asList(data.exclusions) || [
    'Anything not expressly listed under our Scope of Work, or agreed by us in writing, is deemed to be in the client’s scope and is chargeable at actuals.',
    'DISCOM deposits, metering charges, feasibility and any statutory / approval fees are at actuals.',
  ];
  doc.font('body').fontSize(9);
  const excBody = 30 + exc.reduce((s, e) => s + Math.max(14, doc.heightOfString('•  ' + e, { width: w - 36 })) + 4, 0);
  y = flowY(y, excBody);
  panel(doc, M, y, w, excBody, C.mint, 9, C.line);
  doc.rect(M, y, 4, excBody).fill(C.emer);
  doc.font('uiSB').fontSize(8.5).fillColor(C.emer).text('EXCLUSIONS', M + 18, y + 12, { characterSpacing: 1 });
  let ey = y + 28;
  exc.forEach((e) => { doc.font('body').fontSize(9).fillColor(C.body).text('•  ' + e, M + 18, ey, { width: w - 36 }); ey = doc.y + 4; });
  return y + excBody + 12;
}

// GST / bank / delay-payment block on the last quotation page.
function companyBankBlock(doc, data, y, flowY) {
  const W = doc.page.width, w = W - 2 * M;
  y = flowY(y, 128);
  eyebrow(doc, 'Payment & Company Details', M, y, C.gold); y += 16;
  const colW = (w - 16) / 2, bh = 108;
  // left — company / GST
  panel(doc, M, y, colW, bh, C.paper, 9, C.line);
  doc.rect(M, y, colW, 3).fill(C.gold);
  doc.font('uiSB').fontSize(8).fillColor(C.emer).text('SUPPLIER', M + 14, y + 12, { characterSpacing: 0.8 });
  const supplierRows = [
    ['Company', 'Arrays Ingenieria Pvt. Ltd.'],
    ['GSTIN', data.company_gstin || '—'],
    ['PAN', data.company_pan || '—'],
    ['Registered Office', data.company_address || 'Arrays Ingenieria Pvt. Ltd.'],
  ];
  let ly = y + 28;
  supplierRows.forEach((r) => {
    doc.font('ui').fontSize(7.2).fillColor(C.mute).text(String(r[0]).toUpperCase(), M + 14, ly, { characterSpacing: 0.5 });
    doc.font('uiSB').fontSize(9).fillColor(C.ink).text(String(r[1]), M + 14, ly + 9, { width: colW - 28 });
    ly = doc.y + 4;
  });
  // right — bank
  const bx = M + colW + 16;
  panel(doc, bx, y, colW, bh, C.paper, 9, C.line);
  doc.rect(bx, y, colW, 3).fill(C.emer);
  doc.font('uiSB').fontSize(8).fillColor(C.emer).text('BANK DETAILS FOR PAYMENT', bx + 14, y + 12, { characterSpacing: 0.8 });
  const bankRows = [
    ['Bank / Branch', [data.bank_name, data.bank_branch].filter(Boolean).join(', ') || '—'],
    ['Account Name', data.bank_account_name || 'Arrays Ingenieria Pvt. Ltd.'],
    ['Account No.', data.bank_account_no || '—'],
    ['IFSC', data.bank_ifsc || '—'],
  ];
  let by = y + 28;
  bankRows.forEach((r) => {
    doc.font('ui').fontSize(7.2).fillColor(C.mute).text(String(r[0]).toUpperCase(), bx + 14, by, { characterSpacing: 0.5 });
    doc.font('uiSB').fontSize(9).fillColor(C.ink).text(String(r[1]), bx + 14, by + 9, { width: colW - 28 });
    by = doc.y + 4;
  });
  y += bh + 10;
  // delay-payment note
  doc.font('bodyI').fontSize(8.4).fillColor(C.mute)
     .text(`Delay in payment beyond the agreed due date attracts interest at ${data.delay_interest || '18% per annum'}. All payments strictly against Proforma Invoice.`, M, y, { width: w, lineGap: 1.5 });
  return doc.y + 6;
}

// A small closing notice for standalone transactional documents.
function autoGenNote(doc, y, kind = 'document') {
  const W = doc.page.width, w = W - 2 * M;
  if (y > doc.page.height - 60) y = doc.page.height - 60;
  doc.moveTo(M, y).lineTo(W - M, y).lineWidth(0.5).strokeColor(C.line).stroke();
  doc.font('ui').fontSize(7).fillColor(C.mute)
     .text(`This is a computer-generated ${kind} produced by the Arrays Ingenieria system and is valid without a physical signature. Figures are indicative and subject to the terms stated herein.`,
           M, y + 6, { width: w, align: 'center', lineGap: 1.3 });
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

  // Client-facing prices: fold internal contingency/overheads/margin into each
  // component's rate so the line items themselves total the quoted price. We
  // never print contingency or margin as separate lines to the client.
  const rawItems = c.items.length ? c.items : null;
  const factor = (rawItems && c.subtotal > 0) ? c.taxable / c.subtotal : 1;
  const items = rawItems || [{ item: 'Complete Solar PV System — Supply, Installation & Commissioning', qty: 1, unit: 'Lot', rate: c.taxable, amount: c.taxable }];
  items.forEach((it, i) => {
    // measure description height
    doc.font('bodyM').fontSize(9.6);
    const descH = doc.heightOfString(String(it.item || '—'), { width: cUnit - cDesc - 10, lineGap: 1.5 });
    const rh = Math.max(30, descH + 16);
    if (y + rh > 792) { doc.addPage(); chrome(doc, 'Bill of Quantities'); y = headerRow(100); }
    if (i % 2) doc.save().rect(M, y, w, rh).fill(C.mint).restore();
    const dispRate = num(it.rate, 0) * factor, dispAmount = num(it.amount, 0) * factor;
    doc.font('uiSB').fontSize(9).fillColor(C.gold).text(String(i + 1), cNo, y + 9, { width: 24 });
    doc.font('bodyM').fontSize(9.6).fillColor(C.ink).text(String(it.item || '—'), cDesc, y + 8, { width: cUnit - cDesc - 10, lineGap: 1.5 });
    doc.font('ui').fontSize(9).fillColor(C.mute).text(V(it.unit, '—'), cUnit, y + 9, { width: 50 });
    doc.font('ui').fontSize(9).fillColor(C.body).text(num(it.qty, 0).toLocaleString('en-IN'), cQty, y + 9, { width: 56, align: 'right' });
    doc.font('ui').fontSize(9).fillColor(C.body).text(money(dispRate), cRate, y + 9, { width: 56, align: 'right' });
    doc.font('uiSB').fontSize(9.4).fillColor(C.ink).text(money(dispAmount), cAmt - 90, y + 9, { width: 90, align: 'right' });
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
  totRow('Sub-Total (before GST)', c.taxable);
  totRow(`GST${c.taxable ? ` (${Math.round((c.gst / c.taxable) * 100)}%)` : ''}`, c.gst);
  totRow('Grand Total (incl. GST)', c.total, C.emer);

  doc.font('bodyI').fontSize(8).fillColor(C.mute)
     .text('Quantities, makes and specifications are as per the requirement of the client. Errors & omissions excepted.', M, Math.min(y + 6, 792), { width: w });
  autoGenNote(doc, Math.min(y + 24, doc.page.height - 54), 'bill of quantities');
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
    y += Math.min(48, 790 - y);
  }
  autoGenNote(doc, Math.min(y + 16, doc.page.height - 54), 'scope of work');
  return doc;
}

export default { renderQuotation, renderBOQ, renderScope };
