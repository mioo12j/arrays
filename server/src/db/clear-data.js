// Wipes all operational data so the app starts empty, while KEEPING login users
// and the expense-category reference list. Run with: npm run clear
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool } from '../config/db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// All data tables (everything except `users` and `expense_categories`).
const TABLES = [
  'audit_logs',
  'ledger_entries',
  'payments',
  'receipts',
  'invoices',
  'bank_statement_lines',
  'bank_statements',
  'vendor_accounts',
  'vendors',
  'employees',
  'clients',
  'sites',
  'projects',
  'quotes',
  'vault_document_versions',
  'vault_documents',
  'materials',
  'shipments',
  'geo_verifications',
  'documents',
];

async function clear() {
  // eslint-disable-next-line no-console
  console.log('[clear] Truncating data tables (keeping users + expense_categories) ...');
  await pool.query(`TRUNCATE ${TABLES.join(', ')} RESTART IDENTITY CASCADE`);

  // Remove uploaded files from local storage (keep the folder + .gitkeep)
  const uploadDir = path.resolve(__dirname, '../../uploads');
  if (fs.existsSync(uploadDir)) {
    for (const f of fs.readdirSync(uploadDir)) {
      if (f === '.gitkeep') continue;
      try { fs.rmSync(path.join(uploadDir, f), { force: true }); } catch { /* ignore */ }
    }
  }

  // eslint-disable-next-line no-console
  console.log('[clear] Done. Users and expense categories preserved; all other data removed.');
  await pool.end();
}

clear().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('[clear] Failed:', err.message);
  process.exit(1);
});
