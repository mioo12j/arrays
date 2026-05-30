import { Router } from 'express';
import { query } from '../config/db.js';
import { asyncHandler, ApiError } from '../utils/asyncHandler.js';
import { authenticate } from '../middleware/auth.js';
import { audit } from '../middleware/audit.js';

const router = Router();
router.use(authenticate);

// GET /api/clients (with receivable summary)
router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const { rows } = await query(`
      SELECT c.*, b.total_billed, b.total_received, b.outstanding,
        (SELECT COUNT(*) FROM invoices i WHERE i.client_id=c.id AND i.status='overdue') AS overdue_invoices
      FROM clients c
      LEFT JOIN v_client_balances b ON b.client_id=c.id
      ORDER BY c.name
    `);
    res.json(rows);
  })
);

// GET /api/clients/:id/ledger
router.get(
  '/:id/ledger',
  asyncHandler(async (req, res) => {
    const { rows: client } = await query('SELECT * FROM clients WHERE id=$1', [req.params.id]);
    if (!client[0]) throw new ApiError(404, 'Client not found');

    const { rows: entries } = await query(
      `SELECT le.*, p.name AS project_name
       FROM ledger_entries le
       LEFT JOIN projects p ON p.id=le.project_id
       WHERE le.party_type='client' AND le.party_id=$1
       ORDER BY le.entry_date, le.created_at`,
      [req.params.id]
    );
    let bal = client[0].opening_balance || 0;
    const ledger = entries.map((e) => {
      bal += e.direction === 'debit' ? e.amount : -e.amount; // debit = billed (increases receivable)
      return { ...e, running_balance: bal };
    });

    const { rows: invoices } = await query(
      'SELECT * FROM invoices WHERE client_id=$1 ORDER BY issue_date DESC NULLS LAST, created_at DESC',
      [req.params.id]
    );
    const { rows: bView } = await query('SELECT * FROM v_client_balances WHERE client_id=$1', [req.params.id]);

    res.json({
      client: client[0],
      summary: bView[0] || { total_billed: 0, total_received: 0, outstanding: 0 },
      entries: ledger,
      invoices,
    });
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const b = req.body || {};
    if (!b.name) throw new ApiError(400, 'Client name is required');
    const { rows } = await query(
      `INSERT INTO clients (name, gstin, contact_name, phone, email, address, opening_balance, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [b.name, b.gstin, b.contact_name, b.phone, b.email, b.address, b.opening_balance || 0, b.notes]
    );
    await audit(req, { action: 'create', entity: 'clients', entityId: rows[0].id, changes: b });
    res.status(201).json(rows[0]);
  })
);

router.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const b = req.body || {};
    const { rows } = await query(
      `UPDATE clients SET
        name=COALESCE($1,name), gstin=COALESCE($2,gstin), contact_name=COALESCE($3,contact_name),
        phone=COALESCE($4,phone), email=COALESCE($5,email), address=COALESCE($6,address),
        opening_balance=COALESCE($7,opening_balance), notes=COALESCE($8,notes)
       WHERE id=$9 RETURNING *`,
      [b.name, b.gstin, b.contact_name, b.phone, b.email, b.address, b.opening_balance, b.notes, req.params.id]
    );
    if (!rows[0]) throw new ApiError(404, 'Client not found');
    await audit(req, { action: 'update', entity: 'clients', entityId: req.params.id, changes: b });
    res.json(rows[0]);
  })
);

export default router;
