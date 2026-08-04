// =============================================================================
//  ARRAYS INGENIERIA — Premium Techno-Commercial Proposal generator (pdfkit)
//  Veteran-led Solar EPC. Real brand identity: emerald + gold editorial system,
//  the company logo, and real project / recognition photography.
//  Typography: Cormorant Garamond (headings) · EB Garamond (body) ·
//  Inter (labels/data) · TeX Gyre Chorus (one chancery flourish).
//  Exports renderProposal(doc, data) which appends the full book to a shared doc.
// =============================================================================
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const FONT_DIR = path.join(HERE, '../assets/fonts');
const BRAND = path.join(HERE, '../assets/brand');

// ---- palette (sampled from the live brand site + logo) ----------------------
const C = {
  ink:   '#0c1f17',   // near-black green — headings ink
  body:  '#38493f',   // body text
  mute:  '#6b7d74',   // captions / labels
  faint: '#93a49b',
  line:  '#e2ece6',   // hairlines
  paper: '#ffffff',
  mint:  '#f4faf7',   // soft panel
  mint2: '#e9f8f1',   // mint panel
  cream: '#fff7e6',   // warm panel
  emer:  '#0a6045',   // primary emerald
  emerD: '#07281d',   // deep emerald (footers / covers)
  emerM: '#0e7a57',   // mid emerald
  gold:  '#b8860b',   // gold
  goldB: '#e7a719',   // bright gold accent
  // logo tri-tones (used sparingly, for the tri-tick + accents)
  sun:  '#f2a51c',
  sky:  '#22a9e0',
  navy: '#1c3a86',
  grn:  '#3aa935',
};

const M = 44;                       // page margin
export const PROPOSAL_BRAND = { M, C };

// ---- font registration ------------------------------------------------------
function reg(doc, name, file, fallback) {
  try { doc.registerFont(name, path.join(FONT_DIR, file)); }
  catch { doc.registerFont(name, fallback || 'Helvetica'); }
}
function registerFonts(doc) {
  reg(doc, 'H',    'Cormorant-SemiBold.ttf', 'Times-Roman');   // display headings
  reg(doc, 'HB',   'Cormorant-Bold.ttf',     'Times-Bold');
  reg(doc, 'body', 'EBGaramond-Regular.ttf', 'Times-Roman');   // running text
  reg(doc, 'bodyM','EBGaramond-Medium.ttf',  'Times-Roman');
  reg(doc, 'bodyI','EBGaramond-Italic.ttf',  'Times-Italic');
  reg(doc, 'ui',   'Inter-Regular.ttf',      'Helvetica');     // labels / data
  reg(doc, 'uiM',  'Inter-Medium.ttf',       'Helvetica');
  reg(doc, 'uiSB', 'Inter-SemiBold.ttf',     'Helvetica-Bold');
  reg(doc, 'uiB',  'Inter-Bold.ttf',         'Helvetica-Bold');
  reg(doc, 'script','TeXGyreChorus.otf',     'Times-Italic');  // chancery flourish
}

// ---- asset helpers ----------------------------------------------------------
const photo  = (n) => path.join(BRAND, 'photos', n + '.jpg');
const press  = (n) => path.join(BRAND, 'press',  n + '.jpg');
const cert   = (n) => path.join(BRAND, 'certs',  n + '.jpg');
const news   = (n) => path.join(BRAND, 'news',   n + '.jpg');
const LOGO_C = path.join(BRAND, 'logo-color.png');
const LOGO_W = path.join(BRAND, 'logo-white.png');
const has = (f) => { try { return fs.existsSync(f); } catch { return false; } };

// cover-fit an image inside a rounded rect, clipped
function drawImg(doc, file, x, y, w, h, r = 0) {
  if (!has(file)) { // graceful placeholder
    doc.save().roundedRect(x, y, w, h, r).fill(C.mint2).restore();
    return;
  }
  doc.save();
  if (r > 0) doc.roundedRect(x, y, w, h, r).clip();
  else doc.rect(x, y, w, h).clip();
  try { doc.image(file, x, y, { cover: [w, h], align: 'center', valign: 'center' }); }
  catch { doc.rect(x, y, w, h).fill(C.mint2); }
  doc.restore();
}

// place the logo fit to a width (art is square with built-in padding)
function logo(doc, x, y, w, white = false) {
  const f = white ? LOGO_W : LOGO_C;
  if (!has(f)) return;
  try { doc.image(f, x, y, { width: w }); } catch { /* ignore */ }
}

// ---- small drawing utilities ------------------------------------------------
function triTick(doc, x, y, w = 74) {          // gold + emerald + sky underline
  const seg = w / 3;
  doc.save();
  doc.rect(x, y, seg, 3).fill(C.gold);
  doc.rect(x + seg + 5, y, seg, 3).fill(C.emer);
  doc.rect(x + 2 * (seg + 5), y, seg - 10, 3).fill(C.sky);
  doc.restore();
}

function eyebrow(doc, text, x, y, color = C.gold) {
  doc.font('uiSB').fontSize(8.5).fillColor(color)
     .text(String(text).toUpperCase(), x, y, { characterSpacing: 2.4 });
}

// section heading block; returns y after the heading
function heading(doc, kicker, title, opts = {}) {
  const x = opts.x ?? M;
  const y = opts.y ?? doc.y;
  const w = opts.w ?? (doc.page.width - 2 * M);
  eyebrow(doc, kicker, x, y, opts.kickColor || C.gold);
  doc.font(opts.script ? 'script' : 'H')
     .fontSize(opts.size || 30).fillColor(opts.ink || C.ink)
     .text(title, x, y + 13, { width: w });
  const yy = doc.y + 6;
  triTick(doc, x, yy, 74);
  doc.y = yy + 16;
  return doc.y;
}

function para(doc, text, x, y, w, opts = {}) {
  doc.font(opts.font || 'body').fontSize(opts.size || 10.6)
     .fillColor(opts.color || C.body)
     .text(text, x, y, { width: w, align: opts.align || 'left', lineGap: opts.lineGap ?? 3.4 });
  return doc.y;
}

// rounded panel
function panel(doc, x, y, w, h, fill, r = 9, stroke) {
  doc.save().roundedRect(x, y, w, h, r);
  if (fill) doc.fillColor(fill).fill();
  if (stroke) { doc.roundedRect(x, y, w, h, r).lineWidth(0.8).strokeColor(stroke).stroke(); }
  doc.restore();
}

// ---- page chrome ------------------------------------------------------------
function chrome(doc, tag) {
  const W = doc.page.width, H = doc.page.height;
  doc.page.margins.bottom = 0;
  // header
  logo(doc, M - 6, 22, 66);
  eyebrow(doc, tag || 'Techno-Commercial Proposal', W - M - 240, 40, C.mute);
  doc.font('ui').fontSize(8).fillColor(C.faint)
     .text('ARRAYS INGENIERIA PVT. LTD.', W - M - 240, 52, { width: 240, align: 'right' });
  doc.moveTo(M, 84).lineTo(W - M, 84).lineWidth(0.8).strokeColor(C.line).stroke();
  doc.rect(M, 84, 46, 2).fill(C.gold);
  // footer strip (full-bleed emerald)
  const fy = H - 30;
  doc.rect(0, fy, W, 30).fill(C.emerD);
  doc.font('bodyI').fontSize(9).fillColor('#cfe9df')
     .text('Developing Green Energy for the Nation', M, fy + 9, { lineBreak: false });
  doc.font('ui').fontSize(7.5).fillColor('#a7cfc0')
     .text('ISO 9001 · 14001 · 45001   ·   arraysingenieria@gmail.com', W - M - 300, fy + 10,
           { width: 300, align: 'right' });
  doc.y = 100;
}

// full-bleed dark page base (cover / thank-you)
function bleed(doc, color) {
  const W = doc.page.width, H = doc.page.height;
  doc.page.margins.bottom = 0;
  doc.rect(0, 0, W, H).fill(color || C.emerD);
}

