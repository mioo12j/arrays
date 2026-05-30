import { Router } from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { asyncHandler, ApiError } from '../utils/asyncHandler.js';
import { authenticate } from '../middleware/auth.js';
import { getDocument } from '../services/document.service.js';
import { UPLOAD_ROOT } from '../middleware/upload.js';

const router = Router();
router.use(authenticate);

// Serve / download a stored document (auth-protected)
router.get(
  '/:id/file',
  asyncHandler(async (req, res) => {
    const doc = await getDocument(req.params.id);
    if (!doc) throw new ApiError(404, 'Document not found');
    const filePath = path.join(UPLOAD_ROOT, doc.stored_name);
    if (!fs.existsSync(filePath)) throw new ApiError(404, 'File missing from storage');
    res.setHeader('Content-Type', doc.mime_type || 'application/octet-stream');
    const inline = req.query.inline === '1';
    res.setHeader(
      'Content-Disposition',
      `${inline ? 'inline' : 'attachment'}; filename="${doc.original_name}"`
    );
    fs.createReadStream(filePath).pipe(res);
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const doc = await getDocument(req.params.id);
    if (!doc) throw new ApiError(404, 'Document not found');
    res.json(doc);
  })
);

export default router;
