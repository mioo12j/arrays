import { Router } from 'express';
import { query, withTransaction, pool } from '../config/db.js';
import { asyncHandler, ApiError } from '../utils/asyncHandler.js';
import { authenticate } from '../middleware/auth.js';
import { audit } from '../middleware/audit.js';
import { upload } from '../middleware/upload.js';
import { saveDocument } from '../services/document.service.js';
import { parsePaymentFields, extractText } from '../services/ocr.service.js';
import { postLedgerEntry, removeLedgerForSource } from '../services/ledger.service.js';
import { autoMapVendor } from '../services/vendor-match.service.js';

const router = Router();
router.use(authenticate);

// Post the payment as a debit to its payee ledger — an employee if set,
// otherwise the vendor. (A payment is to one payee, never both ledgers.)
async function postPaymentLedger(db, pay, userId) {
  if (pay.employee_id) {
    await postLedgerEntry(db, {
      partyType: 'employee', partyId: pay.employee_id, direction: 'debit',
      amount: pay.amount, entryDate: pay.payment_date, description: pay.comment,
      projectId: pay.project_id, siteId: pay.site_id, sourceType: 'payment', sourceId: pay.id, userId,
    });
  } else if (pay.vendor_id) {
    await postLedgerEntry(db, {
      partyType: 'vendor', partyId: pay.vendor_id, direction: 'debit',
      amount: pay.amount, entryDate: pay.payment_date, description: pay.comment,
      projectId: pay.project_id, siteId: pay.site_id, sourceType: 'payment', sourceId: pay.id, userId,
    });
  }
}

// ── Step 1: Upload proof & auto-extract (OCR) ───────────────────────────────
// POST /api/payments/extract   (multipart: file)
// Returns parsed fields + the stored document id. The operator then reviews/
// corrects the fields and POSTs to /api/payments to save.
router.post(
  '/extract',
  upload.single('file'),
  asyncHandler(async (req, res) => {
    if (!req.file) throw new ApiError(400, 'A payment proof file is required');
    const text = await extractText(req.file.path, req.file.mimetype);
    const fields = parsePaymentFields(text);
    const doc = await saveDocument({
      file: req.file,
      kind: 'payment_proof',
      userId: req.user.id,
    });
    // attach ocr text to the doc record
    await query('UPDATE documents SET ocr_text=$1, ocr_json=$2 WHERE id=$3', [
      text, JSON.stringify(fields), doc.id,
    ]);
    // Suggest a vendor from the Vendor Master (account or fuzzy name)
    const suggested = await autoMapVendor(pool, {
      accountNumber: fields.account_details, beneficiary: fields.beneficiary_name,
    });
    res.json({
      document_id: doc.id, extracted: fields, suggested_vendor: suggested,
      ocr_preview: (text || '').slice(0, 600),
    });
  })
);

// ── Step 2: Save the verified payment ───────────────────────────────────────
// POST /api/payments
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const b = req.body || {};

    // Mandatory operator comment — business meaning lives here.
    if (!b.comment || !String(b.comment).trim()) {
      throw new ApiError(400, 'An additional comment is mandatory before saving a payment');
    }
    if (!b.amount || Number(b.amount) <= 0) {
      throw new ApiError(400, 'A valid amount is required');
    }

    const payment = await withTransaction(async (db) => {
      // Auto-map a vendor if neither vendor nor employee was picked.
      if (!b.vendor_id && !b.employee_id) {
        const m = await autoMapVendor(db, {
          accountNumber: b.account_details, beneficiary: b.beneficiary_name,
        });
        if (m) b.vendor_id = m.vendor_id;
      }
      const { rows } = await db.query(
        `INSERT INTO payments
          (reference_id, amount, payment_date, beneficiary_name, account_details,
           bank_remarks, comment, payment_mode, network_type,
           project_id, site_id, vendor_id, employee_id, category_id, material_type, tags,
           invoice_status, proof_document_id, source, created_by)
         VALUES ($1,$2,$3,$4,$5,$6,$7,COALESCE($8,'neft')::payment_mode,$9,
                 $10,$11,$12,$13,$14,$15,$16,
                 COALESCE($17,'pending')::invoice_link,$18,'manual',$19)
         RETURNING *`,
        [
          b.reference_id, b.amount, b.payment_date || null, b.beneficiary_name, b.account_details,
          b.bank_remarks, b.comment.trim(), b.payment_mode, b.network_type,
          b.project_id || null, b.site_id || null, b.vendor_id || null, b.employee_id || null,
          b.category_id || null, b.material_type, b.tags || [],
          b.invoice_status, b.proof_document_id || null, req.user.id,
        ]
      );
      const created = rows[0];

      // Link the proof document to this payment
      if (created.proof_document_id) {
        await db.query(
          `UPDATE documents SET entity='payments', entity_id=$1 WHERE id=$2`,
          [created.id, created.proof_document_id]
        );
      }

      // Automation: post a debit to the payee ledger (employee takes priority,
      // else vendor) so money paid out reflects in that party's statement.
      await postPaymentLedger(db, created, req.user.id);
      return created;
    });

    await audit(req, { action: 'create', entity: 'payments', entityId: payment.id, changes: b });
    res.status(201).json(payment);
  })
);

