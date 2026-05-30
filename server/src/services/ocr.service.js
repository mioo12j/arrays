// ============================================================================
//  OCR & Extraction Engine
//  - Images  -> tesseract.js
//  - PDFs    -> pdf-parse (embedded text); falls back gracefully
//  Then a heuristic parser pulls structured fields out of the raw text:
//  reference id, amount, date, beneficiary, remarks, payment mode, network.
// ============================================================================
import fs from 'node:fs';
import path from 'node:path';

const IMAGE_EXT = new Set(['.png', '.jpg', '.jpeg', '.webp', '.bmp']);

/** Run raw text extraction for a file on disk. */
export async function extractText(filePath, mimeType = '') {
  const ext = path.extname(filePath).toLowerCase();
  try {
    if (ext === '.pdf' || mimeType === 'application/pdf') {
      return await extractPdf(filePath);
    }
    if (IMAGE_EXT.has(ext) || mimeType.startsWith('image/')) {
      return await extractImage(filePath);
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[ocr] extraction failed:', err.message);
  }
  return '';
}

async function extractPdf(filePath) {
  // Parse in-process with the modern, stateless pdfjs-dist. (Earlier we spawned a
  // child process to isolate pdf-parse's buggy old pdf.js, but pdfjs-dist is
  // stateless per getDocument — so in-process is safe and uses far less memory,
  // which matters on small cloud instances like Render's 512 MB free tier.)
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const data = new Uint8Array(fs.readFileSync(filePath));
  const doc = await pdfjs.getDocument({ data, useSystemFonts: true, isEvalSupported: false }).promise;
  let out = '';
  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p);
    const content = await page.getTextContent();
    let lastY = null;
    for (const item of content.items) {
      const y = item.transform ? item.transform[5] : null;
      if (lastY !== null && y !== null && Math.abs(y - lastY) > 2) out += '\n';
      else if (out && !out.endsWith('\n')) out += ' ';
      out += item.str;
      lastY = y;
    }
    out += '\n';
  }
  try { await doc.cleanup(); await doc.destroy(); } catch { /* ignore */ }
  return out;
}

async function extractImage(filePath) {
  const { createWorker } = await import('tesseract.js');
  const worker = await createWorker('eng');
  try {
    const { data } = await worker.recognize(filePath);
    return data.text || '';
  } finally {
    await worker.terminate();
  }
}

// ── Field parsing ──────────────────────────────────────────────────────────

const MONTHS = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
};

