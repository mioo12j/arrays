// ============================================================================
//  e-Invoice lifecycle service
//  create → edit → validate → submit (IRN) → print → cancel → archive
//  Every state change writes an audit event; every adapter call writes an
//  immutable API log. All portal access goes through getAdapter().
// ============================================================================

import { ApiError } from '../../utils/asyncHandler.js';
import { validateEInvoice, summarize } from './validation.js';
import { buildEInvoicePayload } from './einvoiceBuilder.js';
import { getAdapter, getMode } from './adapter.js';
import { recordApiLog, recordAudit } from './log.js';
import * as branches from './branchService.js';
import * as series from './seriesService.js';
import * as duplicates from './duplicateService.js';
import * as versions from './versionService.js';

const EDITABLE = new Set(['draft', 'validated', 'needs_review', 'error', 'pending_submission']);

// ── row <-> internal record ────────────────────────────────────────────────
export function rowToRecord(r) {
  if (!r) return null;
  return {
    id: r.id,
    status: r.status,
    env: r.env,
    schemaVersion: r.schema_version,
    supplyType: r.supply_type,
    docType: r.doc_type,
    docNo: r.doc_no,
    docDate: r.doc_date,
    reverseCharge: r.reverse_charge,
    igstOnIntra: r.igst_on_intra,
    ecomGstin: r.ecom_gstin,
    seller: r.seller_dtls || {},
    buyer: r.buyer_dtls || {},
    dispatch: r.disp_dtls || null,
    shipTo: r.ship_dtls || null,
    items: r.item_list || [],
    val: r.val_dtls || {},
    irn: r.irn,
    ackNo: r.ack_no,
    ackDate: r.ack_date,
    signedInvoice: r.signed_invoice,
    signedQr: r.signed_qr,
    irpStatus: r.irp_status,
    isCancelled: r.is_cancelled,
    cancelReasonCode: r.cancel_reason_code,
    cancelRemark: r.cancel_remark,
    cancelDate: r.cancel_date,
    printCount: r.print_count,
    isArchived: r.is_archived,
    isDeleted: r.is_deleted,
    validationErrors: r.validation_errors || [],
    sourceInvoiceId: r.source_invoice_id,
    branchId: r.branch_id,
    branchCode: r.branch_code,
    branchName: r.branch_name,
    buyerGstin: r.buyer_gstin,
    buyerName: r.buyer_name,
    totalInvVal: r.total_inv_val,
    totalTaxVal: r.total_tax_val,
    preparedBy: r.prepared_by,
    approvedBy: r.approved_by,
    submittedBy: r.submitted_by,
    submittedAt: r.submitted_at,
    createdBy: r.created_by,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    // joined display
    createdByName: r.created_by_name,
    submittedByName: r.submitted_by_name,
  };
}

function scalarsFrom(body) {
  const val = body.val || {};
  const taxTotal =
    Number(val.cgstValue || 0) + Number(val.sgstValue || 0) +
    Number(val.igstValue || 0) + Number(val.cessValue || 0);
  return {
    buyerGstin: body.buyer?.gstin || null,
    buyerName: body.buyer?.legalName || null,
    totalInvVal: val.totalInvoiceValue ?? null,
    totalTaxVal: taxTotal || null,
  };
}

