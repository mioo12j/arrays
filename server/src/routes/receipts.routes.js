import { Router } from 'express';
import { query, withTransaction } from '../config/db.js';
import { asyncHandler, ApiError } from '../utils/asyncHandler.js';
import { authenticate } from '../middleware/auth.js';
import { audit } from '../middleware/audit.js';
import { upload } from '../middleware/upload.js';
import { saveDocument } from '../services/document.service.js';
import { parseReceiptFields, extractText } from '../services/ocr.service.js';
import { postLedgerEntry, removeLedgerForSource, refreshInvoiceStatus } from '../services/ledger.service.js';

const router = Router();
router.use(authenticate);

// ── Upload proof & extract ──────────────────────────────────────────────────
router.post(
  '/extract',
  upload.single('file'),
  asyncHandler(async (req, res) => {
    if (!req.file) throw new ApiError(400, 'A receipt proof file is required');
    const text = await extractText(req.file.path, req.file.mimetype);
    const fields = parseReceiptFields(text);
    const doc = await saveDocument({ file: req.file, kind: 'receipt_proof', userId: req.user.id });
    await query('UPDATE documents SET ocr_text=$1, ocr_json=$2 WHERE id=$3', [
      text, JSON.stringify(fields), doc.id,
    ]);
    res.json({ document_id: doc.id, extracted: fields, ocr_preview: (text || '').slice(0, 600) });
  })
);

// ── Save receipt ────────────────────────────────────────────────────────────
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const b = req.body || {};
    if (!b.credited_amount || Number(b.credited_amount) <= 0) {
      throw new ApiError(400, 'A valid credited amount is required');
    }
    if (!b.client_id) throw new ApiError(400, 'A client must be selected');

    const receipt = await withTransaction(async (db) => {
      const { rows } = await db.query(
        `INSERT INTO receipts
          (reference_id, credited_amount, credited_date, account_details, client_id,
           invoice_id, project_id, site_id, deduction_amount, deduction_reason,
           tds_amount, retention_amount, comment, proof_document_id, source, created_by)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,'manual',$15)
         RETURNING *`,
        [b.reference_id, b.credited_amount, b.credited_date || null, b.account_details, b.client_id,
         b.invoice_id || null, b.project_id || null, b.site_id || null,
         b.deduction_amount || 0, b.deduction_reason, b.tds_amount || 0, b.retention_amount || 0,
         b.comment, b.proof_document_id || null, req.user.id]
      );
      const created = rows[0];

      if (created.proof_document_id) {
        await db.query(`UPDATE documents SET entity='receipts', entity_id=$1 WHERE id=$2`,
          [created.id, created.proof_document_id]);
      }

      // Automation: credit client ledger by the FULL settled value
      // (cash received + deductions/TDS/retention all reduce the receivable).
      const settled = Number(created.credited_amount) + Number(created.deduction_amount) +
                      Number(created.tds_amount) + Number(created.retention_amount);
      await postLedgerEntry(db, {
        partyType: 'client', partyId: created.client_id, direction: 'credit',
        amount: settled, entryDate: created.credited_date,
        description: created.comment || `Receipt ${created.reference_id || ''}`.trim(),
        projectId: created.project_id, siteId: created.site_id,
        sourceType: 'receipt', sourceId: created.id, userId: req.user.id,
      });

      // Refresh linked invoice status
      if (created.invoice_id) await refreshInvoiceStatus(db, created.invoice_id);

      return created;
    });

    await audit(req, { action: 'create', entity: 'receipts', entityId: receipt.id, changes: b });
    res.status(201).json(receipt);
  })
);

// ── List ────────────────────────────────────────────────────────────────────
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { search, client_id, project_id, from, to } = req.query;
    const clauses = [];
    const p = [];
    if (search) { p.push(`%${search}%`); clauses.push(`(r.reference_id ILIKE $${p.length} OR r.comment ILIKE $${p.length})`); }
    if (client_id) { p.push(client_id); clauses.push(`r.client_id=$${p.length}`); }
    if (project_id) { p.push(project_id); clauses.push(`r.project_id=$${p.length}`); }
    if (from) { p.push(from); clauses.push(`r.credited_date >= $${p.length}`); }
    if (to) { p.push(to); clauses.push(`r.credited_date <= $${p.length}`); }
    const whereSql = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';

    const { rows } = await query(
      `SELECT r.*, c.name AS client_name, pr.name AS project_name, i.invoice_number
       FROM receipts r
       LEFT JOIN clients c ON c.id=r.client_id
       LEFT JOIN projects pr ON pr.id=r.project_id
       LEFT JOIN invoices i ON i.id=r.invoice_id
       ${whereSql}
       ORDER BY r.credited_date DESC NULLS LAST, r.created_at DESC
       LIMIT 500`,
      p
    );
    res.json(rows);
  })
);

router.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const b = req.body || {};
    const updated = await withTransaction(async (db) => {
      const { rows } = await db.query(
        `UPDATE receipts SET
          reference_id=COALESCE($1,reference_id), credited_amount=COALESCE($2,credited_amount),
          credited_date=COALESCE($3,credited_date), account_details=COALESCE($4,account_details),
          client_id=COALESCE($5,client_id), invoice_id=COALESCE($6,invoice_id),
          project_id=COALESCE($7,project_id), site_id=COALESCE($8,site_id),
          deduction_amount=COALESCE($9,deduction_amount), deduction_reason=COALESCE($10,deduction_reason),
          tds_amount=COALESCE($11,tds_amount), retention_amount=COALESCE($12,retention_amount),
          comment=COALESCE($13,comment)
         WHERE id=$14 RETURNING *`,
        [b.reference_id, b.credited_amount, b.credited_date, b.account_details, b.client_id,
         b.invoice_id, b.project_id, b.site_id, b.deduction_amount, b.deduction_reason,
         b.tds_amount, b.retention_amount, b.comment, req.params.id]
      );
      if (!rows[0]) throw new ApiError(404, 'Receipt not found');
      const r = rows[0];
      await removeLedgerForSource(db, 'receipt', r.id);
      const settled = Number(r.credited_amount) + Number(r.deduction_amount) +
                      Number(r.tds_amount) + Number(r.retention_amount);
      await postLedgerEntry(db, {
        partyType: 'client', partyId: r.client_id, direction: 'credit',
        amount: settled, entryDate: r.credited_date, description: r.comment,
        projectId: r.project_id, siteId: r.site_id,
        sourceType: 'receipt', sourceId: r.id, userId: req.user.id,
      });
      if (r.invoice_id) await refreshInvoiceStatus(db, r.invoice_id);
      return r;
    });
    await audit(req, { action: 'update', entity: 'receipts', entityId: req.params.id, changes: b });
    res.json(updated);
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await withTransaction(async (db) => {
      const { rows } = await db.query('SELECT invoice_id FROM receipts WHERE id=$1', [req.params.id]);
      await removeLedgerForSource(db, 'receipt', req.params.id);
      await db.query('DELETE FROM receipts WHERE id=$1', [req.params.id]);
      if (rows[0]?.invoice_id) await refreshInvoiceStatus(db, rows[0].invoice_id);
    });
    await audit(req, { action: 'delete', entity: 'receipts', entityId: req.params.id });
    res.json({ ok: true });
  })
);

export default router;
