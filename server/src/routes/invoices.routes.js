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
import * as invSvc from '../services/invoiceService.js';
import { company } from '../config/company.js';

const router = Router();
router.use(authenticate);

// §3 Unified dashboard — standard invoices + GST e-invoices in one list.
router.get('/unified', asyncHandler(async (req, res) => res.json(await invSvc.listUnified({ query }, req.query))));

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
        (i.total_amount - i.amount_received) AS balance_due,
        ei.id AS einvoice_id, ei.irn AS einvoice_irn, ei.status::text AS einvoice_status
       FROM invoices i
       LEFT JOIN clients c ON c.id=i.client_id
       LEFT JOIN projects pr ON pr.id=i.project_id
       LEFT JOIN LATERAL (
         SELECT e.id, e.irn, e.status FROM gst_einvoices e
         WHERE e.source_invoice_id = i.id OR e.doc_no = i.invoice_number
         ORDER BY (e.irn IS NOT NULL) DESC, e.created_at DESC LIMIT 1
       ) ei ON TRUE
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
      `SELECT i.*, c.name AS client_name, c.gstin AS client_gstin, pr.name AS project_name,
        ei.id AS einvoice_id, ei.irn AS einvoice_irn, ei.status::text AS einvoice_status, ei.ack_no AS einvoice_ack_no,
        w.ewb_no AS linked_ewb_no, w.status::text AS linked_ewb_status, w.ewb_date AS linked_ewb_date
       FROM invoices i
       LEFT JOIN clients c ON c.id=i.client_id
       LEFT JOIN projects pr ON pr.id=i.project_id
       LEFT JOIN gst_eway_bills w ON w.id=i.linked_ewb_id
       LEFT JOIN LATERAL (
         SELECT e.id, e.irn, e.status, e.ack_no FROM gst_einvoices e
         WHERE e.source_invoice_id = i.id OR e.doc_no = i.invoice_number
         ORDER BY (e.irn IS NOT NULL) DESC, e.created_at DESC LIMIT 1
       ) ei ON TRUE
       WHERE i.id=$1`, [req.params.id]
    );
    if (!rows[0]) throw new ApiError(404, 'Invoice not found');
    const { rows: receipts } = await query(
      'SELECT * FROM receipts WHERE invoice_id=$1 ORDER BY credited_date', [req.params.id]
    );
    const lineItems = await invSvc.items({ query }, req.params.id);
    res.json({ ...rows[0], receipts, items: lineItems });
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const b = req.body || {};
    if (!b.invoice_number) throw new ApiError(400, 'Invoice number is required');

    const invoice = await withTransaction(async (db) => {
      // With line items → compute taxable + CGST/SGST/IGST; else use posted amounts.
      let taxable = Number(b.taxable_amount || 0), gst = Number(b.gst_amount || 0);
      let cgst = Number(b.cgst_amount || 0), sgst = Number(b.sgst_amount || 0), igst = Number(b.igst_amount || 0);
      let lineItems = null;
      if (Array.isArray(b.items) && b.items.length) {
        const sellerState = await invSvc.sellerStateFor(db, b.branch_id);
        const c = invSvc.computeInvoiceTotals(b.place_of_supply, sellerState, b.items);
        lineItems = c.items; taxable = c.totals.taxable; gst = c.totals.gst; cgst = c.totals.cgst; sgst = c.totals.sgst; igst = c.totals.igst;
      }
      const total = b.total_amount != null && !lineItems ? Number(b.total_amount) : taxable + gst;
      const { rows } = await db.query(
        `INSERT INTO invoices
          (invoice_number, type, status, client_id, project_id, site_id, branch_id,
           customer_name, customer_gstin, billing_address, shipping_address, place_of_supply,
           issue_date, due_date, taxable_amount, gst_amount, cgst_amount, sgst_amount, igst_amount,
           total_amount, notes, document_id, created_by)
         VALUES ($1,COALESCE($2,'tax')::invoice_type,COALESCE($3,'draft')::invoice_status,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23)
         RETURNING *`,
        [b.invoice_number, b.type, b.status, b.client_id || null, b.project_id || null, b.site_id || null, b.branch_id || null,
         b.customer_name || null, b.customer_gstin || null, b.billing_address || null, b.shipping_address || null, b.place_of_supply || null,
         b.issue_date || null, b.due_date || null, taxable, gst, cgst, sgst, igst, total, b.notes, b.document_id || null, req.user.id]
      );
      const inv = rows[0];
      if (lineItems) await invSvc.writeItems(db, inv.id, lineItems);
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
      let taxable = b.taxable_amount, gst = b.gst_amount, cgst = b.cgst_amount, sgst = b.sgst_amount, igst = b.igst_amount, total = b.total_amount, lineItems = null;
      if (Array.isArray(b.items)) {
        const cur = (await db.query('SELECT branch_id, place_of_supply FROM invoices WHERE id=$1', [req.params.id])).rows[0] || {};
        const sellerState = await invSvc.sellerStateFor(db, b.branch_id ?? cur.branch_id);
        const c = invSvc.computeInvoiceTotals(b.place_of_supply ?? cur.place_of_supply, sellerState, b.items);
        lineItems = c.items; taxable = c.totals.taxable; gst = c.totals.gst; cgst = c.totals.cgst; sgst = c.totals.sgst; igst = c.totals.igst; total = c.totals.total;
      }
      const { rows } = await db.query(
        `UPDATE invoices SET
          invoice_number=COALESCE($1,invoice_number), type=COALESCE($2::invoice_type,type),
          status=COALESCE($3::invoice_status,status), client_id=COALESCE($4,client_id),
          project_id=COALESCE($5,project_id), site_id=COALESCE($6,site_id),
          issue_date=COALESCE($7,issue_date), due_date=COALESCE($8,due_date),
          taxable_amount=COALESCE($9,taxable_amount), gst_amount=COALESCE($10,gst_amount),
          total_amount=COALESCE($11,total_amount), notes=COALESCE($12,notes),
          customer_name=COALESCE($14,customer_name), customer_gstin=COALESCE($15,customer_gstin),
          billing_address=COALESCE($16,billing_address), shipping_address=COALESCE($17,shipping_address),
          place_of_supply=COALESCE($18,place_of_supply), branch_id=COALESCE($19,branch_id),
          cgst_amount=COALESCE($20,cgst_amount), sgst_amount=COALESCE($21,sgst_amount), igst_amount=COALESCE($22,igst_amount)
         WHERE id=$13 RETURNING *`,
        [b.invoice_number, b.type, b.status, b.client_id, b.project_id, b.site_id,
         b.issue_date, b.due_date, taxable, gst, total, b.notes, req.params.id,
         b.customer_name, b.customer_gstin, b.billing_address, b.shipping_address, b.place_of_supply, b.branch_id,
         cgst, sgst, igst]
      );
      if (!rows[0]) throw new ApiError(404, 'Invoice not found');
      if (lineItems) await invSvc.writeItems(db, req.params.id, lineItems);
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

// §4 Link an existing e-Way Bill to this invoice (bidirectional).
router.post('/:id/link-ewb', asyncHandler(async (req, res) => {
  const ewbId = req.body?.ewb_id;
  if (!ewbId) throw new ApiError(400, 'ewb_id is required');
  await withTransaction(async (db) => {
    const inv = (await db.query('SELECT id FROM invoices WHERE id=$1', [req.params.id])).rows[0];
    if (!inv) throw new ApiError(404, 'Invoice not found');
    await db.query('UPDATE invoices SET linked_ewb_id=$1 WHERE id=$2', [ewbId, req.params.id]);
    await db.query('UPDATE gst_eway_bills SET source_invoice_id=$1 WHERE id=$2', [req.params.id, ewbId]).catch(() => {});
  });
  await audit(req, { action: 'link-ewb', entity: 'invoices', entityId: req.params.id, changes: { ewbId } });
  res.json({ ok: true, invoiceId: req.params.id, ewbId });
}));

// §4 Create an e-Way Bill draft from this invoice and link both ways.
router.post('/:id/create-ewb', asyncHandler(async (req, res) => {
  const out = await withTransaction(async (db) => {
    const i = (await db.query(
      `SELECT i.*, COALESCE(i.customer_name, c.name) AS party, c.gstin AS client_gstin
       FROM invoices i LEFT JOIN clients c ON c.id=i.client_id WHERE i.id=$1`, [req.params.id])).rows[0];
    if (!i) throw new ApiError(404, 'Invoice not found');
    const its = await invSvc.items(db, i.id);
    const ewb = await import('../services/gst/ewbService.js');
    const draft = await ewb.createDraft(db, {
      branchId: i.branch_id, docType: 'INV', docNo: i.invoice_number, docDate: i.issue_date, supplyType: 'O',
      fromGstin: company.gstin, fromTradeName: company.pdfName, fromStateCode: String(company.gstin || '09').slice(0, 2),
      toGstin: i.customer_gstin || i.client_gstin, toTradeName: i.party, toStateCode: i.place_of_supply,
      totInvValue: i.total_amount, totalTaxable: i.taxable_amount, cgstValue: i.cgst_amount, sgstValue: i.sgst_amount, igstValue: i.igst_amount,
      sourceInvoiceId: i.id,
      items: its.map((it) => ({ description: it.description, hsn: it.hsn, quantity: it.quantity, unit: it.unit, taxableAmount: it.taxable_value })),
    }, req.user.id);
    await db.query('UPDATE invoices SET linked_ewb_id=$1 WHERE id=$2', [draft.id, i.id]);
    return draft;
  });
  await audit(req, { action: 'create-ewb', entity: 'invoices', entityId: req.params.id });
  res.status(201).json({ ok: true, ewb: out });
}));

export default router;