// ── List with rich filters ─────────────────────────────────────────────────
export async function list(db, q = {}) {
  const clauses = ['e.is_deleted = FALSE'];
  const p = [];
  const like = (sql, val) => { p.push(`%${val}%`); clauses.push(sql.replace('$$', `$${p.length}`)); };
  if (q.search) {
    p.push(`%${q.search}%`);
    const i = p.length;
    clauses.push(`(e.doc_no ILIKE $${i} OR e.buyer_gstin ILIKE $${i} OR e.buyer_name ILIKE $${i} OR e.irn ILIKE $${i})`);
  }
  if (q.doc_no) like('e.doc_no ILIKE $$', q.doc_no);
  if (q.gstin) like('e.buyer_gstin ILIKE $$', q.gstin);
  if (q.customer) like('e.buyer_name ILIKE $$', q.customer);
  if (q.irn) like('e.irn ILIKE $$', q.irn);
  if (q.hsn) { p.push(q.hsn); clauses.push(`EXISTS (SELECT 1 FROM jsonb_array_elements(e.item_list) it WHERE it->>'hsn' = $${p.length})`); }
  if (q.status) { p.push(q.status); clauses.push(`e.status = $${p.length}::gst_einv_status`); }
  if (q.from) { p.push(q.from); clauses.push(`e.doc_date >= $${p.length}`); }
  if (q.to) { p.push(q.to); clauses.push(`e.doc_date <= $${p.length}`); }
  if (q.min_amount) { p.push(q.min_amount); clauses.push(`e.total_inv_val >= $${p.length}`); }
  if (q.max_amount) { p.push(q.max_amount); clauses.push(`e.total_inv_val <= $${p.length}`); }
  if (q.branch_id && q.branch_id !== 'all') { p.push(q.branch_id); clauses.push(`e.branch_id = $${p.length}`); }
  if (q.archived === 'true') clauses.push('e.is_archived = TRUE');
  else if (q.archived !== 'all') clauses.push('e.is_archived = FALSE');

  const { rows } = await db.query(
    `SELECT e.*, u.name AS created_by_name, su.name AS submitted_by_name, b.code AS branch_code, b.name AS branch_name
       FROM gst_einvoices e
       LEFT JOIN users u ON u.id = e.created_by
       LEFT JOIN users su ON su.id = e.submitted_by
       LEFT JOIN gst_branches b ON b.id = e.branch_id
      WHERE ${clauses.join(' AND ')}
      ORDER BY e.created_at DESC
      LIMIT 500`,
    p
  );
  return rows.map(rowToRecord);
}

export async function get(db, id) {
  const { rows } = await db.query(
    `SELECT e.*, u.name AS created_by_name, su.name AS submitted_by_name, b.code AS branch_code, b.name AS branch_name
       FROM gst_einvoices e
       LEFT JOIN users u ON u.id = e.created_by
       LEFT JOIN users su ON su.id = e.submitted_by
       LEFT JOIN gst_branches b ON b.id = e.branch_id
      WHERE e.id = $1`, [id]
  );
  if (!rows[0]) throw new ApiError(404, 'e-Invoice not found');
  const rec = rowToRecord(rows[0]);
  const { rows: timeline } = await db.query(
    `SELECT a.*, u.name AS user_name FROM gst_audit_events a
       LEFT JOIN users u ON u.id = a.user_id
      WHERE a.object_type='einvoice' AND a.object_id=$1 ORDER BY a.created_at ASC`, [id]
  );
  const { rows: apiLogs } = await db.query(
    `SELECT id, action, response_status, http_status, error_code, error_message, created_at
       FROM gst_api_logs WHERE object_type='einvoice' AND object_id=$1 ORDER BY created_at ASC`, [id]
  );
  return { ...rec, timeline, apiLogs };
}