// =============================================================================
//  ICONS (simple vector pictograms drawn in a tinted chip)
// =============================================================================
function icon(doc, kind, cx, cy, s, col) {
  doc.save().lineWidth(1.6).strokeColor(col).fillColor(col);
  const L = (a, b, c, d) => doc.moveTo(a, b).lineTo(c, d).stroke();
  switch (kind) {
    case 'panel':
      doc.rect(cx - s, cy - s * 0.7, 2 * s, 1.4 * s).stroke();
      L(cx - s, cy - s * 0.23, cx + s, cy - s * 0.23);
      L(cx - s, cy + s * 0.23, cx + s, cy + s * 0.23);
      L(cx - s / 3, cy - s * 0.7, cx - s / 3, cy + s * 0.7);
      L(cx + s / 3, cy - s * 0.7, cx + s / 3, cy + s * 0.7); break;
    case 'sun':
      doc.circle(cx, cy, s * 0.45).stroke();
      for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; L(cx + Math.cos(a) * s * 0.7, cy + Math.sin(a) * s * 0.7, cx + Math.cos(a) * s, cy + Math.sin(a) * s); } break;
    case 'bolt':
      doc.moveTo(cx + s * 0.2, cy - s).lineTo(cx - s * 0.5, cy + s * 0.1).lineTo(cx, cy + s * 0.1)
         .lineTo(cx - s * 0.2, cy + s).lineTo(cx + s * 0.5, cy - s * 0.1).lineTo(cx, cy - s * 0.1).fill(); break;
    case 'shield':
      doc.moveTo(cx, cy - s).lineTo(cx + s * 0.8, cy - s * 0.55).lineTo(cx + s * 0.8, cy + s * 0.2)
         .bezierCurveTo(cx + s * 0.8, cy + s * 0.7, cx + s * 0.4, cy + s, cx, cy + s)
         .bezierCurveTo(cx - s * 0.4, cy + s, cx - s * 0.8, cy + s * 0.7, cx - s * 0.8, cy + s * 0.2)
         .lineTo(cx - s * 0.8, cy - s * 0.55).closePath().stroke();
      doc.moveTo(cx - s * 0.32, cy + s * 0.02).lineTo(cx - s * 0.05, cy + s * 0.32).lineTo(cx + s * 0.4, cy - s * 0.35).stroke(); break;
    case 'leaf':
      doc.moveTo(cx - s * 0.7, cy + s * 0.7).bezierCurveTo(cx - s, cy - s * 0.6, cx + s * 0.4, cy - s, cx + s * 0.8, cy - s * 0.7)
         .bezierCurveTo(cx + s * 0.6, cy + s * 0.5, cx - s * 0.5, cy + s * 0.9, cx - s * 0.7, cy + s * 0.7).fill();
      doc.strokeColor('#ffffff').moveTo(cx - s * 0.4, cy + s * 0.5).lineTo(cx + s * 0.5, cy - s * 0.5).stroke(); break;
    case 'clock':
      doc.circle(cx, cy, s * 0.85).stroke(); L(cx, cy, cx, cy - s * 0.5); L(cx, cy, cx + s * 0.4, cy + s * 0.15); break;
    case 'medal':
      doc.circle(cx, cy + s * 0.25, s * 0.55).stroke();
      L(cx - s * 0.35, cy - s * 0.1, cx - s * 0.6, cy - s); L(cx + s * 0.35, cy - s * 0.1, cx + s * 0.6, cy - s); break;
    case 'people':
      doc.circle(cx - s * 0.4, cy - s * 0.3, s * 0.35).stroke();
      doc.circle(cx + s * 0.4, cy - s * 0.3, s * 0.35).stroke();
      doc.moveTo(cx - s, cy + s * 0.8).bezierCurveTo(cx - s, cy + s * 0.1, cx + 0, cy + s * 0.1, cx + 0, cy + s * 0.8).stroke();
      doc.moveTo(cx + 0, cy + s * 0.8).bezierCurveTo(cx + 0, cy + s * 0.1, cx + s, cy + s * 0.1, cx + s, cy + s * 0.8).stroke(); break;
    case 'tools':
      L(cx - s * 0.7, cy + s * 0.7, cx + s * 0.2, cy - s * 0.2);
      doc.circle(cx - s * 0.6, cy + s * 0.6, s * 0.22).stroke();
      L(cx + s * 0.1, cy + s * 0.7, cx + s * 0.7, cy - s * 0.6); break;
    case 'home':
      doc.moveTo(cx - s, cy).lineTo(cx, cy - s * 0.9).lineTo(cx + s, cy).stroke();
      doc.rect(cx - s * 0.7, cy, s * 1.4, s * 0.85).stroke(); break;
    case 'factory':
      doc.moveTo(cx - s, cy + s * 0.6).lineTo(cx - s, cy - s * 0.2).lineTo(cx - s * 0.1, cy + s * 0.2)
         .lineTo(cx - s * 0.1, cy - s * 0.2).lineTo(cx + s * 0.8, cy + s * 0.2).lineTo(cx + s * 0.8, cy + s * 0.6).closePath().stroke(); break;
    case 'grid':
      doc.rect(cx - s * 0.8, cy - s * 0.8, s * 1.6, s * 1.6).stroke();
      L(cx, cy - s * 0.8, cx, cy + s * 0.8); L(cx - s * 0.8, cy, cx + s * 0.8, cy); break;
    case 'doc':
      doc.rect(cx - s * 0.6, cy - s * 0.85, s * 1.2, s * 1.7).stroke();
      L(cx - s * 0.3, cy - s * 0.35, cx + s * 0.3, cy - s * 0.35);
      L(cx - s * 0.3, cy, cx + s * 0.3, cy); L(cx - s * 0.3, cy + s * 0.35, cx + s * 0.1, cy + s * 0.35); break;
    case 'rupee':
      doc.font('uiB').fontSize(s * 1.6).fillColor(col).text('₹', cx - s * 0.55, cy - s * 0.9); break;
    case 'flag':
      L(cx - s * 0.6, cy - s, cx - s * 0.6, cy + s);
      doc.moveTo(cx - s * 0.6, cy - s).lineTo(cx + s * 0.7, cy - s * 0.6).lineTo(cx - s * 0.6, cy - s * 0.2).closePath().stroke(); break;
    default:
      doc.circle(cx, cy, s * 0.6).stroke();
  }
  doc.restore();
}

function iconChip(doc, kind, x, y, d, bg = C.mint2, col = C.emer) {
  doc.save().roundedRect(x, y, d, d, d * 0.28).fill(bg).restore();
  icon(doc, kind, x + d / 2, y + d / 2, d * 0.26, col);
}

// =============================================================================
//  VALUE / DATA HELPERS
// =============================================================================
const V = (v, d = '—') => (v === undefined || v === null || v === '' ? d : v);
function num(v, d = 0) { const n = parseFloat(String(v).replace(/[^0-9.\-]/g, '')); return isNaN(n) ? d : n; }
const inr = (n) => '₹' + Math.round(n).toLocaleString('en-IN');
function inrShort(n) {
  n = Math.round(n);
  if (n >= 1e7) return '₹' + (n / 1e7).toFixed(2) + ' Cr';
  if (n >= 1e5) return '₹' + (n / 1e5).toFixed(2) + ' L';
  return '₹' + n.toLocaleString('en-IN');
}

// derive a financial model from whatever the questionnaire gave us
function model(data) {
  const kwp = num(data.capacity_kwp || data.system_kwp || data.capacity, 0) || 100;
  const tariff = num(data.tariff, 0) || 8.5;
  const yieldPerKwp = 1500;                       // kWh/kWp/yr (India avg)
  const gen1 = kwp * yieldPerKwp;                 // year-1 units
  const costPerKwp = num(data.cost_per_kwp, 0) || 48000;
  const capex = kwp * costPerKwp;
  const save1 = gen1 * tariff;
  // 25-yr cumulative: 3.5% tariff escalation, 0.6%/yr degradation
  let cum = 0, esc = 1, deg = 1;
  const series = [];
  for (let yr = 1; yr <= 25; yr++) {
    const s = gen1 * deg * tariff * esc;
    cum += s; series.push(cum);
    esc *= 1.035; deg *= 0.994;
  }
  const payback = capex / save1;
  const co2 = gen1 * 0.82 / 1000;                 // tonnes/yr
  return {
    kwp, tariff, gen1, capex, save1, cum25: cum, series,
    paybackYrs: payback, co2yr: co2, trees: Math.round(co2 * 45), co2_25: co2 * 25,
    dailyUnits: Math.round(gen1 / 365),
  };
}

// =============================================================================
//  PAGE 1 — COVER
// =============================================================================
function coverPage(doc, data) {
  const W = doc.page.width, H = doc.page.height;
  bleed(doc, C.emerD);
  // hero photo top ~60%
  const ph = H * 0.60;
  drawImg(doc, photo('hero-solar-farm'), 0, 0, W, ph);
  // emerald gradient veil over photo
  const g = doc.linearGradient(0, 0, 0, ph);
  g.stop(0, C.emerD, 0.15).stop(0.6, C.emerD, 0.35).stop(1, C.emerD, 1);
  doc.rect(0, 0, W, ph).fill(g);
  // thin gold rule top
  doc.rect(0, 0, W, 4).fill(C.gold);
  // logo (original colour) top-left
  logo(doc, M - 10, 34, 104, false);
  doc.font('uiSB').fontSize(9.5).fillColor(C.goldB)
     .text('EX-SERVICEMEN LED  ·  ISO 9001 · 14001 · 45001  ·  SINCE 2018', M, 150, { characterSpacing: 1.6 });

  // title block on the dark lower band
  let y = ph - 6;
  eyebrow(doc, 'Techno-Commercial Proposal', M, y, C.goldB); y += 16;
  doc.font('H').fontSize(52).fillColor('#ffffff')
     .text('Solar Power Plant', M, y, { width: W - 2 * M });
  doc.font('H').fontSize(52).fillColor('#ffffff')
     .text('for a Brighter Nation', M, doc.y - 6, { width: W - 2 * M });
  y = doc.y + 12;
  triTick(doc, M, y, 90); y += 18;
  doc.font('bodyI').fontSize(13.5).fillColor('#dcf3e7')
     .text('Engineered with military precision by Arrays Ingenieria.', M, y, { width: W * 0.72 });

  // client / meta card bottom-right
  const cw = 250, cx = W - M - cw, cy = H - 150;
  panel(doc, cx, cy, cw, 108, '#ffffff', 10);
  doc.rect(cx, cy, 4, 108).fill(C.gold);
  const kv = (lbl, val, yy) => {
    doc.font('ui').fontSize(7.5).fillColor(C.mute).text(String(lbl).toUpperCase(), cx + 18, yy, { characterSpacing: 1.5 });
    doc.font('uiSB').fontSize(11).fillColor(C.ink).text(V(val), cx + 18, yy + 10, { width: cw - 34 });
  };
  const m = model(data);
  kv('Prepared For', data.client_name || data.customer_name || 'Valued Client', cy + 14);
  kv('Proposed Capacity', (m.kwp ? m.kwp + ' kWp' : '—') + (data.grid_type ? '  ·  ' + data.grid_type : ''), cy + 44);
  kv('Reference / Date', (V(data.quote_number, 'PROPOSAL')) + '   ·   ' +
     new Date(data.date || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }), cy + 74);
}

// =============================================================================
//  PAGE 2 — CONTENTS
// =============================================================================
function tocPage(doc) {
  chrome(doc, 'Contents');
  heading(doc, 'Inside This Proposal', 'Contents');
  const items = [
    ['01', 'Confidentiality & Conditions', 'The terms under which this proposal is shared'],
    ['02', 'From the Leadership', 'A message from our veteran leadership'],
    ['03', 'About Arrays Ingenieria', 'Where engineering meets resilience'],
    ['04', 'The Veteran Advantage', 'Why India’s leaders choose us'],
    ['05', 'End-to-End Capabilities', 'Our full-spectrum solar EPC services'],
    ['06', 'Industries We Serve', 'Tailored solar for every sector'],
    ['07', 'Trusted by India’s Leaders', 'Clients & landmark projects'],
    ['08', 'Track Record', 'A portfolio delivered pan-India'],
    ['09', 'Client Voices', 'In the words of those we’ve served'],
    ['10', 'Recognition & Media', 'Honoured from the nation’s highest offices'],
    ['11', 'Understanding Your Project', 'Your requirement, engineered'],
    ['12', 'How Solar Works', 'From sunlight to savings'],
    ['13', 'Net Metering Explained', 'On-grid, off-grid & hybrid'],
    ['14', 'Execution Methodology', 'Our disciplined delivery process'],
    ['15', 'Savings & ROI Analysis', 'The numbers behind your investment'],
    ['16', 'Quality, Safety & Warranty', 'Triple-ISO systems, Tier-1 hardware'],
    ['17', 'Your Questions, Answered', 'Frequently asked questions'],
  ];
  const colW = (doc.page.width - 2 * M - 24) / 2;
  const startY = doc.y + 4;
  const rowH = 60;
  const half = Math.ceil(items.length / 2);
  items.forEach((it, i) => {
    const col = i < half ? 0 : 1;
    const row = col === 0 ? i : i - half;
    const x = M + col * (colW + 24);
    const y = startY + row * rowH;
    doc.font('H').fontSize(22).fillColor(C.mint2).text(it[0], x, y - 2, { lineBreak: false });
    doc.font('uiSB').fontSize(10.5).fillColor(C.ink).text(it[1], x + 40, y, { width: colW - 40 });
    doc.font('body').fontSize(9).fillColor(C.mute).text(it[2], x + 40, y + 15, { width: colW - 40 });
    doc.moveTo(x + 40, y + 40).lineTo(x + colW, y + 40).lineWidth(0.6).strokeColor(C.line).stroke();
  });
}

