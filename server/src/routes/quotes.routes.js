import { Router } from 'express';
import { query, withTransaction, pool } from '../config/db.js';
import { asyncHandler, ApiError } from '../utils/asyncHandler.js';
import { authenticate } from '../middleware/auth.js';
import { audit } from '../middleware/audit.js';
import { calculateQuote } from '../services/quote-calc.service.js';
import { streamQuotePdf } from '../services/quote-pdf.service.js';
import * as branding from '../services/gst/brandingService.js';

const router = Router();
router.use(authenticate);

async function nextQuoteNumber() {
  const yr = new Date().getFullYear();
  const { rows } = await query(
    `SELECT COUNT(*)::int AS c FROM quotes WHERE quote_number LIKE $1`,
    [`QT-${yr}-%`]
  );
  return `QT-${yr}-${String(rows[0].c + 1).padStart(4, '0')}`;
}

// Live calculation preview (no persistence) — powers the builder UI.
router.post(
  '/calculate',
  asyncHandler(async (req, res) => {
    res.json(calculateQuote(req.body || {}));
  })
);

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { search, status } = req.query;
    const clauses = [];
    const p = [];
    if (search) { p.push(`%${search}%`); clauses.push(`(q.quote_number ILIKE $${p.length} OR q.client_name ILIKE $${p.length})`); }
    if (status) { p.push(status); clauses.push(`q.status=$${p.length}`); }
    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const { rows } = await query(
      `SELECT q.id, q.quote_number, q.version, q.status, q.client_name, q.project_type,
              q.capacity_kw, q.total_amount, q.margin_amount, q.cost_amount, q.per_watt,
              q.issue_date, q.valid_until, c.name AS client_full_name
       FROM quotes q LEFT JOIN clients c ON c.id=q.client_id
       ${where} ORDER BY q.created_at DESC LIMIT 500`,
      p
    );
    res.json(rows);
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const { rows } = await query(
      `SELECT q.*, c.name AS client_full_name FROM quotes q
       LEFT JOIN clients c ON c.id=q.client_id WHERE q.id=$1`, [req.params.id]
    );
    if (!rows[0]) throw new ApiError(404, 'Quote not found');
    res.json(rows[0]);
  })
);

function buildRow(b) {
  const calc = calculateQuote(b);
  return { calc };
}

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const b = req.body || {};
    if (!b.capacity_kw || Number(b.capacity_kw) <= 0) throw new ApiError(400, 'A valid system size (kW) is required');
    const { calc } = buildRow(b);
    const number = b.quote_number || (await nextQuoteNumber());
    const { rows } = await query(
      `INSERT INTO quotes
        (quote_number, version, status, client_id, client_name, project_id, project_name, site_name, project_type,
         capacity_kw, location, issue_date, valid_until, inputs, line_items,
         subtotal, contingency_amount, margin_amount, taxable_amount, gst_amount, total_amount,
         cost_amount, per_watt, subsidy_amount, net_cost, annual_savings, payback_years, lifetime_savings,
         notes, terms, exclusions, created_by)
       VALUES ($1,1,COALESCE($2,'draft')::quote_status,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,
               $15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31)
       RETURNING *`,
      [number, b.status, b.client_id || null, b.client_name, b.project_id || null, b.project_name, b.site_name, calc.project_type,
       calc.capacity_kw, b.location, b.issue_date || new Date().toISOString().slice(0, 10), b.valid_until || null,
       JSON.stringify(calc.inputs), JSON.stringify(calc.line_items),
       calc.subtotal, calc.contingency_amount, calc.margin_amount, calc.taxable_amount, calc.gst_amount,
       calc.total_amount, calc.cost_amount, calc.per_watt, calc.subsidy_amount, calc.net_cost,
       calc.annual_savings, calc.payback_years, calc.lifetime_savings,
       b.notes, b.terms, b.exclusions, req.user.id]
    );
    await audit(req, { action: 'create', entity: 'quotes', entityId: rows[0].id, changes: { quote_number: number } });
    res.status(201).json(rows[0]);
  })
);

router.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const b = req.body || {};
    const { rows: existing } = await query('SELECT * FROM quotes WHERE id=$1', [req.params.id]);
    if (!existing[0]) throw new ApiError(404, 'Quote not found');
    // Recalculate from merged inputs so totals always stay consistent.
    const merged = { ...existing[0].inputs, ...b, capacity_kw: b.capacity_kw ?? existing[0].capacity_kw, project_type: b.project_type ?? existing[0].project_type };
    const calc = calculateQuote(merged);
    const { rows } = await query(
      `UPDATE quotes SET
         status=COALESCE($1,status)::quote_status, client_id=COALESCE($2,client_id), client_name=COALESCE($3,client_name),
         project_type=$4, capacity_kw=$5, location=COALESCE($6,location), valid_until=COALESCE($7,valid_until),
         inputs=$8, line_items=$9, subtotal=$10, contingency_amount=$11, margin_amount=$12,
         taxable_amount=$13, gst_amount=$14, total_amount=$15, cost_amount=$16, per_watt=$17,
         notes=COALESCE($18,notes), terms=COALESCE($19,terms), exclusions=COALESCE($20,exclusions),
         project_name=COALESCE($21,project_name), site_name=COALESCE($22,site_name),
         subsidy_amount=$23, net_cost=$24, annual_savings=$25, payback_years=$26, lifetime_savings=$27
       WHERE id=$28 RETURNING *`,
      [b.status, b.client_id, b.client_name, calc.project_type, calc.capacity_kw, b.location, b.valid_until,
       JSON.stringify(calc.inputs), JSON.stringify(calc.line_items), calc.subtotal, calc.contingency_amount,
       calc.margin_amount, calc.taxable_amount, calc.gst_amount, calc.total_amount, calc.cost_amount,
       calc.per_watt, b.notes, b.terms, b.exclusions, b.project_name, b.site_name,
       calc.subsidy_amount, calc.net_cost, calc.annual_savings, calc.payback_years, calc.lifetime_savings, req.params.id]
    );
    await audit(req, { action: 'update', entity: 'quotes', entityId: req.params.id, changes: b });
    res.json(rows[0]);
  })
);

