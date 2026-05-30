import { verifyToken } from '../utils/token.js';
import { ApiError } from '../utils/asyncHandler.js';

// Authenticates a request via Bearer token and attaches req.user.
export function authenticate(req, _res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return next(new ApiError(401, 'Authentication required'));
  try {
    const payload = verifyToken(token);
    req.user = {
      id: payload.sub,
      role: payload.role,
      name: payload.name,
      email: payload.email,
    };
    next();
  } catch {
    next(new ApiError(401, 'Invalid or expired token'));
  }
}
