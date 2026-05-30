import { Router } from 'express';
import { withTransaction } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { authenticate } from '../middleware/auth.js';
import { editorOnly } from '../middleware/rbac.js';
import { audit } from '../middleware/audit.js';
import { clearAllData, seedDemo } from '../services/system.service.js';

const router = Router();
router.use(authenticate, editorOnly); // super-admin (editor) only

// Wipe every operational record (keeps users + expense categories).
router.post(
  '/clear-data',
  asyncHandler(async (req, res) => {
    await withTransaction((db) => clearAllData(db));
    await audit(req, { action: 'delete', entity: 'system', changes: { cleared: true } });
    res.json({ ok: true, message: 'All operational data cleared.' });
  })
);

// Load a realistic demo dataset (clears first, then seeds).
router.post(
  '/seed-demo',
  asyncHandler(async (req, res) => {
    const summary = await withTransaction((db) => seedDemo(db, req.user.id));
    await audit(req, { action: 'create', entity: 'system', changes: { demo: summary } });
    res.json({ ok: true, ...summary });
  })
);

export default router;
