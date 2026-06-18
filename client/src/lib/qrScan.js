// ============================================================================
//  Read the e-invoice QR straight from the government's signed PDF (or a QR
//  image / screenshot) — no manual scanning or typing. Renders the PDF in the
//  browser (pdfjs) and decodes the QR (jsQR), then pulls the IRN out of the
//  signed QR's JWT payload.
// ============================================================================
import jsQR from 'jsqr';
import * as pdfjs from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

function imageDataFromCanvas(canvas) {
  return canvas.getContext('2d', { willReadFrequently: true }).getImageData(0, 0, canvas.width, canvas.height);
}

async function imageDataFromImageFile(file) {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url; });
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
    canvas.getContext('2d').drawImage(img, 0, 0);
    return [imageDataFromCanvas(canvas)];
  } finally { URL.revokeObjectURL(url); }
}

async function imageDatasFromPdf(file) {
  const buf = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: buf }).promise;
  const out = [];
  for (let p = 1; p <= Math.min(pdf.numPages, 2); p++) {
    const page = await pdf.getPage(p);
    const viewport = page.getViewport({ scale: 3 });   // high res so a small QR is readable
    const canvas = document.createElement('canvas');
    canvas.width = Math.ceil(viewport.width); canvas.height = Math.ceil(viewport.height);
    await page.render({ canvasContext: canvas.getContext('2d', { willReadFrequently: true }), viewport }).promise;
    out.push(imageDataFromCanvas(canvas));
  }
  return out;
}

// Scan a file (PDF or image) → the QR's raw string (the SignedQRCode), or null.
export async function scanQrFromFile(file) {
  const datas = file.type === 'application/pdf' || /\.pdf$/i.test(file.name)
    ? await imageDatasFromPdf(file)
    : await imageDataFromImageFile(file);
  for (const d of datas) {
    const r = jsQR(d.data, d.width, d.height, { inversionAttempts: 'attemptBoth' });
    if (r && r.data) return r.data;
  }
  return null;
}

const b64url = (s) => { let t = s.replace(/-/g, '+').replace(/_/g, '/'); while (t.length % 4) t += '='; return atob(t); };

// The signed QR is a JWS (hdr.payload.sig). The payload's `data` claim is the
// JSON of the QR fields (Irn, IrnDt, …). Pull IRN + date out for auto-fill.
export function parseSignedQr(qr) {
  try {
    const parts = String(qr).split('.');
    if (parts.length < 2) return {};
    const payload = JSON.parse(b64url(parts[1]));
    const data = typeof payload.data === 'string' ? JSON.parse(payload.data) : (payload.data || payload);
    const d = data.IrnDt || data.AckDt || '';
    return { irn: data.Irn || '', ackNo: data.AckNo ? String(data.AckNo) : '', ackDate: d ? String(d).slice(0, 10) : '' };
  } catch { return {}; }
}
