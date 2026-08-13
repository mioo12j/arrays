// ============================================================================
//  Solar project estimation engine.
//  Given a system size + project type + (optional) rate overrides, it computes
//  a full Bill of Quantities, cost, contingency, margin, GST and total.
//  All rates are explicit and overridable — no hidden/dummy numbers.
// ============================================================================

// Default rates (INR). Tuned per project type; every value is overridable
// through the `inputs` payload so estimates reflect real procurement prices.
// All work rates are ₹ PER WATT (₹/Wp). e.g. ₹4/W civil on a 25 kWp system
// = ₹4 × 25,000 W. Operator rates are the final client price (they already
// include the company's margin) — no hidden margin/contingency is added.
const DEFAULTS = {
  panel_wattage: 545,            // Wp per module
  panel_rate: 11990,             // ₹ per module (when panel basis = module)
  panel_rate_per_watt: 22,       // ₹/W  (when panel basis = watt)
  extra_module_pct: 0,           // % extra modules on client demand
  inverter_rate: 4.2,            // ₹/W
  structure_rate: 3.5,           // ₹/W
  bos_rate: 4,                   // ₹/W  — combined cabling + earthing + balance of system
  civil_rate: 0,                 // ₹/W  (set per project type below)
  labour_rate: 2.5,              // ₹/W  — installation, testing & commissioning
  transport_rate: 0.5,           // ₹/W  (only when transport is not included)
  contingency_pct: 0,            // optional — off by default
  margin_pct: 15,                // operator markup on cost; distributed across BOQ item rates
  gst_pct: 13.8,                 // blended GST on solar
  tariff_per_kwh: 8,             // grid tariff offset (₹/kWh) for savings calc
  generation_per_kw_year: 1500,  // kWh per kW per year (~17% CUF)
  subsidy_amount: 0,             // manual override for non-residential
};

// Project-type specific civil work intensity (₹ per watt).
const CIVIL_BY_TYPE = {
  residential: 0.5,
  rooftop: 0.6,
  commercial: 0.9,
  institutional: 0.9,
  government: 1.0,
  industrial: 1.5,
  ground_mount: 3.2,
  utility: 3.2,
};

// PM Surya Ghar residential subsidy (capped ₹78,000).
function residentialSubsidy(kw) {
  return Math.min(78000, 30000 * Math.min(kw, 2) + (kw > 2 ? 18000 : 0));
}

const round = (n) => Math.round((Number(n) || 0) * 100) / 100;

export function calculateQuote(input = {}) {
  const r = { ...DEFAULTS, ...clean(input) };
  const kw = Number(input.capacity_kw || 0);
  const wp = kw * 1000;
  const type = input.project_type || 'rooftop';
  if (!r.civil_rate) r.civil_rate = CIVIL_BY_TYPE[type] ?? CIVIL_BY_TYPE.rooftop;
  const panelBasis = String(input.panel_rate_basis || 'module') === 'watt' ? 'watt' : 'module';
  const transportIncluded = !(input.transport_included === false || String(input.transport_included).toLowerCase() === 'false' || String(input.transport_included).toLowerCase() === 'no');

  const extraPct = Number(r.extra_module_pct) || 0;
  const panelCount = wp > 0 ? Math.ceil((wp * (1 + extraPct / 100)) / r.panel_wattage) : 0;

  // Operator-defined custom line items take priority. Their amounts are the
  // FINAL client-facing prices (already include margin) — the sum is taxable.
  const custom = normalizeItems(input.custom_items, wp, r);
  let items, subtotal, taxable_amount, margin_amount = 0;
  const contingency_amount = 0;
  const isCustom = !!custom;

  if (custom) {
    items = custom;
  } else {
    // per-watt work rates → a whole-of-work billing (1 Lot / Set), modules by Nos
    const panelUnitRate = panelBasis === 'watt' ? round(r.panel_rate_per_watt * r.panel_wattage) : round(r.panel_rate);
    const lot = (name, ratePerW, unit, note) => line(name, 1, unit, round(wp * ratePerW), round(wp * ratePerW), note);
    items = [
      line('Solar PV Modules', panelCount, 'Nos', panelUnitRate, round(panelCount * panelUnitRate),
        `${r.panel_wattage} Wp${extraPct ? ` · incl. ${extraPct}% extra` : ''}`),
      lot('Inverter', r.inverter_rate, 'Set', 'String / central inverter'),
      lot('Module Mounting Structure', r.structure_rate, 'Lot', type === 'ground_mount' ? 'Galvanised ground structure' : 'Rooftop structure'),
      lot('Cabling, Earthing & Balance of System', r.bos_rate, 'Lot', 'DC/AC cables, earthing, LA, ACDB/DCDB'),
      lot('Civil Work', r.civil_rate, 'Lot', `${labelType(type)} civil / foundation`),
      lot('Installation, Testing & Commissioning', r.labour_rate, 'Lot', 'Erection, testing & commissioning'),
      ...(transportIncluded ? [] : [lot('Transportation', r.transport_rate, 'Lot', 'Logistics to site')]),
      ...normalizeExtras(input.custom_extras, wp, panelCount),
    ].filter((i) => i.amount > 0);
  }
  subtotal = round(items.reduce((s, i) => s + i.amount, 0));
  // Custom items are already the final price; for the rate-based BOQ the operator's
  // margin is added on top and later distributed across the item rates (never shown
  // as a line to the client).
  if (!isCustom) margin_amount = round(subtotal * (Number(r.margin_pct) || 0) / 100);
  taxable_amount = round(subtotal + margin_amount);
  const cost_amount = subtotal;

  // GST: operator may set the rate or a fixed amount (breakdown handled in UI/PDF)
  const gst_pct = Number(input.gst_pct) || r.gst_pct;
  const gst_amount = Number(input.gst_amount) > 0 ? round(input.gst_amount) : round(taxable_amount * (gst_pct / 100));
  const total_amount = round(taxable_amount + gst_amount);
  const per_watt = wp > 0 ? round(total_amount / wp) : 0;

  // Subsidy + return-on-investment (savings use the operator's tariff & yield)
  const subsidy_amount = type === 'residential'
    ? residentialSubsidy(kw)
    : round(r.subsidy_amount || 0);
  const net_cost = round(total_amount - subsidy_amount);
  const annual_generation = round(kw * r.generation_per_kw_year);
  const annual_savings = round(annual_generation * r.tariff_per_kwh);
  const payback_years = annual_savings > 0 ? round(net_cost / annual_savings) : 0;
  const lifetime_savings = round(annual_savings * 25);

  return {
    inputs: r,
    project_type: type,
    capacity_kw: kw,
    panel_count: panelCount,
    line_items: items,
    subtotal,
    contingency_amount,
    cost_amount,
    margin_amount,
    taxable_amount,
    gst_amount,
    total_amount,
    per_watt,
    subsidy_amount,
    net_cost,
    annual_generation,
    annual_savings,
    payback_years,
    lifetime_savings,
    co2_offset_tonnes: round(annual_generation * 0.00071 * 25), // ~0.71 kg CO2/kWh over 25y
  };
}

