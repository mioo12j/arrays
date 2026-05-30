import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../config/db.js';
import { asyncHandler, ApiError } from '../utils/asyncHandler.js';
import { authenticate } from '../middleware/auth.js';
import { adminOnly } from '../middleware/rbac.js';
import { audit } from '../middleware/audit.js';

const router = Router();
router.use(authenticate, adminOnly); // user management is admin-only

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const { rows } = await query(
      'SELECT id, name, email, role, is_active, last_login_at, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(rows);
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body || {};
    if (!name || !email || !password) throw new ApiError(400, 'Name, email and password are required');
    if (!['admin', 'operator'].includes(role)) throw new ApiError(400, 'Role must be admin or operator');
    const hash = await bcrypt.hash(password, 10);
    const { rows } = await query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1,$2,$3,$4)
       RETURNING id, name, email, role, is_active, created_at`,
      [name, email.toLowerCase(), hash, role]
    );
    await audit(req, { action: 'create', entity: 'users', entityId: rows[0].id, changes: { name, email, role } });
    res.status(201).json(rows[0]);
  })
);

router.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const { name, role, is_active } = req.body || {};
    const { rows } = await query(
      `UPDATE users SET
         name = COALESCE($1, name),
         role = COALESCE($2, role),
         is_active = COALESCE($3, is_active)
       WHERE id=$4
       RETURNING id, name, email, role, is_active`,
      [name ?? null, role ?? null, is_active ?? null, req.params.id]
    );
    if (!rows[0]) throw new ApiError(404, 'User not found');
    await audit(req, { action: 'update', entity: 'users', entityId: req.params.id, changes: req.body });
    res.json(rows[0]);
  })
);

export default router;
