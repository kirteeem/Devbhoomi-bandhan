// Escapes special regex characters in user-supplied search input before it
// is used inside a MongoDB $regex filter. Without this, a search query
// containing regex metacharacters (e.g. ".*", "(a+)+$") can either return
// unintended matches or, in pathological cases, cause catastrophic
// backtracking (ReDoS) on the database. Always wrap free-text search input
// with this before building a $regex query.
export const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Convenience helper for the common "case-insensitive contains" pattern,
// with the search term capped to a sane length to further bound worst-case
// matching cost.
export const containsRegex = (value, { maxLength = 100 } = {}) => ({
  $regex: escapeRegex(String(value).slice(0, maxLength)),
  $options: "i",
});