// ── List with filters ───────────────────────────────────────────────────────
// GET /api/payments?search=&project_id=&vendor_id=&site_id=&invoice_status=&from=&to=
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { search, project_id, vendor_id, site_id, category_id, invoice_status, from, to } = req.query;
    const clauses = [];
    const p = [];
    if (search) { p.push(`%${search}%`); clauses.push(`(p.reference_id ILIKE $${p.length} OR p.beneficiary_name ILIKE $${p.length} OR p.comment ILIKE $${p.length} OR p.bank_remarks ILIKE $${p.length} OR v.name ILIKE $${p.length})`); }
    if (project_id) { p.push(project_id); clauses.push(`p.project_id=$${p.length}`); }
    if (vendor_id) { p.push(vendor_id); clauses.push(`p.vendor_id=$${p.length}`); }
    if (site_id) { p.push(site_id); clauses.push(`p.site_id=$${p.length}`); }
    if (category_id) { p.push(category_id); clauses.push(`p.category_id=$${p.length}`); }
    if (invoice_status) { p.push(invoice_status); clauses.push(`p.invoice_status=$${p.length}`); }
    if (from) { p.push(from); clauses.push(`p.payment_date >= $${p.length}`); }
    if (to) { p.push(to); clauses.push(`p.payment_date <= $${p.length}`); }
    const whereSql = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';

    const { rows } = await query(
      `SELECT p.*,
        v.name AS vendor_name, e.name AS employee_name, pr.name AS project_name, s.name AS site_name,
        ec.name AS category_name
       FROM payments p
       LEFT JOIN vendors v ON v.id=p.vendor_id
       LEFT JOIN employees e ON e.id=p.employee_id
       LEFT JOIN projects pr ON pr.id=p.project_id
       LEFT JOIN sites s ON s.id=p.site_id
       LEFT JOIN expense_categories ec ON ec.id=p.category_id
       ${whereSql}
       ORDER BY p.payment_date DESC NULLS LAST, p.created_at DESC
       LIMIT 500`,
      p
    );
    res.json(rows);
  })
);

// GET /api/payments/:id
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const { rows } = await query(
      `SELECT p.*, v.name AS vendor_name, pr.name AS project_name, s.name AS site_name,
        ec.name AS category_name,
        d.original_name AS proof_name, d.stored_name AS proof_file
       FROM payments p
       LEFT JOIN vendors v ON v.id=p.vendor_id
       LEFT JOIN projects pr ON pr.id=p.project_id
       LEFT JOIN sites s ON s.id=p.site_id
       LEFT JOIN expense_categories ec ON ec.id=p.category_id
       LEFT JOIN documents d ON d.id=p.proof_document_id
       WHERE p.id=$1`,
      [req.params.id]
    );
    if (!rows[0]) throw new ApiError(404, 'Payment not found');
    res.json(rows[0]);
  })
);

// PATCH /api/payments/:id  (re-classify; re-posts ledger if vendor/amount change)
router.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const b = req.body || {};
    if (b.comment !== undefined && !String(b.comment).trim()) {
      throw new ApiError(400, 'Comment cannot be empty');
    }
    const updated = await withTransaction(async (db) => {
      const { rows } = await db.query(
        `UPDATE payments SET
          reference_id=COALESCE($1,reference_id), amount=COALESCE($2,amount),
          payment_date=COALESCE($3,payment_date), beneficiary_name=COALESCE($4,beneficiary_name),
          account_details=COALESCE($5,account_details), bank_remarks=COALESCE($6,bank_remarks),
          comment=COALESCE($7,comment), payment_mode=COALESCE($8::payment_mode,payment_mode),
          network_type=COALESCE($9,network_type), project_id=COALESCE($10,project_id),
          site_id=COALESCE($11,site_id), vendor_id=COALESCE($12,vendor_id),
          category_id=COALESCE($13,category_id), material_type=COALESCE($14,material_type),
          tags=COALESCE($15,tags), employee_id=COALESCE($17,employee_id)
         WHERE id=$16 RETURNING *`,
        [b.reference_id, b.amount, b.payment_date, b.beneficiary_name, b.account_details,
         b.bank_remarks, b.comment, b.payment_mode, b.network_type, b.project_id,
         b.site_id, b.vendor_id, b.category_id, b.material_type, b.tags, req.params.id, b.employee_id]
      );
      if (!rows[0]) throw new ApiError(404, 'Payment not found');
      const pay = rows[0];
      // Rebuild the payee ledger entry for this payment (employee or vendor)
      await removeLedgerForSource(db, 'payment', pay.id);
      await postPaymentLedger(db, pay, req.user.id);
      return pay;
    });
    await audit(req, { action: 'update', entity: 'payments', entityId: req.params.id, changes: b });
    res.json(updated);
  })
);

// POST /api/payments/:id/invoice  (attach an invoice document later)
router.post(
  '/:id/invoice',
  upload.single('file'),
  asyncHandler(async (req, res) => {
    if (!req.file) throw new ApiError(400, 'Invoice file is required');
    const doc = await saveDocument({
      file: req.file, kind: 'invoice', entity: 'payments', entityId: req.params.id,
      userId: req.user.id, runOcr: false,
    });
    const { rows } = await query(
      `UPDATE payments SET invoice_status='attached' WHERE id=$1 RETURNING *`,
      [req.params.id]
    );
    if (!rows[0]) throw new ApiError(404, 'Payment not found');
    await audit(req, { action: 'upload', entity: 'payments', entityId: req.params.id, changes: { invoice: doc.original_name } });
    res.json({ payment: rows[0], document: doc });
  })
);

// DELETE /api/payments/:id
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await withTransaction(async (db) => {
      await removeLedgerForSource(db, 'payment', req.params.id);
      await db.query('DELETE FROM payments WHERE id=$1', [req.params.id]);
    });
    await audit(req, { action: 'delete', entity: 'payments', entityId: req.params.id });
    res.json({ ok: true });
  })
);

export default router;
