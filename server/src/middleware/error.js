import { ApiError } from '../utils/asyncHandler.js';

export function notFound(_req, res) {
  res.status(404).json({ error: 'Not found' });
}

// Centralised error handler.
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  if (err instanceof ApiError) {
    return res.status(err.status).json({ error: err.message, details: err.details });
  }
  // Postgres unique violation
  if (err.code === '23505') {
    return res.status(409).json({ error: 'A record with these details already exists' });
  }
  // Postgres FK violation
  if (err.code === '23503') {
    return res.status(400).json({ error: 'Referenced record does not exist' });
  }
  // eslint-disable-next-line no-console
  console.error('[error]', err);
  res.status(500).json({ error: 'Internal server error' });
}
