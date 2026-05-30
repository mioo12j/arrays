import { ApiError } from '../utils/asyncHandler.js';

// Restricts a route to one or more roles. Example: requireRole('admin')
export function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.user) return next(new ApiError(401, 'Authentication required'));
    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, 'You do not have permission to perform this action'));
    }
    next();
  };
}

// 'editor' is a super-admin: every admin privilege, plus exclusive rights
// (data tools, managing protected users).
export const adminOnly = requireRole('admin', 'editor');
export const editorOnly = requireRole('editor');
