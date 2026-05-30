import { Router } from 'express';
import { query, withTransaction } from '../config/db.js';
import { asyncHandler, ApiError } from '../utils/asyncHandler.js';
import { authenticate } from '../middleware/auth.js';
import { audit } from '../middleware/audit.js';
import { upload } from '../middleware/upload.js';
import { parseVendorFile } from '../services/vendor-import.service.js';

const router = Router();
router.use(authenticate);

// Upsert a vendor + optional accounts within a transaction (used by import).
// Import brings in core identity (beneficiary_id / nickname / account) and
// marks the record as a candidate for later manual enrichment.
async function upsertVendor(db, v, userId) {
  // Idempotent on account number: if this beneficiary account already exists,
  // reuse that vendor instead of creating a duplicate on re-import.
  if (v.account_number) {
    const { rows: existing } = await db.query(
      `SELECT vendor_id FROM vendor_accounts WHERE account_number=$1 LIMIT 1`,
      [String(v.account_number).trim()]
    );
    if (existing[0]) {
      const { rows: ev } = await db.query('SELECT * FROM vendors WHERE id=$1', [existing[0].vendor_id]);
      return { ...(ev[0] || {}), _skipped: true };
    }
  }
  const { rows } = await db.query(
    `INSERT INTO vendors (name, beneficiary_id, gstin, contact_name, phone, email, address, bank_account, ifsc, category, material_type, tags, is_candidate, first_seen_date)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,COALESCE($12::text[],'{}'),true,CURRENT_DATE)
     RETURNING *`,
    [v.name, v.beneficiary_id || null, v.gstin, v.contact_name, v.phone, v.email, v.address,
     v.account_number || v.bank_account, v.ifsc, v.category, v.material_type, v.tags]
  );
  const vendor = rows[0];
  if (v.account_number) {
    await db.query(
      `INSERT INTO vendor_accounts (vendor_id, account_number, ifsc, label)
       VALUES ($1,$2,$3,$4) ON CONFLICT (account_number) DO NOTHING`,
      [vendor.id, String(v.account_number).trim(), v.ifsc, 'primary']
    );
  }
  return vendor;
}

// GET /api/vendors  (with balances from the view)
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { rows } = await query(`
      SELECT v.*, b.balance, b.total_paid,
        (SELECT COUNT(*) FROM payments p WHERE p.vendor_id=v.id AND p.invoice_status='pending') AS pending_invoices
      FROM vendors v
      LEFT JOIN v_vendor_balances b ON b.vendor_id = v.id
      ORDER BY v.name
    `);
    res.json(rows);
  })
);

// GET /api/vendors/:id/ledger
router.get(
  '/:id/ledger',
  asyncHandler(async (req, res) => {
    const { rows: vendor } = await query('SELECT * FROM vendors WHERE id=$1', [req.params.id]);
    if (!vendor[0]) throw new ApiError(404, 'Vendor not found');

    const { rows: entries } = await query(
      `SELECT le.*, p.name AS project_name
       FROM ledger_entries le
       LEFT JOIN projects p ON p.id = le.project_id
       WHERE le.party_type='vendor' AND le.party_id=$1
       ORDER BY le.entry_date, le.created_at`,
      [req.params.id]
    );

    // running balance
    let bal = vendor[0].opening_balance || 0;
    const ledger = entries.map((e) => {
      bal += e.direction === 'credit' ? e.amount : -e.amount;
      return { ...e, running_balance: bal };
    });

    const { rows: bView } = await query('SELECT * FROM v_vendor_balances WHERE vendor_id=$1', [req.params.id]);

    res.json({
      vendor: vendor[0],
      summary: bView[0] || { balance: vendor[0].opening_balance || 0, total_paid: 0 },
      entries: ledger,
    });
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const b = req.body || {};
    if (!b.name) throw new ApiError(400, 'Vendor name is required');
    const vendor = await withTransaction(async (db) => {
      const { rows } = await db.query(
        `INSERT INTO vendors (name, gstin, contact_name, phone, email, address, bank_account, ifsc, category, material_type, tags, opening_balance, notes)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,COALESCE($11::text[],'{}'),$12,$13) RETURNING *`,
        [b.name, b.gstin, b.contact_name, b.phone, b.email, b.address, b.bank_account, b.ifsc,
         b.category, b.material_type, b.tags, b.opening_balance || 0, b.notes]
      );
      const v = rows[0];
      if (b.bank_account) {
        await db.query(
          `INSERT INTO vendor_accounts (vendor_id, account_number, ifsc, label)
           VALUES ($1,$2,$3,'primary') ON CONFLICT (account_number) DO NOTHING`,
          [v.id, String(b.bank_account).trim(), b.ifsc]
        );
      }
      return v;
    });
    await audit(req, { action: 'create', entity: 'vendors', entityId: vendor.id, changes: b });
    res.status(201).json(vendor);
  })
);

