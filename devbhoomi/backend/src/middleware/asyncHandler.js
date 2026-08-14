// Wraps async route handlers so thrown errors reach errorHandler without try/catch everywhere.
export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
