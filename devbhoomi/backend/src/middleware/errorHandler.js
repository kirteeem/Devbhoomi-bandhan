export const notFound = (req, res, next) => {
  res.status(404);
  next(new Error(`Route not found - ${req.originalUrl}`));
};

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  // A controller/utility that deliberately threw a specific, already-safe
  // client-facing error sets EITHER res.status(...) before throwing (the
  // pattern used throughout the controllers, e.g. `res.status(401); throw
  // new Error("Invalid credentials")`) OR err.statusCode directly (used by
  // utilities like utils/otp.js that don't have `res` in scope). Either one
  // means "this message is safe and specific — show it as-is".
  //
  // If NEITHER is set, this is a genuinely unexpected failure (a thrown
  // error from a third-party library, a network hiccup, etc.) and its raw
  // message must never reach the client — e.g. an SMTP provider's rejection
  // text, a Mongo connection string, or similar internal detail. Those get
  // logged in full server-side (below) but replaced with a generic message
  // for the response body.
  const hasExplicitStatus = Boolean(err.statusCode) || (res.statusCode && res.statusCode !== 200);
  let statusCode = err.statusCode || (res.statusCode && res.statusCode !== 200 ? res.statusCode : 500);
  let message = hasExplicitStatus
    ? err.message
    : "Something went wrong on our end. Please try again in a moment.";

  // Zod schema validation thrown directly (e.g. schema.parse(...) inside a
  // controller, rather than via the validate() middleware) — same friendly
  // "field: reason" shape as validate() produces, instead of a raw stack.
  if (err.name === "ZodError" && Array.isArray(err.issues)) {
    statusCode = 400;
    message = err.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
  }

  // Malformed ObjectId passed to a mongoose query (e.g. bad :id in URL)
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid ${err.path}`;
  }

  // Mongoose schema validation failures
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join("; ");
  }

  // Duplicate key (unique index) violations
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0];
    message = field ? `An account with this ${field} already exists` : "Duplicate value";
  }

  // Malformed JWT
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Not authorized, token invalid or expired";
  }

  if (statusCode >= 500) {
    // Server-side errors are logged with full detail; never sent to the client.
    console.error(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} —`, err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
};