// ── Create draft ───────────────────────────────────────────────────────────
export async function createDraft(db, body, userId) {
  await branches.ensureDefault(db);
  await series.ensureDefault(db);
  const branchId = body.branchId || await branches.getDefaultId(db);
  // Auto-number when no document number was supplied and a series is configured.
  if (!body.docNo) {
    const b = branchId ? await branches.get(db, branchId).catch(() => null) : null;
    const allocated = await series.allocate(db, { branchId, docType: body.docType || 'INV', branchCode: b?.code || '' }, userId);
    if (allocated) body = { ...body, docNo: allocated };
  }
  // Duplicate prevention: an exact document-number clash in the same branch is
  // an integrity error — block unless the user explicitly overrides (audited).
  if (body.docNo && !body.overrideDuplicate) {
    const dup = await duplicates.check(db, { docNo: body.docNo, branchId });
    if (dup.hasExact) throw new ApiError(409, `An invoice with document number “${body.docNo}” already exists in this branch. Use a different number, or confirm to override.`);
  }
  const s = scalarsFrom(body);
  const { rows } = await db.query(
    `INSERT INTO gst_einvoices
      (env, schema_version, status, supply_type, doc_type, doc_no, doc_date,
       reverse_charge, igst_on_intra, ecom_gstin,
       seller_dtls, buyer_dtls, disp_dtls, ship_dtls, item_list, val_dtls,
       buyer_gstin, buyer_name, total_inv_val, total_tax_val,
       source_invoice_id, prepared_by, created_by)
     VALUES ($1,'1.1','draft',$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$20)
     RETURNING *`,
    [
      body.env || 'sandbox', body.supplyType || 'B2B', body.docType || 'INV', body.docNo || null, body.docDate || null,
      !!body.reverseCharge, !!body.igstOnIntra, body.ecomGstin || null,
      JSON.stringify(body.seller || {}), JSON.stringify(body.buyer || {}),
      body.dispatch ? JSON.stringify(body.dispatch) : null, body.shipTo ? JSON.stringify(body.shipTo) : null,
      JSON.stringify(body.items || []), JSON.stringify(body.val || {}),
      s.buyerGstin, s.buyerName, s.totalInvVal, s.totalTaxVal,
      body.sourceInvoiceId || null, userId,
    ]
  );
  if (branchId) { await db.query('UPDATE gst_einvoices SET branch_id=$2 WHERE id=$1', [rows[0].id, branchId]); rows[0].branch_id = branchId; }
  await recordAudit(db, { objectType: 'einvoice', objectId: rows[0].id, eventType: 'created', message: `Draft created (${body.docNo || 'no doc no'})`, userId });
  if (body.overrideDuplicate) await recordAudit(db, { objectType: 'einvoice', objectId: rows[0].id, eventType: 'duplicate_override', message: `Duplicate document number overridden: ${body.overrideReason || 'no reason given'}`, userId });
  await versions.record(db, { objectType: 'einvoice', objectId: rows[0].id, row: rows[0], reason: 'Initial draft' }, userId);
  return rowToRecord(rows[0]);
}

// ── Update draft ───────────────────────────────────────────────────────────
export async function updateDraft(db, id, body, userId) {
  const cur = (await db.query('SELECT * FROM gst_einvoices WHERE id=$1 AND is_deleted=FALSE', [id])).rows[0];
  if (!cur) throw new ApiError(404, 'e-Invoice not found');
  if (!EDITABLE.has(cur.status)) throw new ApiError(409, `An e-invoice in “${cur.status}” state cannot be edited. Once an IRN is generated the document is locked.`);
  const s = scalarsFrom(body);
  const { rows } = await db.query(
    `UPDATE gst_einvoices SET
       supply_type=$2, doc_type=$3, doc_no=$4, doc_date=$5, reverse_charge=$6, igst_on_intra=$7, ecom_gstin=$8,
       seller_dtls=$9, buyer_dtls=$10, disp_dtls=$11, ship_dtls=$12, item_list=$13, val_dtls=$14,
       buyer_gstin=$15, buyer_name=$16, total_inv_val=$17, total_tax_val=$18,
       status = CASE WHEN status='error' THEN 'draft'::gst_einv_status ELSE status END
     WHERE id=$1 RETURNING *`,
    [
      id, body.supplyType, body.docType, body.docNo || null, body.docDate || null,
      !!body.reverseCharge, !!body.igstOnIntra, body.ecomGstin || null,
      JSON.stringify(body.seller || {}), JSON.stringify(body.buyer || {}),
      body.dispatch ? JSON.stringify(body.dispatch) : null, body.shipTo ? JSON.stringify(body.shipTo) : null,
      JSON.stringify(body.items || []), JSON.stringify(body.val || {}),
      s.buyerGstin, s.buyerName, s.totalInvVal, s.totalTaxVal,
    ]
  );
  await recordAudit(db, { objectType: 'einvoice', objectId: id, eventType: 'edited', message: 'Draft edited', userId });
  await versions.record(db, { objectType: 'einvoice', objectId: id, row: rows[0], reason: body.changeReason }, userId);
  return rowToRecord(rows[0]);
}

