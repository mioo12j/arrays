// ============================================================================
//  Standard Tax Invoice PDF — A4, branded, print-ready. Pure local document
//  (no IRN / e-invoice). Reuses the branding theme + bilingual font engine.
// ============================================================================
import fs from 'node:fs';
import path from 'node:path';
import PDFDocument from 'pdfkit';
import { company } from '../config/company.js';
import { UPLOAD_ROOT } from '../middleware/upload.js';
import { applyPdfLang } from './pdf-i18n.js';

const M = 40;
const SOFT = '#f8fafc';
let BRAND = '#1d4ed8', INK = '#0f172a', MUTE = '#64748b', FAINT = '#94a3b8', LINE = '#e2e8f0';
let HEADER_BG = '#1d4ed8', HEADER_TX = '#ffffff', SUBTX = '#dbeafe', THEAD_BG = '#1d4ed8', THEAD_TX = '#ffffff', WM = '#1d4ed8';
const validHex = (c) => (/^#?[0-9a-fA-F]{6}$/.test(String(c || '').trim()) ? (String(c).trim()[0] === '#' ? String(c).trim() : '#' + String(c).trim()) : null);
const mix2 = (a, b, t) => { const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16); const ch = (x, s) => (x >> s) & 255; const m = (s) => Math.round(ch(pa, s) + (ch(pb, s) - ch(pa, s)) * t); return '#' + [m(16), m(8), m(0)].map((v) => v.toString(16).padStart(2, '0')).join(''); };
function setTheme(b = {}) {
  BRAND = validHex(b.pdfColor) || '#1d4ed8'; INK = validHex(b.textColor) || '#0f172a'; MUTE = validHex(b.mutedColor) || '#64748b';
  FAINT = mix2(MUTE, '#ffffff', 0.35); LINE = validHex(b.lineColor) || '#e2e8f0';
  HEADER_BG = validHex(b.headerBgColor) || BRAND; HEADER_TX = validHex(b.headerTextColor) || '#ffffff'; SUBTX = mix2(HEADER_TX, HEADER_BG, 0.28);
  THEAD_BG = validHex(b.tableHeadBgColor) || BRAND; THEAD_TX = validHex(b.tableHeadTextColor) || '#ffffff'; WM = validHex(b.watermarkColor) || BRAND;
}