// GET /api/vendors/:id  (with linked accounts + spend)
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const { rows } = await query('SELECT * FROM vendors WHERE id=$1', [req.params.id]);
    if (!rows[0]) throw new ApiError(404, 'Vendor not found');
    const { rows: accounts } = await query(
      'SELECT * FROM vendor_accounts WHERE vendor_id=$1 ORDER BY created_at', [req.params.id]
    );
    res.json({ ...rows[0], accounts });
  })
);

// POST /api/vendors/:id/accounts  (add a beneficiary/labour account)
router.post(
  '/:id/accounts',
  asyncHandler(async (req, res) => {
    const { account_number, ifsc, label } = req.body || {};
    if (!account_number) throw new ApiError(400, 'Account number is required');
    const { rows } = await query(
      `INSERT INTO vendor_accounts (vendor_id, account_number, ifsc, label)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [req.params.id, String(account_number).trim(), ifsc, label]
    );
    await audit(req, { action: 'create', entity: 'vendor_accounts', entityId: rows[0].id, changes: req.body });
    res.status(201).json(rows[0]);
  })
);

// POST /api/vendors/import  (Excel/CSV vendor list -> Vendor Master)
router.post(
  '/import',
  upload.single('file'),
  asyncHandler(async (req, res) => {
    if (!req.file) throw new ApiError(400, 'A vendor list file is required');
    const parsed = await parseVendorFile(req.file.path, req.file.mimetype);
    if (!parsed.length) throw new ApiError(422, 'No vendor rows could be read from this file');

    const result = await withTransaction(async (db) => {
      let created = 0, skipped = 0, accounts = 0;
      for (const v of parsed) {
        const vendor = await upsertVendor(db, v, req.user.id);
        if (vendor?._skipped) { skipped++; continue; }
        created++;
        if (v.account_number) accounts++;
      }
      return { created, skipped, accounts };
    });
    await audit(req, { action: 'create', entity: 'vendors', changes: { imported: result.created } });
    res.status(201).json({ imported: result.created, skipped: result.skipped, accounts_linked: result.accounts, total_rows: parsed.length });
  })
);

router.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const b = req.body || {};
    const { rows } = await query(
      `UPDATE vendors SET
        name=COALESCE($1,name), gstin=COALESCE($2,gstin), contact_name=COALESCE($3,contact_name),
        phone=COALESCE($4,phone), email=COALESCE($5,email), address=COALESCE($6,address),
        bank_account=COALESCE($7,bank_account), ifsc=COALESCE($8,ifsc), category=COALESCE($9,category),
        opening_balance=COALESCE($10,opening_balance), notes=COALESCE($11,notes)
       WHERE id=$12 RETURNING *`,
      [b.name, b.gstin, b.contact_name, b.phone, b.email, b.address, b.bank_account, b.ifsc, b.category, b.opening_balance, b.notes, req.params.id]
    );
    if (!rows[0]) throw new ApiError(404, 'Vendor not found');
    await audit(req, { action: 'update', entity: 'vendors', entityId: req.params.id, changes: b });
    res.json(rows[0]);
  })
);

export default router;
