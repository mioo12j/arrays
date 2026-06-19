import { Router } from 'express';
import { withTransaction, pool } from '../config/db.js';
import { asyncHandler, ApiError } from '../utils/asyncHandler.js';
import { authenticate } from '../middleware/auth.js';
import { editorOnly } from '../middleware/rbac.js';
import { audit } from '../middleware/audit.js';
import { clearAllData, seedDemo } from '../services/system.service.js';
import { syncToCloud } from '../services/sync.service.js';
import { getStatus, startSelfUpdate } from '../services/updateService.js';
import * as backups from '../services/gst/backupService.js';

const router = Router();
router.use(authenticate); // all routes require login

// Destructive tools (clear / demo) are editor-only.
router.post(
  '/clear-data',
  editorOnly,
  asyncHandler(async (req, res) => {
    await withTransaction((db) => clearAllData(db));
    await audit(req, { action: 'delete', entity: 'system', changes: { cleared: true } });
    res.json({ ok: true, message: 'All operational data cleared.' });
  })
);

// Load a realistic demo dataset (clears first, then seeds) — editor-only.
router.post(
  '/seed-demo',
  editorOnly,
  asyncHandler(async (req, res) => {
    const summary = await withTransaction((db) => seedDemo(db, req.user.id));
    await audit(req, { action: 'create', entity: 'system', changes: { demo: summary } });
    res.json({ ok: true, ...summary });
  })
);

// Whether cloud publishing is configured on this (local) instance. (any user)
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

// ── Software updates (git-based, code only) ─────────────────────────────────
// Anyone signed in can check the version; applying is for the System Manager or
// Editor (not the view-only admin/auditor).
router.get('/update/status', asyncHandler(async (_req, res) => res.json(await getStatus())));

router.post(
  '/update/apply',
  asyncHandler(async (req, res) => {
    if (['admin', 'auditor'].includes(req.user.role)) {
      throw new ApiError(403, 'Updating the software is reserved for the System Manager or Editor.');
    }
    const status = await getStatus();
    if (!status.ok) throw new ApiError(400, status.message || 'Updates are not available on this machine.');
    if (!status.behind) return res.json({ ok: true, started: false, message: 'Already on the latest version.' });

    // Always take a safety backup before touching the code. Abort if it fails.
    try {
      await withTransaction((db) => backups.create(db, { kind: 'pre-update' }, req.user.id));
    } catch (e) {
      throw new ApiError(500, `Backup before update failed — update aborted for safety. ${e.message}`);
    }
    await audit(req, { action: 'update', entity: 'system', changes: { selfUpdate: { from: status.currentShort, to: status.latestShort } } });
    startSelfUpdate();
    res.json({ ok: true, started: true, from: status.currentShort, to: status.latestShort });
  })
);

export default router;