// =============================================================================
//  PAGE 3 — CONFIDENTIALITY
// =============================================================================
function confidentialityPage(doc) {
  chrome(doc, 'Confidential');
  heading(doc, 'Section 01', 'Confidentiality & Conditions');
  const w = doc.page.width - 2 * M;
  const paras = [
    'This techno-commercial proposal (the "Proposal") for the design, supply, installation and commissioning of a solar photovoltaic power system is submitted by Arrays Ingenieria Pvt. Ltd. ("Ingenieria") with the intent of executing a definitive and legally binding agreement following an award of business.',
    'This Proposal constitutes confidential and proprietary information of Ingenieria. The recipient may use the information contained herein solely for the purpose of evaluating this Proposal. This Proposal and all supporting documentation shall remain the property of Ingenieria and must be returned upon request.',
    'This Proposal is based upon the set of requirements provided by the client and certain reasonable engineering assumptions. Should the requirements change, or should any stated assumption prove inaccurate, this Proposal — including pricing, generation estimates and timelines — may be revised accordingly.',
    'Generation and savings figures are good-faith engineering estimates based on standard irradiance data, a 1,500 kWh/kWp annual yield, prevailing tariffs and typical system performance. Actual results vary with site conditions, weather, shading, grid availability, tariff revisions and DISCOM policy. Implementation is subject to applicable statutory, DISCOM and regulatory norms in force on the date of execution.',
    'Unless expressly stated otherwise, this Proposal is valid for 30 days from the date of issue.',
  ];
  let y = doc.y + 2;
  paras.forEach((p) => {
    doc.circle(M + 4, y + 7, 3).fill(C.gold);
    y = para(doc, p, M + 20, y, w - 20, { size: 10.4, lineGap: 3.6 }) + 12;
  });
  // signature-of-good-faith strip
  const by = 676;
  panel(doc, M, by, w, 66, C.mint, 9);
  doc.rect(M, by, 4, 66).fill(C.emer);
  doc.font('uiSB').fontSize(8.5).fillColor(C.emer).text('PREPARED IN GOOD FAITH', M + 20, by + 14, { characterSpacing: 1.4 });
  doc.font('body').fontSize(10).fillColor(C.body)
     .text('Every figure and commitment in this document reflects our military-grade standard of accuracy and accountability. We would be privileged to walk you through any part of it in person.',
           M + 20, by + 28, { width: w - 200 });
  doc.font('bodyI').fontSize(11).fillColor(C.ink)
     .text('Arrays Ingenieria Pvt. Ltd.', M + w - 180, by + 26, { width: 160, align: 'right' });
}

// =============================================================================
//  PAGE 4 — LEADERSHIP LETTER
// =============================================================================
function leadershipPage(doc) {
  chrome(doc, 'Leadership');
  const W = doc.page.width, w = W - 2 * M;
  // chancery flourish heading (the single script use)
  eyebrow(doc, 'Section 02', M, doc.y, C.gold);
  doc.font('script').fontSize(44).fillColor(C.gold).text('From the Leadership', M, doc.y + 10);
  triTick(doc, M, doc.y + 6, 74);
  let y = doc.y + 22;

  // president photo + identity card (right column)
  const colX = W - M - 176, colW = 176;
  drawImg(doc, press('ceo-president'), colX, y, colW, 208, 8);
  doc.font('bodyI').fontSize(8).fillColor(C.mute)
     .text('Honoured by the Hon’ble President of India', colX, y + 216, { width: colW, align: 'center' });
  // identity card
  const idY = y + 236;
  panel(doc, colX, idY, colW, 92, C.mint, 9, C.line);
  doc.rect(colX, idY, colW, 3).fill(C.gold);
  doc.font('HB').fontSize(15.5).fillColor(C.gold).text('Lt. Gen. A.R. Prasad', colX + 14, idY + 14, { width: colW - 28 });
  doc.font('HB').fontSize(15.5).fillColor(C.gold).text('(Retd)', colX + 14, doc.y - 2, { width: colW - 28 });
  doc.font('uiSB').fontSize(7.8).fillColor(C.emer).text('AVSM · VSM · ADC · Ph.D', colX + 14, idY + 56, { width: colW - 28, characterSpacing: 0.4 });
  doc.font('ui').fontSize(7.8).fillColor(C.mute).text('Chief Executive Officer', colX + 14, idY + 68, { width: colW - 28 });

  // letter body (left)
  const bw = colX - M - 26;
  doc.font('bodyI').fontSize(13).fillColor(C.emer).text('Respected Client,', M, y);
  y = doc.y + 8;
  const letter = [
    'Thank you for the opportunity to earn your trust. At Arrays Ingenieria, solar is more than a business — it is a national mission carried forward by soldiers who have spent their lives in service of this country.',
    'We founded this company in 2018 on a simple conviction: that the discipline, precision and accountability of the armed forces are exactly what India’s clean-energy transition demands. Every plant we build — from a rooftop on a factory shed to the 300 MW SECI solar park — is delivered with that same zero-compromise standard.',
    'This proposal is our commitment to you in writing. Within it you will find not only competitive economics, but the engineering rigour, the quality systems and the long-term partnership that have earned us the trust of Tata Power, Tata Steel, Tata Motors, Bharat Petroleum and many more.',
    'We would be honoured to power your future.',
  ];
  letter.forEach((p) => { y = para(doc, p, M, y, bw, { size: 11.5, lineGap: 4.2 }) + 9; });
  doc.font('script').fontSize(26).fillColor(C.gold).text('A.R. Prasad', M, y + 4);
  doc.font('uiSB').fontSize(8.5).fillColor(C.gold).text('LT. GEN. A.R. PRASAD (RETD)', M, doc.y + 3, { characterSpacing: 0.6 });
  doc.font('ui').fontSize(8).fillColor(C.mute).text('Chief Executive Officer — Arrays Ingenieria Pvt. Ltd.', M, doc.y + 1);

  // emerald pull-quote band, anchored below the taller of the two columns
  const bandY = Math.max(y + 40, idY + 92 + 24, 700), bandH = 64;
  panel(doc, M, bandY, w, bandH, C.emerD, 9);
  doc.rect(M, bandY, 4, bandH).fill(C.gold);
  doc.font('H').fontSize(46).fillColor(C.gold).text('“', M + 16, bandY + 2);
  doc.font('bodyI').fontSize(13.5).fillColor('#ffffff')
     .text('Where engineering meets resilience — and every megawatt is a mission accomplished.',
           M + 52, bandY + 22, { width: w - 80 });
}

// =============================================================================
//  PAGE 5 — ABOUT
// =============================================================================
function aboutPage(doc) {
  chrome(doc, 'About Us');
  const W = doc.page.width, w = W - 2 * M;
  heading(doc, 'Section 03 · Who We Are', 'Where Engineering Meets Resilience');
  let y = doc.y;
  // intro + photo
  const pw = 210;
  drawImg(doc, photo('proj-rooftop-pano'), W - M - pw, y, pw, 168, 8);
  const bw = W - M - pw - 26 - M;
  y = para(doc,
    '"Ingeniería" means engineering in Spanish — a fitting symbol of our commitment to precision and discipline. Founded in 2018 and run entirely by former military personnel, Arrays Ingenieria designs and delivers ground-mount and rooftop solar power plants across India, along with pile foundations, civil works, grid commissioning and long-term O&M.',
    M, y, bw, { size: 10.8, lineGap: 3.8 });
  y = para(doc,
    'From a single rooftop to a 300 MW utility-scale solar park, we approach every project with the same focus on excellence, safety and sustainability — earning the trust of India’s biggest industrial names.',
    M, y + 8, bw, { size: 10.8, lineGap: 3.8 });

  y = Math.max(y, 175 + 168) + 24;

  // mission / vision cards
  const cw = (w - 18) / 2;
  const cardH = 132;
  const mv = [
    ['sun', 'Our Mission', 'To accelerate India’s transition to clean, reliable and affordable energy — delivering projects of uncompromising quality that empower communities and protect the environment for generations.'],
    ['flag', 'Our Vision', 'To be India’s most trusted, veteran-led renewable-energy partner — recognised nationwide for engineering excellence, safety and integrity, and for the enduring impact of every megawatt online.'],
  ];
  mv.forEach((c, i) => {
    const x = M + i * (cw + 18);
    panel(doc, x, y, cw, cardH, C.mint, 9, C.line);
    iconChip(doc, c[0], x + 16, y + 18, 32, C.mint2, C.emer);
    doc.font('H').fontSize(18).fillColor(C.ink).text(c[1], x + 58, y + 22);
    doc.font('body').fontSize(9.8).fillColor(C.body).text(c[2], x + 16, y + 56, { width: cw - 32, lineGap: 3 });
  });
  y += cardH + 22;

  // values row
  eyebrow(doc, 'Built on Military Values', M, y, C.gold); y += 18;
  const vals = [['shield', 'Discipline', 'Decisive, accountable execution'],
                ['medal', 'Integrity', 'Transparent, dependable delivery'],
                ['bolt', 'Quality & Safety', 'Triple-ISO, zero-compromise'],
                ['leaf', 'Sustainability', 'A cleaner, greener future']];
  const vw = (w - 3 * 14) / 4;
  vals.forEach((v, i) => {
    const x = M + i * (vw + 14);
    panel(doc, x, y, vw, 120, C.paper, 9, C.line);
    iconChip(doc, v[0], x + vw / 2 - 19, y + 20, 38, C.mint2, C.emer);
    doc.font('uiSB').fontSize(11).fillColor(C.ink).text(v[1], x + 8, y + 70, { width: vw - 16, align: 'center' });
    doc.font('body').fontSize(8.8).fillColor(C.mute).text(v[2], x + 10, y + 88, { width: vw - 20, align: 'center', lineGap: 1.5 });
  });
  y += 120 + 24;

  // stat band (anchored near bottom)
  statBand(doc, M, y, w, [['2018', 'Established'], ['50 MW+', 'Engineered'], ['40+', 'Projects'], ['100%', 'Ex-Servicemen Led'], ['3×', 'ISO Certified']]);
}

