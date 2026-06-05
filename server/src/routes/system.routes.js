import { Router } from 'express';
import { withTransaction, pool } from '../config/db.js';
import { asyncHandler, ApiError } from '../utils/asyncHandler.js';
import { authenticate } from '../middleware/auth.js';
import { editorOnly } from '../middleware/rbac.js';
import { audit } from '../middleware/audit.js';
import { clearAllData, seedDemo } from '../services/system.service.js';
import { syncToCloud } from '../services/sync.service.js';

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

// Whether cloud publishing is configured on this (local) instance.
router.get('/cloud-status', (_req, res) => {
  res.json({ configured: !!process.env.CLOUD_DATABASE_URL });
});

// Publish local data (rows only — not files) to the cloud database.
router.post(
  '/sync-to-cloud',
  asyncHandler(async (req, res) => {
    const targetUrl = process.env.CLOUD_DATABASE_URL;
    if (!targetUrl) {
      throw new ApiError(400, 'CLOUD_DATABASE_URL is not configured on this computer. Set it in server/.env, then restart the app.');
    }
    const counts = await syncToCloud(pool, targetUrl);
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    await audit(req, { action: 'create', entity: 'system', changes: { published: total } });
    res.json({ ok: true, total, counts });
  })
);

export default router;
