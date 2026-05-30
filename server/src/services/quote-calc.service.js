// ============================================================================
//  Solar project estimation engine.
//  Given a system size + project type + (optional) rate overrides, it computes
//  a full Bill of Quantities, cost, contingency, margin, GST and total.
//  All rates are explicit and overridable — no hidden/dummy numbers.
// ============================================================================

// Default rates (INR). Tuned per project type; every value is overridable
// through the `inputs` payload so estimates reflect real procurement prices.
const DEFAULTS = {
  panel_wattage: 545,            // Wp per module
  panel_rate: 11990,             // ₹ per module (~22/Wp)
  inverter_rate_per_kw: 4200,    // ₹ per kW
  structure_rate_per_kw: 3500,   // ₹ per kW
  cable_rate_per_kw: 1800,       // ₹ per kW (AC+DC)
  earthing_rate_per_kw: 650,     // ₹ per kW (earthing + LA)
  civil_rate_per_kw: 0,          // set per project type below
  labour_rate_per_kw: 2500,      // ₹ per kW (installation)
  bos_rate_per_kw: 1200,         // balance of system / accessories
  transport_rate_per_kw: 500,    // ₹ per kW
  contingency_pct: 3,            // % of subtotal
  margin_pct: 15,                // markup % on cost
  gst_pct: 13.8,                 // blended GST on solar (illustrative)
  tariff_per_kwh: 8,             // grid tariff offset (₹/kWh) for savings calc
  generation_per_kw_year: 1500,  // kWh per kW per year (~17% CUF)
  subsidy_amount: 0,             // manual override for non-residential
};

// Project-type specific civil work intensity (₹ per kW).
const CIVIL_BY_TYPE = {
  residential: 500,
  rooftop: 600,
  commercial: 900,
  institutional: 900,
  government: 1000,
  industrial: 1500,
  ground_mount: 3200,
  utility: 3200,
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
  if (!r.civil_rate_per_kw) r.civil_rate_per_kw = CIVIL_BY_TYPE[type] ?? CIVIL_BY_TYPE.rooftop;

  const panelCount = wp > 0 ? Math.ceil(wp / r.panel_wattage) : 0;

  const items = [
    line('Solar PV Modules', panelCount, 'nos', r.panel_rate, panelCount * r.panel_rate,
      `${r.panel_wattage} Wp modules`),
    line('Inverters', kw, 'kW', r.inverter_rate_per_kw, kw * r.inverter_rate_per_kw, 'String/central inverters'),
    line('Module Mounting Structure', kw, 'kW', r.structure_rate_per_kw, kw * r.structure_rate_per_kw,
      type === 'ground_mount' ? 'Galvanized ground structure' : 'Rooftop structure'),
    line('DC + AC Cabling', kw, 'kW', r.cable_rate_per_kw, kw * r.cable_rate_per_kw, 'Cables, conduits, terminations'),
    line('Earthing & Lightning Arrestor', kw, 'kW', r.earthing_rate_per_kw, kw * r.earthing_rate_per_kw, 'Earthing pits + LA'),
    line('Balance of System', kw, 'kW', r.bos_rate_per_kw, kw * r.bos_rate_per_kw, 'ACDB/DCDB, accessories'),
    line('Civil Work', kw, 'kW', r.civil_rate_per_kw, kw * r.civil_rate_per_kw, `${labelType(type)} foundation/civil`),
    line('Installation Labour', kw, 'kW', r.labour_rate_per_kw, kw * r.labour_rate_per_kw, 'Erection & commissioning'),
    line('Transportation', kw, 'kW', r.transport_rate_per_kw, kw * r.transport_rate_per_kw, 'Logistics to site'),
  ];

  const subtotal = round(items.reduce((s, i) => s + i.amount, 0));
  const contingency_amount = round(subtotal * (r.contingency_pct / 100));
  const cost_amount = round(subtotal + contingency_amount);
  const margin_amount = round(cost_amount * (r.margin_pct / 100));
  const taxable_amount = round(cost_amount + margin_amount);
  const gst_amount = round(taxable_amount * (r.gst_pct / 100));
  const total_amount = round(taxable_amount + gst_amount);
  const per_watt = wp > 0 ? round(total_amount / wp) : 0;

  // Subsidy + return-on-investment
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