function statBand(doc, x, y, w, stats) {
  const h = 66;
  panel(doc, x, y, w, h, C.emer, 9);
  const cw = w / stats.length;
  stats.forEach((s, i) => {
    const cx = x + i * cw;
    if (i) doc.moveTo(cx, y + 14).lineTo(cx, y + h - 14).lineWidth(0.6).strokeColor('#2f7a60').stroke();
    doc.font('H').fontSize(23).fillColor('#ffffff').text(s[0], cx, y + 13, { width: cw, align: 'center' });
    doc.font('ui').fontSize(7.6).fillColor('#bfe7d6').text(String(s[1]).toUpperCase(), cx, y + 44, { width: cw, align: 'center', characterSpacing: 1 });
  });
}

// =============================================================================
//  PAGE 6 — VETERAN ADVANTAGE
// =============================================================================
function whyPage(doc) {
  chrome(doc, 'The Veteran Advantage');
  const W = doc.page.width, w = W - 2 * M;
  heading(doc, 'Section 04', 'The Veteran Advantage');
  para(doc, 'A company built on military values — discipline, precision and an unwavering commitment to mission success. This is why India’s largest industrial houses choose Ingenieria.', M, doc.y, w, { size: 10.6 });
  let y = doc.y + 14;

  const cards = [
    ['medal', '100% Veteran-Led', 'Founded and operated entirely by decorated former military officers — strategic planning, decisive action, zero-compromise execution on every site.'],
    ['shield', 'Triple-ISO Certified', 'ISO 9001, 14001 & 45001 for quality, environmental and occupational-safety management — audited systems, not slogans.'],
    ['grid', 'Proven Scale', 'From 10 kWp rooftops to the 300 MW SECI solar park — any size, any terrain, delivered to specification.'],
    ['flag', 'Pan-India Reach', 'Dedicated crews mobilised across the length and breadth of the nation, from Assam’s tea estates to Karnataka’s solar parks.'],
    ['tools', 'In-House Engineering', 'Feasibility, geo-technical survey, design, piling, civil and electrical — a single accountable team, start to finish.'],
    ['clock', 'On-Time, Every Time', 'Military logistics translated into renewable delivery: 100% on-time commissioning across our portfolio.'],
  ];
  const cw = (w - 2 * 16) / 3, ch = 150;
  const y0 = y;
  cards.forEach((c, i) => {
    const col = i % 3, row = Math.floor(i / 3);
    const x = M + col * (cw + 16), yy = y0 + row * (ch + 18);
    panel(doc, x, yy, cw, ch, C.paper, 9, C.line);
    doc.rect(x, yy, cw, 3).fill(i % 2 ? C.emer : C.gold);
    iconChip(doc, c[0], x + 18, yy + 20, 36, C.mint2, C.emer);
    doc.font('H').fontSize(16).fillColor(C.ink).text(c[1], x + 18, yy + 64);
    doc.font('body').fontSize(9.2).fillColor(C.body).text(c[2], x + 18, yy + 86, { width: cw - 36, lineGap: 2.6 });
  });
  y = y0 + 2 * (ch + 18) + 10;

  // performance metrics strip
  eyebrow(doc, 'Performance You Can Measure', M, y, C.gold); y += 18;
  statBand(doc, M, y, w, [['100%', 'On-Time'], ['100%', 'Safety Compliance'], ['98%', 'Quality Rating'], ['95%', 'Repeat & Referral'], ['100%', 'Client Satisfaction']]);
}

// =============================================================================
//  PAGE 7 — SERVICES
// =============================================================================
function servicesPage(doc) {
  chrome(doc, 'Capabilities');
  const W = doc.page.width, w = W - 2 * M;
  heading(doc, 'Section 05 · What We Do', 'End-to-End Solar EPC');
  para(doc, 'A full-spectrum renewable-energy contractor. We carry every project from feasibility and geo-technical survey — through detailed engineering, Tier-1 procurement, piling, civil and electrical execution — right up to grid synchronisation, testing and long-term O&M.', M, doc.y, w, { size: 10.4 });
  let y = doc.y + 14;
  const svc = [
    ['grid', 'Ground-Mount Solar', 'Utility & industrial-scale power plants engineered for maximum yield across any terrain.'],
    ['home', 'Rooftop Solar', 'On-grid RCC & metal-shed systems that turn unused roof space into a bill-slashing asset.'],
    ['tools', 'EPC Turnkey', 'Single-point design, procurement & construction — one accountable veteran-led team.'],
    ['bolt', 'Piling & Foundations', 'Hydraulic pile-driving and precise foundations built to survive decades of load.'],
    ['shield', 'Civil & Fencing', 'Boundary walls, chain-link fencing, cable trenches and site infrastructure.'],
    ['clock', 'O&M & Support', 'Preventive & corrective maintenance, module cleaning, monitoring and rapid fault resolution.'],
  ];
  const cw = (w - 2 * 16) / 3, ch = 142;
  const y0 = y;
  svc.forEach((s, i) => {
    const col = i % 3, row = Math.floor(i / 3);
    const x = M + col * (cw + 16), yy = y0 + row * (ch + 18);
    panel(doc, x, yy, cw, ch, C.mint, 9, C.line);
    iconChip(doc, s[0], x + 18, yy + 20, 38, C.paper, C.emer);
    doc.font('H').fontSize(17).fillColor(C.ink).text(s[1], x + 18, yy + 66);
    doc.font('body').fontSize(9.2).fillColor(C.body).text(s[2], x + 18, yy + 88, { width: cw - 36, lineGap: 2.6 });
  });
  y = y0 + 2 * (ch + 18) + 8;
  // photo strip with captions
  const iw = (w - 2 * 12) / 3;
  const caps = [['proj-seci', 'SECI · Piling'], ['proj-tml', 'Tata Motors · EPC'], ['proj-earthing', 'Earthing & Safety']];
  caps.forEach((p, i) => {
    const x = M + i * (iw + 12);
    drawImg(doc, photo(p[0]), x, y, iw, 132, 8);
    doc.font('uiSB').fontSize(8.5).fillColor(C.emer).text(p[1].toUpperCase(), x, y + 138, { width: iw, align: 'center', characterSpacing: 0.6 });
  });
}

// =============================================================================
//  PAGE 8 — INDUSTRIES
// =============================================================================
function industriesPage(doc) {
  chrome(doc, 'Industries');
  const W = doc.page.width, w = W - 2 * M;
  heading(doc, 'Section 06 · Who We Power', 'Industries We Serve');
  para(doc, 'Decades of military discipline applied to the renewable-energy needs of India’s homes, businesses and institutions — six sectors, one trusted partner.', M, doc.y, w, { size: 10.6 });
  let y = doc.y + 14;
  const inds = [
    ['home', 'Residential', 'Rooftop solar for homes & housing societies — lower bills and energy independence, with PM Surya Ghar subsidy support.'],
    ['factory', 'Commercial', 'Offices, malls, hotels & fuel stations — slash operating costs and carbon with reliable clean power.'],
    ['bolt', 'Industrial', 'Factories, smelters & manufacturing units — large rooftop and ground-mount systems built at scale.'],
    ['shield', 'Institutional', 'Schools, hospitals & campuses — compliant, dependable solar that funds itself over time.'],
    ['leaf', 'Agriculture & Tea', 'Ground-mount plants for estates & agri-loads — proven across Assam’s tea gardens.'],
    ['flag', 'Government & PSU', 'Utility-scale & PSU projects (SECI, Tata Power EPC) executed exactly to specification.'],
  ];
  const cw = (w - 16) / 2, ch = 104, y0 = y;
  inds.forEach((c, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = M + col * (cw + 16), yy = y0 + row * (ch + 16);
    panel(doc, x, yy, cw, ch, C.paper, 9, C.line);
    iconChip(doc, c[0], x + 18, yy + 20, 38, C.mint2, C.emer);
    doc.font('H').fontSize(17).fillColor(C.ink).text(c[1], x + 66, yy + 22);
    doc.font('body').fontSize(9.2).fillColor(C.body).text(c[2], x + 66, yy + 44, { width: cw - 84, lineGap: 2.6 });
  });
  y = y0 + 3 * (ch + 16) + 10;
  panel(doc, M, y, w, 58, C.cream, 9);
  doc.rect(M, y, 4, 58).fill(C.gold);
  doc.font('H').fontSize(28).fillColor(C.gold).text('“', M + 18, y + 8, { lineBreak: false });
  doc.font('body').fontSize(10.4).fillColor(C.body)
     .text('Residential clients benefit from the PM Surya Ghar subsidy; commercial and industrial clients gain from accelerated depreciation and rapid 3–5 year paybacks — solar that funds itself.', M + 46, y + 16, { width: w - 68, lineGap: 3 });
}