// Restore a previous version — only while the document is still a draft.
export async function restoreVersion(db, id, versionId, userId) {
  const cur = (await db.query('SELECT * FROM gst_einvoices WHERE id=$1 AND is_deleted=FALSE', [id])).rows[0];
  if (!cur) throw new ApiError(404, 'e-Invoice not found');
  if (cur.irn) throw new ApiError(409, 'This e-invoice has an IRN and is locked — earlier versions are viewable but cannot be restored.');
  if (!EDITABLE.has(cur.status)) throw new ApiError(409, `Cannot restore a version while in “${cur.status}”.`);
  const v = await versions.get(db, versionId);
  if (v.object_id !== id) throw new ApiError(400, 'Version does not belong to this document.');
  const s = v.snapshot;
  const { rows } = await db.query(
    `UPDATE gst_einvoices SET supply_type=$2, doc_type=$3, doc_no=$4, doc_date=$5, reverse_charge=$6, igst_on_intra=$7, ecom_gstin=$8,
       seller_dtls=$9, buyer_dtls=$10, disp_dtls=$11, ship_dtls=$12, item_list=$13, val_dtls=$14,
       buyer_gstin=$15, buyer_name=$16, total_inv_val=$17, total_tax_val=$18 WHERE id=$1 RETURNING *`,
    [id, s.supply_type, s.doc_type, s.doc_no, s.doc_date, s.reverse_charge, s.igst_on_intra, s.ecom_gstin,
     JSON.stringify(s.seller_dtls || {}), JSON.stringify(s.buyer_dtls || {}), s.disp_dtls ? JSON.stringify(s.disp_dtls) : null,
     s.ship_dtls ? JSON.stringify(s.ship_dtls) : null, JSON.stringify(s.item_list || []), JSON.stringify(s.val_dtls || {}),
     s.buyer_gstin, s.buyer_name, s.total_inv_val, s.total_tax_val]
  );
  await versions.record(db, { objectType: 'einvoice', objectId: id, row: rows[0], reason: `Restored from v${v.version_no}` }, userId);
  await recordAudit(db, { objectType: 'einvoice', objectId: id, eventType: 'version_restored', message: `Restored content from version ${v.version_no}`, userId });
  return rowToRecord(rows[0]);
}

// ── Validate ───────────────────────────────────────────────────────────────
export async function validate(db, id, userId, opts = {}) {
  const cur = (await db.query('SELECT * FROM gst_einvoices WHERE id=$1 AND is_deleted=FALSE', [id])).rows[0];
  if (!cur) throw new ApiError(404, 'e-Invoice not found');
  const rec = rowToRecord(cur);
  const issues = validateEInvoice(rec, { preSubmission: true, sellerAATOAbove5cr: opts.aatoAbove5cr !== false });
  const sum = summarize(issues);
  const newStatus = sum.ok ? 'validated' : 'needs_review';
  await db.query('UPDATE gst_einvoices SET status=$2::gst_einv_status, validation_errors=$3, last_error=$4 WHERE id=$1',
    [id, newStatus, JSON.stringify(issues), sum.ok ? null : `${sum.errors.length} validation error(s)`]);
  await recordAudit(db, { objectType: 'einvoice', objectId: id, eventType: 'validated', message: sum.ok ? 'Validation passed' : `Validation found ${sum.errors.length} error(s)`, userId });
  return { ...sum, status: newStatus };
}