function toISODate(raw) {
  if (!raw) return null;
  const s = raw.trim();
  // dd/mm/yyyy or dd-mm-yyyy
  let m = s.match(/\b(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})\b/);
  if (m) {
    let [, d, mo, y] = m;
    if (y.length === 2) y = `20${y}`;
    return `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }
  // dd Mon yyyy   /  Mon dd, yyyy
  m = s.match(/\b(\d{1,2})\s*([A-Za-z]{3,})\.?\s*,?\s*(\d{2,4})\b/);
  if (m && MONTHS[m[2].slice(0, 3).toLowerCase()]) {
    let [, d, mon, y] = m;
    if (y.length === 2) y = `20${y}`;
    return `${y}-${String(MONTHS[mon.slice(0, 3).toLowerCase()]).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }
  m = s.match(/\b([A-Za-z]{3,})\.?\s+(\d{1,2})\s*,?\s*(\d{2,4})\b/);
  if (m && MONTHS[m[1].slice(0, 3).toLowerCase()]) {
    let [, mon, d, y] = m;
    if (y.length === 2) y = `20${y}`;
    return `${y}-${String(MONTHS[mon.slice(0, 3).toLowerCase()]).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }
  return null;
}

function firstMatch(text, patterns) {
  for (const re of patterns) {
    const m = text.match(re);
    if (m && m[1]) return m[1].trim();
  }
  return null;
}

/**
 * Parse structured payment fields from raw OCR/PDF text.
 * Returns best-effort values; the operator verifies/corrects them in the UI.
 */
export function parsePaymentFields(text) {
  const t = (text || '').replace(/ /g, ' ');

  // Amount: look for ₹ / Rs / INR followed by number, else any large number
  let amount = null;
  const amtMatch =
    t.match(/(?:₹|rs\.?|inr)\s*([0-9][0-9,]*\.?[0-9]{0,2})/i) ||
    t.match(/amount\s*[:\-]?\s*(?:₹|rs\.?|inr)?\s*([0-9][0-9,]*\.?[0-9]{0,2})/i);
  if (amtMatch) amount = Number(amtMatch[1].replace(/,/g, ''));

  // Reference / UTR / transaction id
  const reference = firstMatch(t, [
    /\b(?:utr|rrn|ref(?:erence)?(?:\s*(?:no|id|number))?|txn(?:\s*id)?|transaction\s*(?:id|no))\s*[:\-]?\s*([A-Za-z0-9]{6,30})/i,
    /\b([A-Z]{2,6}\d{8,20})\b/,
  ]);

  // Date
  const dateMatch = firstMatch(t, [
    /\b(?:date|on|dated|value\s*date)\s*[:\-]?\s*([0-9A-Za-z\/\-.,\s]{6,20})/i,
  ]);
  const paymentDate = toISODate(dateMatch) || toISODate(t);

  // Beneficiary / payee
  const beneficiary = firstMatch(t, [
    /\b(?:beneficiary(?:\s*name)?|payee|to|paid\s*to|credited\s*to)\s*[:\-]?\s*([A-Za-z0-9 .&'@_-]{3,60})/i,
  ]);

  // Account details (masked acc no)
  const account = firstMatch(t, [
    /\b(?:a\/c|acc(?:ount)?(?:\s*(?:no|number))?)\s*[:\-]?\s*([Xx*\d]{4,20})/i,
  ]);

  // Network / mode
  let network = null;
  if (/\brtgs\b/i.test(t)) network = 'RTGS';
  else if (/\bneft\b/i.test(t)) network = 'NEFT';
  else if (/\bimps\b/i.test(t)) network = 'IMPS';
  else if (/\bupi\b/i.test(t)) network = 'UPI';

  const modeMap = { RTGS: 'rtgs', NEFT: 'neft', IMPS: 'imps', UPI: 'upi' };
  const paymentMode = network ? modeMap[network] : null;

  // Remarks / narration / note (auto-extracted from the proof — distinct from
  // the operator's manual comment). Covers bank + UPI screenshot wordings.
  const remarks = firstMatch(t, [
    /\b(?:remarks?|narration|description|purpose|note|message|reason|paid\s*for|payment\s*for|comments?)\s*[:\-]?\s*([A-Za-z0-9 .,&'/_()-]{3,90})/i,
    /\b(?:upi\s*ref(?:erence)?(?:\s*(?:id|no))?)\s*[:\-]?\s*([A-Za-z0-9 .,&'/_-]{3,60})/i,
  ]);

  return {
    reference_id: reference,
    amount,
    payment_date: paymentDate,
    beneficiary_name: beneficiary,
    account_details: account,
    network_type: network,
    payment_mode: paymentMode,
    bank_remarks: remarks,
  };
}

/** Parse fields from an uploaded invoice (PDF/scan/Excel-as-text). */
export function parseInvoiceFields(text) {
  const t = (text || '').replace(/ /g, ' ');
  const numFrom = (re) => {
    const m = t.match(re);
    return m ? Number(m[1].replace(/,/g, '')) : null;
  };
  const invoice_number = firstMatch(t, [
    // Require a separator (: # - or the words no/number) so we don't capture the
    // bare word "INVOICE" from a heading like "TAX INVOICE".
    /\b(?:invoice|inv|bill)\s*(?:no\.?|number|#)?\s*[:#\-]\s*([A-Za-z0-9][A-Za-z0-9\/\-]{2,29})/i,
    /\b(?:invoice|inv|bill)\s*(?:no\.?|number|#)\s+([A-Za-z0-9][A-Za-z0-9\/\-]{2,29})/i,
  ]);
  const dateRaw = firstMatch(t, [
    /\b(?:invoice\s*date|date|dated)\s*[:\-]?\s*([0-9A-Za-z\/\-.,\s]{6,20})/i,
  ]);
  const taxable = numFrom(/\b(?:taxable(?:\s*value| amount)?|sub\s*total|basic)\s*[:\-]?\s*(?:₹|rs\.?|inr)?\s*([0-9][0-9,]*\.?[0-9]{0,2})/i);
  const gst = numFrom(/\b(?:gst|igst|cgst\s*\+?\s*sgst|tax)\s*(?:amount)?\s*[:\-]?\s*(?:₹|rs\.?|inr)?\s*([0-9][0-9,]*\.?[0-9]{0,2})/i);
  const total = numFrom(/\b(?:grand\s*total|total\s*(?:amount|payable|invoice value)|net\s*payable|total)\s*[:\-]?\s*(?:₹|rs\.?|inr)?\s*([0-9][0-9,]*\.?[0-9]{0,2})/i);
  return {
    invoice_number,
    issue_date: toISODate(dateRaw) || toISODate(t),
    taxable_amount: taxable,
    gst_amount: gst,
    total_amount: total,
  };
}

/** Parse fields relevant to an incoming credit/receipt. */
export function parseReceiptFields(text) {
  const base = parsePaymentFields(text);
  return {
    reference_id: base.reference_id,
    credited_amount: base.amount,
    credited_date: base.payment_date,
    account_details: base.account_details,
  };
}
