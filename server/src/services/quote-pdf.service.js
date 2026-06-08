// Branded, client-ready quotation PDF for ARRAYS INGENIERIA.
import PDFDocument from 'pdfkit';
import { company } from '../config/company.js';

const BRAND = '#' + (company.brandColor || '1d4ed8');
const INK = '#0f172a';
const MUTE = '#64748b';
const LINE = '#e2e8f0';
// pdfkit's standard Helvetica (WinAnsi) has no ₹ glyph (it prints as "¹"); use
// an ASCII "Rs " prefix that renders correctly on every platform.
const inr = (n) => 'Rs ' + new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(Number(n || 0));
const TYPE_LABEL = {
  residential: 'Residential Rooftop', rooftop: 'Rooftop Solar', commercial: 'Commercial',
  industrial: 'Industrial', institutional: 'Institutional', government: 'Government',
  ground_mount: 'Ground Mount', utility: 'Utility-Scale',
};

export function streamQuotePdf(res, quote) {
  const doc = new PDFDocument({ size: 'A4', margin: 40, bufferPages: true });
  const safe = String(quote.quote_number || 'quote').replace(/[^\x20-\x7E]/g, '').replace(/["\\]/g, '');
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${safe}.pdf"`);
  doc.pipe(res);

  const M = doc.page.margins.left;
  const W = doc.page.width - M * 2;
  const bottom = () => doc.page.height - 70;
  const ensure = (need) => { if (doc.y + need > bottom()) doc.addPage(); };

  // ── Header band (compact company name) ────────────────────────────────────
  doc.rect(0, 0, doc.page.width, 96).fill(BRAND);
  doc.fillColor('#fff').font('Helvetica-Bold').fontSize(19).text(company.pdfName, M, 20, { width: W - 150 });
  doc.font('Helvetica').fontSize(7.5).fillColor('#dbeafe')
    .text(company.tagline, M, 44)
    .text(`GSTIN ${company.gstin}  |  CIN ${company.cin}`, M, 56)
    .text(company.address, M, 67, { width: W - 150 })
    .text(`${company.email}  |  ${company.certifications.join(' · ')}`, M, 78, { width: W - 150 });
  doc.font('Helvetica-Bold').fontSize(22).fillColor('#fff').text('QUOTATION', M, 24, { width: W, align: 'right' });
  doc.font('Helvetica').fontSize(9).fillColor('#dbeafe')
    .text(quote.quote_number + (quote.version > 1 ? `  (Rev ${quote.version})` : ''), M, 50, { width: W, align: 'right' });
  doc.y = 112;

  // ── Meta grid ─────────────────────────────────────────────────────────────
  const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');
  const meta = [
    ['Client', quote.client_name || '—'], ['Issue Date', fmtDate(quote.issue_date)],
    ['Project', quote.project_name || '—'], ['Valid Until', fmtDate(quote.valid_until)],
    ['Site', quote.site_name || '—'], ['System Size', `${quote.capacity_kw} kW`],
    ['Type', TYPE_LABEL[quote.project_type] || quote.project_type], ['Per Watt', quote.per_watt ? inr(quote.per_watt) : '—'],
  ];
  let my = doc.y;
  doc.fontSize(8.5);
  for (let i = 0; i < meta.length; i += 2) {
    metaCell(doc, M, my, meta[i][0], meta[i][1], W / 2 - 6);
    if (meta[i + 1]) metaCell(doc, M + W / 2 + 6, my, meta[i + 1][0], meta[i + 1][1], W / 2 - 6);
    my += 17;
  }
  doc.y = my + 8;

  // ── BOQ table ─────────────────────────────────────────────────────────────
  section(doc, 'Scope & Bill of Quantities');
  const cols = [
    { h: 'Item', w: 0.36, k: 'item', a: 'left' },
    { h: 'Qty', w: 0.12, k: 'qty', a: 'right' },
    { h: 'Unit', w: 0.10, k: 'unit', a: 'left' },
    { h: 'Rate', w: 0.20, k: 'rate', a: 'right', m: true },
    { h: 'Amount', w: 0.22, k: 'amount', a: 'right', m: true },
  ];
  drawTableHeader(doc, cols, W, M);
  doc.font('Helvetica').fontSize(8.5).fillColor(INK);
  (quote.line_items || []).forEach((row, idx) => {
    if (doc.y + 16 > bottom()) { doc.addPage(); drawTableHeader(doc, cols, W, M); }
    const y = doc.y;
    if (idx % 2 === 0) doc.rect(M, y, W, 16).fill('#f1f5f9');
    let cx = M;
    cols.forEach((c) => {
      let v = row[c.k];
      v = c.m ? inr(v) : c.k === 'qty' ? new Intl.NumberFormat('en-IN').format(Number(v || 0)) : String(v ?? '');
      doc.fillColor(INK).font('Helvetica').fontSize(8.5).text(v, cx + 5, y + 4, { width: c.w * W - 10, height: 12, align: c.a, ellipsis: true, lineBreak: false });
      cx += c.w * W;
    });
    doc.y = y + 16;
  });

  // ── Commercial summary ────────────────────────────────────────────────────
  ensure(150);
  doc.moveDown(0.6);
  const boxX = M + W * 0.5;
  const boxW = W * 0.5;
  let ty = doc.y;
  const totals = [
    ['Subtotal', quote.subtotal], ['Contingency', quote.contingency_amount],
    ['Margin', quote.margin_amount], ['Taxable Value', quote.taxable_amount], ['GST', quote.gst_amount],
  ];
  doc.fontSize(9);
  totals.forEach((t) => {
    doc.fillColor(MUTE).font('Helvetica').text(t[0], boxX, ty, { width: boxW * 0.5 });
    doc.fillColor(INK).font('Helvetica').text(inr(t[1]), boxX + boxW * 0.5, ty, { width: boxW * 0.5, align: 'right' });
    ty += 15;
  });
  doc.rect(boxX, ty + 2, boxW, 22).fill(BRAND);
  doc.fillColor('#fff').font('Helvetica-Bold').fontSize(11)
    .text('Grand Total (incl. GST)', boxX + 6, ty + 8, { width: boxW * 0.55 })
    .text(inr(quote.total_amount), boxX, ty + 8, { width: boxW - 6, align: 'right' });
  ty += 30;

  // Subsidy section (if any)
  if (Number(quote.subsidy_amount) > 0) {
    doc.fontSize(9);
    [['Gross Cost', quote.total_amount], ['Govt. Subsidy', -quote.subsidy_amount], ['Net Effective Cost', quote.net_cost]].forEach((t, i) => {
      doc.fillColor(i === 1 ? '#059669' : MUTE).font(i === 2 ? 'Helvetica-Bold' : 'Helvetica').text(t[0], boxX, ty, { width: boxW * 0.5 });
      doc.fillColor(i === 2 ? INK : (i === 1 ? '#059669' : INK)).font(i === 2 ? 'Helvetica-Bold' : 'Helvetica').text(inr(t[1]), boxX + boxW * 0.5, ty, { width: boxW * 0.5, align: 'right' });
      ty += 15;
    });
  }

  // Cost-breakdown mini bar chart on the left
  costBreakdownChart(doc, M, doc.y, W * 0.46, quote.line_items || []);
  doc.y = Math.max(doc.y, ty) + 10;

  // ── Solar benefits / ROI ──────────────────────────────────────────────────
  if (Number(quote.annual_savings) > 0) {
    ensure(120);
    section(doc, 'Why Solar — Value & Return on Investment');
    const cards = [
      ['Annual Savings', inr(quote.annual_savings)],
      ['Payback Period', `${quote.payback_years} yrs`],
      ['25-Year Savings', inr(quote.lifetime_savings)],
      ['Net Investment', inr(quote.net_cost || quote.total_amount)],
    ];
    const cw = W / 4;
    const cy = doc.y;
    cards.forEach((c, i) => {
      const x = M + i * cw;
      doc.roundedRect(x + 3, cy, cw - 6, 44, 6).fill('#f1f5f9');
      doc.fillColor(MUTE).font('Helvetica').fontSize(7.5).text(c[0].toUpperCase(), x + 9, cy + 8, { width: cw - 18 });
      doc.fillColor(BRAND).font('Helvetica-Bold').fontSize(12).text(c[1], x + 9, cy + 20, { width: cw - 18 });
    });
    doc.y = cy + 54;
    doc.font('Helvetica').fontSize(8).fillColor(MUTE).text(
      'Solar adoption reduces grid dependency and energy cost, provides 25+ years of clean generation, ' +
      'lowers carbon footprint, and delivers a strong long-term return after a short payback period.',
      M, doc.y, { width: W });
    doc.moveDown(0.6);
  }

  // ── Terms / scope / exclusions ────────────────────────────────────────────
  [['Technical Scope', quote.notes], ['Commercial Terms', quote.terms || defaultTerms()], ['Exclusions', quote.exclusions || defaultExclusions()]]
    .forEach(([h, body]) => {
      if (!body) return;
      ensure(60);
      section(doc, h);
      doc.font('Helvetica').fontSize(8).fillColor('#334155').text(body, M, doc.y, { width: W });
      doc.moveDown(0.6);
    });

  // ── Signature block ───────────────────────────────────────────────────────
  ensure(70);
  doc.moveDown(1);
  const sy = doc.y;
  doc.font('Helvetica').fontSize(8).fillColor(MUTE).text(`For ${company.pdfName}`, M + W - 200, sy, { width: 200, align: 'right' });
  doc.moveTo(M + W - 200, sy + 36).lineTo(M + W, sy + 36).strokeColor('#94a3b8').lineWidth(0.6).stroke();
  doc.fillColor(INK).font('Helvetica-Bold').fontSize(8.5).text('Authorized Signatory', M + W - 200, sy + 40, { width: 200, align: 'right' });

  // ── Footer on every page ──────────────────────────────────────────────────
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    doc.page.margins.bottom = 0;   // footer sits in the margin band — stop pdfkit from auto-paginating
    const fy = doc.page.height - 50;
    doc.moveTo(M, fy).lineTo(M + W, fy).strokeColor(LINE).lineWidth(0.5).stroke();
    doc.font('Helvetica').fontSize(7).fillColor(MUTE)
      .text(`${company.bank.name}  •  A/c ${company.bank.accountNumber}  •  ${company.bank.branch}`, M, fy + 6, { width: W * 0.8 })
      .text(`Page ${i - range.start + 1} of ${range.count}`, M, fy + 6, { width: W, align: 'right' })
      .text(`Prices valid until the date stated. System-generated by ${company.shortName} ERP.`, M, fy + 17, { width: W });
  }
  doc.flushPages();
  doc.end();
}

function metaCell(doc, x, y, label, value, w) {
  doc.fillColor('#94a3b8').font('Helvetica').fontSize(7.5).text(label.toUpperCase(), x, y, { width: w * 0.38 });
  doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(8.5).text(String(value), x + w * 0.38, y - 1, { width: w * 0.62 });
}
function section(doc, title) {
  const M = doc.page.margins.left;
  const W = doc.page.width - M * 2;
  doc.font('Helvetica-Bold').fontSize(11).fillColor(BRAND).text(title, M, doc.y);
  doc.moveTo(M, doc.y + 2).lineTo(M + W, doc.y + 2).strokeColor(LINE).lineWidth(0.6).stroke();
  doc.moveDown(0.5);
}
function drawTableHeader(doc, cols, W, M) {
  const y = doc.y;
  doc.rect(M, y, W, 18).fill(BRAND);
  doc.fillColor('#fff').font('Helvetica-Bold').fontSize(8.5);
  let cx = M;
  cols.forEach((c) => { doc.text(c.h, cx + 5, y + 5, { width: c.w * W - 10, align: c.a, lineBreak: false }); cx += c.w * W; });
  doc.y = y + 18;
}
function costBreakdownChart(doc, x, y, w, items) {
  const top = [...items].filter((i) => i.amount > 0).sort((a, b) => b.amount - a.amount).slice(0, 6);
  if (!top.length) return;
  const max = Math.max(...top.map((i) => i.amount));
  doc.font('Helvetica-Bold').fontSize(9).fillColor(BRAND).text('Cost Breakdown', x, y);
  let by = y + 16;
  doc.fontSize(7).font('Helvetica');
  top.forEach((i) => {
    doc.fillColor('#475569').text(i.item, x, by, { width: w, ellipsis: true });
    by += 10;
    const bw = Math.max(2, (i.amount / max) * w);
    doc.rect(x, by, bw, 7).fill(BRAND);
    doc.fillColor('#475569').fontSize(6.5).text(inr(i.amount), x + bw + 4, by, { width: 80 });
    by += 13;
    doc.fontSize(7);
  });
  doc.y = Math.max(doc.y, by);
}
function defaultTerms() {
  return '1. Payment: 30% advance, 60% against material delivery, 10% on commissioning. ' +
    '2. Delivery: 4–6 weeks from PO & advance. 3. Warranty: OEM (modules 25 yrs performance, inverter 5 yrs). ' +
    '4. Prices exclusive of statutory levies introduced after the quotation date.';
}
function defaultExclusions() {
  return 'Net-metering liaisoning & DISCOM fees, civil work beyond standard scope, DG/grid synchronization, ' +
    'storage/batteries, and any work not explicitly listed above.';
}