// =============================================================================
//  PAGE 9 — TRUSTED BY (client wall + milestone)
// =============================================================================
function clientsPage(doc) {
  chrome(doc, 'Our Clients');
  const W = doc.page.width, w = W - 2 * M;
  heading(doc, 'Section 07', 'Trusted by India’s Leaders');
  para(doc, 'From utility giants to tea estates, India’s most demanding industrial houses rely on Ingenieria for solar delivered to specification.', M, doc.y, w, { size: 10.6 });
  let y = doc.y + 14;
  const clients = [
    ['TATA POWER', 'SOLAR EPC'], ['TATA STEEL', 'NOAMUNDI'], ['TATA MOTORS', 'JAMSHEDPUR'],
    ['SECI', '300 MW PARK'], ['BHARAT', 'PETROLEUM'], ['SUPER', 'SMELTERS'],
    ['DCM', 'HISAR'], ['JAY SHREE', 'TEA · BIRLA'], ['AMALGAMATED', 'PLANTATIONS'],
  ];
  const cols = 3, gap = 16, tw = (w - (cols - 1) * gap) / cols, th = 78, y0 = y;
  clients.forEach((c, i) => {
    const col = i % cols, row = Math.floor(i / cols);
    const x = M + col * (tw + gap), yy = y0 + row * (th + gap);
    panel(doc, x, yy, tw, th, C.paper, 8, C.line);
    doc.rect(x, yy, tw, 3).fill(C.gold);
    doc.font('uiB').fontSize(14).fillColor(C.emer).text(c[0], x, yy + 24, { width: tw, align: 'center', characterSpacing: 0.5 });
    doc.font('ui').fontSize(7.5).fillColor(C.mute).text(c[1], x, yy + 46, { width: tw, align: 'center', characterSpacing: 1.5 });
  });
  y = y0 + 3 * (th + gap) + 12;

  // milestone project: photo + quote
  const ph = 176;
  const iw = w * 0.46;
  drawImg(doc, photo('proj-supersmelters'), M, y, iw, ph, 9);
  const tx = M + iw + 24, twq = w - iw - 24;
  eyebrow(doc, 'Landmark Project', tx, y + 4, C.gold);
  doc.font('H').fontSize(21).fillColor(C.ink).text('Super Smelters — 1,980 kWp', tx, y + 18);
  doc.font('ui').fontSize(8.5).fillColor(C.mute).text('ASANSOL, WEST BENGAL  ·  WITH TATA POWER SOLAR', tx, y + 44, { characterSpacing: 0.8 });
  doc.font('bodyI').fontSize(12.5).fillColor(C.body)
     .text('“Technical expertise, professionalism and timely delivery — with thorough inspections and meticulous attention to detail throughout.”',
           tx, y + 64, { width: twq, lineGap: 3.4 });
  doc.font('uiSB').fontSize(9).fillColor(C.emer).text('Inaugurated & featured in Dainik Bhaskar', tx, y + ph - 16);
}

// =============================================================================
//  PAGE 10 — TRACK RECORD (table)
// =============================================================================
function trackRecordPage(doc) {
  chrome(doc, 'Track Record');
  const W = doc.page.width, w = W - 2 * M;
  heading(doc, 'Section 08 · Portfolio', 'A Track Record, Delivered');
  let y = doc.y + 2;
  const rows = [
    ['SECI', 'Pile Foundation — Solar Park', 'Koppal, Karnataka', '300 MW'],
    ['YIAPL', 'Solar Park · Civil & Fencing', 'Uttar Pradesh', '14.36 MW'],
    ['DCM', 'Ground-Mount', 'Hisar, Haryana', '10 MW'],
    ['Tata Motors', 'Piling & Civil', 'Jamshedpur, Jharkhand', '5.5 MW'],
    ['Super Smelters', 'Industrial Rooftop', 'Asansol, West Bengal', '1,980 kWp'],
    ['On-Grid Rooftop', 'Rooftop', 'Assam', '1,711 kWp'],
    ['Grid-Connected', 'Ground-Mount', 'Pan-India', '1,035 kWp'],
    ['Jayshree Tea', 'Ground-Mount · Tata Power EPC', 'Sonari, Assam', '1 MW'],
    ['Towkok Tea', 'Ground-Mount', 'Assam', '535 kWp'],
    ['Manjushree Tea', 'Ground-Mount', 'Assam', '500 kWp'],
  ];
  const cols = [M, M + 128, M + 300, W - M - 76];
  panel(doc, M, y, w, 26, C.emer, 5);
  doc.font('uiSB').fontSize(8).fillColor('#ffffff');
  doc.text('CLIENT', cols[0] + 12, y + 9); doc.text('SCOPE', cols[1], y + 9);
  doc.text('LOCATION', cols[2], y + 9); doc.text('CAPACITY', cols[3], y + 9, { width: 66, align: 'right' });
  y += 26;
  rows.forEach((r, i) => {
    const rh = 33;
    if (i % 2) doc.save().rect(M, y, w, rh).fill(C.mint).restore();
    doc.font('uiSB').fontSize(9.8).fillColor(C.ink).text(r[0], cols[0] + 12, y + 11, { width: 120 });
    doc.font('body').fontSize(9.8).fillColor(C.body).text(r[1], cols[1], y + 11, { width: 168 });
    doc.font('body').fontSize(9.8).fillColor(C.mute).text(r[2], cols[2], y + 11, { width: 150 });
    doc.font('uiB').fontSize(9.8).fillColor(C.emer).text(r[3], cols[3], y + 11, { width: 66, align: 'right' });
    doc.moveTo(M, y + rh).lineTo(W - M, y + rh).lineWidth(0.5).strokeColor(C.line).stroke();
    y += rh;
  });
  y += 14;
  // photo strip with captions
  const iw = (w - 3 * 12) / 4;
  const ps = [['proj-dcm-hisar', 'DCM · 10 MW'], ['proj-jayshree', 'Jayshree · 1 MW'], ['proj-manjushree', 'Manjushree · 500 kWp'], ['proj-yiapl', 'YIAPL · 14.36 MW']];
  ps.forEach((p, i) => {
    const x = M + i * (iw + 12);
    drawImg(doc, photo(p[0]), x, y, iw, 104, 8);
    doc.font('uiSB').fontSize(7.6).fillColor(C.emer).text(p[1].toUpperCase(), x, y + 110, { width: iw, align: 'center', characterSpacing: 0.4 });
  });
}

// =============================================================================
//  PAGE 11 — TESTIMONIALS
// =============================================================================
function testimonialsPage(doc) {
  chrome(doc, 'Client Voices');
  const W = doc.page.width, w = W - 2 * M;
  heading(doc, 'Section 09 · In Their Words', 'What Our Clients Say');
  let y = doc.y + 4;
  const t = [
    ['Exceptional quality, strict adherence to safety and a well-maintained work environment. Commissioned to our full satisfaction.', 'Jay Shree Tea (Birla)', 'Assam · Ground-Mount', C.emer],
    ['Technical expertise, professionalism and timely delivery — with thorough inspections and meticulous attention to detail.', 'Super Smelters Ltd.', 'Asansol · 1,980 kWp', C.sky],
    ['Statutory compliance, cleanliness and flawless workmanship that exceeded expectations. A reliable partner we rely on.', 'Tata Motors', 'Jamshedpur · 5.5 MW', C.navy],
    ['Their professionalism in installation and commissioning was praiseworthy — a competent, dependable partner start to finish.', 'Bharat Petroleum', 'Gurugram · RCC Rooftop', C.grn],
    ['Pile-foundation works were executed to exacting standards and on schedule, even under demanding ground conditions.', 'Tata Power Solar (EPC)', 'SECI · 300 MW', C.sky],
    ['From design to grid synchronisation, every milestone was met with discipline and transparency. The veteran-led team inspires confidence.', 'DCM', 'Hisar · 10 MW', C.gold],
  ];
  const cw = (w - 16) / 2, ch = 166, y0 = y;
  t.forEach((q, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = M + col * (cw + 16), yy = y0 + row * (ch + 16);
    panel(doc, x, yy, cw, ch, C.paper, 9, C.line);
    doc.rect(x, yy, 4, ch).fill(q[3]);
    doc.font('H').fontSize(40).fillColor(q[3]).text('“', x + 18, yy + 8);
    doc.font('bodyI').fontSize(11.5).fillColor(C.body).text(q[0], x + 20, yy + 48, { width: cw - 40, lineGap: 3.6 });
    doc.moveTo(x + 20, yy + ch - 40).lineTo(x + cw - 20, yy + ch - 40).lineWidth(0.6).strokeColor(C.line).stroke();
    doc.font('uiSB').fontSize(10).fillColor(C.ink).text(q[1], x + 20, yy + ch - 32);
    doc.font('ui').fontSize(8).fillColor(C.mute).text(String(q[2]).toUpperCase(), x + 20, yy + ch - 18, { characterSpacing: 0.8 });
  });
}

// =============================================================================
//  PAGE 12 — RECOGNITION
// =============================================================================
function recognitionPage(doc) {
  chrome(doc, 'Recognition');
  const W = doc.page.width, w = W - 2 * M;
  heading(doc, 'Section 10 · Honoured by the Nation', 'Recognition & Media');
  para(doc, 'From the nation’s highest offices to leading news channels, our work in renewable energy continues to earn trust and acclaim across India.', M, doc.y, w, { size: 10.6 });
  let y = doc.y + 14;
  const items = [
    [press('ceo-president'), 'President of India', 'Honoured for distinguished service'],
    [press('ceo-modi'), 'PM Shri Narendra Modi', 'A shared vision for a renewable India'],
    [press('ceo-rajnath'), 'Raksha Mantri Rajnath Singh', 'Honouring our ex-servicemen'],
    [press('ceo-defcom'), 'Keynote at DEFCOM India', 'Addressing the defence community'],
  ];
  const cw = (w - 3 * 14) / 4, ih = 122, y0 = y;
  items.forEach((it, i) => {
    const x = M + i * (cw + 14);
    drawImg(doc, it[0], x, y0, cw, ih, 8);
    doc.font('uiSB').fontSize(8.6).fillColor(C.ink).text(it[1], x, y0 + ih + 8, { width: cw, height: 24 });
    doc.font('body').fontSize(8).fillColor(C.mute).text(it[2], x, y0 + ih + 32, { width: cw, lineGap: 1.5 });
  });
  y = y0 + ih + 62;

  // TV / national-media band
  panel(doc, M, y, w, 74, C.mint, 9, C.line);
  eyebrow(doc, 'As Seen on National Media', M + 18, y + 14, C.gold);
  doc.font('body').fontSize(9.4).fillColor(C.body)
     .text('Lt. Gen. A.R. Prasad (Retd) is a sought-after voice on national television — bringing strategic insight to the nation’s biggest stories.', M + 18, y + 28, { width: w - 250 });
  const chans = ['India Today', 'Aaj Tak', 'India TV'];
  chans.forEach((c, i) => {
    const cx = M + w - 216 + i * 70;
    panel(doc, cx, y + 24, 62, 32, C.paper, 6, C.line);
    doc.font('uiB').fontSize(8.5).fillColor(C.emer).text(c, cx, y + 35, { width: 62, align: 'center' });
  });
  y += 74 + 18;

  // In the Newspapers
  eyebrow(doc, 'In the Newspapers', M, y, C.gold); y += 18;
  const clips = [
    ['news-bhaskar-tcpl', 'Dainik Bhaskar', '319 kWp rooftop solar for TCPL Greenery Agro (Tata Consumer), Vaishali.'],
    ['news-supersmelters-inaug', 'Regional Press', '1,980 kWp solar plant inaugurated at Super Smelters, with Tata Power Solar.'],
    ['news-supersmelters-rooftop', 'Jamuria Edition', '1,980 kWp rooftop solar power plant commissioned at Super Smelters, Asansol.'],
  ];
  const nw = (w - 2 * 14) / 3;
  clips.forEach((c, i) => {
    const x = M + i * (nw + 14);
    panel(doc, x, y, nw, 176, C.paper, 9, C.line);
    drawImg(doc, news(c[0]), x + 8, y + 8, nw - 16, 100, 5);
    doc.font('uiSB').fontSize(8).fillColor(C.gold).text(c[1].toUpperCase(), x + 12, y + 118, { characterSpacing: 0.8 });
    doc.font('body').fontSize(8.8).fillColor(C.body).text(c[2], x + 12, y + 131, { width: nw - 24, lineGap: 2 });
  });
}