// Create a new revision (version+1) of an existing quote.
router.post(
  '/:id/revise',
  asyncHandler(async (req, res) => {
    const revised = await withTransaction(async (db) => {
      const { rows: e } = await db.query('SELECT * FROM quotes WHERE id=$1', [req.params.id]);
      if (!e[0]) throw new ApiError(404, 'Quote not found');
      const src = e[0];
      await db.query(`UPDATE quotes SET status='revised' WHERE id=$1`, [src.id]);
      const { rows } = await db.query(
        `INSERT INTO quotes
          (quote_number, version, parent_id, status, client_id, client_name, project_id, project_type,
           capacity_kw, location, issue_date, valid_until, inputs, line_items,
           subtotal, contingency_amount, margin_amount, taxable_amount, gst_amount, total_amount,
           cost_amount, per_watt, notes, terms, exclusions, created_by)
         SELECT quote_number, version+1, $1, 'draft', client_id, client_name, project_id, project_type,
           capacity_kw, location, CURRENT_DATE, valid_until, inputs, line_items,
           subtotal, contingency_amount, margin_amount, taxable_amount, gst_amount, total_amount,
           cost_amount, per_watt, notes, terms, exclusions, $2
         FROM quotes WHERE id=$3 RETURNING *`,
        [src.parent_id || src.id, req.user.id, src.id]
      );
      return rows[0];
    });
    await audit(req, { action: 'create', entity: 'quotes', entityId: revised.id, changes: { revisedFrom: req.params.id } });
    res.status(201).json(revised);
  })
);

router.post(
  '/:id/approve',
  asyncHandler(async (req, res) => {
    const { rows } = await query(
      `UPDATE quotes SET status='approved', approved_by=$1, approved_at=now() WHERE id=$2 RETURNING *`,
      [req.body?.approved_by || req.user.name, req.params.id]
    );
    if (!rows[0]) throw new ApiError(404, 'Quote not found');
    await audit(req, { action: 'update', entity: 'quotes', entityId: req.params.id, changes: { approved: true } });
    res.json(rows[0]);
  })
);

// Convert an (approved) quote into a live project for execution.
router.post(
  '/:id/convert',
  asyncHandler(async (req, res) => {
    const out = await withTransaction(async (db) => {
      const { rows: q } = await db.query('SELECT * FROM quotes WHERE id=$1', [req.params.id]);
      if (!q[0]) throw new ApiError(404, 'Quote not found');
      const quote = q[0];
      if (quote.project_id) throw new ApiError(400, 'This quote is already linked to a project');
      const { rows: proj } = await db.query(
        `INSERT INTO projects (name, client_id, client_name, capacity_kw, budget, contract_value, location, status, created_by)
         VALUES ($1,$2,$3,$4,$5,$6,$7,'active',$8) RETURNING *`,
        [`${quote.client_name || 'Project'} — ${quote.capacity_kw}kW ${quote.project_type}`,
         quote.client_id, quote.client_name, quote.capacity_kw,
         quote.cost_amount, quote.total_amount, quote.location, req.user.id]
      );
      await db.query(`UPDATE quotes SET status='converted', project_id=$1 WHERE id=$2`, [proj[0].id, quote.id]);
      return proj[0];
    });
    await audit(req, { action: 'create', entity: 'projects', entityId: out.id, changes: { fromQuote: req.params.id } });
    res.status(201).json({ project: out });
  })
);

router.get(
  '/:id/pdf',
  asyncHandler(async (req, res) => {
    const { rows } = await query(
      `SELECT q.*, c.name AS client_full_name FROM quotes q LEFT JOIN clients c ON c.id=q.client_id WHERE q.id=$1`,
      [req.params.id]
    );
    if (!rows[0]) throw new ApiError(404, 'Quote not found');
    const quote = { ...rows[0], client_name: rows[0].client_name || rows[0].client_full_name };
    let brand = {};
    try { brand = await branding.get(pool); } catch { /* branding optional */ }
    streamQuotePdf(res, quote, brand, req.query.lang);
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await query('DELETE FROM quotes WHERE id=$1', [req.params.id]);
    await audit(req, { action: 'delete', entity: 'quotes', entityId: req.params.id });
    res.json({ ok: true });
  })
);

export default router;