// ── Submit to IRP (generate IRN) — checker action, idempotent ──────────────
export async function submit(db, id, userId, { idempotencyKey } = {}) {
  // lock the row to prevent double submission
  const cur = (await db.query('SELECT * FROM gst_einvoices WHERE id=$1 AND is_deleted=FALSE FOR UPDATE', [id])).rows[0];
  if (!cur) throw new ApiError(404, 'e-Invoice not found');
  if (cur.irn) return { alreadyDone: true, irn: cur.irn, ackNo: cur.ack_no, status: cur.status }; // idempotent
  if (cur.is_cancelled) throw new ApiError(409, 'A cancelled e-invoice cannot be resubmitted.');

  const rec = rowToRecord(cur);
  const issues = validateEInvoice(rec, { preSubmission: true });
  const sum = summarize(issues);
  if (!sum.ok) {
    await db.query('UPDATE gst_einvoices SET status=$2::gst_einv_status, validation_errors=$3 WHERE id=$1', [id, 'needs_review', JSON.stringify(issues)]);
    throw new ApiError(422, `Cannot submit — ${sum.errors.length} validation error(s) must be fixed first.`);
  }

  const payload = buildEInvoicePayload(rec);
  const started = Date.now();
  const resp = getAdapter().einvoiceGenerateIRN(payload);
  const duration = Date.now() - started;

  await recordApiLog(db, {
    objectType: 'einvoice', objectId: id, env: cur.env, action: 'generate',
    requestPayload: payload, responsePayload: resp.data || { error: resp.errorMessage },
    responseStatus: resp.ok ? 'accepted' : 'rejected', httpStatus: resp.httpStatus,
    errorCode: resp.errorCode, errorMessage: resp.errorMessage, idempotencyKey, durationMs: duration, userId,
  });

  if (!resp.ok) {
    await db.query('UPDATE gst_einvoices SET status=$2::gst_einv_status, last_error=$3 WHERE id=$1', [id, 'error', `${resp.errorCode}: ${resp.errorMessage}`]);
    await recordAudit(db, { objectType: 'einvoice', objectId: id, eventType: 'error', message: `IRP rejected: ${resp.errorCode} — ${resp.errorMessage}`, userId });
    throw new ApiError(502, `IRP rejected the invoice: ${resp.errorMessage}`);
  }

  const d = resp.data;
  const { rows } = await db.query(
    `UPDATE gst_einvoices SET
       status='irn_generated', irn=$2, ack_no=$3, ack_date=$4, signed_invoice=$5, signed_qr=$6,
       irp_status='ACT', canonical_payload=$7, submitted_by=$8, submitted_at=now(), approved_by=$8,
       idempotency_key=COALESCE(idempotency_key,$9), validation_errors='[]', last_error=NULL
     WHERE id=$1 RETURNING *`,
    [id, d.Irn, d.AckNo, d.AckDt, d.SignedInvoice, d.SignedQRCode, JSON.stringify(payload), userId, idempotencyKey || null]
  );
  await recordAudit(db, { objectType: 'einvoice', objectId: id, eventType: 'irn_generated', field: 'irn', newValue: d.Irn, message: `IRN generated (Ack ${d.AckNo})`, userId });
  return { ok: true, mode: getMode(), ...rowToRecord(rows[0]) };
}

// ── Cancel (lawful) — checker action; cannot reinstate a govt-cancelled IRN ─
export async function cancel(db, id, { reasonCode, remark }, userId) {
  const cur = (await db.query('SELECT * FROM gst_einvoices WHERE id=$1 AND is_deleted=FALSE FOR UPDATE', [id])).rows[0];
  if (!cur) throw new ApiError(404, 'e-Invoice not found');
  if (!cur.irn) throw new ApiError(409, 'Only an e-invoice with an IRN can be cancelled at the IRP. A draft can simply be deleted.');
  if (cur.is_cancelled) throw new ApiError(409, 'This e-invoice is already cancelled.');
  if (!reasonCode) throw new ApiError(400, 'A cancellation reason code is required.');

  const started = Date.now();
  const resp = getAdapter().einvoiceCancel(cur.irn, { reasonCode, remark });
  await recordApiLog(db, {
    objectType: 'einvoice', objectId: id, env: cur.env, action: 'cancel',
    requestPayload: { Irn: cur.irn, CnlRsn: reasonCode, CnlRem: remark },
    responsePayload: resp.data || { error: resp.errorMessage },
    responseStatus: resp.ok ? 'accepted' : 'rejected', httpStatus: resp.httpStatus,
    errorCode: resp.errorCode, errorMessage: resp.errorMessage, durationMs: Date.now() - started, userId,
  });
  if (!resp.ok) throw new ApiError(502, `IRP rejected cancellation: ${resp.errorMessage}`);

  const { rows } = await db.query(
    `UPDATE gst_einvoices SET status='cancelled', is_cancelled=TRUE, irp_status='CNL',
       cancel_reason_code=$2, cancel_remark=$3, cancel_date=now(), cancelled_by=$4
     WHERE id=$1 RETURNING *`, [id, reasonCode, remark || null, userId]
  );
  await recordAudit(db, { objectType: 'einvoice', objectId: id, eventType: 'cancelled', field: 'status', oldValue: 'irn_generated', newValue: 'cancelled', message: `Cancelled at IRP (reason ${reasonCode})`, userId });
  return rowToRecord(rows[0]);
}

