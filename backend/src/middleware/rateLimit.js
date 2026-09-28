import rateLimit from "express-rate-limit";

/**
 * Frame endpoints are hit at ~4-8 fps by design (see CameraFeed sampling on
 * the frontend). This allows generous headroom above that while still
 * bounding abuse/runaway clients.
 */
export const frameRateLimiter = rateLimit({
  windowMs: 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many frames submitted too quickly. Please slow down." },
});