// =============================================================================
//  PAGE 13 — UNDERSTANDING YOUR PROJECT (customised)
// =============================================================================
function understandPage(doc, data) {
  chrome(doc, 'Your Project');
  const W = doc.page.width, w = W - 2 * M;
  heading(doc, 'Section 11 · Tailored to You', 'Understanding Your Project');
  const m = model(data);
  let y = doc.y + 2;

  // snapshot table (2 cols of key/value)
  const rows = [
    ['Client', data.client_name || data.customer_name],
    ['Site / Location', data.location || data.site || data.city],
    ['State / DISCOM', [V(data.state, ''), V(data.discom, '')].filter(Boolean).join(' · ') || null],
    ['Segment', data.project_type],
    ['Installation', data.install_type],
    ['Grid Type', data.grid_type],
    ['Proposed Capacity', m.kwp ? m.kwp + ' kWp' : null],
    ['Est. Monthly Bill', data.monthly_bill ? inr(num(data.monthly_bill)) : null],
    ['Module / Inverter', [V(data.module_brand, ''), V(data.inverter_brand, '')].filter(Boolean).join(' · ') || null],
    ['Structure', data.structure_type],
    ['Net Metering', data.net_metering],
    ['Battery Backup', data.battery],
  ];
  const cw = (w - 18) / 2, rh = 38;
  rows.forEach((r, ci) => {
    const col = ci % 2, row = Math.floor(ci / 2);
    const x = M + col * (cw + 18), yy = y + row * rh;
    panel(doc, x, yy, cw, rh - 8, C.mint, 6);
    doc.rect(x, yy, 3, rh - 8).fill(C.emer);
    doc.font('ui').fontSize(8).fillColor(C.mute).text(String(r[0]).toUpperCase(), x + 14, yy + 6, { characterSpacing: 0.8 });
    doc.font('uiSB').fontSize(10.5).fillColor(C.ink).text(V(r[1]), x + 14, yy + 17, { width: cw - 24 });
  });
  y += Math.ceil(rows.length / 2) * rh + 16;

  // customised narrative
  const seg = String(data.project_type || '').toLowerCase();
  const inst = String(data.install_type || '').toLowerCase();
  let narr;
  if (seg.includes('resid'))
    narr = 'For your home, we will right-size a rooftop system to your sanctioned load and daytime consumption, maximising self-consumption and net-metering export. As a residential consumer you are eligible for the PM Surya Ghar subsidy, shortening your payback further while delivering decades of near-free daytime power.';
  else if (seg.includes('indust') || seg.includes('factory'))
    narr = 'For your industrial load, we engineer for maximum generation against your daytime demand — cutting the most expensive commercial tariff units first. You benefit from accelerated depreciation and a rapid 3–5 year payback, while our O&M keeps the plant at peak yield for its full 25-year life.';
  else if (seg.includes('comm'))
    narr = 'For your commercial premises, we design to slash the operating-hour tariff that hurts your bottom line, converting unused roof or land into a clean-power asset. Accelerated depreciation and low O&M make the economics compelling from year one.';
  else if (seg.includes('gov') || seg.includes('psu'))
    narr = 'For your institutional / PSU requirement, we deliver exactly to tender specification — with the statutory compliance, documentation and quality systems that public projects demand, backed by our SECI and Tata Power EPC track record.';
  else
    narr = 'We begin with a feasibility study and geo-technical survey of your site, then engineer a system sized precisely to your load and available roof or land. Every design decision is made to maximise lifetime generation, safety and return — and delivered with the discipline that defines Ingenieria.';
  const nh = 120;
  panel(doc, M, y, w, nh, C.cream, 9);
  doc.rect(M, y, 4, nh).fill(C.gold);
  iconChip(doc, inst.includes('ground') ? 'grid' : 'home', M + 18, y + 18, 38, C.paper, C.gold);
  doc.font('H').fontSize(18).fillColor(C.ink).text('Engineered for Your Requirement', M + 68, y + 22);
  doc.font('body').fontSize(10).fillColor(C.body).text(narr, M + 68, y + 48, { width: w - 88, lineGap: 3 });
  y += nh + 16;
  drawImg(doc, photo(inst.includes('ground') ? 'proj-seci' : 'proj-rooftop-pano'), M, y, w, 132, 9);
}

// =============================================================================
//  PAGE 14 — HOW SOLAR WORKS
// =============================================================================
function howItWorksPage(doc) {
  chrome(doc, 'How Solar Works');
  const W = doc.page.width, w = W - 2 * M;
  heading(doc, 'Section 12', 'From Sunlight to Savings');
  para(doc, 'A solar PV system converts free sunlight into clean electricity that powers your premises by day and earns you credit for any surplus. Here is how the energy flows.', M, doc.y, w, { size: 10.6 });
  let y = doc.y + 16;

  const steps = [
    ['sun', 'Sunlight', 'Photons strike Tier-1 PV modules on your roof or land.'],
    ['panel', 'DC Power', 'The modules generate direct-current (DC) electricity.'],
    ['bolt', 'Inverter', 'A smart inverter converts DC into grid-quality AC power.'],
    ['home', 'Your Load', 'Clean AC power runs your lights, machines & equipment.'],
    ['grid', 'The Grid', 'Surplus is exported; a net meter credits every unit.'],
  ];
  const n = steps.length, sw = (w - (n - 1) * 10) / n, sh = 150, y0 = y;
  steps.forEach((s, i) => {
    const x = M + i * (sw + 10);
    panel(doc, x, y0, sw, sh, C.mint, 9, C.line);
    doc.circle(x + sw / 2, y0 + 30, 16).fill(C.emer);
    doc.font('uiB').fontSize(11).fillColor('#fff').text(String(i + 1), x + sw / 2 - 6, y0 + 24, { width: 12, align: 'center' });
    icon(doc, s[0], x + sw / 2, y0 + 68, 11, C.gold);
    doc.font('uiSB').fontSize(10).fillColor(C.ink).text(s[1], x + 6, y0 + 90, { width: sw - 12, align: 'center' });
    doc.font('body').fontSize(8.2).fillColor(C.mute).text(s[2], x + 8, y0 + 106, { width: sw - 16, align: 'center', lineGap: 1.6 });
    if (i < n - 1) { doc.font('uiB').fontSize(15).fillColor(C.gold).text('›', x + sw + 0.5, y0 + 56, { width: 10, align: 'center' }); }
  });
  y = y0 + sh + 22;

  // photo + benefits
  const iw = w * 0.42;
  drawImg(doc, photo('how-photo'), M, y, iw, 184, 9);
  const bx = M + iw + 24, bw = w - iw - 24;
  eyebrow(doc, 'Why It Pays', bx, y + 4, C.gold);
  const bens = [
    ['rupee', 'Cut up to 90% of your electricity bill from day one.'],
    ['clock', 'Rapid 3–5 year payback, then decades of near-free power.'],
    ['shield', '25-year performance-warranted modules & robust structures.'],
    ['leaf', 'Slash your carbon footprint and meet ESG commitments.'],
  ];
  let by = y + 26;
  bens.forEach((b) => {
    iconChip(doc, b[0], bx, by, 30, C.mint2, C.emer);
    doc.font('body').fontSize(10.4).fillColor(C.body).text(b[1], bx + 40, by + 7, { width: bw - 46, lineGap: 2 });
    by += 42;
  });
}