// ── Duplicate (new local draft from an existing record) ────────────────────
export async function duplicate(db, id, userId) {
  const cur = (await db.query('SELECT * FROM gst_einvoices WHERE id=$1', [id])).rows[0];
  if (!cur) throw new ApiError(404, 'e-Invoice not found');
  const body = {
    env: cur.env, supplyType: cur.supply_type, docType: cur.doc_type, docNo: '', docDate: null,
    reverseCharge: cur.reverse_charge, igstOnIntra: cur.igst_on_intra, ecomGstin: cur.ecom_gstin,
    seller: cur.seller_dtls, buyer: cur.buyer_dtls, dispatch: cur.disp_dtls, shipTo: cur.ship_dtls,
    items: cur.item_list, val: cur.val_dtls, sourceInvoiceId: cur.source_invoice_id,
  };
  const created = await createDraft(db, body, userId);
  await recordAudit(db, { objectType: 'einvoice', objectId: created.id, eventType: 'created', message: `Duplicated from ${cur.doc_no || cur.id}`, userId });
  return created;
}

// ── Archive / soft-delete / restore ────────────────────────────────────────
export async function setArchived(db, id, archived, userId) {
  const { rows } = await db.query('UPDATE gst_einvoices SET is_archived=$2 WHERE id=$1 AND is_deleted=FALSE RETURNING *', [id, archived]);
  if (!rows[0]) throw new ApiError(404, 'e-Invoice not found');
  await recordAudit(db, { objectType: 'einvoice', objectId: id, eventType: archived ? 'archived' : 'unarchived', message: archived ? 'Archived' : 'Unarchived', userId });
  return rowToRecord(rows[0]);
}

export async function softDelete(db, id, userId) {
  const cur = (await db.query('SELECT * FROM gst_einvoices WHERE id=$1', [id])).rows[0];
  if (!cur) throw new ApiError(404, 'e-Invoice not found');
  if (cur.irn && !cur.is_cancelled) throw new ApiError(409, 'A live IRN-generated e-invoice cannot be deleted. Cancel it lawfully first.');
  await db.query('UPDATE gst_einvoices SET is_deleted=TRUE, deleted_at=now(), deleted_by=$2 WHERE id=$1', [id, userId]);
  await recordAudit(db, { objectType: 'einvoice', objectId: id, eventType: 'deleted', message: 'Soft-deleted (recoverable)', userId });
  return { ok: true };
}

export async function restore(db, id, userId) {
  const { rows } = await db.query('UPDATE gst_einvoices SET is_deleted=FALSE, deleted_at=NULL, deleted_by=NULL WHERE id=$1 RETURNING *', [id]);
  if (!rows[0]) throw new ApiError(404, 'e-Invoice not found');
  await recordAudit(db, { objectType: 'einvoice', objectId: id, eventType: 'restored', message: 'Restored local draft/record', userId });
  return rowToRecord(rows[0]);
}

export async function markPrinted(db, id, userId) {
  const { rows } = await db.query(
    `UPDATE gst_einvoices SET print_count=print_count+1, last_printed_at=now(),
       status = CASE WHEN status='irn_generated' THEN 'printed'::gst_einv_status ELSE status END
     WHERE id=$1 RETURNING *`, [id]
  );
  if (!rows[0]) throw new ApiError(404, 'e-Invoice not found');
  await recordAudit(db, { objectType: 'einvoice', objectId: id, eventType: 'printed', message: 'Printed / PDF generated', userId });
  return rowToRecord(rows[0]);
}
