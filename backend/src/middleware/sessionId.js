const SESSION_ID_HEADER = "x-session-id";
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Every stateful recognition/session endpoint must identify its session via
 * this header. This is the enforcement point for "recognition state must be
 * isolated per browser session" — no endpoint here ever falls back to a
 * shared/global identity.
 */
export function requireSessionId(req, res, next) {
  const sessionId = req.header(SESSION_ID_HEADER);
  if (!sessionId || !UUID_RE.test(sessionId)) {
    return res.status(400).json({
      error: "A valid X-Session-Id header (UUID) is required for this endpoint.",
    });
  }
  req.sessionId = sessionId;
  next();
}
