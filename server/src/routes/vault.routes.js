import { Router } from 'express';
import { query, withTransaction } from '../config/db.js';
import { asyncHandler, ApiError } from '../utils/asyncHandler.js';
import { authenticate } from '../middleware/auth.js';
import { audit } from '../middleware/audit.js';
import { upload } from '../middleware/upload.js';
import { saveDocument } from '../services/document.service.js';

const router = Router();
router.use(authenticate);

export const VAULT_CATEGORIES = [
  'PAN Card', 'GST Certificate', 'CIN Document', 'AOA', 'MOA', 'ISO Certificate',
  'Bank Document', 'Cancelled Cheque', 'Vendor Agreement', 'Contract', 'NDA',
  'Purchase Order', 'Insurance', 'Compliance', 'Technical Datasheet',
  'Government Registration', 'Tender Document', 'Other',
];

router.get('/categories', (_req, res) => res.json(VAULT_CATEGORIES));

// List with search / category filter + expiry status
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { search, category, tag } = req.query;
    const clauses = [];
    const p = [];
    if (search) { p.push(`%${search}%`); clauses.push(`(v.title ILIKE $${p.length} OR v.reference_no ILIKE $${p.length} OR v.description ILIKE $${p.length})`); }
    if (category) { p.push(category); clauses.push(`v.category=$${p.length}`); }
    if (tag) { p.push(tag); clauses.push(`$${p.length} = ANY(v.tags)`); }
    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const { rows } = await query(
      `SELECT v.*, d.original_name, d.mime_type, d.size_bytes,
        CASE
          WHEN v.expiry_date IS NULL THEN 'none'
          WHEN v.expiry_date < CURRENT_DATE THEN 'expired'
          WHEN v.expiry_date < CURRENT_DATE + INTERVAL '30 days' THEN 'expiring'
          ELSE 'valid'
        END AS expiry_status
       FROM vault_documents v
       LEFT JOIN documents d ON d.id = v.document_id
       ${where}
       ORDER BY v.created_at DESC LIMIT 500`,
      p
    );
    res.json(rows);
  })
);

// Documents expiring soon / expired (for reminders)
router.get(
  '/expiring',
  asyncHandler(async (req, res) => {
    const days = Math.min(Number(req.query.days || 60), 365);
    const { rows } = await query(
      `SELECT id, title, category, expiry_date,
        (expiry_date < CURRENT_DATE) AS is_expired
       FROM vault_documents
       WHERE expiry_date IS NOT NULL AND expiry_date < CURRENT_DATE + ($1 || ' days')::interval
       ORDER BY expiry_date ASC`,
      [days]
    );
    res.json(rows);
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const { rows } = await query(
      `SELECT v.*, d.original_name, d.stored_name, d.mime_type FROM vault_documents v
       LEFT JOIN documents d ON d.id=v.document_id WHERE v.id=$1`, [req.params.id]
    );
    if (!rows[0]) throw new ApiError(404, 'Document not found');
    const { rows: versions } = await query(
      `SELECT vv.*, d.original_name FROM vault_document_versions vv
       LEFT JOIN documents d ON d.id=vv.document_id WHERE vv.vault_id=$1 ORDER BY vv.version DESC`,
      [req.params.id]
    );
    res.json({ ...rows[0], versions });
  })
);

// Upload a new vault document (file + metadata)
router.post(
  '/',
  upload.single('file'),
  asyncHandler(async (req, res) => {
    const b = req.body || {};
    if (!req.file) throw new ApiError(400, 'A document file is required');
    if (!b.title) throw new ApiError(400, 'A title is required');
    if (!b.category) throw new ApiError(400, 'A category is required');

    const created = await withTransaction(async (db) => {
      const doc = await saveDocument({ file: req.file, kind: 'vault', userId: req.user.id });
      const tags = b.tags ? String(b.tags).split(',').map((t) => t.trim()).filter(Boolean) : [];
      const { rows } = await db.query(
        `INSERT INTO vault_documents
          (title, category, description, tags, document_id, version, issue_date, expiry_date, reference_no, uploaded_by)
         VALUES ($1,$2,$3,$4,$5,1,$6,$7,$8,$9) RETURNING *`,
        [b.title, b.category, b.description, tags, doc.id, b.issue_date || null, b.expiry_date || null, b.reference_no, req.user.id]
      );
      await db.query(`UPDATE documents SET entity='vault_documents', entity_id=$1 WHERE id=$2`, [rows[0].id, doc.id]);
      await db.query(
        `INSERT INTO vault_document_versions (vault_id, version, document_id, note, uploaded_by)
         VALUES ($1,1,$2,'Initial upload',$3)`, [rows[0].id, doc.id, req.user.id]
      );
      return rows[0];
    });
    await audit(req, { action: 'upload', entity: 'vault_documents', entityId: created.id, changes: { title: b.title, category: b.category } });
    res.status(201).json(created);
  })
);

// Upload a new version of an existing document
router.post(
  '/:id/version',
  upload.single('file'),
  asyncHandler(async (req, res) => {
    if (!req.file) throw new ApiError(400, 'A document file is required');
    const updated = await withTransaction(async (db) => {
      const { rows: v } = await db.query('SELECT * FROM vault_documents WHERE id=$1', [req.params.id]);
      if (!v[0]) throw new ApiError(404, 'Document not found');
      const doc = await saveDocument({ file: req.file, kind: 'vault', entity: 'vault_documents', entityId: req.params.id, userId: req.user.id });
      const newVersion = v[0].version + 1;
      await db.query(
        `INSERT INTO vault_document_versions (vault_id, version, document_id, note, uploaded_by)
         VALUES ($1,$2,$3,$4,$5)`,
        [req.params.id, newVersion, doc.id, req.body?.note || `Version ${newVersion}`, req.user.id]
      );
      const { rows } = await db.query(
        `UPDATE vault_documents SET version=$1, document_id=$2,
           expiry_date=COALESCE($3,expiry_date), issue_date=COALESCE($4,issue_date)
         WHERE id=$5 RETURNING *`,
        [newVersion, doc.id, req.body?.expiry_date || null, req.body?.issue_date || null, req.params.id]
      );
      return rows[0];
    });
    await audit(req, { action: 'upload', entity: 'vault_documents', entityId: req.params.id, changes: { version: updated.version } });
    res.json(updated);
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await query('DELETE FROM vault_documents WHERE id=$1', [req.params.id]);
    await audit(req, { action: 'delete', entity: 'vault_documents', entityId: req.params.id });
    res.json({ ok: true });
  })
);

export default router;
