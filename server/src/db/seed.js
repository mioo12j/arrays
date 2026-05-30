// Seeds default users, expense categories and a couple of demo records so the
// dashboard isn't empty on first run. Idempotent: safe to run multiple times.
import bcrypt from 'bcryptjs';
import { pool } from '../config/db.js';

async function upsertUser(name, email, password, role) {
  const hash = await bcrypt.hash(password, 10);
  await pool.query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ($1,$2,$3,$4)
     ON CONFLICT (email) DO UPDATE SET name=EXCLUDED.name, role=EXCLUDED.role`,
    [name, email, hash, role]
  );
}

async function seedCategories() {
  const cats = [
    ['Steel', 'expense'],
    ['Solar Panels', 'expense'],
    ['Cables', 'expense'],
    ['Inverters', 'expense'],
    ['Mounting Structure', 'expense'],
    ['Transport', 'expense'],
    ['Labour', 'expense'],
    ['Civil Work', 'expense'],
    ['Electrical', 'expense'],
    ['Miscellaneous', 'expense'],
    ['Project Revenue', 'revenue'],
  ];
  for (const [name, kind] of cats) {
    await pool.query(
      `INSERT INTO expense_categories (name, kind) VALUES ($1,$2)
       ON CONFLICT (name) DO NOTHING`,
      [name, kind]
    );
  }
}

async function main() {
  // eslint-disable-next-line no-console
  console.log('[seed] Seeding users ...');
  await upsertUser('System Admin', 'admin@ingenieria.com', 'Admin@123', 'admin');
  await upsertUser('Operations Clerk', 'operator@ingenieria.com', 'Operator@123', 'operator');

  // eslint-disable-next-line no-console
  console.log('[seed] Seeding expense categories ...');
  await seedCategories();

  // eslint-disable-next-line no-console
  console.log('[seed] Done.');
  await pool.end();
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('[seed] Failed:', err.message);
  process.exit(1);
});
