// =============================================================================
//  ARRAYS INGENIERIA — Commercial Quotation & Bill of Quantities (pdfkit)
//  Renders in the same brand identity as the proposal book (see KIT).
//  Exports renderQuotation(doc, data) and renderBOQ(doc, data), each of which
//  appends its pages to a shared doc (first page on the current page, then
//  addPage between its own pages) so they can be combined into one PDF.
// =============================================================================
import { KIT, registerFonts } from './proposal-pdf.service.js';

const { C, M, chrome, heading, para, panel, eyebrow, triTick, drawImg, logo,
        photo, V, num, inr, inrShort } = KIT;

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
  const rows = [
    ['Client', data.client_name || data.client_full_name || data.customer_name],
    ['Project', data.project_name || data.site_name],
    ['Location', data.location || data.site],
    ['Capacity', num(data.capacity_kw, 0) ? num(data.capacity_kw, 0) + ' kWp' : null],
    ['Reference', data.quote_number],
    ['Date', new Date(data.issue_date || data.date || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })],
    ['Valid Until', data.valid_until ? new Date(data.valid_until).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '30 days from issue'],
  ].filter((r) => r[1]);
  const rh = 26, h = rows.length * rh + 16;
  panel(doc, x, y, w, h, C.mint, 9, C.line);
  doc.rect(x, y, 4, h).fill(C.gold);
  rows.forEach((r, i) => {
    const yy = y + 12 + i * rh;
    doc.font('ui').fontSize(7.5).fillColor(C.mute).text(String(r[0]).toUpperCase(), x + 18, yy, { characterSpacing: 0.8, width: 90 });
    doc.font('uiSB').fontSize(9.5).fillColor(C.ink).text(V(r[1]), x + 112, yy - 1, { width: w - 128 });
    if (i < rows.length - 1) doc.moveTo(x + 18, yy + rh - 6).lineTo(x + w - 16, yy + rh - 6).lineWidth(0.5).strokeColor(C.line).stroke();
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
       .text(label, M + 16, y + (opt.big ? 14 : 8), { width: w - 220 });
    doc.font(opt.big ? 'HB' : 'uiSB').fontSize(opt.big ? 18 : 10.5).fillColor(opt.big ? '#fff' : (opt.accent || C.ink))
       .text(money(val), M + w - 200, y + (opt.big ? 11 : 7), { width: 184, align: 'right' });
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
    doc.font('uiSB').fontSize(9).fillColor(C.gold).text('EFFECTIVE PRICE', M + 18, y + 12, { characterSpacing: 0.6 });
    doc.font('bodyM').fontSize(11).fillColor(C.ink)
       .text(`₹${c.perW.toFixed(2)} per Watt   ·   ${money(Math.round(c.total / c.kwp))} per kWp installed`, M + 130, y + 11);
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
      doc.font('H').fontSize(19).fillColor('#fff').text(t[0], x, y + 28, { width: tw - 10 });
      doc.font('ui').fontSize(7.3).fillColor('#bfe7d6').text(String(t[1]).toUpperCase(), x, y + 50, { width: tw - 10, characterSpacing: 0.5 });
    });
  }

  // ---- PAGE 2 — payment, savings, acceptance ----
  doc.addPage(); chrome(doc, 'Commercial Quotation');
  heading(doc, 'Terms of Business', 'Payment & Returns');
  y = doc.y + 2;

  // payment schedule
  eyebrow(doc, 'Payment Schedule', M, y, C.gold); y += 18;
  const pay = [
    ['30%', 'Advance', 'On order confirmation & mobilisation'],
    ['60%', 'On Supply', 'Against delivery of modules, inverters & BOS at site'],
    ['10%', 'On Commissioning', 'After successful grid synchronisation & handover'],
  ];
  const pw = (w - 2 * 14) / 3;
  pay.forEach((p, i) => {
    const x = M + i * (pw + 14);
    panel(doc, x, y, pw, 96, C.mint, 9, C.line);
    doc.rect(x, y, pw, 3).fill(i === 0 ? C.gold : C.emer);
    doc.font('H').fontSize(30).fillColor(C.emer).text(p[0], x + 16, y + 14);
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
    doc.font('H').fontSize(19).fillColor(C.ink).text(r[1], x + 14, y + 25);
  });
  y += 62 + 22;

  // inclusions band
  panel(doc, M, y, w, 92, C.mint, 9, C.line);
  doc.font('uiSB').fontSize(8.5).fillColor(C.emer).text('SCOPE INCLUDES', M + 18, y + 14, { characterSpacing: 1 });
  const incl = 'Detailed engineering & drawings · Tier-1 modules & inverters · GI mounting structure · DC/AC cabling & earthing · Piling / civil foundations · Net-meter liaison & DISCOM approvals · Testing, commissioning & grid synchronisation · Handover documentation & O&M orientation.';
  doc.font('body').fontSize(9.6).fillColor(C.body).text(incl, M + 18, y + 30, { width: w - 36, lineGap: 3 });
  y += 92 + 18;

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
    'Prices are firm for the validity period stated overleaf and are exclusive of any price escalation in modules, inverters or statutory levies thereafter.',
    'GST and applicable taxes are charged at prevailing rates as on the date of invoicing.',
    'Delivery & commissioning timelines commence from receipt of advance, technically clear order and unobstructed site access.',
    'Client shall provide clear site access, shadow-free installation area, electricity, water and safe storage for materials at site.',
    'Any civil works, transformer, HT/LT lines or DISCOM charges beyond the stated scope are billed at actuals unless expressly included.',
    'Warranties: modules 25-year linear performance, inverters as per OEM, workmanship 5 years — subject to the manufacturer’s and our standard terms.',
    'Force majeure events (weather, strikes, regulatory changes, grid unavailability) are excluded from timeline commitments.',
    'This quotation is confidential and remains the property of Arrays Ingenieria Pvt. Ltd.',
  ];
  terms.forEach((t) => {
    doc.circle(M + 4, y + 7, 2.5).fill(C.gold);
    y = para(doc, t, M + 18, y, w - 20, { size: 9.8, lineGap: 3.2 }) + 9;
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
    doc.font(fill ? 'HB' : 'uiSB').fontSize(fill ? 15 : 10).fillColor(fill ? '#fff' : C.ink)
       .text(money(val), M + w - 130, y + (fill ? 9 : 6), { width: 120, align: 'right' });
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

export default { renderQuotation, renderBOQ };