function line(item, qty, unit, rate, amount, note) {
  return { item, qty: round(qty), unit, rate: round(rate), amount: round(amount), note };
}

// Sanitize operator-supplied custom line items. Amount = explicit amount, else
// qty × rate; a per-watt unit with no qty computes against the whole system's
// wattage. Returns null when there are no usable rows (falls back to auto BOQ).
function normalizeItems(list, wp, r) {
  if (!Array.isArray(list)) return null;
  const items = list.map((ci) => {
    const desc = String(ci.description ?? ci.item ?? '').trim();
    if (!desc) return null;
    const unit = (String(ci.unit ?? 'Nos').trim()) || 'Nos';
    const qty = Number(ci.qty) || 0;
    const rate = Number(ci.rate) || 0;
    let amount = (ci.amount !== undefined && ci.amount !== null && ci.amount !== '') ? Number(ci.amount) : NaN;
    if (!Number.isFinite(amount)) {
      amount = (/w(p|att)?$|\/\s*w/i.test(unit) && qty === 0) ? wp * rate : qty * rate;
    }
    return line(desc, qty, unit, rate, amount, String(ci.note ?? '').trim());
  }).filter(Boolean);
  return items.length ? items : null;
}

// Extra/optional works added on top of the auto BOQ (e.g. transformer, DG sync).
// basis: 'watt' → rate × system watts; 'module' → rate × module count; else qty × rate.
function normalizeExtras(list, wp, panelCount) {
  if (!Array.isArray(list)) return [];
  return list.map((x) => {
    const name = String(x.name ?? x.description ?? '').trim();
    if (!name) return null;
    const unit = (String(x.unit ?? 'Lot').trim()) || 'Lot';
    const basis = String(x.basis ?? '').toLowerCase();
    const qty = Number(x.qty) || 1;
    const rate = Number(x.rate) || 0;
    let amount;
    if (basis === 'watt') amount = wp * rate;
    else if (basis === 'module') amount = panelCount * rate;
    else amount = qty * rate;
    return line(name, qty, unit, rate, round(amount), String(x.note ?? '').trim());
  }).filter(Boolean);
}
function labelType(t) {
  return ({ rooftop: 'Rooftop', ground_mount: 'Ground Mount', industrial: 'Industrial', commercial: 'Commercial' })[t] || 'Rooftop';
}
// Keep only numeric rate overrides from the input payload.
function clean(input) {
  const out = {};
  for (const k of Object.keys(DEFAULTS)) {
    if (input[k] !== undefined && input[k] !== null && input[k] !== '' && !Number.isNaN(Number(input[k]))) {
      out[k] = Number(input[k]);
    }
  }
  return out;
}
