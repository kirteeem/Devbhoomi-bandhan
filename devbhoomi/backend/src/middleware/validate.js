import mongoose from "mongoose";

// Generic Zod-based request validator: validate(schema) as a route middleware.
export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    res.status(400);
    return next(new Error(result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")));
  }
  req.body = result.data;
  next();
};

// Same as validate(), but for req.query (search/filter endpoints).
export const validateQuery = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.query);
  if (!result.success) {
    res.status(400);
    return next(new Error(result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")));
  }
  req.query = result.data;
  next();
};

// Rejects requests where a route param isn't a valid Mongo ObjectId, instead of
// letting mongoose throw a CastError deep inside a query.
export const validateObjectId = (...paramNames) => (req, res, next) => {
  for (const paramName of paramNames) {
    const value = req.params[paramName];
    if (!mongoose.Types.ObjectId.isValid(value)) {
      res.status(400);
      return next(new Error(`Invalid ${paramName}`));
    }
  }
  next();
};
