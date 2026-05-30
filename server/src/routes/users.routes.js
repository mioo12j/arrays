import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../config/db.js';
import { asyncHandler, ApiError } from '../utils/asyncHandler.js';
import { authenticate } from '../middleware/auth.js';
import { adminOnly } from '../middleware/rbac.js';
import { audit } from '../middleware/audit.js';

const router = Router();
router.use(authenticate, adminOnly); // user management is admin (or editor)

const isEditor = (req) => req.user.role === 'editor';

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const { rows } = await query(
      'SELECT id, name, email, role, is_active, is_protected, last_login_at, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(rows);
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body || {};
    if (!name || !email || !password) throw new ApiError(400, 'Name, login ID and password are required');
    if (!['admin', 'operator', 'editor'].includes(role)) throw new ApiError(400, 'Invalid role');
    // Only an editor (super-admin) may create another editor.
    if (role === 'editor' && !isEditor(req)) throw new ApiError(403, 'Only an editor can create an editor account');
    const hash = await bcrypt.hash(password, 10);
    const { rows } = await query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1,$2,$3,$4)
       RETURNING id, name, email, role, is_active, is_protected, created_at`,
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

    const { rows: target } = await query('SELECT id, role, is_protected FROM users WHERE id=$1', [req.params.id]);
    if (!target[0]) throw new ApiError(404, 'User not found');

    // A protected user (the editor / super-admin) cannot be disabled, demoted,
    // or modified by anyone other than an editor.
    if (target[0].is_protected) {
      if (!isEditor(req)) throw new ApiError(403, 'This account is protected and cannot be modified');
      if (is_active === false) throw new ApiError(400, 'The editor account cannot be deactivated');
      if (role && role !== 'editor') throw new ApiError(400, 'The editor role cannot be changed');
    }
    // Only an editor may promote someone to editor.
    if (role === 'editor' && !isEditor(req)) throw new ApiError(403, 'Only an editor can grant the editor role');

    const { rows } = await query(
      `UPDATE users SET
         name = COALESCE($1, name),
         role = COALESCE($2, role),
         is_active = COALESCE($3, is_active)
       WHERE id=$4
       RETURNING id, name, email, role, is_active, is_protected`,
      [name ?? null, role ?? null, is_active ?? null, req.params.id]
    );
    await audit(req, { action: 'update', entity: 'users', entityId: req.params.id, changes: req.body });
    res.json(rows[0]);
  })
);

export default router;
