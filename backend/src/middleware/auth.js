export function requireAuth(req, res, next) {
  if (req.user) return next();
  res.status(401).json({ message: "Please log in to continue." });
}

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

// Browsers only send a custom header cross-site after a CORS preflight, and this server approves
// none, so requiring one on every write blocks cross-site request forgery.
export function requireApiHeader(req, res, next) {
  if (SAFE_METHODS.has(req.method) || req.get("X-Requested-With")) return next();
  res.status(403).json({ message: "Request blocked: missing X-Requested-With header." });
}
