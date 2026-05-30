// ============================================================================
//  Export service — professional Excel (exceljs) & PDF (pdfkit) generators.
//  PDF engine: content-aware column widths, text WRAPPING (no truncation),
//  variable row height, branded header/footer on every page, page numbers,
//  totals row. Nothing is ever cut off — it wraps or spills to a new page.
// ============================================================================
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { company } from '../config/company.js';

const BRAND = company.brandColor || '1d4ed8';
const HBRAND = '#' + BRAND;
const INK = '#0f172a';
const MUTE = '#64748b';
const LINE = '#e2e8f0';
const ZEBRA = '#f3f6fb';

const money = (n) =>
  new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(n || 0));

const safeName = (f) =>
  String(f || 'report').replace(/[^\x20-\x7E]/g, '').replace(/["\\]/g, '').replace(/\s+/g, '-').trim() || 'report';

const cellText = (row, col) => {
  const v = row[col.key];
  if (v == null || v === '') return '';
  return col.money ? money(v) : String(v);
};

// ─────────────────────────────────────────────────────────────────────────────
//  EXCEL
// ─────────────────────────────────────────────────────────────────────────────
export async function streamExcel(res, { title, columns, rows, filename, totals }) {
  const wb = new ExcelJS.Workbook();
  wb.creator = company.name;
  const ws = wb.addWorksheet((title || 'Report').slice(0, 30));

  ws.mergeCells(1, 1, 1, columns.length);
  const co = ws.getCell(1, 1);
  co.value = company.name;
  co.font = { size: 15, bold: true, color: { argb: 'FF' + BRAND } };
  ws.getRow(1).height = 22;

  ws.mergeCells(2, 1, 2, columns.length);
  const sub = ws.getCell(2, 1);
  sub.value = `${title}   •   GSTIN ${company.gstin}   •   ${company.email}`;
  sub.font = { size: 9, color: { argb: 'FF64748B' } };

  const headerRowIdx = 4;
  ws.getRow(headerRowIdx).values = columns.map((c) => c.header);
  ws.getRow(headerRowIdx).eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + BRAND } };
    cell.alignment = { vertical: 'middle', wrapText: true };
    cell.border = { bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } } };
  });
  columns.forEach((c, i) => {
    ws.getColumn(i + 1).width = c.xlsWidth || c.width || 18;
    ws.getColumn(i + 1).alignment = { wrapText: true, horizontal: c.money ? 'right' : 'left', vertical: 'top' };
    if (c.money) ws.getColumn(i + 1).numFmt = '#,##0.00';
  });

  rows.forEach((r, idx) => {
    const row = ws.addRow(columns.map((c) => r[c.key] ?? ''));
    if (idx % 2 === 1) row.eachCell((cell) => { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } }; });
  });

  if (totals) {
    const tr = ws.addRow(columns.map((c) => (c.key in totals ? totals[c.key] : (c === columns[0] ? 'TOTAL' : ''))));
    tr.eachCell((cell) => { cell.font = { bold: true }; cell.border = { top: { style: 'thin', color: { argb: 'FF94A3B8' } } }; });
  }

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="${safeName(filename)}.xlsx"`);
  await wb.xlsx.write(res);
  res.end();
}

// ─────────────────────────────────────────────────────────────────────────────
//  PDF
// ─────────────────────────────────────────────────────────────────────────────
export function streamPdf(res, { title, subtitle, columns, rows, filename, totals }) {
  const landscape = columns.length > 5;
  const doc = new PDFDocument({ size: 'A4', layout: landscape ? 'landscape' : 'portrait', margin: 32, bufferPages: true });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${safeName(filename)}.pdf"`);
  doc.pipe(res);

  const M = doc.page.margins.left;
  const pageW = doc.page.width;
  const contentW = pageW - M * 2;
  const HEADER_H = 96;
  const FOOTER_H = 38;
  const PAD = 8;            // horizontal cell padding (total)
  const VPAD = 5;          // vertical cell padding (top)
  const FONT = 8;
  const HFONT = 8.5;
  const bottomLimit = () => doc.page.height - doc.page.margins.bottom - FOOTER_H;

  // ── Content-aware column widths ──────────────────────────────────────────
  // Measure the natural width each column needs (header + a sample of rows),
  // cap any single column so it can't dominate, then fit to the page width.
  doc.font('Helvetica-Bold').fontSize(HFONT);
  const headerW = columns.map((c) => doc.widthOfString(String(c.header)) + PAD + 6);
  const sample = rows.length > 300 ? rows.filter((_, k) => k % Math.ceil(rows.length / 300) === 0) : rows;
  doc.font('Helvetica').fontSize(FONT);
  const natural = columns.map((c, i) => {
    let w = headerW[i];
    for (const r of sample) {
      const tw = doc.widthOfString(cellText(r, c)) + PAD;
      if (tw > w) w = tw;
    }
    return w + 4; // small safety buffer so exact-fit text never wraps
  });
  // Split columns into NARROW (dates, amounts, refs, short labels) which must
  // never wrap, and WIDE/flex (remarks, comments, names) which absorb wrapping.
  // This keeps a date like "02/05/2026" or an amount on a single line while long
  // free-text fields wrap at word boundaries instead.
  const FIXED_MAX = 118;
  const FLEX_MIN = 70;
  const fixedIdx = [];
  const flexIdx = [];
  natural.forEach((w, i) => (w <= FIXED_MAX ? fixedIdx : flexIdx).push(i));

  let widths = natural.slice();
  const fixedSum = fixedIdx.reduce((s, i) => s + natural[i], 0);

  if (flexIdx.length) {
    const remaining = contentW - fixedSum;
    if (remaining >= flexIdx.length * FLEX_MIN) {
      // Fixed columns keep their exact natural width (no wrap on dates/amounts).
      // Flex columns: give each FLEX_MIN, then split the leftover by natural size
      // so the row fills the page exactly without shrinking fixed columns.
      fixedIdx.forEach((i) => { widths[i] = natural[i]; });
      const leftover = remaining - flexIdx.length * FLEX_MIN;
      const flexNat = flexIdx.reduce((s, i) => s + natural[i], 0) || 1;
      flexIdx.forEach((i) => { widths[i] = FLEX_MIN + leftover * (natural[i] / flexNat); });
    } else {
      // Too many/large columns: shrink everything proportionally as a last resort.
      const want = fixedSum + flexIdx.length * FLEX_MIN;
      const scale = contentW / want;
      fixedIdx.forEach((i) => { widths[i] = natural[i] * scale; });
      flexIdx.forEach((i) => { widths[i] = FLEX_MIN * scale; });
    }
  } else {
    const sum = widths.reduce((a, b) => a + b, 0);
    const extra = contentW - sum;
    widths = widths.map((w) => w + (extra > 0 ? extra / widths.length : extra * (w / sum)));
  }
  const colX = [];
  let acc = M;
  widths.forEach((w) => { colX.push(acc); acc += w; });
  const align = (c) => c.align || (c.money ? 'right' : 'left');

  function drawPageHeader() {
    doc.rect(0, 0, pageW, HEADER_H).fill(HBRAND);
    doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(16).text(company.pdfName, M, 16, { width: contentW - 150, lineBreak: false });
    doc.font('Helvetica').fontSize(7.5).fillColor('#dbeafe')
      .text(`GSTIN: ${company.gstin}    CIN: ${company.cin}`, M, 38, { width: contentW - 150, lineBreak: false })
      .text(company.address, M, 49, { width: contentW - 150, lineBreak: false })
      .text(`${company.email}    ${company.certifications.join('  ·  ')}`, M, 60, { width: contentW - 150, lineBreak: false });
    doc.font('Helvetica-Bold').fontSize(13).fillColor('#ffffff').text(title, M, 20, { width: contentW, align: 'right', lineBreak: false });
    doc.font('Helvetica').fontSize(8).fillColor('#dbeafe')
      .text(subtitle || `Generated ${new Date().toLocaleDateString('en-GB')}`, M, 40, { width: contentW, align: 'right', lineBreak: false });
    return HEADER_H + 12;
  }

  function drawTableHeader(y) {
    // header height adapts to wrapped header labels
    doc.font('Helvetica-Bold').fontSize(HFONT);
    let hh = FONT + VPAD * 2;
    columns.forEach((c, i) => {
      const h = doc.heightOfString(String(c.header), { width: widths[i] - PAD, align: align(c) }) + VPAD * 2;
      if (h > hh) hh = h;
    });
    doc.rect(M, y, contentW, hh).fill(HBRAND);
    doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(HFONT);
    columns.forEach((c, i) => {
      doc.text(String(c.header), colX[i] + PAD / 2, y + VPAD, { width: widths[i] - PAD, align: align(c) });
    });
    return y + hh;
  }

  function rowHeight(r) {
    doc.font('Helvetica').fontSize(FONT);
    let hh = FONT + VPAD * 2;
    columns.forEach((c, i) => {
      const h = doc.heightOfString(cellText(r, c), { width: widths[i] - PAD, align: align(c) }) + VPAD * 2;
      if (h > hh) hh = h;
    });
    return Math.max(18, hh);
  }

  let y = drawPageHeader();
  y = drawTableHeader(y);

  rows.forEach((r, idx) => {
    const rh = rowHeight(r);
    if (y + rh > bottomLimit()) {
      doc.addPage();
      y = drawPageHeader();
      y = drawTableHeader(y);
    }
    if (idx % 2 === 1) doc.rect(M, y, contentW, rh).fill(ZEBRA);
    doc.fillColor(INK).font('Helvetica').fontSize(FONT);
    columns.forEach((c, i) => {
      doc.text(cellText(r, c), colX[i] + PAD / 2, y + VPAD, { width: widths[i] - PAD, align: align(c) });
    });
    doc.moveTo(M, y + rh).lineTo(M + contentW, y + rh).strokeColor(LINE).lineWidth(0.5).stroke();
    y += rh;
  });

  if (totals) {
    const tr = {};
    columns.forEach((c, i) => { tr[c.key] = c.key in totals ? totals[c.key] : (i === 0 ? 'TOTAL' : ''); });
    const rh = Math.max(20, rowHeight(tr));
    if (y + rh > bottomLimit()) { doc.addPage(); y = drawPageHeader(); y = drawTableHeader(y); }
    doc.rect(M, y, contentW, rh).fillAndStroke('#e2e8f0', '#cbd5e1');
    doc.fillColor(INK).font('Helvetica-Bold').fontSize(HFONT);
    columns.forEach((c, i) => {
      let v = c.key in totals ? (c.money ? money(totals[c.key]) : totals[c.key]) : (i === 0 ? 'TOTAL' : '');
      doc.text(String(v), colX[i] + PAD / 2, y + VPAD, { width: widths[i] - PAD, align: align(c) });
    });
    y += rh;
  }

  // ── Footer + page numbers on every page ──────────────────────────────────
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    const fy = doc.page.height - doc.page.margins.bottom - FOOTER_H + 8;
    doc.moveTo(M, fy).lineTo(M + contentW, fy).strokeColor(LINE).lineWidth(0.5).stroke();
    doc.font('Helvetica').fontSize(7).fillColor(MUTE);
    doc.text(`${company.name}  •  ${company.bank.name} A/c ${company.bank.accountNumber}`, M, fy + 6, { width: contentW * 0.7, lineBreak: false });
    doc.text(`Page ${i - range.start + 1} of ${range.count}`, M, fy + 6, { width: contentW, align: 'right', lineBreak: false });
    doc.text(`${company.address}  •  ${company.email}`, M, fy + 17, { width: contentW, lineBreak: false });
  }

  doc.flushPages();
  doc.end();
}