// =============================================================================
//  PAGE 15 — NET METERING
// =============================================================================
function netMeteringPage(doc, data) {
  chrome(doc, 'Net Metering');
  const W = doc.page.width, w = W - 2 * M;
  heading(doc, 'Section 13 · Clarifying Your Doubts', 'Net Metering Explained');
  para(doc, 'Net metering lets your solar plant feed surplus power back into the grid. A bi-directional meter records both the units you import and the units you export — and you are billed only on the net. It is the mechanism that turns your roof into a virtual battery.', M, doc.y, w, { size: 10.6 });
  let y = doc.y + 16;

  // simple flow diagram
  const dY = y, dH = 150;
  panel(doc, M, dY, w, dH, C.mint, 9, C.line);
  const nodes = [
    ['sun', 'Solar Array', 0.10],
    ['bolt', 'Inverter', 0.32],
    ['grid', 'Net Meter', 0.55],
    ['home', 'Your Load', 0.78],
  ];
  const midY = dY + 64;
  nodes.forEach((nd, i) => {
    const cx = M + w * nd[2];
    doc.circle(cx, midY, 24).fill(C.paper); doc.circle(cx, midY, 24).lineWidth(1).strokeColor(C.emer).stroke();
    icon(doc, nd[0], cx, midY, 12, C.emer);
    doc.font('uiSB').fontSize(9.5).fillColor(C.ink).text(nd[1], cx - 45, midY + 34, { width: 90, align: 'center' });
    if (i < nodes.length - 1) {
      const nx = M + w * nodes[i + 1][2];
      doc.moveTo(cx + 26, midY).lineTo(nx - 30, midY).lineWidth(1.4).strokeColor(C.gold).stroke();
      doc.moveTo(nx - 28, midY).lineTo(nx - 35, midY - 4).lineTo(nx - 35, midY + 4).fill(C.gold);
    }
  });
  const mx = M + w * 0.55;
  doc.moveTo(mx, midY - 26).lineTo(mx, dY + 22).lineWidth(1.4).strokeColor(C.emer).dash(3, { space: 2 }).stroke().undash();
  doc.font('ui').fontSize(7.5).fillColor(C.emer).text('EXPORT ↑', mx + 8, dY + 18);
  y = dY + dH + 18;

  // three grid-type cards
  const modes = [
    ['grid', 'On-Grid', 'Connected to the utility grid with net metering. No batteries — surplus is exported for credit. The most economical option; ideal where grid supply is reliable.', C.emer, 'ongrid'],
    ['bolt', 'Off-Grid', 'Fully independent with battery storage. Powers you through outages and remote sites with no grid connection. Higher upfront cost, total energy autonomy.', C.gold, 'offgrid'],
    ['shield', 'Hybrid', 'The best of both — grid-tied with battery backup. You export surplus for credit and still keep critical loads running during outages.', C.navy, 'hybrid'],
  ];
  const chosen = String(data.grid_type || '').toLowerCase().replace(/[^a-z]/g, '');
  const cw = (w - 2 * 14) / 3, ch = 168;
  modes.forEach((mo, i) => {
    const x = M + i * (cw + 14);
    const active = chosen && chosen.includes(mo[4].slice(0, 5));
    panel(doc, x, y, cw, ch, active ? C.mint2 : C.paper, 9, active ? mo[3] : C.line);
    doc.rect(x, y, cw, 3).fill(mo[3]);
    iconChip(doc, mo[0], x + 16, y + 18, 34, C.mint2, mo[3]);
    doc.font('H').fontSize(17).fillColor(C.ink).text(mo[1], x + 58, y + 24);
    if (active) { doc.font('uiB').fontSize(7).fillColor(mo[3]).text('● YOUR CHOICE', x + 58, y + 44); }
    doc.font('body').fontSize(9.4).fillColor(C.body).text(mo[2], x + 16, y + 64, { width: cw - 32, lineGap: 3 });
  });
  y += ch + 18;

  // billed-on-the-net example strip
  panel(doc, M, y, w, 60, C.emerD, 9);
  doc.rect(M, y, 4, 60).fill(C.gold);
  doc.font('uiSB').fontSize(8.5).fillColor(C.goldB).text('BILLED ONLY ON THE NET', M + 20, y + 13, { characterSpacing: 1.2 });
  doc.font('bodyI').fontSize(12).fillColor('#ffffff')
     .text('Units exported to the grid are subtracted from units imported — you pay only for the difference, turning surplus daytime generation into real credit on your bill.',
           M + 20, y + 27, { width: w - 40 });
}

// =============================================================================
//  PAGE 16 — EXECUTION
// =============================================================================
function executionPage(doc) {
  chrome(doc, 'Execution');
  const W = doc.page.width, w = W - 2 * M;
  heading(doc, 'Section 14 · How We Deliver', 'Execution Methodology');
  para(doc, 'Military logistics translated into renewable-energy delivery — a disciplined, six-stage process with accountability at every checkpoint.', M, doc.y, w, { size: 10.6 });
  let y = doc.y + 14;
  const steps = [
    ['doc', 'Survey & Feasibility', 'Site assessment, geo-technical survey, shadow & structural analysis, load study.'],
    ['grid', 'Detailed Engineering', 'System sizing, single-line diagrams, structure & foundation design, Tier-1 BOQ.'],
    ['tools', 'Procurement', 'Tier-1 modules, smart inverters and BIS-grade balance-of-system — sourced & inspected.'],
    ['bolt', 'Piling & Civil', 'Hydraulic pile-driving, foundations, mounting structures, fencing & cable trenches.'],
    ['panel', 'Installation & Wiring', 'Module mounting, DC/AC wiring, earthing, LT/HT works and safety systems.'],
    ['sun', 'Testing & Commissioning', 'Grid synchronisation, DISCOM liaison, net-meter installation & handover with O&M.'],
  ];
  const cw = (w - 2 * 16) / 3, ch = 134, y0 = y;
  steps.forEach((s, i) => {
    const col = i % 3, row = Math.floor(i / 3);
    const x = M + col * (cw + 16), yy = y0 + row * (ch + 18);
    panel(doc, x, yy, cw, ch, C.paper, 9, C.line);
    doc.circle(x + 28, yy + 28, 17).fill(C.emer);
    doc.font('uiB').fontSize(12).fillColor('#fff').text(String(i + 1), x + 21, yy + 21, { width: 14, align: 'center' });
    icon(doc, s[0], x + cw - 24, yy + 26, 10, C.gold);
    doc.font('H').fontSize(15.5).fillColor(C.ink).text(s[1], x + 18, yy + 54, { width: cw - 36 });
    doc.font('body').fontSize(8.8).fillColor(C.body).text(s[2], x + 18, yy + 76, { width: cw - 36, lineGap: 2.4 });
  });
  y = y0 + 2 * (ch + 18) + 10;
  const iw = (w - 2 * 12) / 3;
  const ps = [['proj-piling-extra', 'Hydraulic Piling'], ['proj-earthing', 'Earthing & Safety'], ['proj-inauguration', 'Commissioning']];
  ps.forEach((p, i) => {
    const x = M + i * (iw + 12);
    drawImg(doc, photo(p[0]), x, y, iw, 116, 8);
    doc.font('uiSB').fontSize(8).fillColor(C.emer).text(p[1].toUpperCase(), x, y + 122, { width: iw, align: 'center', characterSpacing: 0.5 });
  });
}

// =============================================================================
//  PAGE 17 — SAVINGS & ROI
// =============================================================================
function savingsPage(doc, data) {
  chrome(doc, 'Savings & ROI');
  const W = doc.page.width, w = W - 2 * M;
  heading(doc, 'Section 15 · The Numbers', 'Savings & ROI Analysis');
  const m = model(data);
  let y = doc.y + 2;

  // top KPI cards
  const kpis = [
    ['System Size', (m.kwp) + ' kWp', C.emer],
    ['Annual Generation', Math.round(m.gen1).toLocaleString('en-IN') + ' kWh', C.navy],
    ['Year-1 Savings', inrShort(m.save1), C.gold],
    ['Payback Period', m.paybackYrs.toFixed(1) + ' yrs', C.emerM],
  ];
  const cw = (w - 3 * 12) / 4, ch = 60;
  kpis.forEach((k, i) => {
    const x = M + i * (cw + 12);
    panel(doc, x, y, cw, ch, C.mint, 9, C.line);
    doc.rect(x, y, 4, ch).fill(k[2]);
    doc.font('ui').fontSize(7.5).fillColor(C.mute).text(String(k[0]).toUpperCase(), x + 14, y + 11, { characterSpacing: 0.6 });
    doc.font('H').fontSize(19).fillColor(C.ink).text(k[1], x + 14, y + 24);
  });
  y += ch + 18;

  // 25-year cumulative savings chart
  eyebrow(doc, '25-Year Cumulative Savings', M, y, C.gold); y += 16;
  const chX = M, chY = y, chW = w, chH = 150;
  panel(doc, chX, chY, chW, chH, C.paper, 9, C.line);
  const padL = 54, padB = 24, padT = 14, padR = 14;
  const plotX = chX + padL, plotY = chY + padT, plotW = chW - padL - padR, plotH = chH - padT - padB;
  const maxV = m.series[m.series.length - 1];
  for (let g = 0; g <= 4; g++) {
    const gy = plotY + plotH - (plotH * g / 4);
    doc.moveTo(plotX, gy).lineTo(plotX + plotW, gy).lineWidth(0.5).strokeColor(C.line).stroke();
    doc.font('ui').fontSize(7).fillColor(C.mute).text(inrShort(maxV * g / 4), chX + 6, gy - 4, { width: padL - 10, align: 'right' });
  }
  const pts = m.series.map((v, i) => [plotX + (plotW * i / 24), plotY + plotH - (plotH * v / maxV)]);
  doc.save();
  doc.moveTo(plotX, plotY + plotH);
  pts.forEach((p) => doc.lineTo(p[0], p[1]));
  doc.lineTo(plotX + plotW, plotY + plotH).closePath();
  const grad = doc.linearGradient(0, plotY, 0, plotY + plotH);
  grad.stop(0, C.emer, 0.55).stop(1, C.emer, 0.06);
  doc.fill(grad); doc.restore();
  doc.save().moveTo(pts[0][0], pts[0][1]);
  pts.forEach((p) => doc.lineTo(p[0], p[1]));
  doc.lineWidth(1.6).strokeColor(C.emer).stroke(); doc.restore();
  [1, 5, 10, 15, 20, 25].forEach((yr) => {
    const px = plotX + (plotW * (yr - 1) / 24);
    doc.font('ui').fontSize(7).fillColor(C.mute).text('Yr ' + yr, px - 10, plotY + plotH + 8, { width: 20, align: 'center' });
  });
  doc.font('ui').fontSize(7.5).fillColor(C.emer).text('25-YEAR TOTAL', plotX + plotW - 120, plotY + 6, { width: 116, align: 'right' });
  doc.font('H').fontSize(20).fillColor(C.emer).text(inrShort(m.cum25), plotX + plotW - 120, plotY + 16, { width: 116, align: 'right' });
  y = chY + chH + 16;

  // environmental impact strip
  panel(doc, M, y, w, 58, C.emer, 9);
  const env = [[Math.round(m.co2_25).toLocaleString('en-IN') + ' t', 'CO₂ avoided (25 yr)'],
               [(m.trees).toLocaleString('en-IN'), 'Trees planted equiv. /yr'],
               [m.dailyUnits.toLocaleString('en-IN'), 'Units generated per day'],
               ['90%', 'Typical bill offset']];
  const ew = w / env.length;
  env.forEach((e, i) => {
    const cx = M + i * ew;
    if (i) doc.moveTo(cx, y + 12).lineTo(cx, y + 46).lineWidth(0.6).strokeColor('#2f7a60').stroke();
    doc.font('H').fontSize(19).fillColor('#fff').text(e[0], cx, y + 10, { width: ew, align: 'center' });
    doc.font('ui').fontSize(7.3).fillColor('#bfe7d6').text(String(e[1]).toUpperCase(), cx, y + 37, { width: ew, align: 'center', characterSpacing: 0.5 });
  });
  y += 58 + 8;
  doc.font('bodyI').fontSize(8).fillColor(C.mute)
     .text('Estimates based on 1,500 kWh/kWp annual yield, 3.5% tariff escalation and 0.6%/yr degradation. Actual results vary with site, weather and DISCOM policy.', M, y, { width: w });
}