const inr = (v) => 'Rs ' + Number(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const dmy = (d) => { if (!d) return '—'; const t = new Date(d); return Number.isNaN(t.getTime()) ? String(d) : `${String(t.getDate()).padStart(2, '0')}/${String(t.getMonth() + 1).padStart(2, '0')}/${t.getFullYear()}`; };
function brandFile(b, k) { const name = b?.[k]; if (!name) return null; const p = path.join(UPLOAD_ROOT, name); return fs.existsSync(p) ? p : null; }
function fitImage(doc, file, x, y, w, h) { if (!file) return false; try { doc.image(file, x, y, { fit: [w, h], align: 'center', valign: 'center' }); return true; } catch { return false; } }
const toBuffer = (doc) => new Promise((res, rej) => { const c = []; doc.on('data', (d) => c.push(d)); doc.on('end', () => res(Buffer.concat(c))); doc.on('error', rej); });
function box(doc, x, y, w, h, fill) { doc.save().roundedRect(x, y, w, h, 4).fillAndStroke(fill || '#ffffff', LINE).restore(); }

// Indian rupees → words (for the amount line).
function rupeesInWords(num) {
  num = Math.round(Number(num || 0));
  if (!num) return 'Zero Rupees Only';
  const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const two = (n) => (n < 20 ? a[n] : b[Math.floor(n / 10)] + (n % 10 ? ' ' + a[n % 10] : ''));
  const three = (n) => (n >= 100 ? a[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + two(n % 100) : '') : two(n));
  let out = '';
  const crore = Math.floor(num / 1e7); num %= 1e7;
  const lakh = Math.floor(num / 1e5); num %= 1e5;
  const thousand = Math.floor(num / 1e3); num %= 1e3;
  if (crore) out += three(crore) + ' Crore ';
  if (lakh) out += two(lakh) + ' Lakh ';
  if (thousand) out += two(thousand) + ' Thousand ';
  if (num) out += three(num);
  return out.trim() + ' Rupees Only';
}

function party(doc, x, y, w, label, name, lines) {
  const h = 86; box(doc, x, y, w, h, SOFT);
  doc.fontSize(8).fillColor(BRAND).font('Helvetica-Bold').text(label, x + 8, y + 6, { width: w - 16, height: 10, ellipsis: true });
  doc.fillColor(INK).fontSize(9.5).font('Helvetica-Bold').text(name || '—', x + 8, y + 18, { width: w - 16, height: 12, ellipsis: true });
  doc.font('Helvetica').fontSize(7.8).fillColor(MUTE);
  let ly = y + 32;
  (lines || []).filter(Boolean).slice(0, 5).forEach((ln) => { doc.text(ln, x + 8, ly, { width: w - 16, height: 9, ellipsis: true }); ly += 11; });
  doc.fillColor(INK); return h;
}

export async function invoicePdf(inv, branding = {}, lang = 'en') {
  setTheme(branding);
  const doc = new PDFDocument({ size: 'A4', margin: M, bufferPages: true });
  applyPdfLang(doc, lang);
  const out = toBuffer(doc);
  const W = doc.page.width, CW = W - 2 * M;
  const wm = branding.watermark || (inv.status === 'draft' ? 'DRAFT' : inv.status === 'cancelled' ? 'CANCELLED' : '');
  const items = inv.items || [];

  // ── Header band ────────────────────────────────────────────────────────────
  const T = 18;                                  // breathing room above the header band
  doc.rect(0, T, W, 88).fill(HEADER_BG);
  let tx = M;
  if (fitImage(doc, brandFile(branding, 'logoFile'), M, T + 14, 44, 44)) tx = M + 54;
  const titleX = W - 250, hdrW = titleX - tx - 10;
  doc.fillColor(HEADER_TX).font('Helvetica-Bold').fontSize(14).text(branding.headerText || company.pdfName, tx, T + 11, { width: hdrW, height: 16, ellipsis: true });
  doc.font('Helvetica').fontSize(7.3).fillColor(SUBTX)
    .text(company.address, tx, T + 29, { width: hdrW, height: 17, ellipsis: true })
    .text(`GSTIN ${company.gstin}  •  ${branding.contactInfo || company.email}`, tx, T + 49, { width: hdrW, height: 9, ellipsis: true });
  doc.fillColor(HEADER_TX).font('Helvetica-Bold').fontSize(15).text('TAX INVOICE', titleX, T + 16, { width: 210, align: 'right' });
  doc.font('Helvetica').fontSize(7).fillColor(SUBTX).text(String(inv.status || '').toUpperCase(), titleX, T + 40, { width: 210, align: 'right' });
  doc.fillColor(INK); doc.y = T + 100;

  if (wm) { const sx = doc.x, sy = doc.y; doc.save().rotate(-45, { origin: [W / 2, doc.page.height / 2] }); doc.fontSize(74).fillColor(WM).fillOpacity(0.05).text(wm, 0, doc.page.height / 2 - 44, { width: W, align: 'center', lineBreak: false }); doc.fillOpacity(1).restore(); doc.x = sx; doc.y = sy; }

  // ── Meta bar ───────────────────────────────────────────────────────────────
  const my = doc.y; box(doc, M, my, CW, 34, SOFT);
  const cell = (label, value, x, w) => {
    doc.fontSize(6.8).fillColor(FAINT).font('Helvetica-Bold').text(String(label).toUpperCase(), x + 8, my + 6, { width: w - 12, height: 9, ellipsis: true });
    doc.fontSize(9).fillColor(INK).font('Helvetica-Bold').text(String(value ?? '—'), x + 8, my + 17, { width: w - 12, height: 11, ellipsis: true });
  };
  const c4 = CW / 4;
  cell('Invoice No', inv.invoice_number, M, c4);
  cell('Date', dmy(inv.issue_date), M + c4, c4);
  cell('Due Date', inv.due_date ? dmy(inv.due_date) : '—', M + 2 * c4, c4);
  cell('Place of Supply', inv.place_of_supply || '—', M + 3 * c4, c4);
  doc.y = my + 44;

  // ── Seller + Buyer ─────────────────────────────────────────────────────────
  const py = doc.y, half = (CW - 10) / 2;
  party(doc, M, py, half, 'SELLER', company.pdfName, [`GSTIN: ${company.gstin}`, company.address, company.email]);
  party(doc, M + half + 10, py, half, 'BILL TO', inv.customer_name || inv.client_name, [
    inv.customer_gstin || inv.client_gstin ? `GSTIN: ${inv.customer_gstin || inv.client_gstin}` : 'Unregistered',
    inv.billing_address, inv.shipping_address && inv.shipping_address !== inv.billing_address ? `Ship to: ${inv.shipping_address}` : null,
  ]);
  doc.y = py + 96;

  // ── Item table ─────────────────────────────────────────────────────────────
  const cols = [
    { t: '#', w: 0.04, a: 'left' }, { t: 'Description', w: 0.30, a: 'left' }, { t: 'HSN/SAC', w: 0.10, a: 'left' },
    { t: 'Qty', w: 0.08, a: 'right' }, { t: 'Unit', w: 0.07, a: 'left' }, { t: 'Rate', w: 0.11, a: 'right' },
    { t: 'Taxable', w: 0.12, a: 'right' }, { t: 'GST%', w: 0.06, a: 'right' }, { t: 'Amount', w: 0.12, a: 'right' },
  ];
  const bottomLimit = () => doc.page.height - 70;
  const drawHead = (yy) => {
    doc.rect(M, yy, CW, 17).fill(THEAD_BG);
    doc.fillColor(THEAD_TX).fontSize(7.3).font('Helvetica-Bold');
    let cx = M; cols.forEach((c) => { doc.text(c.t, cx + 4, yy + 5, { width: c.w * CW - 8, align: c.a, lineBreak: false }); cx += c.w * CW; });
    return yy + 17;
  };
  let ty = drawHead(doc.y);
  const rowH = 16;
  items.forEach((it, i) => {
    if (ty + rowH > bottomLimit()) { doc.addPage(); ty = drawHead(M + 10); }
    if (i % 2) doc.rect(M, ty, CW, rowH).fill(SOFT);
    const cells = [String(it.line_no || i + 1), it.description || '—', it.hsn || '—',
      String(it.quantity ?? ''), it.unit || '', inr(it.rate), inr(it.taxable_value), `${Number(it.gst_rate || 0)}%`, inr(it.amount)];
    doc.fillColor(INK).font('Helvetica').fontSize(7.3);
    let cx = M; cols.forEach((c, k) => { doc.text(cells[k], cx + 4, ty + 4.5, { width: c.w * CW - 8, align: c.a, ellipsis: true, lineBreak: false }); cx += c.w * CW; });
    ty += rowH;
  });
  doc.moveTo(M, ty).lineTo(W - M, ty).strokeColor(LINE).lineWidth(0.6).stroke();
  doc.y = ty + 10;

  // ── Tax summary (right) + amount in words (left) ───────────────────────────
  const blockY = doc.y, sumW = 220, sumX = W - M - sumW, leftW = sumX - M - 10;
  box(doc, sumX, blockY, sumW, 96, SOFT);
  const sline = (label, value, i) => {
    const ry = blockY + 8 + i * 13;
    doc.fontSize(8).font('Helvetica').fillColor(MUTE).text(label, sumX + 10, ry, { width: sumW * 0.5, lineBreak: false });
    doc.font('Helvetica-Bold').fillColor(INK).text(inr(value), sumX + sumW * 0.45, ry, { width: sumW * 0.55 - 12, align: 'right', lineBreak: false });
  };
  sline('Taxable Value', inv.taxable_amount, 0);
  sline('CGST', inv.cgst_amount, 1); sline('SGST', inv.sgst_amount, 2); sline('IGST', inv.igst_amount, 3);
  doc.rect(sumX, blockY + 72, sumW, 24).fill(THEAD_BG);
  doc.fillColor(THEAD_TX).font('Helvetica-Bold').fontSize(9.5)
    .text('Total', sumX + 10, blockY + 80, { width: sumW * 0.5, lineBreak: false })
    .text(inr(inv.total_amount), sumX + sumW * 0.45, blockY + 80, { width: sumW * 0.55 - 10, align: 'right', lineBreak: false });

  box(doc, M, blockY, leftW, 96, '#ffffff');
  doc.font('Helvetica-Bold').fontSize(7.5).fillColor(BRAND).text('Amount in words', M + 8, blockY + 8);
  doc.font('Helvetica').fontSize(8).fillColor(INK).text(rupeesInWords(inv.total_amount), M + 8, blockY + 20, { width: leftW - 16 });
  if (inv.notes) { doc.font('Helvetica-Bold').fontSize(7.5).fillColor(BRAND).text('Notes', M + 8, blockY + 52); doc.font('Helvetica').fontSize(7.5).fillColor(MUTE).text(inv.notes, M + 8, blockY + 63, { width: leftW - 16, height: 28, ellipsis: true }); }
  doc.y = blockY + 106;

  // ── Signature ───────────────────────────────────────────────────────────────
  if (doc.y + 80 > bottomLimit()) { doc.addPage(); doc.y = M + 10; }
  const sy = doc.y;
  fitImage(doc, brandFile(branding, 'stampFile'), W - M - 230, sy, 56, 48);
  fitImage(doc, brandFile(branding, 'signatureFile'), W - M - 160, sy, 110, 44);
  doc.font('Helvetica').fontSize(8).fillColor(MUTE).text(`For ${branding.headerText || company.pdfName}`, W - M - 200, sy - 2, { width: 200, align: 'right', lineBreak: false });
  doc.moveTo(W - M - 200, sy + 50).lineTo(W - M, sy + 50).strokeColor(FAINT).lineWidth(0.6).stroke();
  doc.fillColor(INK).font('Helvetica-Bold').fontSize(8.5).text('Authorised Signatory', W - M - 200, sy + 54, { width: 200, align: 'right' });
  // bank details
  doc.font('Helvetica').fontSize(7.5).fillColor(MUTE).text(
    `Bank: ${company.bank?.name || ''}  •  A/c ${company.bank?.accountNumber || ''}  •  IFSC ${company.bank?.ifsc || ''}  •  ${company.bank?.branch || ''}`,
    M, sy + 4, { width: W - M - 240 });
  doc.y = sy + 72;

  // ── Terms + footer ──────────────────────────────────────────────────────────
  if (doc.y + 22 < bottomLimit()) {
    doc.fontSize(7).fillColor(MUTE).font('Helvetica').text(
      branding.terms || 'Goods/services once sold are subject to our standard terms. Please pay by the due date. This is a computer-generated tax invoice.',
      M, doc.y, { width: CW });
  }
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i); doc.page.margins.bottom = 0;
    const fy = doc.page.height - 40;
    doc.moveTo(M, fy).lineTo(W - M, fy).strokeColor(LINE).lineWidth(0.5).stroke();
    doc.font('Helvetica').fontSize(7).fillColor(MUTE)
      .text(branding.footerText || `${company.name} • Tax Invoice`, M, fy + 6, { width: CW * 0.8, lineBreak: false })
      .text(`Page ${i - range.start + 1} of ${range.count}`, M, fy + 6, { width: CW, align: 'right', lineBreak: false });
  }
  doc.flushPages(); doc.end();
  return out;
}
