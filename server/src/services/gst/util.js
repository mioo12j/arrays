// Small shared helpers for the GST JSON builders.

// dd/mm/yyyy — the date format the IRP and EWB portals expect.
export function toDdMmYyyy(d) {
  if (!d) return null;
  const dt = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(dt.getTime())) return null;
  const dd = String(dt.getDate()).padStart(2, '0');
  const mm = String(dt.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}/${dt.getFullYear()}`;
}

export const yn = (b) => (b ? 'Y' : 'N');
export const n2 = (v) => Math.round((Number(v || 0) + Number.EPSILON) * 100) / 100;
export const intOrNull = (v) => (v == null || v === '' ? null : parseInt(v, 10));
export const strOrNull = (v) => (v == null || v === '' ? null : String(v));
