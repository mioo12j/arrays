import { Router } from 'express';
import { query } from '../config/db.js';
import { asyncHandler, ApiError } from '../utils/asyncHandler.js';
import { authenticate } from '../middleware/auth.js';
import { audit } from '../middleware/audit.js';

const router = Router();
router.use(authenticate);

// ── Projects ────────────────────────────────────────────────────────────────

// GET /api/projects  (with computed spend & receipts)
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { rows } = await query(`
      SELECT p.*,
        c.name AS client_full_name,
        (SELECT COALESCE(SUM(amount),0) FROM payments  WHERE project_id=p.id) AS total_spent,
        (SELECT COALESCE(SUM(credited_amount),0) FROM receipts WHERE project_id=p.id) AS total_received,
        (SELECT COUNT(*) FROM sites WHERE project_id=p.id) AS site_count
      FROM projects p
      LEFT JOIN clients c ON c.id = p.client_id
      ORDER BY p.created_at DESC
    `);
    res.json(rows);
  })
);

// GET /api/projects/:id  (detail with profitability)
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const { rows } = await query(
      `SELECT p.*, c.name AS client_full_name FROM projects p
       LEFT JOIN clients c ON c.id=p.client_id WHERE p.id=$1`,
      [req.params.id]
    );
    if (!rows[0]) throw new ApiError(404, 'Project not found');
    const project = rows[0];

    const { rows: spend } = await query(
      'SELECT COALESCE(SUM(amount),0) AS v FROM payments WHERE project_id=$1', [project.id]
    );
    const { rows: recv } = await query(
      'SELECT COALESCE(SUM(credited_amount),0) AS v FROM receipts WHERE project_id=$1', [project.id]
    );
    const { rows: sites } = await query(
      `SELECT s.*,
        (SELECT COALESCE(SUM(amount),0) FROM payments WHERE site_id=s.id) AS site_spent
       FROM sites s WHERE s.project_id=$1 ORDER BY s.created_at`, [project.id]
    );

    const totalSpent = spend[0].v;
    const totalReceived = recv[0].v;
    res.json({
      ...project,
      total_spent: totalSpent,
      total_received: totalReceived,
      budget_remaining: (project.budget || 0) - totalSpent,
      gross_margin: (project.contract_value || 0) - totalSpent,
      sites,
    });
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const b = req.body || {};
    if (!b.name) throw new ApiError(400, 'Project name is required');
    const { rows } = await query(
      `INSERT INTO projects
        (code, name, client_id, client_name, capacity_kw, budget, contract_value,
         location, status, start_date, end_date, notes, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,COALESCE($9,'active'),$10,$11,$12,$13)
       RETURNING *`,
      [b.code, b.name, b.client_id || null, b.client_name, b.capacity_kw, b.budget || 0,
       b.contract_value || 0, b.location, b.status, b.start_date || null, b.end_date || null,
       b.notes, req.user.id]
    );
    await audit(req, { action: 'create', entity: 'projects', entityId: rows[0].id, changes: b });
    res.status(201).json(rows[0]);
  })
);

router.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const b = req.body || {};
    const { rows } = await query(
      `UPDATE projects SET
        code=COALESCE($1,code), name=COALESCE($2,name), client_id=COALESCE($3,client_id),
        client_name=COALESCE($4,client_name), capacity_kw=COALESCE($5,capacity_kw),
        budget=COALESCE($6,budget), contract_value=COALESCE($7,contract_value),
        location=COALESCE($8,location), status=COALESCE($9,status),
        start_date=COALESCE($10,start_date), end_date=COALESCE($11,end_date),
        notes=COALESCE($12,notes)
       WHERE id=$13 RETURNING *`,
      [b.code, b.name, b.client_id, b.client_name, b.capacity_kw, b.budget,
       b.contract_value, b.location, b.status, b.start_date, b.end_date, b.notes, req.params.id]
    );
    if (!rows[0]) throw new ApiError(404, 'Project not found');
    await audit(req, { action: 'update', entity: 'projects', entityId: req.params.id, changes: b });
    res.json(rows[0]);
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await query('DELETE FROM projects WHERE id=$1', [req.params.id]);
    await audit(req, { action: 'delete', entity: 'projects', entityId: req.params.id });
    res.json({ ok: true });
  })
);

// ── Sites (nested under a project) ──────────────────────────────────────────

router.get(
  '/:id/sites',
  asyncHandler(async (req, res) => {
    const { rows } = await query(
      `SELECT s.*,
        (SELECT COALESCE(SUM(amount),0) FROM payments WHERE site_id=s.id) AS site_spent
       FROM sites s WHERE s.project_id=$1 ORDER BY s.created_at`,
      [req.params.id]
    );
    res.json(rows);
  })
);

router.post(
  '/:id/sites',
  asyncHandler(async (req, res) => {
    const b = req.body || {};
    if (!b.name) throw new ApiError(400, 'Site name is required');
    const { rows } = await query(
      `INSERT INTO sites (project_id, code, name, location, latitude, longitude, budget, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,COALESCE($8,'active')) RETURNING *`,
      [req.params.id, b.code, b.name, b.location, b.latitude || null, b.longitude || null, b.budget || 0, b.status]
    );
    await audit(req, { action: 'create', entity: 'sites', entityId: rows[0].id, changes: b });
    res.status(201).json(rows[0]);
  })
);

export default router;
