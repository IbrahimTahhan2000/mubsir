import "dotenv/config";

function parseOrigins(value) {
  return (value || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export const env = {
  port: Number(process.env.PORT || 4000),
  nodeEnv: process.env.NODE_ENV || "development",
  aiServiceUrl: process.env.AI_SERVICE_URL || "http://127.0.0.1:8000",
  allowedOrigins: parseOrigins(
    process.env.ALLOWED_ORIGINS || "http://localhost:5173"
  ),
  sessionTtlMinutes: Number(process.env.SESSION_TTL_MINUTES || 30),
  logLevel: process.env.LOG_LEVEL || "info",
};
