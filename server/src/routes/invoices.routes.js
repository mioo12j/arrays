import { Router } from 'express';
import { query, withTransaction } from '../config/db.js';
import { asyncHandler, ApiError } from '../utils/asyncHandler.js';
import { authenticate } from '../middleware/auth.js';
import { noImportForAdmin } from '../middleware/rbac.js';
import { audit } from '../middleware/audit.js';
import { upload } from '../middleware/upload.js';
import { saveDocument } from '../services/document.service.js';
import { postLedgerEntry, removeLedgerForSource, refreshInvoiceStatus } from '../services/ledger.service.js';
import { extractText, parseInvoiceFields } from '../services/ocr.service.js';

const router = Router();
router.use(authenticate);

// Import an invoice file (PDF/scan/Excel) and auto-extract fields for review.
router.post(
  '/extract',
  noImportForAdmin,
  upload.single('file'),
  asyncHandler(async (req, res) => {
    if (!req.file) throw new ApiError(400, 'An invoice file is required');
    const text = await extractText(req.file.path, req.file.mimetype);
    const fields = parseInvoiceFields(text);
    const doc = await saveDocument({ file: req.file, kind: 'invoice', userId: req.user.id });
    await query('UPDATE documents SET ocr_text=$1, ocr_json=$2 WHERE id=$3', [text, JSON.stringify(fields), doc.id]);
    res.json({ document_id: doc.id, extracted: fields, ocr_preview: (text || '').slice(0, 600) });
  })
);

// Posts/repaints the client billing ledger debit for an invoice based on status.
async function syncInvoiceLedger(db, invoice, userId) {
  await removeLedgerForSource(db, 'invoice', invoice.id);
  if (invoice.status !== 'draft' && invoice.client_id) {
    await postLedgerEntry(db, {
      partyType: 'client', partyId: invoice.client_id, direction: 'debit',
      amount: invoice.total_amount, entryDate: invoice.issue_date,
      description: `Invoice ${invoice.invoice_number}`,
      projectId: invoice.project_id, siteId: invoice.site_id,
      sourceType: 'invoice', sourceId: invoice.id, userId,
    });
  }
}

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { search, client_id, project_id, status, type } = req.query;
    const clauses = [];
    const p = [];
    if (search) { p.push(`%${search}%`); clauses.push(`i.invoice_number ILIKE $${p.length}`); }
    if (client_id) { p.push(client_id); clauses.push(`i.client_id=$${p.length}`); }
    if (project_id) { p.push(project_id); clauses.push(`i.project_id=$${p.length}`); }
    if (status) { p.push(status); clauses.push(`i.status=$${p.length}`); }
    if (type) { p.push(type); clauses.push(`i.type=$${p.length}`); }
    const whereSql = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const { rows } = await query(
      `SELECT i.*, c.name AS client_name, pr.name AS project_name,
        (i.total_amount - i.amount_received) AS balance_due
       FROM invoices i
       LEFT JOIN clients c ON c.id=i.client_id
       LEFT JOIN projects pr ON pr.id=i.project_id
       ${whereSql}
       ORDER BY i.issue_date DESC NULLS LAST, i.created_at DESC LIMIT 500`,
      p
    );
    res.json(rows);
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const { rows } = await query(
      `SELECT i.*, c.name AS client_name, pr.name AS project_name
       FROM invoices i
       LEFT JOIN clients c ON c.id=i.client_id
       LEFT JOIN projects pr ON pr.id=i.project_id
       WHERE i.id=$1`, [req.params.id]
    );
    if (!rows[0]) throw new ApiError(404, 'Invoice not found');
    const { rows: receipts } = await query(
      'SELECT * FROM receipts WHERE invoice_id=$1 ORDER BY credited_date', [req.params.id]
    );
    res.json({ ...rows[0], receipts });
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const b = req.body || {};
    if (!b.invoice_number) throw new ApiError(400, 'Invoice number is required');
    const taxable = Number(b.taxable_amount || 0);
    const gst = Number(b.gst_amount || 0);
    const total = b.total_amount != null ? Number(b.total_amount) : taxable + gst;

    const invoice = await withTransaction(async (db) => {
      const { rows } = await db.query(
        `INSERT INTO invoices
          (invoice_number, type, status, client_id, project_id, site_id,
           issue_date, due_date, taxable_amount, gst_amount, total_amount, notes, document_id, created_by)
         VALUES ($1,COALESCE($2,'tax')::invoice_type,COALESCE($3,'draft')::invoice_status,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
         RETURNING *`,
        [b.invoice_number, b.type, b.status, b.client_id || null, b.project_id || null, b.site_id || null,
         b.issue_date || null, b.due_date || null, taxable, gst, total, b.notes, b.document_id || null, req.user.id]
      );
      const inv = rows[0];
      if (b.document_id) await db.query(`UPDATE documents SET entity='invoices', entity_id=$1 WHERE id=$2`, [inv.id, b.document_id]);
      await syncInvoiceLedger(db, inv, req.user.id);
      return inv;
    });
    await audit(req, { action: 'create', entity: 'invoices', entityId: invoice.id, changes: b });
    res.status(201).json(invoice);
  })
);

router.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const b = req.body || {};
    const updated = await withTransaction(async (db) => {
      const { rows } = await db.query(
        `UPDATE invoices SET
          invoice_number=COALESCE($1,invoice_number), type=COALESCE($2::invoice_type,type),
          status=COALESCE($3::invoice_status,status), client_id=COALESCE($4,client_id),
          project_id=COALESCE($5,project_id), site_id=COALESCE($6,site_id),
          issue_date=COALESCE($7,issue_date), due_date=COALESCE($8,due_date),
          taxable_amount=COALESCE($9,taxable_amount), gst_amount=COALESCE($10,gst_amount),
          total_amount=COALESCE($11,total_amount), notes=COALESCE($12,notes)
         WHERE id=$13 RETURNING *`,
        [b.invoice_number, b.type, b.status, b.client_id, b.project_id, b.site_id,
         b.issue_date, b.due_date, b.taxable_amount, b.gst_amount, b.total_amount, b.notes, req.params.id]
      );
      if (!rows[0]) throw new ApiError(404, 'Invoice not found');
      await syncInvoiceLedger(db, rows[0], req.user.id);
      await refreshInvoiceStatus(db, rows[0].id);
      const { rows: fresh } = await db.query('SELECT * FROM invoices WHERE id=$1', [req.params.id]);
      return fresh[0];
    });
    await audit(req, { action: 'update', entity: 'invoices', entityId: req.params.id, changes: b });
    res.json(updated);
  })
);

// Upload an external invoice PDF
router.post(
  '/:id/document',
  upload.single('file'),
  asyncHandler(async (req, res) => {
    if (!req.file) throw new ApiError(400, 'Invoice file is required');
    const doc = await saveDocument({
      file: req.file, kind: 'invoice', entity: 'invoices', entityId: req.params.id, userId: req.user.id,
    });
    await query('UPDATE invoices SET document_id=$1 WHERE id=$2', [doc.id, req.params.id]);
    await audit(req, { action: 'upload', entity: 'invoices', entityId: req.params.id });
    res.json(doc);
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await withTransaction(async (db) => {
      await removeLedgerForSource(db, 'invoice', req.params.id);
      await db.query('DELETE FROM invoices WHERE id=$1', [req.params.id]);
    });
    await audit(req, { action: 'delete', entity: 'invoices', entityId: req.params.id });
    res.json({ ok: true });
  })
);

export default router;
