// ============================================================================
//  Publish to Cloud — one-way data sync from the LOCAL database to the cloud
//  (Neon) database. Copies DATA ONLY (table rows), never the uploaded files —
//  the heavy proof images / PDFs stay on the local computer; the cloud just
//  shows the structured data so the admin can review it on the web.
//
//  It fully mirrors local -> cloud each run (truncate target, copy rows), in
//  foreign-key dependency order. Document ROWS are copied (so links resolve)
//  but the physical files are not uploaded.
// ============================================================================
import pg from 'pg';

const { Pool } = pg;

// Tables in FK dependency order (parents first). Truncated + re-copied each run.
// Tables not present in the cloud schema are skipped automatically, so this list
// can safely include newer tables before the cloud has been migrated.
const TABLES = [
  'app_config',
  'users',
  'expense_categories',
  'clients',
  'vendors',
  'employees',
  'projects',
  'sites',
  'project_payment_terms',
  'vendor_accounts',
  'gst_branches',
  'gst_number_series',
  'documents',
  'invoices',
  'invoice_items',
  'gst_einvoices',
  'gst_eway_bills',
  'delivery_challans',
  'delivery_challan_items',
  'payments',
  'receipts',
  'ledger_entries',
  'bank_statements',
  'bank_statement_lines',
  'quotes',
  'materials',
  'shipments',
  'geo_verifications',
  'audit_logs',
  'vault_documents',
  'vault_document_versions',
];

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

/**
 * @param source   a pg Pool/Client connected to the LOCAL database
 * @param targetUrl  cloud (Neon) connection string
 * @returns per-table row counts
 */
export async function syncToCloud(source, targetUrl) {
  if (!targetUrl) throw new Error('CLOUD_DATABASE_URL is not set — cannot reach the cloud database.');

  // Cloud hosts need SSL; a local target (testing) must not use SSL.
  const isLocal = /@(localhost|127\.0\.0\.1)[:/]/.test(targetUrl);
  const target = new Pool({
    connectionString: targetUrl,
    ssl: isLocal ? false : { rejectUnauthorized: false },
    max: 4,
  });
  const counts = {};
  try {
    // Only touch tables that actually exist in the cloud schema, so a cloud DB
    // that hasn't been migrated to the very latest schema never breaks the run.
    const { rows: cloudTables } = await target.query(
      `SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE'`);
    const present = new Set(cloudTables.map((r) => r.table_name));
    const tables = TABLES.filter((t) => present.has(t));

    // Clear the cloud data tables (single CASCADE handles cross-table FKs).
    if (tables.length) await target.query(`TRUNCATE ${tables.map((t) => `"${t}"`).join(', ')} RESTART IDENTITY CASCADE`);

    for (const table of tables) {
      // Use the cloud schema's columns as the source of truth.
      const { rows: colMeta } = await target.query(
        `SELECT column_name, data_type FROM information_schema.columns
         WHERE table_schema='public' AND table_name=$1 ORDER BY ordinal_position`,
        [table]
      );
      if (!colMeta.length) { counts[table] = 0; continue; }
      const cols = colMeta.map((c) => c.column_name);
      const jsonb = new Set(colMeta.filter((c) => c.data_type === 'jsonb' || c.data_type === 'json').map((c) => c.column_name));

      const colSql = cols.map((c) => `"${c}"`).join(', ');
      const { rows } = await source.query(`SELECT ${colSql} FROM "${table}"`);
      counts[table] = rows.length;
      if (!rows.length) continue;

      // Insert in batches; JSONB values must be stringified, arrays pass as-is.
      const perRow = cols.length;
      const batchSize = Math.max(1, Math.floor(50000 / perRow));
      for (const part of chunk(rows, batchSize)) {
        const params = [];
        const tuples = part.map((row) => {
          const ph = cols.map((c) => {
            let v = row[c];
            if (jsonb.has(c) && v != null && typeof v === 'object') v = JSON.stringify(v);
            params.push(v === undefined ? null : v);
            return `$${params.length}`;
          });
          return `(${ph.join(', ')})`;
        });
        await target.query(`INSERT INTO "${table}" (${colSql}) VALUES ${tuples.join(', ')}`, params);
      }
    }
    return counts;
  } finally {
    await target.end();
  }
}
