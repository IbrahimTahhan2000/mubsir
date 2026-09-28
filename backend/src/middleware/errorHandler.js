import { logger } from "../utils/logger.js";

/**
 * Centralized error handler. Never leaks stack traces or internal error
 * details to clients — only a generic message plus a stable error code
 * where relevant.
 */
export function errorHandler(err, req, res, _next) {
  logger.error({ err, path: req.path }, "Unhandled request error");

  if (err.type === "entity.too.large") {
    return res.status(413).json({ error: "Payload too large." });
  }

  const status = err.status && Number.isInteger(err.status) ? err.status : 500;
  const message =
    status === 500 ? "Internal server error." : err.message || "Request failed.";

  res.status(status).json({ error: message });
}

export function notFoundHandler(req, res) {
  res.status(404).json({ error: `No route: ${req.method} ${req.path}` });
}