// =============================================================================
//  PAGE 18 — QUALITY, SAFETY & WARRANTY
// =============================================================================
function qualityPage(doc) {
  chrome(doc, 'Quality & Warranty');
  const W = doc.page.width, w = W - 2 * M;
  heading(doc, 'Section 16 · Assurance', 'Quality, Safety & Warranty');
  para(doc, 'Every plant is engineered to audited, triple-ISO standards using Tier-1 hardware — and backed by warranties that protect your investment for decades.', M, doc.y, w, { size: 10.6 });
  let y = doc.y + 14;

  const certs = [['iso-9001', 'ISO 9001', 'Quality Management'], ['iso-14001', 'ISO 14001', 'Environmental Mgmt.'], ['iso-45001', 'ISO 45001', 'Occupational Safety'], ['award-india5000', 'India 5000', 'Best MSME Award']];
  const cw = (w - 3 * 14) / 4, ih = 150, y0 = y;
  certs.forEach((c, i) => {
    const x = M + i * (cw + 14);
    panel(doc, x, y0, cw, ih + 38, C.paper, 9, C.line);
    drawImg(doc, cert(c[0]), x + 12, y0 + 12, cw - 24, ih - 12, 4);
    doc.font('uiSB').fontSize(10).fillColor(C.ink).text(c[1], x, y0 + ih + 8, { width: cw, align: 'center' });
    doc.font('body').fontSize(8).fillColor(C.mute).text(c[2], x, y0 + ih + 22, { width: cw, align: 'center' });
  });
  y = y0 + ih + 38 + 20;

  eyebrow(doc, 'Warranty & Assurance', M, y, C.gold); y += 18;
  const rows = [
    ['Solar Modules', 'Tier-1, mono PERC / TOPCon', '25-year linear · 12-year product'],
    ['Inverters', 'Smart string / central', '5–10 years (extendable)'],
    ['Mounting Structure', 'Hot-dip galvanised / GI', '10–15 years vs. corrosion'],
    ['Workmanship (EPC)', 'Ingenieria installation', '5-year comprehensive'],
    ['Plant Performance', 'Guaranteed generation', 'As per PPA / contract terms'],
  ];
  const c0 = M, c1 = M + 150, c2 = M + 320;
  panel(doc, M, y, w, 26, C.emer, 5);
  doc.font('uiSB').fontSize(8).fillColor('#fff');
  doc.text('COMPONENT', c0 + 12, y + 9); doc.text('SPECIFICATION', c1, y + 9); doc.text('WARRANTY', c2, y + 9);
  y += 26;
  rows.forEach((r, i) => {
    const rh = 36;
    if (i % 2) doc.save().rect(M, y, w, rh).fill(C.mint).restore();
    doc.font('uiSB').fontSize(9.8).fillColor(C.ink).text(r[0], c0 + 12, y + 12, { width: 140 });
    doc.font('body').fontSize(9.6).fillColor(C.body).text(r[1], c1, y + 12, { width: 165 });
    doc.font('uiM').fontSize(9.6).fillColor(C.emer).text(r[2], c2, y + 12, { width: W - M - c2 - 10 });
    doc.moveTo(M, y + rh).lineTo(W - M, y + rh).lineWidth(0.5).strokeColor(C.line).stroke();
    y += rh;
  });
}

// =============================================================================
//  PAGE 19 — FAQ
// =============================================================================
function faqPage(doc) {
  chrome(doc, 'FAQ');
  const W = doc.page.width, w = W - 2 * M;
  heading(doc, 'Section 17 · Your Questions, Answered', 'Frequently Asked Questions');
  let y = doc.y + 4;
  const faqs = [
    ['Will rooftop solar damage my roof?', 'No. We use leak-proof, structurally engineered mounting and conduct a full structural and shadow analysis before installation to protect your roof’s integrity.'],
    ['How much can I actually save?', 'Most clients offset 70–90% of their electricity bill and reach payback in 3–5 years, then enjoy decades of near-free daytime power.'],
    ['What happens on cloudy days or at night?', 'On-grid systems draw seamlessly from the grid when generation is low; net metering credits your daytime surplus. Hybrid systems add battery backup for outages.'],
    ['Do you handle the DISCOM & net-metering paperwork?', 'Yes. We manage the entire DISCOM liaison, net-metering application, inspections and grid-synchronisation approvals end to end.'],
    ['What subsidy am I eligible for?', 'Residential consumers qualify for the PM Surya Ghar subsidy; commercial & industrial clients benefit from accelerated depreciation. We help you claim what applies.'],
    ['How long does installation take?', 'A typical rooftop is commissioned in 3–6 weeks; larger ground-mount plants follow a project schedule shared upfront and tracked with military discipline.'],
    ['What maintenance does a solar plant need?', 'Very little — periodic module cleaning and inverter checks. Our O&M packages cover preventive & corrective maintenance, monitoring and rapid fault resolution.'],
    ['Why choose Ingenieria over others?', 'A 100% veteran-led, triple-ISO team with a portfolio from 10 kWp rooftops to the 300 MW SECI park — and the discipline to deliver every one on time.'],
  ];
  const cw = (w - 24) / 2, rowH = 116;
  faqs.forEach((f, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = M + col * (cw + 24), yy = y + row * rowH;
    doc.save().roundedRect(x - 12, yy - 10, cw + 24, rowH - 8, 9).fill(i % 2 ? C.mint : C.paper).restore();
    if (!(i % 2)) doc.roundedRect(x - 12, yy - 10, cw + 24, rowH - 8, 9).lineWidth(0.8).strokeColor(C.line).stroke();
    doc.font('uiB').fontSize(11).fillColor(C.gold).text('Q', x, yy);
    doc.font('uiSB').fontSize(10.8).fillColor(C.ink).text(f[0], x + 18, yy, { width: cw - 18 });
    doc.font('body').fontSize(9.6).fillColor(C.body).text(f[1], x + 18, doc.y + 3, { width: cw - 18, lineGap: 2.8 });
  });
}

// =============================================================================
//  PAGE 20 — THANK YOU
// =============================================================================
function thankYouPage(doc) {
  const W = doc.page.width, H = doc.page.height;
  bleed(doc, C.emerD);
  doc.rect(0, 0, W, 4).fill(C.gold);
  drawImg(doc, photo('hero-solar-farm'), 0, H - 220, W, 220);
  const veil = doc.linearGradient(0, H - 220, 0, H);
  veil.stop(0, C.emerD, 1).stop(1, C.emerD, 0.55);
  doc.rect(0, H - 220, W, 220).fill(veil);

  logo(doc, W / 2 - 62, 84, 124, false);
  doc.font('script').fontSize(58).fillColor('#ffffff').text('Thank You', 0, 214, { width: W, align: 'center' });
  triTick(doc, W / 2 - 45, 296, 90);
  doc.font('bodyI').fontSize(14).fillColor('#dcf3e7')
     .text('We would be honoured to power your future.', 0, 316, { width: W, align: 'center' });

  // dark "cold" contact card — emerald, gold-edged (no white)
  const cw = 400, cx = W / 2 - cw / 2, cy = 376;
  panel(doc, cx, cy, cw, 136, '#0b3a2b', 12, '#1f6b4f');
  doc.rect(cx, cy, cw, 4).fill(C.gold);
  doc.font('uiSB').fontSize(9).fillColor(C.goldB).text('START YOUR SOLAR PROJECT', cx, cy + 22, { width: cw, align: 'center', characterSpacing: 1.6 });
  doc.font('H').fontSize(24).fillColor('#ffffff').text('Arrays Ingenieria Pvt. Ltd.', cx, cy + 38, { width: cw, align: 'center' });
  doc.font('body').fontSize(10).fillColor('#cfe9df')
     .text('Ex-Servicemen Led  ·  ISO 9001 · 14001 · 45001  ·  Pan-India', cx, cy + 72, { width: cw, align: 'center' });
  doc.font('uiSB').fontSize(11.5).fillColor(C.goldB)
     .text('arraysingenieria@gmail.com', cx, cy + 92, { width: cw, align: 'center' });
  doc.font('ui').fontSize(9).fillColor('#a7cfc0')
     .text('www.arraysingenieria.com', cx, cy + 110, { width: cw, align: 'center' });

  doc.font('bodyI').fontSize(11).fillColor('#a7cfc0')
     .text('Developing Green Energy for the Nation', 0, H - 58, { width: W, align: 'center' });
}

// =============================================================================
//  ORCHESTRATION
// =============================================================================
export function renderProposal(doc, data = {}) {
  registerFonts(doc);
  doc.page.margins.bottom = 0;
  doc.on('pageAdded', () => { doc.page.margins.bottom = 0; });

  const pages = [
    (d) => coverPage(d, data),
    (d) => tocPage(d),
    (d) => confidentialityPage(d),
    (d) => leadershipPage(d),
    (d) => aboutPage(d),
    (d) => whyPage(d),
    (d) => servicesPage(d),
    (d) => industriesPage(d),
    (d) => clientsPage(d),
    (d) => trackRecordPage(d),
    (d) => testimonialsPage(d),
    (d) => recognitionPage(d),
    (d) => understandPage(d, data),
    (d) => howItWorksPage(d),
    (d) => netMeteringPage(d, data),
    (d) => executionPage(d),
    (d) => savingsPage(d, data),
    (d) => qualityPage(d),
    (d) => faqPage(d),
    (d) => thankYouPage(d),
  ];
  pages.forEach((fn, i) => { if (i) doc.addPage(); fn(doc); });
  return doc;
}

// Shared brand toolkit so the Quotation & BOQ documents render in the exact
// same identity (fonts, palette, chrome, helpers) as the proposal book.
export { registerFonts };
export const KIT = {
  C, M, chrome, bleed, heading, para, panel, eyebrow, triTick,
  iconChip, icon, drawImg, logo, statBand,
  photo, press, cert, news, V, num, inr, inrShort, model,
};

export default { renderProposal, PROPOSAL_BRAND, KIT, registerFonts };
